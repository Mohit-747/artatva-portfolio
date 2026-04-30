/* ============================================
   HERO CANVAS — Particle Network
   ============================================ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles, mouse = { x: -1000, y: -1000 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(80, Math.floor((w * h) / 15000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,102,241,0.5)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = dx * dx + dy * dy;
        if (dist < 20000) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 20000)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mDist = mdx * mdx + mdy * mdy;
      if (mDist < 40000) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(6,182,212,${0.3 * (1 - mDist / 40000)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => { resize(); createParticles(); });
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
})();

/* ============================================
   CURSOR GLOW
   ============================================ */
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.innerWidth < 768) { if (glow) glow.style.display = 'none'; return; }
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
})();

/* ============================================
   NAVIGATION
   ============================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  let menuOpen = false;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 50);
  });

  toggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menu.classList.toggle('mobile-menu--open', menuOpen);
    toggle.classList.toggle('active', menuOpen);
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menuOpen = false;
      menu.classList.remove('mobile-menu--open');
      toggle.classList.remove('active');
    });
  });
})();

/* ============================================
   GSAP ANIMATIONS
   ============================================ */
gsap.registerPlugin(ScrollTrigger);

// Hero text reveal
gsap.fromTo('.reveal-text', {
  opacity: 0,
  y: 30
}, {
  opacity: 1,
  y: 0,
  duration: 0.8,
  stagger: 0.15,
  ease: 'power3.out',
  delay: 0.3
});

// Scroll-triggered reveals
gsap.utils.toArray('.reveal-up').forEach((el, i) => {
  gsap.fromTo(el, {
    opacity: 0,
    y: 50
  }, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });
});

// Stat counter animation
gsap.utils.toArray('.stat__number').forEach(el => {
  const target = parseFloat(el.dataset.target);
  const isDecimal = target % 1 !== 0;
  const obj = { val: 0 };

  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = isDecimal ? obj.val.toFixed(1) : Math.round(obj.val);
        }
      });
    },
    once: true
  });
});

// Timeline line draw
gsap.fromTo('.timeline::before', {
  scaleY: 0
}, {
  scaleY: 1,
  scrollTrigger: {
    trigger: '.timeline',
    start: 'top 80%',
    end: 'bottom 60%',
    scrub: 1
  }
});

// Project cards stagger within view
ScrollTrigger.batch('.project-card', {
  onEnter: (batch) => {
    gsap.fromTo(batch, {
      opacity: 0,
      y: 40,
      scale: 0.97
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    });
  },
  start: 'top 88%',
  once: true
});

// Skill chips stagger
ScrollTrigger.batch('.skill-chip', {
  onEnter: (batch) => {
    gsap.fromTo(batch, {
      opacity: 0,
      y: 16,
      scale: 0.9
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      stagger: 0.03,
      ease: 'back.out(1.5)'
    });
  },
  start: 'top 90%',
  once: true
});

// Parallax on hero
gsap.to('.hero__content', {
  y: -80,
  opacity: 0.3,
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1
  }
});

// Nav links active state on scroll
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav__link');

sections.forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top center',
    end: 'bottom center',
    onEnter: () => setActiveLink(section.id),
    onEnterBack: () => setActiveLink(section.id),
  });
});

function setActiveLink(id) {
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + id ? 'var(--text)' : '';
  });
}

/* ============================================
   SMOOTH SCROLL for anchor links
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 72,
        behavior: 'smooth'
      });
    }
  });
});

/* ============================================
   PROJECT CARD TILT EFFECT
   ============================================ */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -3;
    const rotateY = (x - centerX) / centerX * 3;
    card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ============================================
   LAMP DIVIDER - light it up on scroll into view
   ============================================ */
(function initLamp() {
  const lamp = document.getElementById('lampDivider');
  if (!lamp) return;
  ScrollTrigger.create({
    trigger: lamp,
    start: 'top 70%',
    onEnter: () => lamp.classList.add('lamp--lit'),
  });
})();

/* ============================================
   CHATBOT NUDGE - prompts visitors to chat after a delay
   ============================================ */
(function initNudge() {
  const nudge = document.getElementById('chatNudge');
  const nudgeClose = document.getElementById('chatNudgeClose');
  const nudgeTitle = document.getElementById('chatNudgeTitle');
  const nudgeText = document.getElementById('chatNudgeText');
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  if (!nudge || !fab || !panel) return;

  const STORAGE_KEY = 'mk_nudge_dismissed';
  const SHOW_AFTER_MS = 3500;
  const AUTO_HIDE_AFTER_MS = 12000;
  const REAPPEAR_INTERVAL_MS = 25000;

  const PROMPTS = [
    { title: "Hi, I'm Mohit's AI 👋", text: "Ask me anything about his work, projects, or Artatva." },
    { title: "Want the 30-second pitch?", text: "Ask: \"What does Mohit actually do?\" — I'll keep it punchy." },
    { title: "Curious about Artatva?", text: "Why he's building it, what's launched, where it's headed — try me." },
    { title: "Hiring or partnering?", text: "Ask about his AI work, MBA, or how to book a call." },
    { title: "Got a tricky AI problem?", text: "Tell me about it. He's shipped 100+ agents in production." },
  ];
  let promptIdx = 0;
  let dismissedByUser = false;
  let hideTimer, reappearTimer;

  function setPrompt(i) {
    const p = PROMPTS[i % PROMPTS.length];
    nudgeTitle.textContent = p.title;
    nudgeText.textContent = p.text;
  }

  function show() {
    if (dismissedByUser) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    if (panel.classList.contains('chat-panel--open')) return;
    setPrompt(promptIdx);
    nudge.classList.add('chat-nudge--show');
    nudge.setAttribute('aria-hidden', 'false');
    fab.classList.add('chat-fab--attention');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(autoHide, AUTO_HIDE_AFTER_MS);
  }
  function autoHide() {
    nudge.classList.remove('chat-nudge--show');
    nudge.setAttribute('aria-hidden', 'true');
    fab.classList.remove('chat-fab--attention');
    promptIdx = (promptIdx + 1) % PROMPTS.length;
    clearTimeout(reappearTimer);
    if (!dismissedByUser) reappearTimer = setTimeout(show, REAPPEAR_INTERVAL_MS);
  }
  function dismiss() {
    dismissedByUser = true;
    sessionStorage.setItem(STORAGE_KEY, '1');
    nudge.classList.remove('chat-nudge--show');
    nudge.setAttribute('aria-hidden', 'true');
    fab.classList.remove('chat-fab--attention');
    clearTimeout(hideTimer);
    clearTimeout(reappearTimer);
  }

  setTimeout(show, SHOW_AFTER_MS);

  nudge.addEventListener('click', (e) => {
    if (e.target === nudgeClose) return;
    fab.click();
    dismiss();
  });
  nudgeClose.addEventListener('click', (e) => {
    e.stopPropagation();
    dismiss();
  });
  fab.addEventListener('click', dismiss);
})();

