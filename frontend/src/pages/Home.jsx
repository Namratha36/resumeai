import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Cpu, CheckCircle, UserCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user, loginAsGuest } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGuestClick = async () => {
    await loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="home-container animate-fade-in">
      <header className="hero">
        <h1 className="hero-title">Craft the Perfect Resume with <span className="highlight">AI</span></h1>
        <p className="hero-subtitle">
          Beat the Applicant Tracking Systems (ATS) and land your dream job with intelligent resume analysis, automated suggestions, and professional PDF generation.
        </p>
        <div className="hero-cta">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <button 
                type="button" 
                onClick={handleGuestClick} 
                className="btn btn-secondary btn-lg" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <UserCheck size={18} /> Try as Guest
              </button>
            </>
          )}
        </div>
      </header>
      
      <section className="features container">
        <div className="feature-card glass-panel">
          <FileText className="feature-icon" size={40} />
          <h3>ATS-Friendly PDFs</h3>
          <p>Generate precise, cleanly parsed PDFs that modern Applicant Tracking Systems can read flawlessly.</p>
        </div>
        <div className="feature-card glass-panel">
          <Cpu className="feature-icon" size={40} />
          <h3>AI Suggestions</h3>
          <p>Powered by Google Gemini to optimize your experience bullet points for maximum impact.</p>
        </div>
        <div className="feature-card glass-panel">
          <CheckCircle className="feature-icon" size={40} />
          <h3>Skill Gap Analysis</h3>
          <p>Compare your resume against any job description to discover what skills you are missing.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
