<div align="center">
  <h1>🚀 MatchPoint AI</h1>
  <h3>AI-Based Investor & Startup Matchmaking Platform</h3>
  <p>Connecting high-potential startups with active venture capital through vector embeddings, multi-criteria thesis matching, automated pitch deck intelligence, and real-time Socket.io communication.</p>

  <p>
    <img src="https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
    <img src="https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind 4" />
    <img src="https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-Real--Time-010101?logo=socket.io&logoColor=white" alt="Socket.io" />
    <img src="https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
  </p>
</div>

---

## 🌟 Key Highlights

* **🎯 Hybrid AI Matchmaking Engine**: Eliminates cold-email noise by scoring startup-investor compatibility (0–100%) across sector alignment, round stage (Pre-Seed to Series B), check size compatibility, and geographic mandates, enhanced by Google Gemini reasoning.
* **💬 Production Real-Time Chat (Socket.io)**: Full bi-directional messaging with instant delivery, typing indicators, active presence tracking, and MongoDB message persistence.
* **📄 Automated Pitch Deck Due-Diligence**: Slide-by-slide text extraction from uploaded **PDF** and **PowerPoint (.pptx)** pitch decks, generating instant analysis across TAM/SAM/SOM, unit economics, competitive moat, and due diligence risk flags.
* **📊 Macroeconomic Context Injection**: Real-time market data integration (S&P 500, NASDAQ, sector indices, VIX) that dynamically infuses current market sentiment into investor recommendations.
* **🔐 Secure JWT Authentication**: Role-based access control (RBAC) separating Startup and Investor flows with token validation middleware and protected React routes.
* **🌱 1-Click Database Seeding Engine**: Ready-to-demo dataset containing 8+ realistic startups (AI, BioTech, CleanTech, CyberSecurity) and institutional investors with pre-populated chat history.

---

## 🏗️ Architecture

```
                               ┌────────────────────────┐
                               │   React 19 Frontend    │
                               │  Vite + Tailwind CSS   │
                               └───────────┬────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ REST APIs (Axios)                   │ WebSockets (Socket.io)
                        ▼                                     ▼
     ┌─────────────────────────────────────────────────────────────────┐
     │                     Express.js Backend Server                   │
     │                      (Node.js 22 + Socket.IO)                   │
     └───────┬─────────────────────────────┬───────────────────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────┐    ┌─────────────────────────┐
│   MongoDB Database     │    │   External AI & Market  │
│  - Users & Roles       │    │  - Google Gemini API    │
│  - Startup Profiles    │    │  - Yahoo Finance        │
│  - Investor Profiles   │    │  - Alpha Vantage        │
│  - Conversations & Msgs│    │  - PDF/PPTX Parsers     │
│  - Match Cache         │    └─────────────────────────┘
└────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, Framer Motion, React Router DOM 7, React Icons, React Toastify |
| **Backend** | Node.js, Express 4, Socket.io, Mongoose (MongoDB), Multer, JWT (`jsonwebtoken`), Bcrypt |
| **AI & Document Processing** | Google Gemini API (`@google/genai`), `pdfreader` (PDF text extraction), `pptx2json` (PowerPoint parser) |
| **Financial Intelligence** | Yahoo Finance API, Alpha Vantage API, CoinGecko |

---

## ⚡ Quickstart Guide

### 1. Prerequisites
* **Node.js** v18+ (v22 recommended)
* **MongoDB** running locally on `localhost:27017` or a MongoDB Atlas URI

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/KS-Vijay/AI-Based-Investor-Startup-Matchmaking-Platform.git
cd AI-Based-Investor-Startup-Matchmaking-Platform

# Install root, server, and client dependencies
npm run install:all
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/investor_matchmaking
JWT_SECRET=your_jwt_secret_key_here

# AI & Gemini Configuration (Required for live AI features)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Optional: Live Market Data
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### 4. Seed the Database
Populate the database with realistic demo startups, institutional VCs, and sample message history:
```bash
npm run seed
```

### 5. Start the Application
Run both backend and frontend concurrently with a single command:
```bash
npm run dev
```

* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`

---

## 🔑 Pre-Configured Demo Accounts

Use these pre-seeded accounts to explore both perspectives of the platform:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Startup Founder** | `founder@nexusai.com` | `password123` | **NexusAI Systems** (Seed Stage, $1.5M Target, B2B AI Observability) |
| **Venture Investor** | `investor@vanguardvc.com` | `password123` | **Vanguard Horizon Ventures** (Ticket: $500K - $2M, Seed/Series A) |

---

## 📡 Core API Endpoints

### Authentication
* `POST /api/register` - Create founder or investor account
* `POST /api/login` - Authenticate and return JWT token
* `GET /api/me` - Retrieve current authenticated profile (Protected)

### AI Matchmaking & Intelligence
* `GET /api/ai/matches/:userId` - Calculate and rank matches between startups and investors
* `POST /api/ai/analyze/:startupId` - Parse pitch deck (PDF/PPTX) and generate due diligence score
* `POST /api/ai/chat` - Context-aware AI investment advisory chatbot

### Real-Time Messaging
* `GET /api/messages/conversations` - Retrieve all active dialogue threads (Protected)
* `GET /api/messages/:conversationId` - Fetch chat history for thread (Protected)
* `POST /api/messages/start` - Initialize new direct connection between users (Protected)
* `POST /api/messages/send` - Transmit message with Socket.io real-time broadcast (Protected)

---

## 📄 License
Licensed under the [MIT License](LICENSE).
