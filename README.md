# ResumeAI - ATS Resume Builder

ResumeAI is a modern, full-stack application that helps users build ATS-friendly resumes. It features intelligent AI suggestions for your work experience bullet points and provides an instant ATS score by analyzing your resume against any job description.

## 🚀 Features
- **Serverless & Fast**: Optimized for 1-click deployment on **Vercel** with serverless functions, or as a single container on **Render**.
- **Smart AI Analysis**: Built with Google Gemini API to analyze your resume and extract missing skills.
- **AI Suggestions**: Enhance your professional summary and experience bullet points with AI-generated suggestions.
- **ATS-Friendly PDF Generation**: Generates clean, crisp vector PDFs using PDFKit with native text layers that ATS systems parse flawlessly.
- **Resume Parsing**: Upload your existing PDF or DOCX resume to extract text.
- **Modern UI/UX**: Premium glassmorphism design with responsive elements and sleek toast notifications.

## 💻 Tech Stack
- **Frontend:** React, Vite, React Router, Lucide Icons, CSS Variables (Glassmorphism design)
- **Backend:** Node.js, Express, PDFKit, Multer, `pdf-parse`, `mammoth`
- **Database:** MongoDB Atlas (Mongoose with serverless connection pooling)
- **AI Provider:** Google Gemini (`@google/genai`)

## 🛠️ Local Development

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster
- Google Gemini API Key

### 2. Installation
Clone the repository and install root and workspace dependencies:
```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

### 3. Environment Variables
Create a `.env` file in the root or `backend/` directory (see `.env.example`):
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### 4. Running Locally
Run both frontend and backend concurrently:
```bash
npm run dev
```

---

## ⚡ Deployment on Vercel (Recommended)

This project is fully configured for Vercel with serverless API functions (`/api`) and Edge CDN static frontend serving (`frontend/dist`).

1. Push your code to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New Project"** and import your GitHub repository (`Namratha36/resumeai`).
4. In the Project Configuration:
   - **Framework Preset:** Other (or Vite)
   - **Root Directory:** `./` (leave default root)
   - The `vercel.json` file in the repository will automatically handle the build command and output directory!
5. Expand the **Environment Variables** section and add:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: A secure secret string (e.g., `supersecretkey123`)
   - `GEMINI_API_KEY`: Your Google Gemini API Key
6. Click **Deploy**!

In ~1 minute, your full-stack app will be live at `https://your-project.vercel.app`!

---

## 🌍 Alternative: Deployment on Render
This repository can also run as a persistent Node.js Web Service on Render:
1. Connect your GitHub repository to Render and create a new **Web Service**.
2. **Build Command:** `npm run build`
3. **Start Command:** `npm start`
4. Add your environment variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `NODE_ENV=production`).
