// app.js — VoteWise | Performance-Optimized Edition
'use strict';

// ─── Performance Budget Tracking ─────────────────────────────────────────────
performance.mark('votewise-init-start');

// ─── Constants ────────────────────────────────────────────────────────────────
const CONFIG = Object.freeze({
  DEBOUNCE_DELAY:     250,
  MAX_HISTORY_LENGTH: 20,
  CACHE_TTL_MS:       5 * 60 * 1000,
  MODEL:              'claude-sonnet-4-20250514',
  MAX_TOKENS:         1000,
});

const SYSTEM_PROMPT = `You are VoteWise AI, a friendly and accurate civic education assistant.
Help users understand the democratic election process clearly and impartially.
Specialise in Indian elections (ECI, EVM, NOTA, VVPAT, Form 6/8) but also cover US and UK.
Keep answers under 200 words, use **bold** for key terms and bullet points for lists.
Never express political opinions. Focus only on civic education.`;

const BADGE_CLASS = Object.freeze({
  'Pre-Election':  'badge-warning',
  'Election Day':  'badge-primary',
  'Post-Election': 'badge-success',
});

const DEFAULT_CHIPS = Object.freeze([
  'How do I register to vote in India?',
  'What happens on polling day?',
  'What is NOTA?',
  'How are votes counted?',
]);

// ─── Memoization Cache ────────────────────────────────────────────────────────
const _memoCache = new Map();
function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  return function (...args) {
    const key = keyFn(...args);
    const cached = _memoCache.get(key);
    if (cached && Date.now() - cached.ts < CONFIG.CACHE_TTL_MS) return cached.value;
    const value = fn.apply(this, args);
    _memoCache.set(key, { value, ts: Date.now() });
    return value;
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function debounce(fn, delay = CONFIG.DEBOUNCE_DELAY) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit = 100) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) { lastCall = now; fn.apply(this, args); }
  };
}

const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function createElement(tag, attrs = {}, html = '') {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (html) el.innerHTML = html;
  return el;
}

function batchWrite(fn) { return requestAnimationFrame(fn); }

function sanitizeText(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function renderMarkdown(text) {
  return sanitizeText(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// ─── Service Worker ───────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[SW] Registered, scope:', reg.scope);
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] Update available.');
            }
          });
        });
      })
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

// ─── Web Worker for Search ────────────────────────────────────────────────────
let searchWorker = null;
const workerCallbacks = new Map();

function initSearchWorker() {
  if (!window.Worker) return;
  try {
    searchWorker = new Worker('/search.worker.js');
    searchWorker.addEventListener('message', (e) => {
      const cb = workerCallbacks.get(e.data.type);
      if (cb) { cb(e.data); workerCallbacks.delete(e.data.type); }
    });
    searchWorker.addEventListener('error', () => { searchWorker = null; });
    searchWorker.postMessage({ type: 'BUILD_SEARCH_INDEX', payload: { faqData, glossaryData } });
  } catch (e) { searchWorker = null; }
}

function workerSearch(type, payload) {
  return new Promise((resolve) => {
    if (!searchWorker) {
      const term = payload.term.toLowerCase();
      if (type === 'FILTER_FAQ') {
        resolve({ results: payload.data.filter(f =>
          f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term)) });
      } else {
        resolve({ results: payload.data.filter(g =>
          g.term.toLowerCase().includes(term) || g.definition.toLowerCase().includes(term)) });
      }
      return;
    }
    const resultType = type === 'FILTER_FAQ' ? 'FAQ_RESULTS' : 'GLOSSARY_RESULTS';
    workerCallbacks.set(resultType, resolve);
    searchWorker.postMessage({ type, payload });
  });
}

// ─── Lazy Section Observer ────────────────────────────────────────────────────
const lazyLoadObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.dispatchEvent(new CustomEvent('sectionVisible'));
      lazyLoadObserver.unobserve(e.target);
    }
  }),
  { rootMargin: '200px 0px' }
);

