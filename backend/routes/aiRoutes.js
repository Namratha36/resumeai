import express from 'express';
import { GoogleGenAI } from '@google/genai';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to get the AI client
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: 'Both resumeText and jobDescription are required.' });
    }

    const ai = getAIClient();
    
    const prompt = `
      You are an expert ATS (Applicant Tracking System) analyzer.
      I will provide a Job Description and a Resume Text.
      Please analyze the resume against the job description and output a JSON response with the following structure:
      {
        "atsScore": [A number between 0 and 100],
        "missingSkills": [Array of skills missing in the resume but present in the JD],
        "matchingSkills": [Array of skills present in both],
        "suggestions": [Array of actionable suggestions to improve the resume for this job]
      }
      
      Job Description:
      ${jobDescription}
      
      Resume Text:
      ${resumeText}
      
      Only output valid JSON without any markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const resultText = response.text.trim();
    // Try to parse JSON. Sometimes AI returns markdown code block, so clean it.
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    res.json(parsedData);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ message: 'Error analyzing resume' });
  }
});

router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const { section, currentText } = req.body;
    
    if (!section || !currentText) {
      return res.status(400).json({ message: 'Both section and currentText are required.' });
    }

    const ai = getAIClient();
    
    const prompt = `
      You are an expert career coach. A user is writing the "${section}" section of their resume.
      Here is what they have written so far:
      "${currentText}"
      
      Please provide an improved, professional, and impactful version of this text. Focus on action verbs, quantifiable results, and clarity.
      Only output the improved text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ suggestion: response.text.trim() });
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({ message: 'Error generating suggestion' });
  }
});

export default router;
