# SafeVoice — Anonymous POSH Reporting Platform

SafeVoice is a mathematically secure, zero-knowledge reporting platform designed to help employees file workplace harassment complaints strictly under the Prevention of Sexual Harassment (POSH) Act, 2013. 

It uses client-side cryptography to let victims maintain 100% anonymity while still being perfectly trackable, allowing them to monitor the mandatory ICC (Internal Complaints Committee) legal deadlines (Day 7, 30, 90).

## 🚀 Getting Started (Phase 1 MVP)

This repository contains both a React frontend and an Express backend. For Phase 1 demo purposes, the frontend is actively mocking database connections using your browser's `localStorage`, meaning you do not need to boot up a PostgreSQL database to test the end-to-end flow!

### 1. Start the Frontend
1. Open a terminal and navigate to the main frontend directory:
   ```bash
   cd safevoice
   ```
2. Install the frontend dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to: [http://localhost:5173](http://localhost:5173)

### 2. Start the Backend API (Optional for Phase 1 Demo)
1. Open a **new terminal** and navigate to the backend directory:
   ```bash
   cd safevoice/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Node.js server:
   ```bash
   npm run dev
   ```
   *The API will be running on `http://localhost:5000`*

---

## 🧪 Testing the 4-Minute Hackathon Demo

To experience the full capability of the zero-knowledge engine, follow these steps:

1. **Assess (`/compass`)**: Click *Check Your Eligibility* on the Landing page and answer the 8-question wizard.
2. **Report (`/report`)**: Fill out the anonymous complaint. When you submit, your browser generates a local cryptographic keypair and encrypts the context.
3. **Lock & Save (`/report/success`)**: You will be presented with your structural **Case ID** and a **12-word Secret Passphrase**. Save this carefully! (You can click download to generate the official Warning PDF).
4. **Track (`/track`)**: You will be redirected to the tracking system. Paste your 12-word passphrase. It will securely authenticate you and pull up your Case Timeline.
5. **ICC Command Center (`/icc/login`)**: Open a new browser tab and navigate to `http://localhost:5173/icc/login`. Use any email/password to login.
6. **ICC Dashboard (`/icc`)**: View the active complaint queue. Find your freshly submitted complaint, click **View**, and actively click **Mark as Acknowledged**!
7. **Switch back to your `Track` tab** — the complainant timeline will now show the ICC's official acknowledgment!

---

## 🔐 Technologies Used
* **Frontend:** React, Vite, Tailwind CSS, Zustand, Framer Motion
* **Cryptography:** Web Crypto API, BIP39 (12-word mnemonic generation), SHA-256 (Client-side localized file hashing)
* **Utilities:** jsPDF (Client-side certificate & legal document generation), React Dropzone
* **Backend:** Node.js, Express, Postgres (Set up for Phase 2 integration)

---
*Note: Because this prototype binds cases to your browser's `localStorage`, you must use the same browser (e.g., normal vs. incognito mode) to see the reports map from the public frontend over to the ICC Dashboard.*