/* ============================================
   ENHANCED SCROLL TRANSITIONS
   - Timeline items slide in from their data-side direction
   - Stat cards scale + fade
   - Headshot photo gentle parallax + scale
   - Project cards rotate-in + lift
   - Section titles slide up with stagger
   - Skill chip groups bounce in
   - Education cards flip in
   - Contact links cascade
   ============================================ */
(function initRichScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Timeline items: slide from their assigned side
  gsap.utils.toArray('.timeline__item').forEach((el) => {
    const side = el.dataset.side === 'left' ? -1 : 1;
    gsap.fromTo(el,
      { opacity: 0, x: 80 * side, scale: 0.96 },
      {
        opacity: 1, x: 0, scale: 1,
        duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
  });

  // Why-cards: 3D-feel rotate-in
  gsap.utils.toArray('.why-card').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 50, rotateX: -15, transformPerspective: 1000 },
      {
        opacity: 1, y: 0, rotateX: 0,
        duration: 0.9, ease: 'power3.out', delay: (i % 2) * 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  // Roadmap phases: stagger from left in a wave
  ScrollTrigger.batch('.phase', {
    onEnter: (batch) => gsap.fromTo(batch,
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08, ease: 'back.out(1.4)' }
    ),
    start: 'top 88%', once: true,
  });

  // Education cards: gentle flip
  gsap.utils.toArray('.edu-card').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40, rotateY: i % 2 === 0 ? -8 : 8, transformPerspective: 1000 },
      {
        opacity: 1, y: 0, rotateY: 0,
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

  // Contact links: cascade
  ScrollTrigger.batch('.contact__link', {
    onEnter: (batch) => gsap.fromTo(batch,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    ),
    start: 'top 90%', once: true,
  });

  // Headshot: gentle parallax inside its frame as the user scrolls
  const headshot = document.getElementById('headshot');
  if (headshot) {
    gsap.fromTo(headshot,
      { y: -20, scale: 1.05 },
      {
        y: 20, scale: 1.05,
        scrollTrigger: { trigger: headshot.closest('.about__intro-card'), start: 'top bottom', end: 'bottom top', scrub: 1 },
      }
    );
  }

  // Marquee: micro-parallax (slows the perceived speed when scrolling)
  gsap.to('.marquee__track', {
    xPercent: -10,
    scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 1 },
  });

  // Section numerals drift up as the section enters view
  gsap.utils.toArray('.section__numeral').forEach((el) => {
    gsap.fromTo(el,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1,
        scrollTrigger: { trigger: el.parentElement, start: 'top 80%', end: 'top 30%', scrub: 0.5 },
      }
    );
  });

  // Section titles: slide up with mask reveal feel
  gsap.utils.toArray('.section__title').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30, letterSpacing: '0.1em' },
      {
        opacity: 1, y: 0, letterSpacing: '0em',
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  // Stats: scale + count combo (count is already wired, this adds the scale pop)
  gsap.utils.toArray('.stat').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30, scale: 0.85 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, ease: 'back.out(1.6)', delay: i * 0.05,
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

  // About intro card: a subtle scale + glow pulse when it enters view
  const introCard = document.querySelector('.about__intro-card');
  if (introCard) {
    gsap.fromTo(introCard,
      { opacity: 0, y: 30, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: introCard, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
  }

  // Lamp title (eyebrow + title + tag): slight upward float on scroll
  gsap.utils.toArray('.about__intro-text > *').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power3.out', delay: 0.1 + i * 0.1,
        scrollTrigger: { trigger: introCard, start: 'top 80%', toggleActions: 'play none none none' },
      }
    );
  });
})();

// Rotating words animation
(function initRotatingWords() {
  const containers = document.querySelectorAll('.rotating-words');
  containers.forEach((el) => {
    const words = (el.dataset.words || '').split(',').map(w => w.trim()).filter(Boolean);
    if (words.length < 2) return;
    const wordEl = el.querySelector('.rotating-words__word');
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      wordEl.textContent = words[i];
      wordEl.style.animation = 'none';
      void wordEl.offsetWidth;
      wordEl.style.animation = '';
    }, 2000);
  });
})();
