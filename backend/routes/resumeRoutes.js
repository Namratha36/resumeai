import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import Resume from '../models/Resume.js';
import authMiddleware from '../middleware/authMiddleware.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all user resumes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific resume
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new resume
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newResume = new Resume({ ...req.body, user: req.user });
    const savedResume = await newResume.save();
    res.status(201).json(savedResume);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a resume
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedResume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      req.body,
      { new: true }
    );
    if (!updatedResume) return res.status(404).json({ message: 'Resume not found' });
    res.json(updatedResume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a resume
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedResume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!deletedResume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload and parse resume
router.post('/upload', authMiddleware, upload.single('resumeFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let parsedText = '';
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();

    if (fileExt === 'pdf') {
      const data = await pdfParse(req.file.buffer);
      parsedText = data.text;
    } else if (fileExt === 'docx') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      parsedText = result.value;
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Use PDF or DOCX.' });
    }

    // Here, we'd typically send parsedText to the AI to extract structured data
    // We'll return the raw text for now so the frontend can send it to the AI route
    res.json({ rawText: parsedText, message: 'File parsed successfully' });

  } catch (error) {
    console.error('Error parsing file:', error);
    res.status(500).json({ message: 'Error parsing file' });
  }
});

// Generate PDF
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    // Generate HTML for the PDF
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 40px; }
            h1 { color: #222; margin-bottom: 5px; font-size: 24px; }
            h2 { color: #444; border-bottom: 2px solid #ddd; padding-bottom: 5px; margin-top: 20px; font-size: 18px; }
            h3 { margin-bottom: 5px; font-size: 16px; color: #333; }
            .contact-info { margin-bottom: 20px; font-size: 14px; color: #555; }
            .section { margin-bottom: 20px; }
            .item { margin-bottom: 15px; }
            .item-header { display: flex; justify-content: space-between; font-weight: bold; }
            .item-sub { font-style: italic; color: #666; margin-bottom: 5px; font-size: 14px; }
            ul { margin: 0; padding-left: 20px; }
            li { margin-bottom: 5px; font-size: 14px; }
            p { font-size: 14px; margin: 0 0 10px 0; }
          </style>
        </head>
        <body>
          <h1>${resume.personalInfo?.fullName || 'Your Name'}</h1>
          <div class="contact-info">
            ${resume.personalInfo?.email ? resume.personalInfo.email + ' | ' : ''}
            ${resume.personalInfo?.phone ? resume.personalInfo.phone + ' | ' : ''}
            ${resume.personalInfo?.location || ''}
          </div>
          
          ${resume.personalInfo?.summary ? `
          <div class="section">
            <h2>Professional Summary</h2>
            <p>${resume.personalInfo.summary}</p>
          </div>` : ''}

          ${resume.experience && resume.experience.length > 0 ? `
          <div class="section">
            <h2>Experience</h2>
            ${resume.experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.position}</span>
                  <span>${exp.startDate} - ${exp.endDate}</span>
                </div>
                <div class="item-sub">${exp.company}</div>
                <p>${exp.description}</p>
              </div>
            `).join('')}
          </div>` : ''}

          ${resume.education && resume.education.length > 0 ? `
          <div class="section">
            <h2>Education</h2>
            ${resume.education.map(edu => `
              <div class="item">
                <div class="item-header">
                  <span>${edu.degree}</span>
                  <span>${edu.startDate} - ${edu.endDate}</span>
                </div>
                <div class="item-sub">${edu.institution}</div>
              </div>
            `).join('')}
          </div>` : ''}

          ${resume.skills && resume.skills.length > 0 ? `
          <div class="section">
            <h2>Skills</h2>
            <p>${resume.skills.join(', ')}</p>
          </div>` : ''}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

export default router;