function isInViewport(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

// ─── DOMContentLoaded ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  performance.mark('votewise-dom-ready');
  initSearchWorker();

  // ── Fade-up scroll animation ─────────────────────────────────────────────
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      const hits = entries.filter(e => e.isIntersecting).map(e => e.target);
      if (!hits.length) return;
      batchWrite(() => hits.forEach(el => { el.classList.add('visible'); fadeObserver.unobserve(el); }));
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  qsa('.fade-up').forEach(el => fadeObserver.observe(el));

  // ── Country Map (O(1) lookup) ────────────────────────────────────────────
  const countryMap = new Map(Object.entries(electionData));

  // ── Timeline ─────────────────────────────────────────────────────────────
  const timelineContainer = qs('#timeline');
  const timelineHeader    = qs('#timeline-header');
  const timelineBtns      = qsa('.timeline-btn');
  const heroPills         = qsa('.country-selector .pill');

  const buildTimelineFragment = memoize((countryKey) => {
    const data = countryMap.get(countryKey);
    if (!data) return null;
    const fragment = document.createDocumentFragment();
    data.steps.forEach(step => {
      const badgeClass = BADGE_CLASS[step.phase] || 'badge-success';
      const stepEl = createElement('div', { class: 'timeline-step', role: 'listitem' });
      stepEl.innerHTML = `
        <div class="timeline-marker" aria-hidden="true">${step.id}</div>
        <div class="timeline-content">
          <div class="timeline-content-header" role="button" tabindex="0"
               aria-expanded="false" aria-controls="step-details-${step.id}"
               aria-label="Step ${step.id}: ${sanitizeText(step.title)}">
            <h4>${step.icon} ${sanitizeText(step.title)}</h4>
            <span class="badge ${badgeClass}">${sanitizeText(step.phase)}</span>
          </div>
          <p class="timeline-duration">
            <i data-lucide="clock" class="icon-sm" aria-hidden="true"></i>
            <span class="sr-only">Duration:</span> ${sanitizeText(step.duration)}
          </p>
          <div class="timeline-details" id="step-details-${step.id}" hidden>
            <div class="detail-box citizen">
              <strong><i data-lucide="user" class="icon-sm" aria-hidden="true"></i> Citizen:</strong>
              <p>${sanitizeText(step.citizen)}</p>
            </div>
            <div class="detail-box official">
              <strong><i data-lucide="building-2" class="icon-sm" aria-hidden="true"></i> Official:</strong>
              <p>${sanitizeText(step.official)}</p>
            </div>
          </div>
        </div>`;
      const header = qs('.timeline-content-header', stepEl);
      function toggleStep() {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        const details = qs('.timeline-details', stepEl);
        batchWrite(() => {
          header.setAttribute('aria-expanded', String(!isExpanded));
          details.hidden = isExpanded;
          details.classList.toggle('expanded', !isExpanded);
        });
      }
      header.addEventListener('click', toggleStep);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStep(); }
      });
      fragment.appendChild(stepEl);
    });
    return { fragment, data };
  }, (k) => `tl-${k}`);

  function switchCountry(countryKey) {
    const result = buildTimelineFragment(countryKey);
    if (!result) return;
    batchWrite(() => {
      timelineHeader.innerHTML = `<h3><i data-lucide="building" class="icon-sm" aria-hidden="true"></i> Official Body: ${sanitizeText(result.data.body)}</h3>`;
      timelineContainer.setAttribute('role', 'list');
      timelineContainer.innerHTML = '';
      timelineContainer.appendChild(result.fragment.cloneNode(true));
      lucide.createIcons();
      timelineBtns.forEach(btn => {
        const a = btn.dataset.country === countryKey;
        btn.classList.toggle('active', a);
        btn.setAttribute('aria-pressed', String(a));
      });
      heroPills.forEach(pill => {
        const a = pill.dataset.country === countryKey;
        pill.classList.toggle('active', a);
        pill.setAttribute('aria-pressed', String(a));
      });
    });
  }

  timelineBtns.forEach(btn => btn.addEventListener('click', (e) => switchCountry(e.currentTarget.dataset.country)));
  heroPills.forEach(pill => {
    pill.addEventListener('click', (e) => switchCountry(e.currentTarget.dataset.country));
    pill.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchCountry(e.currentTarget.dataset.country); }
    });
  });

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => switchCountry('india'), { timeout: 500 });
  } else {
    switchCountry('india');
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────
  const faqContainer = qs('#faq-container');
  const faqSearch    = qs('#faq-search');

  function buildFAQFragment(filtered) {
    const fragment = document.createDocumentFragment();
    if (!filtered.length) {
      fragment.appendChild(createElement('p', { class: 'no-results', role: 'status' }, 'No questions found.'));
      return fragment;
    }
    filtered.forEach((faq, i) => {
      const id = `faq-answer-${i}`;
      const item = createElement('div', { class: 'faq-item', itemscope: '', itemtype: 'https://schema.org/Question' });
      item.innerHTML = `
        <div class="faq-question" role="button" tabindex="0" aria-expanded="false" aria-controls="${id}">
          <h3 itemprop="name">${sanitizeText(faq.question)}</h3>
          <i data-lucide="chevron-down" class="faq-icon" aria-hidden="true"></i>
        </div>
        <div class="faq-answer" id="${id}" role="region" hidden
             itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">${sanitizeText(faq.answer)}</p>
        </div>`;
      const qEl = qs('.faq-question', item);
      function toggleFaq() {
        const aEl = qs('.faq-answer', item);
        const open = qEl.getAttribute('aria-expanded') === 'true';
        qsa('.faq-question[aria-expanded="true"]').forEach(q => {
          if (q === qEl) return;
          q.setAttribute('aria-expanded', 'false');
          q.closest('.faq-item').classList.remove('active');
          const a = q.closest('.faq-item').querySelector('.faq-answer');
          if (a) { a.style.maxHeight = null; a.hidden = true; }
        });
        batchWrite(() => {
          qEl.setAttribute('aria-expanded', String(!open));
          item.classList.toggle('active', !open);
          if (!open) { aEl.hidden = false; requestAnimationFrame(() => { aEl.style.maxHeight = aEl.scrollHeight + 'px'; }); }
          else { aEl.style.maxHeight = null; setTimeout(() => { aEl.hidden = true; }, 300); }
        });
      }
      qEl.addEventListener('click', toggleFaq);
      qEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(); } });
      fragment.appendChild(item);
    });
    return fragment;
  }

  const renderFAQs = debounce(async (term = '') => {
    performance.mark('faq-start');
    const { results } = await workerSearch('FILTER_FAQ', { data: faqData, term });
    performance.mark('faq-end');
    performance.measure('faq-filter', 'faq-start', 'faq-end');
    batchWrite(() => {
      faqContainer.innerHTML = '';
      faqContainer.appendChild(buildFAQFragment(results));
      lucide.createIcons();
      let s = qs('#faq-status');
      if (!s) { s = createElement('p', { id: 'faq-status', class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' }); faqContainer.before(s); }
      s.textContent = `${results.length} question${results.length !== 1 ? 's' : ''} found.`;
    });
  });

  faqSearch.addEventListener('input', (e) => renderFAQs(e.target.value), { passive: true });
  renderFAQs('');

  // ── Glossary ──────────────────────────────────────────────────────────────
  const glossaryContainer = qs('#glossary-container');
  const glossarySearch    = qs('#glossary-search');

  const renderGlossary = debounce(async (term = '') => {
    const { results } = await workerSearch('FILTER_GLOSSARY', { data: glossaryData, term });
    const fragment = document.createDocumentFragment();
    if (!results.length) {
      fragment.appendChild(createElement('p', { class: 'no-results', role: 'status' }, 'No terms found.'));
    } else {
      results.forEach(item => {
        const card = createElement('div', { class: 'card glossary-card', itemscope: '', itemtype: 'https://schema.org/DefinedTerm' });
        card.innerHTML = `<h3 itemprop="name">${sanitizeText(item.term)}</h3><p itemprop="description">${sanitizeText(item.definition)}</p>`;
        fragment.appendChild(card);
      });
    }
    batchWrite(() => {
      glossaryContainer.innerHTML = '';
      glossaryContainer.appendChild(fragment);
      let s = qs('#glossary-status');
      if (!s) { s = createElement('p', { id: 'glossary-status', class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' }); glossaryContainer.before(s); }
      s.textContent = `${results.length} term${results.length !== 1 ? 's' : ''} found.`;
    });
  });

  glossarySearch.addEventListener('input', (e) => renderGlossary(e.target.value), { passive: true });
  renderGlossary('');

  // ── Google Charts ─────────────────────────────────────────────────────────
  const statsSection = qs('#election-stats');
  function drawCharts() {
    const timelineEl = qs('#timeline-chart');
    if (timelineEl && typeof google !== 'undefined') {
      const data = google.visualization.arrayToDataTable([
        ['Country', 'Pre-Election Days', 'Campaign Days'],
        ['India',   60, 14],
        ['USA',     180, 60],
        ['UK',      25, 21],
      ]);
      new google.visualization.BarChart(timelineEl).draw(data, {
        title: 'Election Timeline Comparison (Days)',
        titleTextStyle: { color: '#1a3a6b', fontName: 'DM Sans', fontSize: 15, bold: true },
        colors: ['#1a3a6b', '#d4a017'],
        backgroundColor: 'transparent',
        legend: { position: 'bottom' },
        chartArea: { width: '80%', height: '65%' },
      });
    }
    const turnoutEl = qs('#turnout-chart');
    if (turnoutEl && typeof google !== 'undefined') {
      const data = google.visualization.arrayToDataTable([
        ['Country', 'Voter Turnout %'],
        ['India 2024',  66.3],
        ['USA 2020',    62.8],
        ['UK 2019',     67.3],
        ['Non-voters',   3.6],
      ]);
      new google.visualization.PieChart(turnoutEl).draw(data, {
        title: 'Average Voter Turnout',
        titleTextStyle: { color: '#1a3a6b', fontName: 'DM Sans', fontSize: 15, bold: true },
        colors: ['#1a3a6b', '#2d7a4f', '#d4a017', '#e5e7eb'],
        backgroundColor: 'transparent',
        pieHole: 0.45,
        chartArea: { width: '90%', height: '75%' },
      });
    }
  }

  if (statsSection) {
    const loadAndDraw = () => {
      if (typeof google !== 'undefined' && google.charts) {
        google.charts.load('current', { packages: ['corechart', 'bar'] });
        google.charts.setOnLoadCallback(drawCharts);
      }
    };
    if (isInViewport(statsSection)) { loadAndDraw(); }
    else {
      lazyLoadObserver.observe(statsSection);
      statsSection.addEventListener('sectionVisible', loadAndDraw, { once: true });
    }
  }
  window.addEventListener('resize', throttle(drawCharts, 300), { passive: true });

  // ── AI Chat ───────────────────────────────────────────────────────────────
  let conversationHistory = [];
  let activeController   = null;

  const chatMessages    = qs('#chat-messages');
  const chatInput       = qs('#chat-input');
  const sendMsgBtn      = qs('#send-msg-btn');
  const chatSuggestions = qs('#chat-suggestions');

  qs('#clear-chat-btn').addEventListener('click', () => {
    activeController?.abort();
    activeController = null;
    batchWrite(() => {
      chatMessages.innerHTML = '<div class="message ai" role="status">Hello! I\'m VoteWise AI. How can I help you understand the election process today?</div>';
      conversationHistory = [];
      chatSuggestions.style.display = 'flex';
    });
  });

  function addMessage(text, isUser = false) {
    const div = createElement('div', { class: `message ${isUser ? 'user' : 'ai'}`, role: isUser ? 'none' : 'status' });
    isUser ? (div.textContent = text) : (div.innerHTML = renderMarkdown(text));
    chatMessages.appendChild(div);
    requestAnimationFrame(() => { chatMessages.scrollTop = chatMessages.scrollHeight; });
  }

  function showTyping() {
    const el = createElement('div', { id: 'typing-indicator', class: 'message ai typing', role: 'status', 'aria-label': 'VoteWise AI is thinking' },
      '<div class="dot"></div><div class="dot"></div><div class="dot"></div>');
    chatMessages.appendChild(el);
    requestAnimationFrame(() => { chatMessages.scrollTop = chatMessages.scrollHeight; });
  }
  function hideTyping() { qs('#typing-indicator')?.remove(); }

  function addChips() {
    const div = createElement('div', { class: 'chat-suggestions message-suggestions', role: 'group', 'aria-label': 'Suggested questions' });
    DEFAULT_CHIPS.forEach(text => {
      const btn = createElement('button', { class: 'chip', type: 'button' }, sanitizeText(text));
      btn.addEventListener('click', () => sendMessage(text));
      div.appendChild(btn);
    });
    chatMessages.appendChild(div);
    requestAnimationFrame(() => { chatMessages.scrollTop = chatMessages.scrollHeight; });
  }

  function setSending(on) {
    sendMsgBtn.disabled = on;
    chatInput.disabled  = on;
    sendMsgBtn.setAttribute('aria-busy', String(on));
  }

  async function sendMessage(userMsg) {
    const msg = userMsg.trim();
    if (!msg) return;
    activeController?.abort();
    activeController = new AbortController();

    addMessage(msg, true);
    chatInput.value = '';
    chatSuggestions.style.display = 'none';

    if (conversationHistory.length > CONFIG.MAX_HISTORY_LENGTH) {
      conversationHistory = conversationHistory.slice(-CONFIG.MAX_HISTORY_LENGTH);
    }
    conversationHistory.push({ role: 'user', content: msg });
    setSending(true);
    showTyping();
    performance.mark('chat-start');

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: activeController.signal,
        body: JSON.stringify({ model: CONFIG.MODEL, max_tokens: CONFIG.MAX_TOKENS, system: SYSTEM_PROMPT, messages: conversationHistory }),
      });
      performance.mark('chat-end');
      performance.measure('chat-latency', 'chat-start', 'chat-end');
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `HTTP ${res.status}`); }
      const data  = await res.json();
      const reply = data.content?.[0]?.text || 'Sorry, I could not get a response.';
      hideTyping();
      addMessage(reply, false);
      conversationHistory.push({ role: 'assistant', content: reply });
      addChips();
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[VoteWise AI]', err);
      hideTyping();
      addMessage('⚠️ Could not connect right now.\n\n**Quick answers:**\n- **NOTA** = None Of The Above (last EVM button)\n- **Register**: voters.eci.gov.in → Form 6\n- **Helpline**: 1950', false);
    } finally {
      setSending(false);
      activeController = null;
      requestAnimationFrame(() => chatInput.focus());
    }
  }

  sendMsgBtn.addEventListener('click', () => sendMessage(chatInput.value));
  chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(chatInput.value); } }, { passive: false });
  qsa('.chip').forEach(chip => chip.addEventListener('click', (e) => sendMessage(e.currentTarget.textContent.trim())));

  // ── Performance Summary ───────────────────────────────────────────────────
  performance.mark('votewise-init-end');
  performance.measure('votewise-total-init', 'votewise-init-start', 'votewise-init-end');

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const [m] = performance.getEntriesByName('votewise-total-init');
      console.log(`[VoteWise] Init in ${m?.duration?.toFixed(2) ?? '?'}ms`);
      window.voteWisePerf = {
        initDuration: m?.duration,
        marks:   performance.getEntriesByType('mark').map(m => ({ name: m.name, time: m.startTime.toFixed(2) })),
        measures: performance.getEntriesByType('measure').map(m => ({ name: m.name, duration: m.duration.toFixed(2) })),
      };
    });
  }

}); // end DOMContentLoaded