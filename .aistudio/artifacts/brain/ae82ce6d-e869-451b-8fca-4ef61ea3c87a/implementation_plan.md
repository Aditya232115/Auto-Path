# Action Path: Plain-Language Guide & Action Checklist for Complex Documents

Action Path is an accessible, reassuring web application designed specifically for older adults and first-time digital users. It transforms dense official notices, pension/scholarship instructions, and bank KYC requirements into a clear, grade-6 plain-language summary and an interactive, step-by-step action checklist in English, Hindi, and Marathi.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during initial clarification and are locked into the system architecture:

- **Read-Aloud Audio System**: Confirmed interactive voice player with Play, Pause, Resume, and adjustable playback speed (0.75x, 1x, 1.25x) tailored for older adults needing slower, clearer diction.
- **Sample Documents**: Confirmed 3 pre-loaded real-world scenarios:
  1. *Government Pension Scheme Life Certificate (Jeevan Pramaan)* annual verification notice (featured by default).
  2. *Bank KYC & Re-Verification Update* notice (RBI account mandate).
  3. *Post-Matric National Scholarship* application and fee waiver guide.
- **Language Switcher**: Confirmed direct header buttons rendering language options directly in their native scripts (`English` · `हिन्दी` · `मराठी`) for instant one-click switching with zero dropdown friction.

---

## 1. Overview & Core Concept

### What It Does
Action Path accepts complex documents via pasted text, camera photo/document image upload, or realistic built-in samples. It invokes a dedicated server-side Gemini service utilizing structured JSON schema output to produce:
1. **Grade-6 Plain Summary**: Under 60 words, strictly factual, calm, and reassuring.
2. **Interactive Action Checklist**: Numbered, checkable steps with difficulty level badges (Easy, Medium, Needs Help), estimated completion times, and plain-English step instructions.
3. **Required Documents & Deadlines**: Immediate inventory of what paperwork to bring and strict chronological deadlines.
4. **Common Pitfalls & Privacy Flags**: Warnings against scam solicitations, unverified agents, or unencrypted personal credential sharing.
5. **Hard Words Explained**: Interactive glossary translating bureaucratic jargon (e.g., "attestation", "KYC", "stipulation", "affidavit") into everyday terminology.
6. **Follow-Up Assistant**: An interactive Q&A assistant contextualized strictly to the analyzed document.

### Target Audience & Persona
- Older adults (ages 55+) renewing pension documents, health cards, or bank accounts who fear making costly mistakes.
- First-generation digital users applying for state scholarships or citizen benefits.
- Caregivers and family members seeking an authoritative, stress-free checklist to walk their parents through official paperwork.

### Key Value
Eliminates bureaucratic intimidation and reliance on third-party brokers by providing step-by-step independence, calm reassurance, and zero privacy risk.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Landing Page ] 
      │
      ├─► Direct Language Switcher (EN / HI / MR)
      ├─► Text Size Controls (A- / A / A+)
      └─► Primary CTA ("Get my action steps")
               │
               ▼
   [ Analyze Page / Section ]
      │
      ├─► Tab 1: Paste Text (Clean multiline textarea with character hint)
      ├─► Tab 2: Upload Photo / PDF (Drag & drop or camera snapshot with thumbnail preview)
      ├─► Tab 3: Try a Sample (Jeevan Pramaan Pension, Bank KYC, or Student Scholarship)
      ├─► Reading Level Toggle: "Simple (Grade 6)" vs "Very Simple (Step-by-step)"
      ├─► Privacy Reassurance Banner: "We don't store your documents."
      └─► "Analyze Document" Button with accessible skeleton shimmer loading
               │
               ▼
    [ Action Result Page ]
      │
      ├─► Sticky Action Status Bar: "2 of 6 steps completed" + animated progress bar
      ├─► Voice Player: Read-aloud audio with Play/Pause & Speed toggle (0.75x, 1x)
      ├─► Confidence Badge & Official Verification Disclaimer
      ├─► Numbered Step Cards: Large tap target checkboxes with strikethrough & completion badges
      ├─► Context Panels:
      │     ├─ Documents You Need (Checkable physical items)
      │     ├─ Critical Deadlines (Calendar date callouts)
      │     ├─ Common Mistakes to Avoid (Warning border & tips)
      │     ├─ Privacy Alerts (Alerting when OTPs or passwords should NEVER be given)
      │     └─ Hard Words Explained (Glossary pills with modal/accordion definitions)
      ├─► Utility Bar: Copy Checklist · Print / Save PDF · Start Over
      ├─► In-Context Follow-Up Question Box (Answers grounded in the document)
      └─► Floating / Sticky Footer CTA: "Share Your Feedback" ──► [ /feedback ]
