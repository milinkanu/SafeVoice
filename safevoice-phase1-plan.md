# 🛡️ SafeVoice — Phase 1 Frontend Planning & Step-by-Step Todo

---

## 🎨 Design Direction

**Aesthetic:** "Secure Sanctuary" — Dark navy/deep teal base with soft warm amber accents.
Feels *safe, institutional but human*, not cold or clinical. Think: encrypted, private, trusted.

**Fonts:**
- Display: `DM Serif Display` — authoritative, warm
- Body: `DM Sans` — readable, modern
- Monospace (for case IDs, passphrases): `JetBrains Mono` — secure/technical feel

**Color Palette:**
```
--bg-primary:     #0D1117   (deep navy black)
--bg-secondary:   #161B22   (card bg)
--bg-surface:     #1F2937   (input/panel)
--accent-primary: #10B981   (emerald green — safety/go)
--accent-warm:    #F59E0B   (amber — alert/warning)
--accent-danger:  #EF4444   (red — urgent/deadline)
--text-primary:   #F9FAFB
--text-muted:     #6B7280
--border:         #374151
```

---

## 🗺️ Pages / Routes Overview

```
/                          → Landing Page (public)
/compass                   → POSH Eligibility Filter (public)
/report                    → Anonymous Complaint Form (public)
/report/success            → Case ID + Passphrase display (ONE TIME)
/track                     → Check Case Status (public, uses passphrase)
/evidence/:caseToken       → Evidence Locker
/icc                       → ICC Dashboard (protected, org login)
/icc/complaint/:id         → Single Complaint Detail + Timeline
/icc/login                 → ICC Login
```

---

## 📄 Page-by-Page Breakdown

---

### PAGE 1: Landing (`/`)

**Purpose:** Build trust, explain the platform, CTA to report or track.

**Sections:**
1. **Hero** — Tagline: "Your Voice. Protected. Anonymous." + two CTAs: [Report an Incident] [Check Case Status]
2. **How It Works** — 4 steps with icons: Compass → Report → Lock → Track
3. **Why SafeVoice** — 3 cards: Truly Anonymous / POSH Compliant / Legal Escalation Auto-pilot
4. **Know Your Rights** — Collapsible FAQ: What is POSH? Who is covered? What are the timelines?
5. **Footer** — Emergency links, POSH helpline numbers

**Key UI Elements:**
- Animated shield logo on load
- Subtle particle background (CSS only, no library)
- Cards with glassmorphism border
- Scroll-reveal animations on sections

---

### PAGE 2: Compass — POSH Eligibility Filter (`/compass`)

**Purpose:** 8-question conversational flow to determine if complaint qualifies under POSH.

**UI Pattern:** One question at a time (wizard), NOT a long form. Progress bar at top.

**Questions Flow:**
```
Q1: "Did this happen at your workplace or a work-related situation?"
    → Yes / No / Not Sure

Q2: "Who is the person who harassed you?"
    → My employer/boss / A colleague / A client or vendor / Someone else

Q3: "Was the behavior sexual in nature?" (tooltip explaining what this means)
    → Yes / No / I'm not sure

Q4: "Did it involve any of these?" (multi-select)
    → Physical contact | Sexual remarks/jokes | Showing explicit content |
      Demands for sexual favors | Stalking/following | Creating hostile environment

Q5: "How long ago did the most recent incident happen?"
    → Within last week | 1 week - 1 month | 1-3 months | More than 3 months ago

Q6: "Where do you work?"
    → Registered company (10+ employees) | Small company (<10 employees) |
      I work at someone's home (domestic worker) | Unorganized/daily wage

Q7: "Is there an Internal Complaints Committee (ICC) at your workplace?"
    → Yes | No | I don't know

Q8: "Are you comfortable sharing details with HR or ICC, or do you need full anonymity?"
    → I need full anonymity | I'm okay with limited sharing | Either is fine
```

**Outcome Screen (3 variants):**

✅ **POSH Applicable:**
> "Your experience qualifies under the POSH Act 2013. You have the right to file a formal complaint. Here's what happens next..."
> → [File Anonymous Complaint]

⚠️ **Partial / Consult Recommended:**
> "Your case may qualify. A few things need clarification. We recommend speaking with a support counselor before filing."
> → [File Anyway] [Speak to Counselor (NGO link)]

🔄 **Not POSH, But Protected:**
> "This may not fall under POSH, but you're still legally protected. Based on your answers, here's the relevant law:"
> → Show: IPC 354 / IT Act 66E / Domestic Violence Act etc. with plain-language explanation
> → Links to appropriate filing authorities

