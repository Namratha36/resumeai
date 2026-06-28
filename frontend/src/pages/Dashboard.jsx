import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, Plus, Trash2, Edit3, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await axios.get('/api/resumes');
      setResumes(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setLoading(false);
    }
  };

  const deleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await axios.delete(`/api/resumes/${id}`);
        setResumes(resumes.filter(r => r._id !== id));
        toast.success('Resume deleted successfully.');
      } catch (error) {
        console.error('Error deleting resume:', error);
        toast.error('Failed to delete resume.');
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`/api/resumes/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div className="dashboard-container container animate-fade-in">
      <div className="dashboard-header">
        <h2>Your Resumes</h2>
        <Link to="/editor" className="btn btn-primary">
          <Plus size={18} style={{ marginRight: '8px' }} />
          Create New
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading your resumes...</div>
      ) : resumes.length === 0 ? (
        <div className="empty-state glass-panel">
          <FileText size={48} className="empty-icon" />
          <h3>No resumes yet</h3>
          <p>Create your first resume to get started.</p>
          <Link to="/editor" className="btn btn-primary mt-4">Create Resume</Link>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map(resume => (
            <div key={resume._id} className="resume-card glass-panel">
              <div className="resume-card-header">
                <FileText className="resume-icon" />
                <h3 className="resume-title">{resume.title || 'Untitled Resume'}</h3>
              </div>
              <p className="resume-meta">Last updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
              
              <div className="resume-actions">
                <Link to={`/editor/${resume._id}`} className="action-btn edit-btn" title="Edit">
                  <Edit3 size={18} />
                </Link>
                <button onClick={() => handleDownload(resume._id)} className="action-btn download-btn" title="Download PDF">
                  <Download size={18} />
                </button>
                <button onClick={() => deleteResume(resume._id)} className="action-btn delete-btn" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
