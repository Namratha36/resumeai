import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeEditor from './pages/ResumeEditor';
import { AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <div className="app-container">
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1E293B',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }} />
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/editor/:id?" element={
            <ProtectedRoute>
              <ResumeEditor />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