**Key UI Elements:**
- Each question slides in from right, previous slides out left
- Selected answer highlighted in emerald
- Back button always visible
- "What does this mean?" tooltip on complex questions
- Progress bar: "Question 3 of 8"

---

### PAGE 3: Anonymous Report Form (`/report`)

**Purpose:** Collect the complaint. Generate keypair in browser. Store only public key + encrypted data.

**Sections:**

**Section A — Incident Details**
- Date of incident (date picker)
- Location / workplace name (optional — can say "withheld")
- Department (optional)
- Nature of incident (multi-select from POSH categories)
- Description (textarea — min 50 chars, no character limit)
- Frequency: One-time / Repeated / Ongoing

**Section B — About the Accused**
- Designation level: Senior to me / Same level / Junior / External (client/vendor)
- Gender (optional)
- Department (optional)
- ⚠️ Note: "We do not store the accused's name at this stage. You may include it in your description above."

**Section C — Evidence Upload (Evidence Locker)**
- Drag & drop file upload
- Accepted: Images, PDF, Audio, Video (max 50MB each, 5 files)
- On upload: file is hashed client-side (SHA-256 via SubtleCrypto API)
- Hash displayed to user: "Your file fingerprint: abc123..."
- Note: "This fingerprint proves this file existed on [today's date]. Keep it safe."

**Section D — Contact (Optional but recommended)**
- WhatsApp number (for status updates via bot) — marked OPTIONAL
- Preferred language
- Note: "If you provide contact, it is stored separately from your complaint and encrypted. ICC will never see this."

**Submit Button:**
- Before submit: "Generating your anonymous identity..." (spinner)
- Keypair generated client-side using Web Crypto API
- Private key → BIP39 12-word mnemonic phrase generated
- Only public key sent to server with complaint

**Key UI Elements:**
- Multi-step form (3 sections, separate screens)
- Auto-save to localStorage (cleared after successful submit)
- Sensitive field blur on tab-out
- Word count on description
- File upload with progress bar + hash display

---

### PAGE 4: Success / Case ID Screen (`/report/success`)

**Purpose:** Show case ID + 12-word passphrase. THIS IS SHOWN ONCE ONLY.

**Layout:**
```
┌─────────────────────────────────────┐
│  ✅ Complaint Filed Successfully     │
│                                     │
│  Your Case ID:                      │
│  ┌─────────────────────────────┐    │
│  │  SV-2025-XK9-4721           │    │
│  └─────────────────────────────┘    │
│                                     │
│  Your Secret Passphrase (SAVE THIS) │
│  ┌─────────────────────────────┐    │
│  │  maple river cloud anchor   │    │
│  │  stone bridge forest amber  │    │
│  │  wave orbit silent pulse    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ⚠️ This passphrase will NEVER be   │
│  shown again. Write it down or      │
│  screenshot it now.                 │
│                                     │
│  [ Copy Passphrase ] [ Download PDF ]│
│                                     │
│  [ Track My Case → ]                │
└─────────────────────────────────────┘
```

**Key behaviors:**
- Page cannot be refreshed/navigated back to
- 5-minute session timer with warning
- "Download PDF" generates a PDF with case ID + passphrase + what to expect next
- Copy button copies to clipboard with confirmation
- After 5 min: auto-redirect to `/track` with case ID pre-filled

---

### PAGE 5: Track Case Status (`/track`)

**Purpose:** Let complainant check status anonymously using passphrase.

**Step 1 — Authentication:**
- Input: Case ID (optional — can look up by passphrase alone)
- Input: 12-word passphrase (word-by-word input or paste)
- Submit → client-side signs a challenge with private key derived from passphrase
- Server verifies signature against stored public key

**Step 2 — Case Dashboard (on successful auth):**

```
CASE STATUS DASHBOARD
─────────────────────────────
Case ID: SV-2025-XK9-4721
Filed: Nov 15, 2025

TIMELINE PROGRESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

● Day 0    [Nov 15] Complaint Filed ✅
● Day 7    [Nov 22] ICC Acknowledgment ⏳ (3 days left)
  Day 30   [Dec 15] Inquiry Must Begin
  Day 90   [Feb 13] Inquiry Must Complete
  Day 150  [Apr 4]  Escalation Deadline

─────────────────────────────
ICC RESPONSE:
"Your complaint has been received and assigned to the ICC."
[Received: Nov 17]

─────────────────────────────
ACTIONS AVAILABLE:
[ Add More Evidence ]
[ Download Legal Notice Template ] ← appears if ICC misses Day 7
[ Generate LCC Escalation Form ]   ← appears if ICC misses Day 90
```

