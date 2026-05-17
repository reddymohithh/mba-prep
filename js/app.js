const SYLLABUS = {
  "Quantitative Aptitude": ["Number System & HCF/LCM","Percentages & Profit-Loss","Ratio, Proportion & Averages","Time, Work & Distance","Algebra & Equations","Geometry & Mensuration","Permutation, Combination & Probability","Data Interpretation","Sequences & Series"],
  "Reasoning & Critical Thinking": ["Coding-Decoding & Analogies","Blood Relations & Direction Sense","Syllogisms & Logical Deduction","Seating Arrangements & Puzzles","Statement & Assumption","Cause & Effect Analysis","Management & Marketing Concepts","Organisational Behaviour","Economics & Business Terminology"],
  "General Knowledge & Business": ["Current Affairs & Business News","Banking & Finance","Government Policies & Schemes","Companies, CEOs & Awards","Indian & Global Economy","International Organizations","Science, Tech & Environment","Sports & Static GK","Reports & Indexes"],
  "General English": ["Grammar & Error Spotting","Vocabulary & Synonyms/Antonyms","Fill in the Blanks","Para Jumbles & Sentence Correction","Idioms, Phrases & One-word Substitution","Direct & Indirect Speech","Sentence Transformation","Word Usage & Analogies"],
  "Reading Comprehension": ["RC — Main Idea & Theme","RC — Inference & Implication","RC — Vocabulary in Context","RC — Fact vs Opinion","RC — Tone & Author's Attitude"]
};

const SECTIONS = [
  {key:"quantitative", name:"Quantitative Aptitude",       short:"Quant",   icon:"📐", total:105},
  {key:"reasoning",    name:"Reasoning & Critical Thinking",short:"Reason",  icon:"🧠", total:105},
  {key:"gk",           name:"General Knowledge & Business", short:"GK",      icon:"🌐", total:105},
  {key:"english",      name:"General English",              short:"English", icon:"📝", total:105},
  {key:"comprehension",name:"Reading Comprehension",        short:"RC",      icon:"📖", total:105}
];

const CIRC = 2 * Math.PI * 46;
const QPER_PAGE = 10;
const CREDS = {username:"amat2026", password:"prepare"};

let QUESTIONS = {};
let currentUser = null, currentUserName = null, currentSection = null;
let examQuestions = [], answeredMap = {}, currentPage = 0;
let timerInterval = null, timeLeft = 0, acViolations = 0, isExamActive = false;
let acHandler;

async function loadQuestions() {
  const keys = ['quantitative','reasoning','gk','english','comprehension'];
  const results = await Promise.all(
    keys.map(k => fetch(`data/${k}.json`).then(r => r.json()))
  );
  keys.forEach((k, i) => QUESTIONS[k] = results[i]);
}

function getState(s)        { try { return JSON.parse(localStorage.getItem('amat_'+s)||'{}') } catch { return {} } }
function saveState(s, d)    { localStorage.setItem('amat_'+s, JSON.stringify(d)) }
function getSyllabusState() { try { return JSON.parse(localStorage.getItem('amat_syllabus')||'{}') } catch { return {} } }
function saveSyllabusState(s){ localStorage.setItem('amat_syllabus', JSON.stringify(s)) }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function doLogin() {
  const name = document.getElementById('login-name').value.trim();
  const u    = document.getElementById('login-user').value.trim();
  const p    = document.getElementById('login-pass').value.trim();
  const err  = document.getElementById('login-error');
  if (!name) { err.textContent = 'Please enter your name.'; err.style.display = 'block'; return; }
  if (u === CREDS.username && p === CREDS.password) {
    currentUser = u; currentUserName = name;
    err.style.display = 'none';
    showScreen('dashboard-screen');
    renderDashboard();
  } else {
    err.textContent = 'Invalid username or password';
    err.style.display = 'block';
  }
}

function doLogout() { currentUser = null; currentUserName = null; showScreen('login-screen'); }

