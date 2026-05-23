/* ============================================================
   JPWEBER MÍDIA TECH — script.js
   Interatividade, canvas de ondas e animações
   ============================================================ */

'use strict';

/* ── NAVBAR SCROLL ──────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ── MENU MOBILE ─────────────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Fechar menu ao clicar em link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── CANVAS DE ONDAS (HERO) ──────────────────────────────────── */
(function initWaves() {
  const canvas = document.getElementById('waveCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, animId;

  const waves = [
    { amplitude: 22, period: 0.012, speed: 0.018, offset: 0,   color: 'rgba(21,101,192,0.5)' },
    { amplitude: 16, period: 0.018, speed: 0.024, offset: 1.2, color: 'rgba(66,165,245,0.35)' },
    { amplitude: 12, period: 0.022, speed: 0.030, offset: 2.4, color: 'rgba(212,168,67,0.18)' },
  ];

  function resize() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);

    waves.forEach(w => {
      ctx.beginPath();

      const y0 = height * 0.55;
      ctx.moveTo(0, y0);

      for (let x = 0; x <= width; x += 2) {
        const y = y0
          + Math.sin(x * w.period + t * w.speed + w.offset) * w.amplitude
          + Math.sin(x * w.period * 1.7 + t * w.speed * 0.7 + w.offset) * (w.amplitude * 0.4);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      ctx.fillStyle = w.color;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  function start() {
    resize();
    if (animId) cancelAnimationFrame(animId);
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  start();
})();

/* ── CONTADORES ANIMADOS (STATS) ─────────────────────────────── */
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Easeout quad
    const eased = 1 - (1 - progress) * (1 - progress);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* ── INTERSECTION OBSERVER — REVEAL + COUNTERS ───────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// Revelar elementos genéricos
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Revelar service cards com delay sequencial
const serviceCards = document.querySelectorAll('.service-card');
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = +entry.target.dataset.delay || 0;
    setTimeout(() => entry.target.classList.add('visible'), delay);
    cardObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });
serviceCards.forEach(card => cardObserver.observe(card));

// Counters
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// Marcar seções para reveal
document.querySelectorAll('.section-header, .sobre-visual, .sobre-content, .filosofia-icon, .filosofia-text, .contato-info, .contato-form-wrap').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ── FORMULÁRIO DE CONTATO ───────────────────────────────────── */
const sendBtn    = document.getElementById('sendBtn');
const formEl     = document.getElementById('contactForm');
const successEl  = document.getElementById('formSuccess');

if (sendBtn) {
  sendBtn.addEventListener('click', () => {
    const nome     = document.getElementById('nome');
    const email    = document.getElementById('email');
    const mensagem = document.getElementById('mensagem');

    // Validação simples
    let valid = true;

    [nome, email, mensagem].forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#e57373';
        valid = false;
      }
    });

    if (!valid) {
      sendBtn.style.animation = 'shake 0.4s ease';
      sendBtn.addEventListener('animationend', () => {
        sendBtn.style.animation = '';
      }, { once: true });
      return;
    }

    // Simula envio (aqui integraria com backend / emailJS / formspree)
    sendBtn.disabled = true;
    sendBtn.querySelector('span').textContent = 'Enviando...';

    setTimeout(() => {
      formEl.style.opacity = '0';
      formEl.style.transition = 'opacity 0.4s ease';
      setTimeout(() => {
        formEl.style.display = 'none';
        successEl.style.display = 'block';
        successEl.style.opacity = '0';
        successEl.style.transition = 'opacity 0.5s ease';
        requestAnimationFrame(() => {
          successEl.style.opacity = '1';
        });
      }, 400);
    }, 1200);
  });
}

// Injetar CSS da animação de shake via JS
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-6px); }
    80%      { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ── SCROLL SUAVE PARA LINKS INTERNOS ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar ? navbar.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── HIGHLIGHT ATIVO NO MENU ─────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// CSS do link ativo
const activeStyle = document.createElement('style');
activeStyle.textContent = `.nav-links a.active { color: var(--gold) !important; }`;
document.head.appendChild(activeStyle);

/* ── MÁSCARA DE TELEFONE ─────────────────────────────────────── */
const whatsappInput = document.getElementById('whatsapp');
if (whatsappInput) {
  whatsappInput.addEventListener('input', () => {
    let v = whatsappInput.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length >= 7) {
      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    } else if (v.length >= 3) {
      v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    whatsappInput.value = v;
  });
}