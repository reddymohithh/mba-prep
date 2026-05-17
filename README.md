# AMAT Prep - MBA Entrance Exam Practice Platform

**A fully browser-based mock test platform built for a friend preparing for the Alliance Management Aptitude Test (AMAT).**

🔗 **[Live Demo →](https://reddymohithh.github.io/mba-prep)** &nbsp;|&nbsp; Credentials: `amat2026` / `prepare`

---

## The Problem

A friend was preparing for the AMAT with a week to go. Every existing platform had one or more of these problems:

- Paywalled after a few questions
- Generic questions not aligned to AMAT's specific syllabus and difficulty curve
- No negative marking simulation (AMAT uses –0.25 per wrong answer)
- No way to track syllabus coverage alongside mock scores
- Required app installation or account creation

The need was specific: a lightweight, private, free tool that mirrored the real exam experience without friction.

---

## What I Built

A single-page exam prep app covering all 5 AMAT sections with **525 questions** (105 per section, balanced across easy/intermediate/hard), a syllabus tracker, an exam readiness dashboard, and a 150-question final mock test. All run in the browser with no server, database, or dependencies.

| Section | Questions | Topics |
|---|---|---|
| Quantitative Aptitude | 105 | Number Systems, DI, Probability, Geometry... |
| Reasoning & Critical Thinking | 105 | Syllogisms, Seating Arrangements, Management Concepts... |
| General Knowledge & Business | 105 | Economy, Banking, Current Affairs, Reports & Indexes... |
| General English | 105 | Grammar, Vocabulary, Para Jumbles, Idioms... |
| Reading Comprehension | 105 | Inference, Tone, Fact vs Opinion, Vocabulary in Context... |

---

## Key Product Decisions

### 1. No backend intentionally
The user needed this in days, not weeks. A backend would mean auth systems, databases, hosting costs, and deployment complexity. localStorage covers all persistence needs for a single user. That forced a cleaner solution.

### 2. Difficulty-sorted first attempt, gap-filling on retry
On the first attempt, questions are served easy → intermediate → hard to build confidence progressively. On subsequent attempts, only unanswered questions are shown, so the tool adapts to where the user actually is, not where they started.

### 3. Syllabus tracker gates the Final Test
Rather than making the final mock always available, it opens only when all syllabus topics are checked off. This creates a natural study loop. Study a topic → check it off → unlock the next milestone. It's a lightweight form of progress-gating that mirrors how real exam prep should work.

### 4. Exam Readiness as a composite metric
The dashboard shows four rings: Syllabus Coverage, Average Score, Readiness (weighted blend of the two), and Final Exam Score. This gives the user a single, honest view of where they stand rather than four separate numbers they have to mentally combine.

### 5. Anti-cheat for self-accountability
Tab-switch detection with a 3-strike auto-submit is about helping the user simulate real exam conditions. Knowing the timer will auto-submit if they context-switch makes the mock feel real enough to be useful.

### 6. Per-question guidance, not post-answer explanations only
Most prep tools only explain after you answer. This app lets users tap "Show Guidance" before answering, a hint rather than the answer. This supports retrieval practice better than pure show/hide explanations.

---

## Exam Engine Features

- **525 questions** across 5 sections + **150-question Final Mock** (30 per section, randomised)
- **–0.25 negative marking** matching real AMAT scoring
- **Per-section timer** (1 min/question) with red alert under 5 minutes
- **Question tracker** panel — colour-coded answered / unanswered, jump to any question
- **Anti-cheat** — 3 tab switches triggers auto-submit
- **Review mode** — browse all previously answered questions with explanations
- **Persistent progress** — answers and scores survive page refresh via localStorage
- **Readiness dashboard** — live rings and section bars update after every test

---

## Technical Decisions

| Decision | Rationale |
|---|---|
| Vanilla HTML/CSS/JS | Zero build step, dependencies, works on GitHub Pages without configuration |
| Static JSON question bank | Questions are content, not data. No query layer needed |
| localStorage for state | Sufficient for single-user, single-device use case. No auth complexity |
| CSS custom properties throughout | Consistent theming, easy to restyle without touching logic |
| fetch() for JSON loading | Keeps questions out of the JS bundle. Easy to add/edit questions without touching code |

**Stack:** HTML, CSS, Vanilla JS, GitHub Pages
**Lines of code:** ~500 JS, ~600 CSS, ~200 HTML
**Build time:** 0 seconds (no build step)
**Hosting cost:** $0

---

## What I'd Build Next

These are the next things I would prioritise if this were a real product:

**High impact, low effort**
- Topic-wise performance breakdown: show which topics within a section the user scores weakest on, so they can direct study time more precisely
- Export results as PDF: useful for the user to share progress with a mentor or tutor

**Medium term**
- Spaced repetition for wrong answers: show incorrectly answered questions more frequently in future sessions
- Mobile layout: the current layout works on desktop. A proper mobile-first redesign would make it usable during commutes
- Dark mode: a common request for any study tool used late at night

**If this were a multi-user product**
- Backend + auth to support cohort progress tracking (useful for coaching institutes)
- Admin panel to add/edit questions without touching JSON files
- Analytics on question-level difficulty calibration: flag questions with unusually high wrong rates for review

---

## Project Structure

```
mba-prep/
├── index.html              # App shell — all screens and overlays
├── css/
│   └── style.css           # All styles, CSS variables, layout
├── js/
│   └── app.js              # Exam engine, routing, localStorage state
└── data/
    ├── quantitative.json   # 105 Quant questions
    ├── reasoning.json      # 105 Reasoning questions
    ├── gk.json             # 105 GK & Business questions
    ├── english.json        # 105 General English questions
    └── comprehension.json  # 105 RC questions (5 passages × 21 questions)
```

---

## Running Locally

The app uses `fetch()` to load JSON files, so it needs a local HTTP server:

```bash
# Python 3
python3 -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080`.

---

*Built with Claude as an AI-assisted product development exercise. All product decisions, feature scoping, and UX choices were made by me. Claude was the implementation pair.*