function setRing(id, pct, color) {
  const el = document.getElementById(id);
  el.style.strokeDashoffset = CIRC * (1 - Math.max(0, Math.min(100, pct)) / 100);
  if (color) el.setAttribute('stroke', color);
}

function updateReadiness() {
  const ss = getSyllabusState();
  const tt = Object.values(SYLLABUS).reduce((a, v) => a + v.length, 0);
  const dt = Object.values(ss).filter(Boolean).length;
  const sP = tt > 0 ? Math.round((dt / tt) * 100) : 0;
  document.getElementById('pct-syllabus').textContent = sP + '%';
  setRing('ring-syllabus', sP, '#3B82F6');

  const scores = SECTIONS.map(s => {
    const st = getState(s.key);
    return (st.lastScore !== undefined && st.lastScore !== null) ? Number(st.lastScore) : null;
  });
  const scored = scores.filter(s => s !== null);
  const avg = scored.length > 0 ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null;

  const barsEl = document.getElementById('section-bars');
  barsEl.innerHTML = '';
  SECTIONS.forEach((sec, i) => {
    const sc = scores[i], d = sc !== null ? sc : 0;
    const c = d >= 75 ? '#10B981' : d >= 50 ? '#F59E0B' : '#EF4444';
    const row = document.createElement('div');
    row.className = 'section-bar-row';
    row.innerHTML = `<div class="section-bar-name">${sec.short}</div><div class="section-bar-track"><div class="section-bar-fill" style="width:${d}%;background:${c}"></div></div><div class="section-bar-val">${sc !== null ? sc + '%' : '—'}</div>`;
    barsEl.appendChild(row);
  });

  if (avg !== null) {
    document.getElementById('pct-avgscore').textContent = avg + '%';
    setRing('ring-avgscore', avg, avg >= 75 ? '#10B981' : avg >= 50 ? '#F59E0B' : '#EF4444');
  } else {
    document.getElementById('pct-avgscore').textContent = '—';
    setRing('ring-avgscore', 0, '#E2E8F0');
  }

  const rP = Math.round(sP * 0.5 + (avg !== null ? avg : 0) * 0.5);
  document.getElementById('pct-readiness').textContent = rP + '%';
  setRing('ring-readiness', rP, rP >= 75 ? '#10B981' : rP >= 50 ? '#F59E0B' : '#3B82F6');

  const fst = getState('final');
  if (fst.lastScore !== undefined && fst.lastScore !== null) {
    const fs = Number(fst.lastScore);
    document.getElementById('pct-finalscore').textContent = fs + '%';
    setRing('ring-finalscore', fs, '#8B5CF6');
  } else {
    document.getElementById('pct-finalscore').textContent = '—';
    setRing('ring-finalscore', 0, '#E2E8F0');
  }
}

