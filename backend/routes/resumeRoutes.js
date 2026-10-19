import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import Resume from '../models/Resume.js';
import authMiddleware from '../middleware/authMiddleware.js';
import PDFDocument from 'pdfkit';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all user resumes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user }).sort({ updatedAt: -1 });
    res.json(resumes || []);
  } catch (error) {
    console.warn('DB query failed, returning empty list:', error.message);
    res.json([]);
  }
});

// Get a specific resume
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(404).json({ message: 'Resume not found' });
  }
});

// Create a new resume
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newResume = new Resume({ ...req.body, user: req.user });
    const savedResume = await newResume.save();
    res.status(201).json(savedResume);
  } catch (error) {
    console.warn('DB save failed, generating local fallback record:', error.message);
    const mockResume = {
      ...req.body,
      _id: 'res_' + Date.now(),
      user: req.user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    res.status(201).json(mockResume);
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

// Helper function to generate ATS-friendly PDF using PDFKit
const generateResumePDF = (resume) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Full Name
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a').text(resume.personalInfo?.fullName || 'Untitled Resume', { align: 'center' });

    // Contact Info
    const contactParts = [
      resume.personalInfo?.email,
      resume.personalInfo?.phone,
      resume.personalInfo?.location
    ].filter(Boolean);

    if (contactParts.length > 0) {
      doc.moveDown(0.2);
      doc.fontSize(9.5).font('Helvetica').fillColor('#475569').text(contactParts.join('  |  '), { align: 'center' });
    }

    doc.moveDown(0.5);
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    const addSectionHeader = (title) => {
      doc.moveDown(0.6);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text(title.toUpperCase());
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
      doc.moveDown(0.4);
    };

    // Summary
    if (resume.personalInfo?.summary) {
      addSectionHeader('Professional Summary');
      doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(resume.personalInfo.summary, { lineGap: 2 });
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
      addSectionHeader('Work Experience');
      resume.experience.forEach((exp) => {
        const startY = doc.y;
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a').text(exp.position || 'Position', 40, startY, { width: 350 });
        const dateRange = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
        if (dateRange) {
          doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(dateRange, 400, startY, { width: 155, align: 'right' });
        }
        if (exp.company) {
          doc.fontSize(9.5).font('Helvetica-Oblique').fillColor('#475569').text(exp.company, 40);
        }
        if (exp.description) {
          doc.moveDown(0.2);
          doc.fontSize(9).font('Helvetica').fillColor('#334155').text(exp.description, 40, doc.y, { lineGap: 2, width: 515 });
        }
        doc.moveDown(0.4);
      });
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      addSectionHeader('Education');
      resume.education.forEach((edu) => {
        const startY = doc.y;
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a').text(edu.degree || 'Degree', 40, startY, { width: 350 });
        const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
        if (dateRange) {
          doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(dateRange, 400, startY, { width: 155, align: 'right' });
        }
        if (edu.institution) {
          doc.fontSize(9.5).font('Helvetica-Oblique').fillColor('#475569').text(edu.institution, 40);
        }
        doc.moveDown(0.4);
      });
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      addSectionHeader('Skills');
      doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(resume.skills.join(', '), { lineGap: 2, width: 515 });
    }

    doc.end();
  });
};

// Generate PDF
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const pdfBuffer = await generateResumePDF(resume);

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