**Key UI Elements:**
- Visual timeline with progress dots (like a delivery tracker)
- Color coding: Green=done, Amber=pending/upcoming, Red=missed deadline
- Locked/blurred sections for future milestones
- Notification preference setting (WhatsApp/Email if contact was provided)

---

### PAGE 6: Evidence Locker (`/evidence/:caseToken`)

**Purpose:** Add more evidence post-filing, view evidence hashes, download certificates.

**Layout:**
- List of uploaded files with hash + upload timestamp
- "Add Evidence" button → same upload flow as in report form
- Each file has a "Download Certificate" button
- Certificate is a PDF: "This file [filename] with hash [hash] was submitted on [date] as part of case [ID]. This timestamp is anchored to [OpenTimestamps proof]."

---

### PAGE 7: ICC Dashboard (`/icc`)

**Purpose:** Organization's ICC members manage complaints.

**Sidebar Navigation:**
- Overview
- All Complaints
- Pending Action
- Closed Cases
- Analytics

**Overview Screen:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Total Cases │ Pending      │  Overdue     │  Closed      │
│     24       │    12        │    3 🔴      │    9         │
└──────────────┴──────────────┴──────────────┴──────────────┘

UPCOMING DEADLINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SV-2025-XK9-4721  Day 7 in 2 days    [Acknowledge Now]
SV-2025-AB3-1892  Day 30 in 5 days   [Begin Inquiry]
SV-2025-QR7-5523  Day 90 OVERDUE 🔴  [Download LCC Form]

PATTERN ALERT 🔶
Engineering Dept: 4 complaints in 60 days (3x avg rate)
```

**All Complaints Table:**
- Columns: Case ID | Filed Date | Category | Status | Days Elapsed | Action
- Filter by: Status / Department / Date range / Category
- Sort by: Days elapsed, urgency

**Single Complaint View (`/icc/complaint/:id`):**
```
LEFT PANEL (60%)               RIGHT PANEL (40%)
─────────────────────          ──────────────────
Case Details                   Timeline Tracker
- Category                     - Day 0 ✅
- Description                  - Day 7 ⏳
- Incident date                - Day 30
- Evidence files               - Day 90
- Accused designation          - Day 150

                               ICC Actions
                               [ Mark Acknowledged ]
                               [ Log Inquiry Start ]
                               [ Upload Resolution ]
                               [ Send Response to Victim ]

                               Auto-generated Docs
                               [ Day 7 Notice (if late) ]
                               [ LCC Form (if Day 90 missed) ]
```

**Key UI Elements:**
- Red badge on overdue items
- One-click "Download LCC Escalation Form" pre-filled with case data
- "Send Message to Complainant" (delivered anonymously via the platform)
- Case notes (internal, ICC only)

---

## 🔧 Component Library (Build These First)

Build these reusable components before pages:

```
/components
├── ui/
│   ├── Button.jsx          (variants: primary, danger, ghost, outline)
│   ├── Input.jsx           (with label, error state, sensitive blur)
│   ├── Card.jsx            (glassmorphism, standard)
│   ├── Badge.jsx           (status: pending, active, overdue, closed)
│   ├── ProgressBar.jsx     (linear, step)
│   ├── Timeline.jsx        (vertical timeline with status dots)
│   ├── FileUpload.jsx      (drag-drop with hash display)
│   ├── Tooltip.jsx
│   └── Modal.jsx
├── layout/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx         (ICC dashboard)
│   └── PageWrapper.jsx
└── features/
    ├── CompassWizard.jsx   (question flow engine)
    ├── PassphraseDisplay.jsx
    ├── PassphraseInput.jsx (word-by-word entry)
    ├── CaseTimeline.jsx
    ├── EvidenceLocker.jsx
    └── EscalationDocs.jsx  (PDF generators)