function renderDashboard() {
  document.getElementById('topbar-username').textContent = 'Welcome, ' + (currentUserName || 'Student');
  const state = getSyllabusState();
  const syl = document.getElementById('syllabus-content');
  syl.innerHTML = '';
  Object.entries(SYLLABUS).forEach(([section, topics]) => {
    const div = document.createElement('div');
    div.className = 'syllabus-section';
    div.innerHTML = `<div class="syllabus-section-title">${section}</div>`;
    topics.forEach(t => {
      const key = section + '_' + t, checked = !!state[key];
      const row = document.createElement('div');
      row.className = 'syllabus-item' + (checked ? ' checked' : '');
      const cbId = 'cb_' + key.replace(/[\s&,\/\-]/g, '_');
      row.innerHTML = `<input type="checkbox" id="${cbId}" ${checked ? 'checked' : ''}><label for="${cbId}">${t}</label>`;
      row.querySelector('input').addEventListener('change', e => {
        const s2 = getSyllabusState();
        s2[key] = e.target.checked;
        saveSyllabusState(s2);
        row.classList.toggle('checked', e.target.checked);
        checkFinalUnlock();
        updateReadiness();
      });
      div.appendChild(row);
    });
    syl.appendChild(div);
  });

  const cards = document.getElementById('section-cards');
  cards.innerHTML = '';
  SECTIONS.forEach(sec => {
    const st = getState(sec.key);
    const answers = st.answers || {};
    const attempted = Object.keys(answers).length;
    const allQ = QUESTIONS[sec.key] || [];
    const correctCount = allQ.filter(q => answers[q.id] && answers[q.id] === q.correct).length;
    const lastScore = attempted > 0 ? Math.round((correctCount / attempted) * 100) + '%' : '—';
    const pct = Math.round((attempted / sec.total) * 100);
    const card = document.createElement('div');
    card.className = 'section-card';
    card.innerHTML = `
      <div class="section-card-header">
        <div class="section-card-title">${sec.icon} ${sec.name}</div>
        <span class="section-badge">${attempted}/${sec.total}</span>
      </div>
      <div class="stats-row">
        <div class="stat"><div class="stat-val">${sec.total}</div><div class="stat-label">Total</div></div>
        <div class="stat"><div class="stat-val">${attempted}</div><div class="stat-label">Attempted</div></div>
        <div class="stat"><div class="stat-val">${sec.total - attempted}</div><div class="stat-label">Remaining</div></div>
        <div class="stat"><div class="stat-val">${lastScore}</div><div class="stat-label">Last Score</div></div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <button class="btn-test" onclick="startExam('${sec.key}','${sec.name}')">Take Test →</button>`;
    cards.appendChild(card);
  });
  checkFinalUnlock();
  updateReadiness();
}

function checkFinalUnlock() {
  const state = getSyllabusState();
  const total = Object.values(SYLLABUS).reduce((a, v) => a + v.length, 0);
  const done = Object.values(state).filter(Boolean).length;
  document.getElementById('btn-final').disabled = done < total;
  document.getElementById('final-hint').textContent = done >= total
    ? 'All topics completed! You can take the Final Test.'
    : `Complete ${total - done} more syllabus topics to unlock the Final Test`;
}

function startFinalTest() {
  currentSection = 'final';
  showScreen('exam-screen');
  document.getElementById('exam-title').textContent = '🏆 Final Mock Test';
  isExamActive = true;
  acViolations = 0;

  // Sample questions from all 5 sections: 10 easy + 10 intermediate + 10 hard each = 150 total
  const PER_DIFF = 10;
  const diffs = ['easy', 'intermediate', 'hard'];
  let pool = [];
  SECTIONS.forEach(sec => {
    const allQ = QUESTIONS[sec.key] || [];
    diffs.forEach(diff => {
      const bucket = allQ.filter(q => q.difficulty === diff);
      const shuffled = bucket.slice().sort(() => Math.random() - 0.5);
      pool = pool.concat(shuffled.slice(0, PER_DIFF));
    });
  });

  // Shuffle final pool
  pool = pool.sort(() => Math.random() - 0.5);

  const st = getState('final');
  answeredMap = {};
  st.attemptCount = (st.attemptCount || 0) + 1;
  saveState('final', st);

  examQuestions = pool;
  currentPage = 0;
  document.getElementById('exam-meta').textContent = `Final Mock · ${pool.length} questions · All Sections`;
  document.getElementById('btn-prev-attempts').style.display = 'none';
  startTimer(pool.length * 60);
  renderTracker();
  renderPage(0);
  setupAntiCheat();
}

function startExam(sectionKey, sectionName) {
  currentSection = sectionKey;
  showScreen('exam-screen');
  document.getElementById('exam-title').textContent = sectionName;
  isExamActive = true;
  acViolations = 0;

  const allQ = QUESTIONS[sectionKey] || [];
  const st = getState(sectionKey);
  answeredMap = st.answers || {};
  const attemptCount = (st.attemptCount || 0) + 1;
  st.attemptCount = attemptCount;
  saveState(sectionKey, st);

  let pool;
  if (attemptCount === 1) {
    pool = allQ.slice().sort((a, b) => ({easy:0,intermediate:1,hard:2}[a.difficulty] - {easy:0,intermediate:1,hard:2}[b.difficulty]));
    document.getElementById('btn-prev-attempts').style.display = 'none';
  } else {
    pool = allQ.filter(q => !answeredMap[q.id]);
    if (!pool.length) { showCompletionScreen(sectionName); return; }
    document.getElementById('btn-prev-attempts').style.display = 'block';
  }

  examQuestions = pool;
  currentPage = 0;
  document.getElementById('exam-meta').textContent = `Attempt ${attemptCount} · ${pool.length} questions`;
  startTimer(pool.length * 60);
  renderTracker();
  renderPage(0);
  setupAntiCheat();
}

