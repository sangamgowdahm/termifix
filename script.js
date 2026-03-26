/* ══════════════════════════════════════════════════════
   TERMIFIX — SCRIPT.JS
   All animations, interactions, and terminal demo
══════════════════════════════════════════════════════ */

'use strict';

// ─── Cursor Glow ──────────────────────────────────────
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });
}

// ─── Navbar scroll effect ─────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ─── Smooth scroll for nav links ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    // Close mobile nav if open
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// ─── Hamburger menu ───────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
}

// ─── Scroll Reveal ────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) * 120 : 0;
      setTimeout(() => {
        el.classList.add('visible');
      }, delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-card, .reveal-step'
).forEach(el => revealObserver.observe(el));

// ─── Counter Animation ────────────────────────────────
function animateCount(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(el => {
        animateCount(el, parseInt(el.dataset.count));
      });
      statObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statObserver.observe(heroStats);

// ─── Terminal Demo ────────────────────────────────────
const terminalBody = document.getElementById('terminalBody');
const tCmd = document.getElementById('tCmd');
const tOutput = document.getElementById('tOutput');

const DEMO_SEQUENCES = [
  {
    cmd: 'npm install',
    outputLines: [
      { cls: 't-err', text: 'npm error code ENOENT' },
      { cls: 't-err', text: 'npm error syscall open' },
      { cls: 't-err', text: 'npm error path /myproject/package.json' },
      { cls: 't-err', text: 'npm error enoent Could not read package.json' },
    ],
    ai: {
      lines: [
        { label: '🔍 PROBLEM', text: 'No package.json found in current directory.' },
        { label: '🧠 ROOT CAUSE', text: "npm install requires package.json to know what to install." },
        { label: '🔧 FIX', text: 'npm init', cls: 't-fix' },
        { label: '⚡ PREVENTION', text: "Always run npm init before npm install in a new project." },
      ]
    },
    fixPrompt: 'Run fix? npm init [y/n]: y',
    fixResult: '✓ package.json created successfully',
  },
  {
    cmd: "python app.py",
    outputLines: [
      { cls: '', text: 'Traceback (most recent call last):' },
      { cls: 't-err', text: '  File "app.py", line 3, in <module>' },
      { cls: 't-err', text: "ModuleNotFoundError: No module named 'requests'" },
    ],
    ai: {
      lines: [
        { label: '🔍 PROBLEM', text: "Python package 'requests' is not installed." },
        { label: '🧠 ROOT CAUSE', text: "The module is not in your active Python environment." },
        { label: '🔧 FIX', text: 'pip install requests', cls: 't-fix' },
        { label: '⚡ PREVENTION', text: "Add requests to requirements.txt to track dependencies." },
      ]
    },
    fixPrompt: 'Run fix? pip install requests [y/n]: y',
    fixResult: '✓ Successfully installed requests-2.31.0',
  },
];

let demoIndex = 0;
let demoRunning = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function typeText(el, text, speed = 45) {
  return new Promise(async resolve => {
    el.textContent = '';
    for (const char of text) {
      el.textContent += char;
      await sleep(speed);
    }
    resolve();
  });
}

function addOutputLine(cls, text) {
  const line = document.createElement('div');
  line.className = cls;
  line.style.fontFamily = 'var(--font-mono)';
  line.style.fontSize = '0.8rem';
  line.style.lineHeight = '1.6';
  line.textContent = text;
  tOutput.appendChild(line);
  terminalBody.parentElement.scrollTop = terminalBody.parentElement.scrollHeight;
}

async function runTerminalDemo() {
  if (demoRunning) return;
  demoRunning = true;

  while (true) {
    const seq = DEMO_SEQUENCES[demoIndex % DEMO_SEQUENCES.length];
    demoIndex++;

    // Clear output
    tOutput.innerHTML = '';
    await sleep(800);

    // Type command
    await typeText(tCmd, seq.cmd, 55);
    await sleep(500);

    // Print error output
    for (const line of seq.outputLines) {
      addOutputLine(line.cls, line.text);
      await sleep(120);
    }
    await sleep(700);

    // Show AI detection banner
    const banner = document.createElement('div');
    banner.style.cssText = `
      margin: 0.8rem 0 0.3rem;
      color: #FFBD2E;
      font-family: var(--font-mono);
      font-size: 0.78rem;
      border-top: 1px solid rgba(0,255,136,0.15);
      padding-top: 0.8rem;
    `;
    banner.textContent = '━━ ⚡ TermiFix AI Analyzing... ━━━━━━━━━━━━━━━━━━━━━━━━━';
    tOutput.appendChild(banner);
    await sleep(600);

    // AI response block
    const aiBlock = document.createElement('div');
    aiBlock.style.cssText = `
      margin: 0.5rem 0;
      border: 1px solid rgba(0,255,136,0.2);
      border-radius: 8px;
      padding: 1rem;
      background: rgba(0,255,136,0.04);
    `;
    tOutput.appendChild(aiBlock);

    for (const aiLine of seq.ai.lines) {
      await sleep(250);
      const row = document.createElement('div');
      row.style.cssText = 'font-family: var(--font-mono); font-size: 0.8rem; margin: 0.25rem 0;';
      const labelSpan = document.createElement('span');
      labelSpan.style.color = 'var(--green)';
      labelSpan.style.fontWeight = '700';
      labelSpan.textContent = aiLine.label + ' ';
      const textSpan = document.createElement('span');
      textSpan.style.color = aiLine.cls === 't-fix' ? 'var(--cyan)' : 'var(--text)';
      textSpan.textContent = aiLine.text;
      row.appendChild(labelSpan);
      row.appendChild(textSpan);
      aiBlock.appendChild(row);
      terminalBody.parentElement.scrollTop = terminalBody.parentElement.scrollHeight;
    }

    await sleep(500);

    // Fix prompt
    const fixLine = document.createElement('div');
    fixLine.style.cssText = 'font-family: var(--font-mono); font-size: 0.8rem; margin-top: 0.8rem; color: var(--text);';
    fixLine.textContent = seq.fixPrompt;
    tOutput.appendChild(fixLine);
    await sleep(600);

    // Fix result
    const resultLine = document.createElement('div');
    resultLine.style.cssText = 'font-family: var(--font-mono); font-size: 0.8rem; color: #27C93F; margin-top: 0.3rem;';
    resultLine.textContent = seq.fixResult;
    tOutput.appendChild(resultLine);
    terminalBody.parentElement.scrollTop = terminalBody.parentElement.scrollHeight;

    await sleep(3500);

    // Fade out output
    tOutput.style.transition = 'opacity 0.5s';
    tOutput.style.opacity = '0';
    await sleep(500);
    tOutput.innerHTML = '';
    tCmd.textContent = '';
    tOutput.style.opacity = '1';
    tOutput.style.transition = '';
    await sleep(800);
  }
}

// Start terminal demo when visible
const terminalObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    runTerminalDemo();
    terminalObserver.disconnect();
  }
}, { threshold: 0.3 });