```

### Visual Identity & Theme
- **Color System (Calm Health-Tech / Gov-Tech)**:
  - Neutral Canvas: `#F8FAFC` (Slate 50) dominant background for optimal optical comfort.
  - Structural Surfaces: `#FFFFFF` cards with subtle hairline border `#E2E8F0` and layered soft shadows (`shadow-sm` / `shadow-md`).
  - Primary Action: Deep Royal Blue `#1D4ED8` (Hover `#1E40AF`, Active `#1E3A8A`).
  - Accent / Reassurance: Deep Teal `#0F766E` (Soft teal tint for positive trust badges).
  - Semantic Status:
    - Success: `#16A34A` (Green 600) for completed steps and safety confirmations.
    - Warning: `#D97706` (Amber 600) for strict deadlines and cautionary tips.
    - Danger / Privacy Alert: `#DC2626` (Red 600) for scam warnings and OTP sensitivity.
    - Text Primary: `#0F172A` (Slate 900) ensuring >7:1 contrast ratio.
    - Text Muted: `#475569` (Slate 600) ensuring >4.5:1 WCAG AA compliance.
- **Typography**:
  - Latin Body & Display: *Inter* (Google Fonts) with geometric clarity and open counters.
  - Devanagari (Hindi & Marathi): *Noto Sans Devanagari* with native conjunct support.
  - Accessible Type Scale: Base font starts at 18px (`text-lg`), with dynamic scaling up to 22px for `A+` mode.
  - Tabular Numerals (`font-mono tabular-nums`) for all step counters, progress percentages, and dates.
- **Accessible Touch & Spatial Layout**:
  - Touch targets $\ge 48\text{px}$ on all buttons, checkboxes, tabs, and language toggles.
  - Card radius: 16px (`rounded-2xl`).
  - Container width: Max 1100px with generous 32px padding for desktop; responsive collapse to single column at 360px mobile.

### Interactive Feedback & Motion
- **Entry Animations**: Subtle staggered fade-up (150–250ms) using Motion (`motion.div`).
- **Step Check-off**: Satisfying micro-spring animation on checkmark fill, green progress bar expansion, and subtle step strikethrough.
- **Voice Playback Indicator**: Pulsing waveform bars during speech synthesis.
- **Feedback Rating**: Interactive 5-star rating with hover scale and micro-feedback label transitions (1: "Very Confusing" → 5: "Extremely Clear").
- **Accessibility Motion Fallback**: Full respect for `prefers-reduced-motion` to immediately display states without transitions.

---

## 3. Key Product Decisions & Trade-Offs

### 1. Client-Side Speech Synthesis vs External Cloud TTS
- **Chosen Approach**: Browser native `window.speechSynthesis` with language-specific voice fallback (`en-IN`, `hi-IN`, `mr-IN` or universal Hindi/Marathi fallback).
- **Why**: Zero latency, zero per-character API costs, runs 100% locally on the user's device without transmitting synthesized audio data over the network, and respects device accessibility audio settings.

### 2. Multi-Lingual Architecture (i18n)
- **Chosen Approach**: Clean in-memory dictionary covering English, Hindi (हिन्दी), and Marathi (मराठी) across all UI elements, button labels, error states, and sample documents. In addition, the Gemini prompt instructs the model to translate and simplify the output directly into the selected target language.
- **Why**: Allows instant switching without page reloads while maintaining grade-6 cultural and linguistic naturalness.

### 3. Server-Side Gemini API Proxy with Structured JSON Schema
- **Chosen Approach**: Express API endpoint (`/api/analyze`) communicating with `@google/genai` on the server using `gemini-2.5-flash` with strict JSON schema definition.
- **Why**: Keeps API keys completely private on the server, guarantees valid JSON output matching the TypeScript interface, and handles multimodal images (via base64 inlineData) cleanly.