function startTimer(s) {
  clearInterval(timerInterval);
  timeLeft = s;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) { clearInterval(timerInterval); doSubmit(); }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
  const el = document.getElementById('timer-display');
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el.className = 'timer-val' + (timeLeft <= 300 ? ' red' : '');
}

function renderTracker() {
  const el = document.getElementById('tracker-content');
  el.innerHTML = '';
  ['easy','intermediate','hard'].forEach(diff => {
    const qs = examQuestions.filter(q => q.difficulty === diff);
    if (!qs.length) return;
    const label = document.createElement('div');
    label.className = 'tracker-section-label';
    label.textContent = diff;
    el.appendChild(label);
    const row = document.createElement('div');
    row.className = 'tracker-row';
    qs.forEach(q => {
      const idx = examQuestions.indexOf(q);
      const btn = document.createElement('button');
      const onCurPage = Math.floor(idx / QPER_PAGE) === currentPage;
      btn.className = 'tracker-btn ' + (answeredMap[q.id] ? 'answered' : 'unanswered') + (onCurPage ? ' current-page' : '');
      btn.id = 'trbtn_' + q.id;
      btn.textContent = idx + 1;
      btn.onclick = (p => () => { currentPage = p; renderPage(p); renderTracker(); })(Math.floor(idx / QPER_PAGE));
      row.appendChild(btn);
    });
    el.appendChild(row);
  });
}

function renderPage(page) {
  currentPage = page;
  const start = page * QPER_PAGE;
  const pageQs = examQuestions.slice(start, start + QPER_PAGE);
  const area = document.getElementById('questions-area');
  area.innerHTML = '';
  pageQs.forEach((q, i) => {
    const globalIdx = start + i;
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = 'qcard_' + q.id;
    const answered = answeredMap[q.id];
    const diffClass = {easy:'diff-easy',intermediate:'diff-intermediate',hard:'diff-hard'}[q.difficulty];
    card.innerHTML = `
      <div class="q-number">Q${globalIdx+1}<span class="q-difficulty ${diffClass}">${q.difficulty}</span><span style="font-size:.7rem;color:var(--gray5)">${q.topic}</span></div>
      <div class="q-text">${q.question}</div>
      <div class="options">${Object.entries(q.options).map(([k,v]) =>
        `<label class="option-label ${answered===k?'selected':''}" id="opt_${q.id}_${k}">
          <input type="radio" name="${q.id}" value="${k}" ${answered===k?'checked':''}>
          <span class="option-key">${k}</span><span>${v}</span>
        </label>`).join('')}
      </div>
      <div class="q-actions">${answered
        ? `<span class="already-answered">✓ Answered</span>`
        : `<button class="btn-submit-ans" onclick="saveAnswer('${q.id}')">Submit Answer</button>`}
        <button class="btn-guidance" onclick="toggleGuidance(event,'${q.id}')">Show Guidance</button>
      </div>
      <div id="guidance_${q.id}" class="guidance-box" style="display:none">${q.guidance}</div>`;
    area.appendChild(card);
    card.querySelectorAll(`input[name="${q.id}"]`).forEach(r => {
      r.addEventListener('change', () => {
        card.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
        card.querySelector(`#opt_${q.id}_${r.value}`).classList.add('selected');
      });
    });
  });
  renderPageNav();
  renderTracker();
  area.scrollTop = 0;
}

