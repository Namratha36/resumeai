# ResumeAI - ATS Resume Builder

ResumeAI is a modern, full-stack application that helps users build ATS-friendly resumes. It features intelligent AI suggestions for your work experience bullet points and provides an instant ATS score by analyzing your resume against any job description.

## 🚀 Features
- **Unified Deployment**: Designed to run as a single Web Service on platforms like Render.
- **Smart AI Analysis**: Built with Google Gemini API to analyze your resume and extract missing skills.
- **AI Suggestions**: Enhance your professional summary and experience bullet points with AI-generated suggestions.
- **ATS-Friendly PDF Generation**: Precisely renders clean PDFs using Puppeteer on the backend to guarantee ATS readability.
- **Resume Parsing**: Upload your existing PDF or DOCX resume to extract text.
- **Modern UI/UX**: Premium glassmorphism design with responsive elements and sleek toast notifications.

## 💻 Tech Stack
- **Frontend:** React, Vite, React Router, CSS Variables (Glassmorphism design)
- **Backend:** Node.js, Express, Puppeteer, Multer, `pdf-parse`, `mammoth`
- **Database:** MongoDB Atlas (Mongoose)
- **AI Provider:** Google Gemini (`@google/genai`)

## 🛠️ Local Development

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local MongoDB)
- Google Gemini API Key

### 2. Installation
Clone the repository, then install dependencies for both the frontend and backend:
```bash
npm install --prefix backend
npm install --prefix frontend
```
*(Alternatively, you can run `npm install concurrently` in the root and use the root scripts).*

### 3. Environment Variables
Create a `.env` file in the `backend/` directory (see `.env.example`):
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### 4. Running Locally
You can run the backend and frontend separately:
- **Backend:** `cd backend && npm start`
- **Frontend:** `cd frontend && npm run dev`

*(If you set up `concurrently` in the root `package.json`, you can just run `npm run dev` from the root).*

## 🌍 Production Deployment (Render)
This repository is configured to be deployed as a **Single Web Service** on Render. The backend will automatically serve the built static frontend files.

1. Connect your GitHub repository to Render and create a new **Web Service**.
2. **Build Command:**
   ```bash
   npm run build
   ```
3. **Start Command:**
   ```bash
   npm start
   ```
4. **Environment Variables:**
   Make sure to add all the variables from your `.env` (MONGODB_URI, JWT_SECRET, GEMINI_API_KEY).
   Also, explicitly set `NODE_ENV` to `production`:
   ```env
   NODE_ENV=production
   ```

Once deployed, your full-stack app will be live at the single public `.onrender.com` URL!