### 4. Storage & Privacy Strategy
- **Chosen Approach**: `localStorage` exclusively for non-sensitive UX state (selected language, text size preference, completed step IDs per document session, and submitted feedback history). Document contents are never persisted.
- **Why**: Gives users complete privacy peace of mind while preserving progress if they accidentally refresh the page.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER (Vite + React)                   │
├────────────────────────────────────────────────────────────────────────┤
│  Global State (Context):                                              │
│  • Language (en | hi | mr)                                             │
│  • TextSizeScale (normal | large | x-large)                           │
│  • CompletedSteps (Set<string>)                                        │
│                                                                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │     Landing View      │  │  Analyze View   │  │   Result View    │  │
│  │ • Hero & Trust Row    │  │ • Text / Image  │  │ • Step Checklist │  │
│  │ • How it works        │  │ • Samples       │  │ • Voice Player   │  │
│  │ • FAQ Accordion       │  │ • Reading Level │  │ • Follow-up Q&A  │  │
│  └───────────────────────┘  └─────────────────┘  └──────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Feedback View (/feedback)                                       │  │
│  │  • Star Rating (1-5) · Ease Rating · Completion (Yes/Partly/No)  │  │
│  │  • Improvement Textareas · Community Average Score Strip         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP POST
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND SERVER (Node.js)                     │
├────────────────────────────────────────────────────────────────────────┤
│  Endpoints:                                                            │
│  • POST /api/analyze: Receives text or imageBase64 + language + level   │
│  • POST /api/ask-followup: Receives question + document context        │
│  • POST /api/feedback: Receives rating payload (for optional webhook)  │
│                                                                        │
│  SDK: Google GenAI SDK (@google/genai)                                 │
│  • Model: gemini-2.5-flash (or gemini-3.8-flash fallback)              │
│  • Config: responseMimeType: "application/json", Type.OBJECT schema   │
│  • Strict System Instruction: Patient Grade-6 Helper                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Server-side API Call
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE GEMINI API                               │
│              (Structured JSON Response / Analysis)                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Schema (TypeScript & Gemini Response Schema)

```typescript
export interface ActionStep {
  id: string;
  action: string;
  detail: string;
  difficulty: "Easy" | "Medium" | "Needs Help";
  estimatedTime: string;
}

export interface DeadlineItem {
  label: string;
  date: string;
}

export interface GlossaryItem {
  term: string;
  meaning: string;
}

export interface AnalysisResult {
  title: string;
  summary: string;
  steps: ActionStep[];
  documentsNeeded: string[];
  deadlines: DeadlineItem[];
  commonMistakes: string[];
  privacyFlags: string[];
  glossary: GlossaryItem[];
  confidence: "High" | "Medium" | "Low";
  disclaimer: string;
}

export interface UserFeedback {
  id: string;
  timestamp: string;
  overallRating: number;
  clarityRating: number;
  completedTask: "Yes" | "Partly" | "No";
  understoodIndependently: boolean;
  confusingParts?: string;
  suggestedImprovements?: string;
  contact?: string;
}
```

### Interactive State Transitions
- **Analysis Execution**: Form validate $\rightarrow$ Loading skeleton trigger $\rightarrow$ Backend JSON validation $\rightarrow$ Smooth transition to Result view with auto-scroll to top.
- **Checklist Interaction**: Tap step $\rightarrow$ Toggle completed state $\rightarrow$ Store in session map $\rightarrow$ Update circular / linear progress bar $\rightarrow$ Sound / visual check confirmation.
- **Follow-up Interaction**: Enter question $\rightarrow$ Send question with original document and summary context $\rightarrow$ Streamed or instant plain-language answer bubble.
- **Feedback Submission**: Real-time character count (max 500) $\rightarrow$ Star hover effects $\rightarrow$ Submit $\rightarrow$ SVG check draw animation + celebratory burst $\rightarrow$ Summary stats refresh.

---

## Verification Plan

### Automated & Compilation Checks
1. Dependency Installation: Install `react-router-dom` and required helper utilities via `install_applet_package`.
2. TypeScript & Build: Execute `compile_applet` and `lint_applet` to guarantee zero type errors.
3. Node Server Verification: Confirm Express backend properly starts, proxies requests to `@google/genai`, and serves static assets.

### Functional Test Scenarios
- **Sample Document Analysis**: Test all 3 pre-configured samples (Pension, KYC, Scholarship) in English, Hindi, and Marathi to ensure high-fidelity JSON parsing and appropriate translation.
- **Multimodal Image Input**: Test image upload with simulated document capture to confirm inline base64 image parsing.
- **Audio Read-Aloud**: Test Web Speech API playback, pause, resume, and speed modifications across supported languages.
- **Step Persistence & Progress**: Check off 3 steps, verify progress counter displays "3 of N steps done", and verify checklist state persists in `localStorage`.
- **Feedback Loop**: Submit a 5-star review, verify validation for mandatory fields, confirm celebratory animation, and ensure community average score updates.