```

---

## 📁 Folder Structure

```
safevoice/
├── public/
│   └── fonts/
├── src/
│   ├── components/         (as above)
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Compass.jsx
│   │   ├── Report.jsx
│   │   ├── ReportSuccess.jsx
│   │   ├── Track.jsx
│   │   ├── Evidence.jsx
│   │   └── icc/
│   │       ├── Dashboard.jsx
│   │       ├── ComplaintDetail.jsx
│   │       └── Login.jsx
│   ├── lib/
│   │   ├── crypto.js       (keypair gen, sign/verify, BIP39)
│   │   ├── hash.js         (SHA-256 file hashing)
│   │   ├── pdfgen.js       (certificate + escalation form generation)
│   │   └── compass.js      (eligibility scoring logic)
│   ├── store/
│   │   └── reportStore.js  (Zustand — multi-step form state)
│   ├── api/
│   │   ├── complaints.js
│   │   ├── evidence.js
│   │   └── icc.js
│   ├── styles/
│   │   └── globals.css
│   └── App.jsx
├── backend/                (separate folder)
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── services/
└── package.json
```

---

## ✅ STEP-BY-STEP TODO (Prioritized)

### 🔴 WEEK 1 — Foundation + Core Crypto

**Day 1-2: Project Setup**
- [ ] Create React app with Vite
- [ ] Install: React Router, Tailwind CSS, Zustand, jsPDF, BIP39
- [ ] Set up color palette + fonts in `tailwind.config.js` and `globals.css`
- [ ] Build all UI primitives: Button, Input, Card, Badge
- [ ] Set up React Router with all routes (stub pages)

**Day 3-4: Crypto Layer (lib/crypto.js)**
- [ ] Implement keypair generation using `window.crypto.subtle.generateKey(ECDSA)`
- [ ] Implement BIP39 12-word mnemonic from private key entropy
- [ ] Implement `signChallenge(privateKey, challenge)` function
- [ ] Implement `verifySignature(publicKey, challenge, signature)` function
- [ ] Implement `exportPublicKey()` → base64 string for server storage
- [ ] Implement `deriveKeyFromMnemonic(words[])` → reconstruct private key
- [ ] **Test all crypto functions thoroughly in isolation**

**Day 5: File Hashing (lib/hash.js)**
- [ ] Implement `hashFile(file)` → SHA-256 via SubtleCrypto, returns hex string
- [ ] Build FileUpload component with drag-drop + progress + hash display
- [ ] Test with various file types

**Day 6-7: Backend Setup**
- [ ] Set up Express server + PostgreSQL
- [ ] Create tables: `complaints`, `evidence`, `icc_users`, `icc_actions`
- [ ] Implement endpoints:
  - `POST /api/complaints` — store complaint + public key
  - `GET /api/complaints/challenge` — return a challenge string for auth
  - `POST /api/complaints/verify` — verify signature, return case status
  - `POST /api/evidence/:caseId` — upload evidence file + store hash
  - `PATCH /api/icc/complaints/:id` — update status (ICC actions)
- [ ] Enable CORS, rate limiting, helmet.js security headers
- [ ] Set up encryption at rest for description field (AES-256)

---

### 🟡 WEEK 2 — Core User Flows

**Day 8-9: Compass Page**
- [ ] Build `CompassWizard.jsx` — question-by-question engine with slide animation
- [ ] Implement `compass.js` scoring logic — maps answers to outcome
- [ ] Build 3 outcome screens (POSH applicable / Partial / Redirect)
- [ ] Add tooltips on complex questions
- [ ] Connect "File Complaint" CTA to `/report`

**Day 10-11: Report Form**
- [ ] Build multi-step form (3 sections) with Zustand store
- [ ] Section A: Incident details with date picker
- [ ] Section B: Accused info
- [ ] Section C: File upload integrated with hash.js
- [ ] Progress indicator between sections
- [ ] On submit: call `crypto.js` to generate keypair → show loading → POST to API
- [ ] localStorage auto-save (cleared on success)

**Day 12: Success Page**
- [ ] Display case ID + 12-word passphrase in styled card
- [ ] "Copy Passphrase" button with clipboard API
- [ ] "Download PDF" using jsPDF — case ID, passphrase, what to expect next
- [ ] 5-minute countdown timer with warning modal
- [ ] Auto-redirect to `/track` after timeout

**Day 13-14: Track Page**
- [ ] Build passphrase input (12 individual word inputs OR single paste box — toggle)
- [ ] On submit: fetch challenge from API → sign with derived private key → verify
- [ ] On success: fetch and display case status
- [ ] Build `CaseTimeline.jsx` — vertical timeline with status dots, color coding
- [ ] Show ICC messages if any
- [ ] Conditionally show: "Download Legal Notice Template" (if Day 7 missed)

---

### 🟢 WEEK 3 — ICC Dashboard + Escalation Docs

**Day 15-16: ICC Login + Auth**
- [ ] Simple email/password login for ICC members
- [ ] JWT token, protected routes
- [ ] Role: ICC member / ICC admin (admin can see analytics)

**Day 17-18: ICC Dashboard**
- [ ] Overview page: stats cards + upcoming deadlines table + pattern alert banner
- [ ] All Complaints table with filter/sort
- [ ] Single Complaint detail view (left/right panel layout)
- [ ] ICC action buttons: Acknowledge, Log Inquiry Start, Upload Resolution
- [ ] Messaging: ICC sends message → stored anonymously → visible on Track page

**Day 19: Automated Timeline Engine**
- [ ] Backend cron job (node-cron) runs every night
- [ ] Checks all active complaints for missed deadlines
- [ ] Day 7 missed → set `icc_status = 'overdue_acknowledge'`
- [ ] Day 30 missed → set `icc_status = 'overdue_inquiry'`
- [ ] Day 90 missed → set `icc_status = 'overdue_resolution'`
- [ ] On track page, missed deadlines trigger document download buttons

**Day 20-21: Escalation Documents (lib/pdfgen.js)**
- [ ] **Day 7 Legal Notice Template:** PDF with case ID, filing date, ICC acknowledgment deadline, legal reference (POSH Act Section 13), blank for victim to fill name/send
- [ ] **Day 90 LCC Escalation Form:** Pre-filled complaint to Local Complaints Committee — case ID, incident dates, ICC name, organization name, description of ICC inaction
- [ ] **Day 150 Court Guidance:** PDF guide — steps to approach District Officer, sample writ petition structure, list of legal aid organizations
- [ ] All PDFs should look official and properly formatted

---

### 🔵 WEEK 4 — Polish + Evidence Locker + Testing

**Day 22: Evidence Locker Page**
- [ ] List all evidence submitted with hash + upload date
- [ ] "Add more evidence" upload flow
- [ ] "Download Certificate" per file — PDF with hash, timestamp, case ID
- [ ] OpenTimestamps integration (if time allows — else note hash + date only)

**Day 23-24: Landing Page**
- [ ] Hero with animated shield
- [ ] "How it Works" section
- [ ] "Why SafeVoice" cards
- [ ] FAQ accordion (POSH basics)
- [ ] Footer with helpline numbers

**Day 25-26: QA + Security Review**
- [ ] Test all crypto flows end-to-end
- [ ] Verify: private key NEVER sent to server (check network tab)
- [ ] Test: wrong passphrase cannot access case
- [ ] Test: all PDF downloads generate correctly
- [ ] Test on mobile (responsive)
- [ ] Accessibility: ARIA labels, keyboard navigation on wizard

**Day 27-28: Demo Prep**
- [ ] Seed demo data (3-4 sample cases at different timeline stages)
- [ ] Create ICC demo account
- [ ] Record demo flow: Compass → Report → Success → Track → ICC Dashboard → Escalation doc
- [ ] Deploy to Vercel (frontend) + Railway or Render (backend)

---

## 🔐 Security Checklist

- [ ] Private key: generated and stays client-side only ✓
- [ ] Server stores: public key, encrypted description, file hashes (not files themselves in DB)
- [ ] Files stored: encrypted S3 bucket, accessed only via signed URLs
- [ ] API: rate limited (max 5 complaints/hour per IP)
- [ ] HTTPS only, HSTS headers
- [ ] No logging of IP addresses for complaint submissions
- [ ] Session: JWT with 1-hour expiry for ICC dashboard
- [ ] CSRF protection on all mutation endpoints
- [ ] Input sanitization (no XSS via description field)

---

## 📦 Key Libraries

```json
{
  "frontend": {
    "vite + react": "build tool",
    "react-router-dom": "routing",
    "tailwindcss": "styling",
    "zustand": "form state management",
    "bip39": "12-word mnemonic generation",
    "jspdf": "PDF generation for certificates + escalation forms",
    "react-dropzone": "file upload",
    "framer-motion": "wizard slide animations",
    "date-fns": "date calculations for timeline"
  },
  "backend": {
    "express": "API server",
    "pg": "PostgreSQL client",
    "bcrypt": "ICC password hashing",
    "jsonwebtoken": "ICC auth",
    "multer + s3": "file uploads",
    "node-cron": "daily deadline checker",
    "helmet + cors + rate-limit": "security"
  }
}
```

---

## 🧪 Demo Script (for Hackathon)

1. **Compass** — show a domestic worker scenario → outcome: "POSH applies, route to LCC"
2. **Report Form** — fill in incident, upload screenshot (show hash being computed live)
3. **Success Page** — show passphrase generation, download PDF
4. **Track Page** — paste passphrase, show timeline (Day 7 missed = legal notice button appears)
5. **ICC Dashboard** — show overdue case, pattern alert banner, click "Download LCC Form"
6. **LCC Form PDF** — show pre-filled official-looking document

**Total demo time: ~4 minutes**

---

*Built for WS010 — SafeVoice: Anonymous Reporting Platform for Workplace Harassment*