function saveAnswer(qid) {
  const selected = document.querySelector(`input[name="${qid}"]:checked`);
  if (!selected) { alert('Please select an option first.'); return; }
  answeredMap[qid] = selected.value;
  const st = getState(currentSection);
  st.answers = answeredMap;
  saveState(currentSection, st);
  const card = document.getElementById('qcard_' + qid);
  card.querySelector('.q-actions').innerHTML = `<span class="already-answered">✓ Answered</span><button class="btn-guidance" onclick="toggleGuidance(event,'${qid}')">Show Guidance</button>`;
  const trbtn = document.getElementById('trbtn_' + qid);
  if (trbtn) {
    const idx = examQuestions.findIndex(q => q.id === qid);
    trbtn.className = 'tracker-btn answered' + (Math.floor(idx / QPER_PAGE) === currentPage ? ' current-page' : '');
  }
}

function toggleGuidance(e, qid) {
  const box = document.getElementById('guidance_' + qid), btn = e.target;
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
  btn.textContent = box.style.display === 'none' ? 'Show Guidance' : 'Hide Guidance';
}

function renderPageNav() {
  const nav = document.getElementById('page-nav');
  const totalPages = Math.ceil(examQuestions.length / QPER_PAGE);
  nav.innerHTML = '';
  const prev = document.createElement('button');
  prev.className = 'arrow-btn'; prev.textContent = '←';
  prev.onclick = () => { if (currentPage > 0) renderPage(currentPage - 1); };
  nav.appendChild(prev);
  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i + 1;
    btn.onclick = (p => () => renderPage(p))(i);
    nav.appendChild(btn);
  }
  const next = document.createElement('button');
  next.className = 'arrow-btn'; next.textContent = '→';
  next.onclick = () => { if (currentPage < totalPages - 1) renderPage(currentPage + 1); };
  nav.appendChild(next);
}

function confirmSubmit() {
  const total = examQuestions.length, answered = examQuestions.filter(q => answeredMap[q.id]).length;
  document.getElementById('submit-overlay-body').textContent = `You have answered ${answered} out of ${total} questions.`;
  document.getElementById('submit-overlay').classList.add('active');
}

function closeSubmitOverlay() { document.getElementById('submit-overlay').classList.remove('active'); }

function doSubmit() {
  clearInterval(timerInterval);
  isExamActive = false;
  document.getElementById('submit-overlay').classList.remove('active');
  document.removeEventListener('visibilitychange', acHandler);
  showResults();
}

function showResults() {
  const qs = examQuestions;
  let correct = 0, wrong = 0, skip = 0;
  qs.forEach(q => {
    const sel = answeredMap[q.id];
    if (!sel) skip++;
    else if (sel === q.correct) correct++;
    else wrong++;
  });
  const rawScore = correct - wrong * 0.25;
  const scorePct = qs.length > 0 ? Math.max(0, (rawScore / qs.length) * 100).toFixed(1) : 0;
  const attempted = correct + wrong;
  const dashScore = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const st = getState(currentSection);
  st.lastScore = dashScore;
  st.answers = answeredMap;
  saveState(currentSection, st);

  document.getElementById('results-score-num').textContent = scorePct;
  document.getElementById('r-correct').textContent = correct;
  document.getElementById('r-wrong').textContent = wrong;
  document.getElementById('r-skip').textContent = skip;

  const list = document.getElementById('results-list');
  list.innerHTML = '';
  const answeredQs = qs.filter(q => answeredMap[q.id]);
  document.getElementById('results-answered-label').textContent = `Answered Questions (${answeredQs.length} of ${qs.length})`;

  if (!answeredQs.length) {
    list.innerHTML = '<div style="background:var(--white);border-radius:var(--radius-lg);border:1px solid var(--gray3);padding:2rem;text-align:center;color:var(--gray5)">No questions answered.</div>';
  } else {
    answeredQs.forEach((q, i) => {
      const sel = answeredMap[q.id], isCorrect = sel === q.correct;
      const item = document.createElement('div');
      item.className = 'result-item';
      const wrongWhys = Object.entries(q.explanation.why_wrong)
        .filter(([k]) => k !== q.correct)
        .map(([k, v]) => `<div class="wrong-opt-item"><span class="wrong-opt-key">${k}:</span><span>${v}</span></div>`)
        .join('');
      item.innerHTML = `
        <div class="result-item-header" onclick="toggleResult(this)">
          <div class="result-status-dot ${isCorrect?'dot-correct':'dot-wrong'}"></div>
          <div class="result-q-text">Q${i+1}: ${q.question}</div>
          <div class="result-chevron">▾</div>
        </div>
        <div class="result-detail">
          <div class="answer-row"><span class="answer-label">Your answer</span><span class="answer-val ${isCorrect?'correct':'wrong'}">${sel}: ${q.options[sel]}</span></div>
          <div class="answer-row"><span class="answer-label">Correct</span><span class="answer-val correct">${q.correct}: ${q.options[q.correct]}</span></div>
          <div class="explanation-box">
            <div class="explanation-title">Why ${q.correct} is correct</div>
            <div class="explanation-text">${q.explanation.why_correct}</div>
            <div class="wrong-options">${wrongWhys}</div>
          </div>
        </div>`;
      list.appendChild(item);
    });
  }
  showScreen('results-screen');
}

