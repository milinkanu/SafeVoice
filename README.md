<div align="center">
  <h1>SafeVoice</h1>
  <p><strong>The Zero-Knowledge, Mathematically Secure POSH Reporting Platform</strong></p>

  [![React](https://img.shields.io/badge/Frontend-React%2018-blue?style=flat-square)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Bundler-Vite-purple?style=flat-square)](https://vitejs.dev/)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=flat-square)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square)](https://www.postgresql.org/)
  [![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](#)
</div>

<br/>

**SafeVoice** is a mathematically secure, zero-knowledge grievance reporting platform engineered to revolutionize workplace safety under the **Prevention of Sexual Harassment (POSH) Act, 2013**. 

Unlike traditional platforms, SafeVoice bridges the gap between the **organized corporate sector** and the vast **unorganized sector** (domestic workers, daily wage laborers, freelancers). By utilizing advanced client-side web cryptography, it guarantees **100% absolute victim anonymity** while maintaining rigorous legal traceability. 

It completely automates compliance with legally mandated ICC/LCC deadlines to ensure zero cases are ignored. Furthermore, it empowers women without corporate HR setups to register formal, legally binding complaints safely from their homes using an intuitive, **multilingual AI chatbot**, removing language and technological barriers completely.

---

## ✨ Core Features & Capabilities

### 🔒 1. Absolute Zero-Knowledge Anonymity
- **No Logins for Victims:** No email, no phone number, no trace. 
- **12-Word Passphrase:** Case access is protected by a BIP39 generated, client-side, 12-word secret passphrase. Only the victim holds the key.
- **Client-Side Encryption:** Case details and evidence are hashed/encrypted *inside the browser* before ever reaching the server.

### ⏱️ 2. Strict POSH Timeline Enforcement
The platform maps cases functionally according to the strict deadlines set by the POSH Act:
- **Day 7:** Mandatory initial acknowledgment.
- **Day 30:** Mandatory inquiry commencement.
- **Day 90:** Legal deadline for resolution. Cases exceeding 90 days trigger visual distress and potential LCC escalation.

### 🏢 3. Multi-Tier Governance Dashboards
- **Employee Portal:** File complaints, access the evidence vault, and track case statuses using the 12-word mnemonic.
- **ICC Dashboard:** The dedicated command center for the Internal Complaints Committee to accept cases, update statuses, view evidence safely, and complete their legal reports.
- **LCC Dashboard:** High-level dashboard for the Local Complaints Committee specifically tailored to monitor cases that the ICC failed to resolve within 90 days.

### 📄 4. Automated Legal Documentation (jsPDF)
- **Warning PDFs:** Auto-generates local case filings.
- **Evidence Certificates:** Generates tamper-proof cryptographic proofs of uploaded files. 
- **LCC Escalation Forms:** Auto-generates legal referral forms when ICC defaults.

### 🌍 5. Unorganized Sector & Multilingual Chatbot Support
- **Beyond Corporate Walls:** Specifically designed to be accessible for women working in the unorganized sector (domestic workers, daily wage laborers, freelancers, etc.) who lack a dedicated corporate HR setup.
- **Home-Safe Registration:** A built-in, intuitive **multilingual chatbot** allows victims to bypass complex forms, navigate legalities conversationally in their native regional language, and safely register complaints directly from their mobile phones without leaving their homes.

### 🤖 6. Real-time Telegram Notifications
- Implements a Node Telegram Bot to instantly ping the ICC members the second a new anonymous report is filed, accelerating response times.

---

## 🏗️ Technical Architecture & Stack

### Frontend (User & Dashboards)
* **Framework:** React 18 / Vite
* **Routing:** React Router v7
* **Styling:** Tailwind CSS + Framer Motion (for buttery smooth micro-interactions)
* **State Management:** Zustand
* **Cryptography:** Web Crypto API, `bip39`, `crypto-browserify`
* **Utilities:** `jspdf` (PDF generation), `lucide-react` (iconography), `react-dropzone`

### Backend (API Engine)
* **Runtime/Server:** Node.js v20+ with Express.js
* **Database:** PostgreSQL (via Supabase)
* **Security:** Helmet, Express-Rate-Limit, CORS, JWT
* **Integrations:** `node-telegram-bot-api` for async team alerts
* **Upload Management:** `multer`

---

## 🚦 End-to-End Walkthrough

1. **Assess (`/compass`):** Employee answers an 8-question wizard to check if their grievance legitimately falls under the POSH Act.
2. **Report (`/report`):** Victim formulates the complaint. Browser locks it encryptographically.
3. **Lock & Save:** The app dispenses the structural **Case ID** and a **12-word Secret Passphrase**. The victim downloads these securely.
4. **Track (`/track`):** Victim enters the passphrase to instantly retrieve their timeline and check ICC progress.
5. **ICC Review (`/icc`):** The internal committee accesses the encrypted queue, accepts the case, and interacts via immutable milestones.
6. **LCC Escalation (`/lcc`):** If a case lingers >90 days, it automatically ports to the LCC overview for higher judicial intervention.

---

## 🚀 Installation & Local Environment Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL Database (Or a Supabase instance)
- A Telegram Bot Token from BotFather *(optional for testing)*

### 1. Clone & Set Up Backend
```bash
git clone https://github.com/your-username/safevoice.git
cd safevoice/backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://your_db_connection_string
JWT_SECRET=your_super_secret_jwt_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

Start the Backend Server:
```bash
npm run dev
```

### 2. Set Up Frontend
Open a new terminal session.
```bash
cd safevoice
npm install
```

*(Optional)* If you have frontend environment variables, create `.env` in the root (matching `src/` directory).

Start the Frontend Server:
```bash
npm run dev
```

### 3. Usage
- Go to `http://localhost:5173` to view the public application.
- Use `http://localhost:5173/icc/login` to access the Internal Committee panel.

---

## 🤝 Contributing
Contributions are absolutely welcome. This project is dedicated to making modern corporate environments safer. If you have improvements for cryptography, UI flows, or testing, please:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Because everyone deserves a safe workplace, without fear of retaliation.*
