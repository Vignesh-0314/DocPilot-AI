# DocPilot AI - Intelligent Document Processing (IDP)

DocPilot AI is a production-ready Full Stack AI application built for Intelligent Document Processing. It automates business document understanding (Invoices, Resumes, Contracts, Medical Reports, Bank Statements, Government Documents) using Google Gemini API, extracting structured JSON parameters, evaluating operational/legal risks, generating executive summaries, and providing actionable recommendations.

---

## 🌟 Key Features

- 🔐 **JWT Authentication & Security**: Register, Login, password hashing with bcrypt, protected routes, Zod input validation.
- 🎨 **Ocean Blue Modern SaaS UI**: Notion AI & ChatGPT-inspired interface built with React, Vite, Tailwind CSS, Framer Motion animations, and Lucide icons.
- 📄 **Multimodal Drag & Drop Upload**: Upload PDF, PNG, JPG, or JPEG files with live progress animation and real-time document preview.
- 🧠 **Google Gemini Multimodal AI Engine**: Direct document analysis returning structured JSON response:
  - Document Type classification
  - Confidence Score (%)
  - Executive Summary
  - Extracted Key-Value structured business metrics
  - Risk Score Level (Low, Medium, High) with detailed risk explanation
  - Actionable Recommendations checklist
- ⚡ **Supabase PostgreSQL & Fallback DB**: Native Supabase integration with automatic in-memory fallback for zero-config hackathon execution out of the box.

---

## 📁 Tech Stack

### Frontend
- **Framework**: React 18, Vite, React Router DOM v7
- **Styling**: Tailwind CSS (Ocean Blue custom palette), Framer Motion, Lucide React Icons
- **HTTP Client**: Axios with automatic JWT Authorization interceptor

### Backend
- **Server**: Node.js, Express.js
- **Auth**: JWT (`jsonwebtoken`), `bcryptjs`, `zod`
- **Uploads**: `multer` memory storage (PDF, PNG, JPG, JPEG)
- **AI**: `@google/generative-ai` (Gemini 1.5 / 2.0 Flash multimodal engine)
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`) + Fallback store

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure Node.js (v18+) and npm are installed.

### 2. Backend Setup
```bash
cd backend
npm install
```

Configure `backend/.env`:
```env
PORT=5000
JWT_SECRET=docpilot_ai_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url_here (optional)
SUPABASE_ANON_KEY=your_supabase_anon_key_here (optional)
```

Start the backend server:
```bash
npm run dev
# Server will start on http://localhost:5000
```

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
# Frontend will start on http://localhost:3000
```

---

## 🔗 API Routes Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Login user & receive JWT token |
| `GET`  | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/document/upload` | Upload document (PDF, PNG, JPG, JPEG) |
| `POST` | `/api/document/analyze` | Process document with Gemini AI & return structured JSON |
| `GET`  | `/api/document/list` | List all user uploaded documents |
| `GET`  | `/api/document/:id` | Fetch specific document details & analysis |
| `DELETE` | `/api/document/:id` | Delete document record |

---

## 🗄️ Supabase PostgreSQL Schema (Optional Setup)

Run the following DDL in your Supabase SQL Editor if connecting to Supabase:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT NOT NULL,
  file_data TEXT,
  status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  confidence INT NOT NULL,
  summary TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  risk_explanation TEXT NOT NULL,
  recommendations JSONB NOT NULL DEFAULT '[]',
  extracted_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
