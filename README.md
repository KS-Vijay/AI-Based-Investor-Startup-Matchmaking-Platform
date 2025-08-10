<div align="center">
  <img src="client/public/vite.svg" alt="Logo" width="80"/>
  <h1>AI-Based Investor-Startup Matchmaking Platform</h1>
  <p>Connecting startups and investors with the power of AI.</p>
</div>

---

## Overview
The AI-Based Investor-Startup Matchmaking Platform leverages artificial intelligence to seamlessly connect promising startups with suitable investors. It streamlines the investment process, enabling startups to find the right funding and investors to discover high-potential opportunities.

---

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, React Router DOM
- **Backend:** Node.js, Express
- **AI Provider:** Gemini (Google Generative Language API)

---

## Folder Structure
```
AI-Based-Investor-Startup-Matchmaking-Platform/
│
├── client/         # Frontend (React, Vite, Tailwind)
│   ├── public/     # Static assets (favicons, etc.)
│   └── src/        # Source code
│       ├── assets/         # Images, icons, etc.
│       ├── components/     # Reusable UI and chat components
│       └── pages/          # App pages (Login, Dashboard, Matchmaking, etc.)
├── server/         # Node.js/Express backend and real-time chat (Socket.io)
└── README.md
```

---

## Features
- **AI-Driven Matchmaking:** Smart algorithms pair startups with relevant investors
- **User Onboarding:** Registration and profile management for both startups and investors
- **Advanced Search & Filters:** Find investors/startups by industry, funding stage, interests
- **Real-Time Chat:** Secure, real-time messaging powered by Socket.io
- **Dashboards:** Personalized analytics and insights
- **Modern UI:** Responsive, mobile-friendly design with Tailwind CSS

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (comes with Node.js)

### Installation & Running (Frontend)
```bash
# Clone the repository
$ git clone <repository-url>
$ cd AI-Based-Investor-Startup-Matchmaking-Platform/client
     ```

### Environment
Create `.env` at project root:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
# optional market data (fallbacks used if missing)
# ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### Run
From the `client/` folder:
```
npm install
npm run start
```
This installs/starts backend and frontend concurrently.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request. For major changes, open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.

## Contact
For questions or support, please open an issue in the repository or contact the maintainer.