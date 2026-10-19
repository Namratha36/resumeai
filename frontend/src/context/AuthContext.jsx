import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
  };

  const loginAsGuest = async () => {
    try {
      const res = await axios.post('/api/auth/guest');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return res.data.user;
    } catch (err) {
      console.warn('Backend guest auth failed, falling back to local guest session', err);
      // Instant client-side fallback guest session
      const guestUser = {
        id: '000000000000000000000000',
        name: 'Guest User',
        email: 'guest@resumeai.demo',
        isGuest: true
      };
      const guestToken = 'guest_token_' + Date.now();
      localStorage.setItem('token', guestToken);
      localStorage.setItem('user', JSON.stringify(guestUser));
      setUser(guestUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${guestToken}`;
      return guestUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginAsGuest, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
