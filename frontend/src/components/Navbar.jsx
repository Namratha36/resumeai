import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FileText, LogOut, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <FileText className="logo-icon" />
          <span>ResumeAI</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <div className="nav-user">
                <User size={18} />
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