const termWrap = document.querySelector('.terminal-wrap');
if (termWrap) terminalObserver.observe(termWrap);

// ─── Particle System ──────────────────────────────────
const particleContainer = document.getElementById('particles');
if (particleContainer) {
  const PARTICLE_COUNT = 40;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = Math.random() * 15 + 10;
    const delay = Math.random() * -20;
    const opacity = Math.random() * 0.3 + 0.05;

    p.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${Math.random() > 0.6 ? '#00FF88' : Math.random() > 0.5 ? '#00D4FF' : '#A855F7'};
      left: ${x}%;
      top: ${y}%;
      opacity: ${opacity};
      animation: floatParticle ${dur}s linear ${delay}s infinite;
      pointer-events: none;
    `;
    particleContainer.appendChild(p);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatParticle {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: var(--op, 0.1); }
      90% { opacity: var(--op, 0.1); }
      100% { transform: translateY(-120vh) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 80 + 20)}px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Testimonial Slider ───────────────────────────────
(function initTestiSlider() {
  const track = document.getElementById('testiTrack');
  const prev = document.getElementById('testiPrev');
  const next = document.getElementById('testiNext');
  const dotsContainer = document.getElementById('testiDots');

  if (!track) return;

  const cards = track.querySelectorAll('.testi-card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.testi-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  next.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  // Touch/swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(current + (diff > 0 ? 1 : -1));
      startAuto();
    }
  });

  startAuto();
})();

// ─── Copy Buttons ─────────────────────────────────────
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('copied');
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="20,6 9,17 4,12"/></svg>`;
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.classList.remove('copied');
      }, 1500);
    } catch {}
  });
});

// ─── Newsletter form ──────────────────────────────────
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    const btn = newsletterForm.querySelector('button');
    btn.textContent = '✓';
    btn.style.color = 'var(--green)';
    input.value = '';
    input.placeholder = 'You\'re in!';
    setTimeout(() => {
      btn.textContent = '→';
      btn.style.color = '';
      input.placeholder = 'your@email.com';
    }, 3000);
  });
}

// ─── Model bar animations on scroll ───────────────────
const modelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.model-fill').forEach(bar => {
        bar.style.animation = 'none';
        void bar.offsetWidth; // reflow
        bar.style.animation = 'fillBar 1.5s ease-out forwards';
      });
      modelObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const modelsGrid = document.querySelector('.models-grid');
if (modelsGrid) modelObserver.observe(modelsGrid);

// ─── Active nav link on scroll ────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === `#${id}`);
        if (a.classList.contains('nav-active')) {
          a.style.color = 'var(--green)';
        } else {
          a.style.color = '';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ─── Parallax on hero blobs ────────────────────────────
const heroBlobs = document.querySelectorAll('.hero-bg .blob');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  heroBlobs.forEach((blob, i) => {
    const speed = (i + 1) * 0.15;
    blob.style.transform = `translateY(${scrolled * speed}px)`;
  });
}, { passive: true });

// ─── Glowing hover effect on feat cards ───────────────
document.querySelectorAll('.feat-card, .module-card, .sol-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.background = `
      radial-gradient(circle at ${x}% ${y}%, rgba(0,255,136,0.06) 0%, transparent 60%),
      var(--bg-card)
    `;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

// ─── Loading animation ────────────────────────────────
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
