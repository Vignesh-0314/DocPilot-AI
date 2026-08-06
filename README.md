# DocPilot AI - Intelligent Document Processing (IDP) & Fraud Audit Platform

> **Transform unstructured business documents into structured intelligence, automated health scores, and fraud audit reports powered by Google Gemini Multimodal AI.**

---

## 📌 Problem Statement

In modern enterprise workflows, organizations receive thousands of unstructured documents daily—including **Invoices, Resumes, Legal Contracts, Medical Reports, Bank Statements, and Government IDs**.

Manual processing of these documents leads to severe operational bottlenecks:

1. **High Operational Costs & Slow Turnaround**: Manual data entry and document auditing require hours of human effort per document.
2. **Human Error & Inconsistency**: Traditional OCR fails on complex layouts, misreading critical fields like total amounts, tax numbers, candidate details, or expiration dates.
3. **Document Fraud & Tampering**: Fraudulent invoices, altered contract dates, missing stamps, or fabricated credentials often bypass manual inspection, leading to financial loss or regulatory non-compliance.
4. **Lack of Standardized Health Metrics**: Businesses lack a unified metric to assess whether a document is complete, legible, and compliant before taking administrative action.

---

## 💡 How DocPilot AI Solves This Problem

**DocPilot AI** is an enterprise-grade **Intelligent Document Processing (IDP)** platform built with React, Express, and Google Gemini Multimodal AI. It automates end-to-end document understanding, compliance auditing, and data extraction in seconds:

- ⚡ **Zero Manual Data Entry**: Upload any document (PDF, PNG, JPG) and automatically extract key-value data points into structured JSON.
- 🩺 **AI Document Health Score (0–100)**: Evaluates completeness, OCR legibility, missing mandatory fields, and formatting quality to assign a clear health status (*Excellent, Good, Needs Review, Poor*).
- 🛡️ **AI Fraud & Tampering Detection**: Scans for visual anomalies, missing signatures/stamps, altered dates, illegal character syntax, and font inconsistencies.
- 📋 **Executive Summaries & Risk Audits**: Generates automated summaries, identifies legal/financial risk factors, and provides actionable recommendation checklists.
- 🚀 **Cloud & Hackathon Ready**: Built on a hybrid architecture supporting **Supabase PostgreSQL** with an automatic **zero-config in-memory database fallback**.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- User registration and login powered by **JSON Web Tokens (JWT)** and **bcryptjs** password hashing.
- Request payload validation using **Zod** schemas.
- Protected frontend routes and automated HTTP request headers via Axios interceptors.

### 🧠 2. Multimodal AI Analysis Engine (Google Gemini)
- **Automatic Document Classification**: Detects document type (*Invoice, Resume, Contract, Medical Report, Bank Statement, Government Document, etc.*).
- **Structured Data Extraction**: Reads complex tables, headers, and footers to extract clean parameters (*Total Amount, Issue Date, Candidate Name, Skills, Vendor Name, Invoice Number*).
- **Executive Summary**: Generates concise executive overviews for quick decision-making.
- **Risk Assessment**: Categorizes overall risk (*Low, Medium, High*) with detailed risk explanations.

### 🩺 3. AI Document Health Score
- **Range**: `0 - 100` score mapped to 4 status tiers:
  - `90–100` $\rightarrow$ **Excellent** (Green)
  - `75–89` $\rightarrow$ **Good** (Yellow)
  - `60–74` $\rightarrow$ **Needs Review** (Orange)
  - `< 60` $\rightarrow$ **Poor** (Red)
- Includes an animated SVG circular progress gauge and a checklist of document health factors.

### 🛡️ 4. AI Fraud & Tampering Detection
- Evaluates document authenticity and outputs a **Tampering Suspicion Score (0–100%)** and **Fraud Risk Level**.
- Audits for:
  - Missing signatures or official physical ink stamps
  - Altered dates or illegal numerical syntax
  - Missing mandatory entity fields
  - Blurred text, low OCR quality, and font inconsistency
- Displays severity badges (*High, Medium, Low*) for detected anomalies.

### 🎨 5. Modern Ocean Blue UI & Responsive Design
- Glassmorphic card layouts built with **React 18**, **Tailwind CSS**, **Framer Motion**, and **Lucide React Icons**.
- Interactive drag-and-drop document upload zone with live upload progress animations.
- Embedded side-by-side original document viewer for PDF and image formats.

---

## 📁 Tech Stack

### **Frontend**
- **Framework**: React 18, Vite, React Router DOM v7
- **Styling**: Tailwind CSS (Custom Ocean Blue Palette), Glassmorphism, Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT Interceptor

### **Backend**
- **Server**: Node.js, Express.js
- **AI Multimodal Engine**: `@google/generative-ai` (`gemini-flash-latest`, `gemini-2.0-flash`)
- **Authentication**: JWT (`jsonwebtoken`), `bcryptjs`, `zod`
- **FileUpload**: `multer` memory storage (PDF, PNG, JPG, JPEG)
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`) + In-Memory Fallback Store

---

## 🔗 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token |
| `GET`  | `/api/auth/me` | Fetch active user profile |
| `POST` | `/api/document/upload` | Upload document (PDF, PNG, JPG, JPEG up to 10MB) |
| `POST` | `/api/document/analyze` | Process document with Gemini AI Engine |
| `GET`  | `/api/document/list` | List all documents uploaded by user |
| `GET`  | `/api/document/:id` | Fetch specific document details & AI analysis |
| `DELETE` | `/api/document/:id` | Delete document record |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure **Node.js (v18+)** and **npm** are installed on your machine.

### 2. Environment Setup
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
SUPABASE_URL=your_supabase_url (optional)
SUPABASE_ANON_KEY=your_supabase_anon_key (optional)
```

### 3. Local Execution

Run the backend server:
```bash
cd backend
npm install
npm run dev
# Express server runs on http://localhost:5000
```

In a separate terminal, run the frontend:
```bash
cd frontend
npm install
npm run dev
# Vite dev server runs on http://localhost:3000
```

---

## 🌐 Deploying to Vercel

DocPilot AI is pre-configured for fullstack deployment on **Vercel**:

1. Import your GitHub repository into Vercel.
2. Ensure **Root Directory** is set to `./` (repository root).
3. Add `GEMINI_API_KEY` under **Environment Variables** in Vercel.
4. Click **Deploy**. Vercel will automatically build the Vite frontend and deploy Express API endpoints as Vercel Serverless Functions.

---

## 🗄️ Supabase Database Schema (Optional)

If connecting to Supabase PostgreSQL, execute the following DDL in your SQL Editor:

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
  health_score JSONB NOT NULL DEFAULT '{}',
  fraud_detection JSONB NOT NULL DEFAULT '{}',
  next_action JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 📄 License
Built with ❤️ for enterprise intelligent document automation.
