import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, UploadCloud, Cpu, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import './ResumeEditor.css';

const ResumeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  
  const [title, setTitle] = useState('Untitled Resume');
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '', summary: ''
  });
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState('');
  
  const [jobDescription, setJobDescription] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      const res = await axios.get(`/api/resumes/${id}`);
      const data = res.data;
      setTitle(data.title);
      setPersonalInfo(data.personalInfo || {});
      setExperience(data.experience || []);
      setEducation(data.education || []);
      setSkills(data.skills ? data.skills.join(', ') : '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resume', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const payload = {
      title,
      personalInfo,
      experience,
      education,
      skills: skills.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      if (id) {
        await axios.put(`/api/resumes/${id}`, payload);
        toast.success('Resume updated successfully!');
      } else {
        const res = await axios.post(`/api/resumes`, payload);
        navigate(`/editor/${res.data._id}`);
      }
    } catch (error) {
      console.error('Error saving resume', error);
      toast.error('Failed to save resume.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resumeFile', file);

    try {
      const res = await axios.post('/api/resumes/upload', formData);
      toast.success(`File parsed successfully! (${res.data.rawText.length} characters)`);
    } catch (error) {
      console.error('Error parsing file', error);
      toast.error('Failed to parse file.');
    }
  };

  const analyzeATS = async () => {
    if (!jobDescription) return toast.error('Please enter a Job Description');
    setAnalyzing(true);
    
    // Construct full text to send to AI
    const resumeText = `
      ${personalInfo.fullName}
      ${personalInfo.summary}
      Experience: ${experience.map(e => e.description).join(' ')}
      Education: ${education.map(e => e.degree).join(' ')}
      Skills: ${skills}
    `;

    try {
      const res = await axios.post('/api/ai/analyze', {
        resumeText,
        jobDescription
      });
      setAiAnalysis(res.data);
      toast.success('ATS Analysis complete!');
    } catch (error) {
      console.error('Error analyzing', error);
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSuggestion = async () => {
    if (!personalInfo.summary) return toast.error('Please write a draft summary first.');
    setSuggesting(true);
    try {
      const res = await axios.post('/api/ai/suggest', {
        section: 'Summary',
        currentText: personalInfo.summary
      });
      setPersonalInfo({ ...personalInfo, summary: res.data.suggestion });
      toast.success('Summary enhanced with AI!');
    } catch (error) {
      console.error('Error suggesting', error);
      toast.error('Failed to get AI suggestion');
    } finally {
      setSuggesting(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading editor...</div>;

  return (
    <div className="editor-container container animate-fade-in">
      <div className="editor-header">
        <input 
          type="text" 
          className="title-input" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Resume Title"
        />
        <div className="header-actions">
          <label className="btn btn-secondary upload-btn">
            <UploadCloud size={18} /> Parse File (PDF/DOCX)
            <input type="file" accept=".pdf,.docx" hidden onChange={handleFileUpload} />
          </label>
          <button onClick={handleSave} className="btn btn-primary">
            <Save size={18} style={{ marginRight: '8px' }} /> Save Resume
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-form-area glass-panel">
          <section className="form-section">
            <h3>Personal Information</h3>
            <div className="grid-2">
              <input className="input-field" placeholder="Full Name" value={personalInfo.fullName} onChange={e => setPersonalInfo({...personalInfo, fullName: e.target.value})} />
              <input className="input-field" placeholder="Email" value={personalInfo.email} onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} />
              <input className="input-field" placeholder="Phone" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} />
              <input className="input-field" placeholder="Location" value={personalInfo.location} onChange={e => setPersonalInfo({...personalInfo, location: e.target.value})} />
            </div>
            <div className="mt-4 summary-wrapper">
              <textarea 
                className="input-field" 
                rows="4" 
                placeholder="Professional Summary" 
                value={personalInfo.summary} 
                onChange={e => setPersonalInfo({...personalInfo, summary: e.target.value})}
              />
              <button onClick={getSuggestion} disabled={suggesting} className="btn ai-btn">
                <Cpu size={14} /> {suggesting ? 'Enhancing...' : 'AI Enhance'}
              </button>
            </div>
          </section>

          <section className="form-section">
            <h3>Skills (Comma separated)</h3>
            <input 
              className="input-field" 
              placeholder="e.g. React, Node.js, Python" 
              value={skills} 
              onChange={e => setSkills(e.target.value)} 
            />
          </section>

          {/* Simple implementations for Experience/Education forms to keep it manageable */}
          <section className="form-section">
            <div className="section-header">
              <h3>Experience</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setExperience([...experience, {}])}>+ Add</button>
            </div>
            {experience.map((exp, index) => (
              <div key={index} className="item-card glass">
                <input className="input-field mb-2" placeholder="Company" value={exp.company || ''} onChange={e => {
                  const newExp = [...experience];
                  newExp[index].company = e.target.value;
                  setExperience(newExp);
                }} />
                <input className="input-field mb-2" placeholder="Position" value={exp.position || ''} onChange={e => {
                  const newExp = [...experience];
                  newExp[index].position = e.target.value;
                  setExperience(newExp);
                }} />
                <textarea className="input-field" placeholder="Description" rows="3" value={exp.description || ''} onChange={e => {
                  const newExp = [...experience];
                  newExp[index].description = e.target.value;
                  setExperience(newExp);
                }} />
              </div>
            ))}
          </section>
        </div>

        <div className="editor-sidebar glass-panel">
          <div className="sidebar-section">
            <h3><Target size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: '#8B5CF6' }}/> Job Matcher</h3>
            <p className="helper-text">Paste a job description to get an ATS score and gap analysis.</p>
            <textarea 
              className="input-field job-desc-input" 
              rows="6" 
              placeholder="Paste Job Description here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
            <button className="btn btn-primary full-width mt-4" onClick={analyzeATS} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze ATS Score'}
            </button>
          </div>

          {aiAnalysis && (
            <div className="analysis-results animate-fade-in">
              <div className="ats-score">
                <span className="score-label">ATS Match</span>
                <span className={`score-value ${aiAnalysis.atsScore >= 75 ? 'good' : 'average'}`}>{aiAnalysis.atsScore}%</span>
              </div>
              
              <div className="result-group">
                <h4>Missing Skills</h4>
                <div className="tags red">
                  {aiAnalysis.missingSkills?.map(skill => <span key={skill} className="tag">{skill}</span>)}
                </div>
              </div>

              <div className="result-group">
                <h4>Suggestions</h4>
                <ul className="suggestions-list">
                  {aiAnalysis.suggestions?.map((sug, i) => <li key={i}>{sug}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
