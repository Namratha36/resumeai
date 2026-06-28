import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Cpu, CheckCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container animate-fade-in">
      <header className="hero">
        <h1 className="hero-title">Craft the Perfect Resume with <span className="highlight">AI</span></h1>
        <p className="hero-subtitle">
          Beat the Applicant Tracking Systems (ATS) and land your dream job with intelligent resume analysis, automated suggestions, and professional PDF generation.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Login</Link>
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
