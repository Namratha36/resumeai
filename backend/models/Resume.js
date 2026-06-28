import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  startDate: String,
  endDate: String,
  description: String
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  startDate: String,
  endDate: String
});

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  link: String
});

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Resume' },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    portfolio: String,
    summary: String
  },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [String],
  projects: [projectSchema],
  atsScore: { type: Number, default: null }
}, { timestamps: true });

export default mongoose.model('Resume', resumeSchema);