function toggleResult(header) { header.parentElement.classList.toggle('open'); }

function goToDashboard() { showScreen('dashboard-screen'); renderDashboard(); }

function goReview() {
  const st = getState(currentSection);
  const allQ = QUESTIONS[currentSection] || [];
  const attempted = allQ.filter(q => st.answers && st.answers[q.id]);
  const body = document.getElementById('review-body');
  body.innerHTML = '';
  attempted.forEach((q, i) => {
    const sel = st.answers[q.id], isCorrect = sel === q.correct;
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-q-num">Q${i+1} · ${q.topic} · ${q.difficulty}</div>
      <div class="review-q-text">${q.question}</div>
      <div class="review-options">${Object.entries(q.options).map(([k,v]) =>
        `<div class="review-option ${sel===k?(isCorrect?'selected-correct':'selected-wrong'):(k===q.correct?'correct-ans':'')}">
          <span style="font-weight:600">${k}.</span> ${v}
          ${sel===k ? `<span style="margin-left:auto">${isCorrect?'✓':'✗'}</span>` : ''}
          ${sel!==k && k===q.correct ? '<span style="margin-left:auto;color:var(--green)">← correct</span>' : ''}
        </div>`).join('')}
      </div>
      <div class="review-exp">${q.explanation.why_correct}</div>`;
    body.appendChild(card);
  });
  showScreen('review-screen');
}

function goBackToExam() { showScreen('exam-screen'); }

function setupAntiCheat() {
  document.removeEventListener('visibilitychange', acHandler);
  acHandler = () => {
    if (document.hidden && isExamActive) {
      acViolations++;
      document.getElementById('ac-count').textContent = acViolations + ' / 3';
      document.getElementById('ac-remaining').textContent = Math.max(0, 3 - acViolations);
      document.getElementById('anticheat-overlay').classList.add('active');
      if (acViolations >= 3) {
        setTimeout(() => {
          document.getElementById('anticheat-overlay').classList.remove('active');
          doSubmit();
        }, 1500);
      }
    }
  };
  document.addEventListener('visibilitychange', acHandler);
}

function dismissAntiCheat() { document.getElementById('anticheat-overlay').classList.remove('active'); }

function showCompletionScreen(name) {
  document.getElementById('questions-area').innerHTML = `
    <div class="completion-screen">
      <div class="completion-icon">🎉</div>
      <div class="completion-title">Section Complete!</div>
      <div class="completion-sub">All questions in ${name} attempted.</div>
      <button class="btn-view-results" onclick="showResults()">View Full Results</button>
    </div>`;
  document.getElementById('tracker-content').innerHTML = '';
  document.getElementById('page-nav').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-pass').addEventListener('keypress', e => {
    if (e.key === 'Enter') doLogin();
  });
  loadQuestions().then(() => {
    renderDashboard();
  }).catch(err => {
    console.error('Failed to load question data:', err);
  });
});
