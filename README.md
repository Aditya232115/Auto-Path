# Action Path

> **Understand any form. Know exactly what to do next.**

Action Path is a production-quality, accessible multi-page web application designed specifically for older adults and first-time digital applicants. It transforms dense official notices, government schemes, pension instructions, and bank KYC letters into a clear, grade-6 plain-language summary and an interactive step-by-step action checklist in **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.

---

## 🌟 Key Features

### 1. Document Analysis
- **3 Flexible Input Modes**:
  - **Paste Text**: Paste from emails, government portals, or SMS alerts.
  - **Upload Photo / Image**: Capture or upload document photos (JPG, PNG, WebP) directly from a phone or computer camera.
  - **Built-in Sample Notices**: Pre-loaded real-world scenarios:
    1. *Pension Life Certificate (Jeevan Pramaan)* annual renewal notice.
    2. *Bank Account Periodic KYC Re-verification* (RBI compliance directive).
    3. *Post-Matric Higher Education Scholarship & Fee Waiver Guide*.
- **Quick Search & Filtering**: Instant keyword search (`pension`, `scholarship`, `bank`, `kyc`) and category pill filters.
- **Reading Level Options**: *Simple (Standard Grade 6)* or *Very Simple (Shortest microscopic steps)*.
- **Privacy Promise**: Documents are processed in-memory and never stored on servers.

### 2. Action Plan & Results
- **Plain-Language Summary**: Factual summary under 60 words.
- **Interactive Voice Player**: Native browser speech synthesis with Play, Pause, Resume, Stop, animated audio waves, and adjustable playback speeds (0.75x, 1x, 1.25x).
- **Numbered Action Checklist**: Large touch-friendly checkboxes with strikethrough, estimated completion times, and difficulty badges (*Easy*, *Moderate*, *May Need Help*).
- **Progress Tracking**: Real-time progress bar saved locally in `localStorage`.
- **Context Panels**: Checkable *Documents You Need*, chronological *Deadlines*, warning-styled *Common Mistakes to Avoid*, and *Privacy & Safety Alerts* (e.g., warning against sharing OTPs or ATM PINs).
- **Hard Words Explained**: Interactive glossary translating complex bureaucratic terms into everyday language.
- **Print & Copy Utility**: One-click checklist copy and dedicated print styling for clean physical printouts.
- **Grounded Follow-Up Q&A**: Ask follow-up questions answered strictly using the analyzed document as context.

### 3. Patient Gemini Assistant ("Sahayak")
- **Multi-Turn Chat Page (`/chat`)**: Maintains full conversation history with auto-scrolling thread.
- **Audio Read-Aloud on Every Answer**: Listen aloud button for older adults.
- **Specialized Roles**:
  - *Patient Guide* (powered by `gemini-3.8-flash`): Step-by-step guidance and reassurance.
  - *Quick Explainer* (powered by `gemini-3.1-flash-lite`): Fast, concise definitions.
  - *Checklist Creator* (powered by `gemini-3.8-flash`): Action plan generator.
- **Starter Prompts**: One-tap cards to start chatting without typing from scratch.
- **Always-Accessible Launcher**: Floating assistant button available across all pages.

### 4. Dedicated Feedback System (`/feedback`)
- 5-Star rating with emoji feedback (*Very Hard* → *Wonderfully Easy*).
- Step clarity scale (1 to 5).
- Task completion buttons (*Yes, fully* / *Partially* / *No*).
- Independent understanding toggle.
- Live character-counter textareas (500 max) for confusion and suggestions.
- Celebratory completion screen with animated SVG checkmark and confetti burst.
- Real-time community aggregate rating strip.

---

## ♿ Accessibility & Design

- **Typography**: Paired *Inter* and *Noto Sans Devanagari* for native conjunct rendering.
- **Text Sizing Controls**: Dynamic text scaling buttons (`A-` / `A+`) in the sticky navigation bar (18px base, 20px, 22px).
- **High-Contrast Color System**: WCAG AA compliant (>7:1 contrast) with deep royal blue `#1D4ED8`, teal `#0F766E`, and slate `#0F172A`.
- **Touch-Friendly**: Minimum 44px–48px touch targets for buttons, checkboxes, and tabs.
- **Screen Reader Ready**: Full ARIA labels, semantic landmark regions, and visible focus rings.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Canvas Confetti.
- **Routing**: React Router (`react-router-dom`).
- **AI & Models**: Google GenAI SDK (`@google/genai`) using `gemini-2.5-flash`, `gemini-3.8-flash`, and `gemini-3.1-flash-lite`.
- **Backend**: Express server with Vite middleware in development and static asset serving in production.
- **Speech**: Browser native Web Speech API (`window.speechSynthesis`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd action-path
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your API key:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 License

Apache-2.0 License. Built for digital confidence and public accessibility.
