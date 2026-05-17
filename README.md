# MBA Prep

A browser-based MBA entrance exam practice platform designed for AMAT / CMAT / MAT aspirants. No backend, no install — runs entirely in the browser with localStorage for progress persistence.

## Live Demo

**[reddymohith.github.io/mba-prep](https://reddymohith.github.io/mba-prep)**

Default credentials: `amat2026` / `prepare`

---

## Features

| Feature | Detail |
|---|---|
| **5 Sections** | Quantitative, Reasoning, GK, English, Reading Comprehension |
| **525 Questions** | 105 per section — easy / intermediate / hard |
| **Syllabus Tracker** | Check off topics as you study; gates the Final Test |
| **Exam Readiness Rings** | Live gauges for Syllabus %, Avg Score, Readiness, Final Exam score |
| **Per-question Guidance** | Tap "Show Guidance" for a hint before answering |
| **Negative Marking** | –0.25 per wrong answer (mirrors real exam scoring) |
| **Anti-cheat** | Tab-switch detection; 3 strikes → auto-submit |
| **Persistent Progress** | Answers + scores saved in `localStorage` |
| **Review Mode** | Browse all previously answered questions per section |

---

## Project Structure

```
mba-prep/
├── index.html          # App shell (screens + overlays)
├── css/
│   └── style.css       # All styles, CSS variables, responsive layout
├── js/
│   └── app.js          # App logic — exam engine, routing, localStorage
└── data/
    ├── quantitative.json   # 105 Quant questions
    ├── reasoning.json      # 105 Reasoning questions
    ├── gk.json             # 105 GK & Business questions
    ├── english.json        # 105 General English questions
    └── comprehension.json  # 105 Reading Comprehension questions
```

---

## Running Locally

Because `app.js` fetches the JSON files, you need a local HTTP server (not `file://`):

```bash
# Python 3
python3 -m http.server 8080

# Node (npx)
npx serve .

# VS Code
Install "Live Server" extension, right-click index.html → Open with Live Server
```

Then open `http://localhost:8080`.

---

## Adding / Editing Questions

Each JSON file is an array of question objects:

```jsonc
{
  "id": "q11",
  "difficulty": "easy",          // "easy" | "intermediate" | "hard"
  "topic": "Percentages & Profit-Loss",
  "question": "Question text here.",
  "options": {
    "A": "First option",
    "B": "Second option",
    "C": "Third option",
    "D": "Fourth option"
  },
  "correct": "A",
  "guidance": "Hint shown before answering.",
  "explanation": {
    "why_correct": "Full explanation of the correct answer.",
    "why_wrong": {
      "B": "Why B is wrong.",
      "C": "Why C is wrong.",
      "D": "Why D is wrong."
    }
  }
}
```

Questions marked `[Placeholder]` are stubs — replace them with real questions following the schema above.

---

## Roadmap

- [ ] Fill all 525 questions with real exam content
- [ ] Final Test (mixed section, 150 Q, 150 min)
- [ ] Performance analytics — topic-wise weak areas
- [ ] Dark mode
- [ ] Mobile-responsive layout
- [ ] Export results as PDF

---

## Tech Stack

- Vanilla HTML / CSS / JS — zero dependencies, zero build step
- Google Fonts: DM Serif Display, DM Sans, JetBrains Mono
- GitHub Pages for hosting

---

## License

MIT
