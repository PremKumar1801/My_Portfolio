/* ===========================
   PORTFOLIO - SCRIPT.JS
   =========================== */

// ---- Custom Cursor ----
const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  const label    = document.getElementById('cursorLabel');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let fx = mx, fy = my;
  let magX = 0, magY = 0;

  // ── cursor dot follows mouse instantly
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    label.style.left  = mx + 'px';
    label.style.top   = my + 'px';
  });

  //
  window.addEventListener("scroll", function () {
  let scrollValue = window.scrollY;
  document.body.style.backgroundPosition = 
    "center " + (-scrollValue * 0.4) + "px";
});
  // ── attach magnetic behaviour to any element with data-cursor-text
  document.querySelectorAll('[data-cursor-text]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('glow');
      follower.classList.add('glow');
      label.textContent = el.dataset.cursorText;
      label.classList.add('visible');
    });

    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
      magX = dx * 0.35;
      magY = dy * 0.35;
    });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('glow');
      follower.classList.remove('glow');
      label.classList.remove('visible');
      el.style.transform = '';
      magX = 0; magY = 0;
    });
  });

  // ── smooth follower lerp loop
  (function tick() {
    fx += ((mx + magX) - fx) * 0.12;
    fy += ((my + magY) - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(tick);
  })();
// Hover effect on interactive elements
document.querySelectorAll('a, button, .project-card, .skill-cat').forEach(el => {
  el.addEventListener('mouseenter', () => cursorFollower.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hover'));
});

// ---- Navigation Scroll ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ---- Mobile Menu ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  const spans = hamburger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ---- Smooth Active Nav Link ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function activateNavLink() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const h = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + h) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}
window.addEventListener('scroll', activateNavLink);

// ---- Intersection Observer: Reveal Elements ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// ---- Trigger reveal for hero elements on load ----
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal-up, #hero .reveal-right').forEach(el => {
      el.classList.add('visible');
    });
  }, 200);
});

// ---- Counter Animation ----
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

// ---- Skill Bar Animation ----
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        const w = bar.dataset.width;
        setTimeout(() => { bar.style.width = w + '%'; }, 200);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const skillsSection = document.querySelector('.skills-bars');
if (skillsSection) barObserver.observe(skillsSection);

// ---- Hero Canvas: Particle Grid ----
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  initParticles();
}

function initParticles() {
  particles = [];
  const cols = Math.floor(canvas.width / 80);
  const rows = Math.floor(canvas.height / 80);
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      particles.push({
        x: (canvas.width / cols) * i,
        y: (canvas.height / rows) * j,
        baseX: (canvas.width / cols) * i,
        baseY: (canvas.height / rows) * j,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
        vx: 0, vy: 0
      });
    }
  }
}

document.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gradient bg
  const grd = ctx.createRadialGradient(
    canvas.width * 0.7, canvas.height * 0.3, 0,
    canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.6
  );
  grd.addColorStop(0, 'rgba(201,169,110,0.06)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    // Mouse interaction
    if (mouse.x !== null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 150;
      if (dist < maxDist) {
        const force = (maxDist - dist) / maxDist;
        p.vx -= (dx / dist) * force * 2;
        p.vy -= (dy / dist) * force * 2;
      }
    }

    // Spring back
    p.vx += (p.baseX - p.x) * 0.04;
    p.vy += (p.baseY - p.y) * 0.04;
    p.vx *= 0.85;
    p.vy *= 0.85;
    p.x += p.vx;
    p.y += p.vy;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232, 213, 183, ${p.opacity})`;
    ctx.fill();
  });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(232, 213, 183, ${0.05 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawCanvas);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawCanvas();

// ---- Contact Form ----
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '<span>Message Sent! ✓</span>';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 3000);
    }, 1500);
  });
}

// ---- Parallax Hero ----
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
    heroContent.style.opacity = 1 - scrollY / 600;
  }
});

// ---- Page Load Progress Bar ----
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  height: 3px;
  background: linear-gradient(90deg, #a07850, #c9a96e, #e8d5b7);
  z-index: 99999;
  transition: width 0.3s;
  width: 0%;
`;
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (scrolled / total) * 100;
  progressBar.style.width = pct + '%';
});




// ---- journey section  ----
(function () {
  'use strict';

  var nodes = document.querySelectorAll('.journey-node');

  /* Must match --j-branch-dur in CSS (ms) */
  var BRANCH_DUR = 540;

  /* ── Detect mouse vs touch device ── */
  var isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ════════════════════════════════════════════════════
     OPEN — two-frame technique:
     Frame 1: remove [hidden] → browser renders display:block
     Frame 2: add --open class → CSS transition fires properly
     Without the double-rAF, transitions on previously-hidden
     elements start from the already-transitioned state.
  ════════════════════════════════════════════════════ */
  function openNode(node) {
    var trigger = node.querySelector('.journey-node__trigger');
    var panel   = node.querySelector('.journey-panel');
    if (!trigger || !panel) return;

    clearTimeout(panel._hideTimer);
    panel.removeAttribute('hidden');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        node.classList.add('journey-node--open');
        trigger.setAttribute('aria-expanded', 'true');
      });
    });
  }

  /* ════════════════════════════════════════════════════
     CLOSE — start CSS transition immediately, then re-add
     [hidden] after the animation finishes so the fade-out
     is never cut short by a sudden display:none.
  ════════════════════════════════════════════════════ */
  function closeNode(node) {
    var trigger = node.querySelector('.journey-node__trigger');
    var panel   = node.querySelector('.journey-panel');
    if (!trigger || !panel) return;

    node.classList.remove('journey-node--open');
    trigger.setAttribute('aria-expanded', 'false');

    clearTimeout(panel._hideTimer);
    panel._hideTimer = setTimeout(function () {
      panel.setAttribute('hidden', '');
    }, BRANCH_DUR + 20);
  }

  function closeAll() {
    nodes.forEach(function (n) { closeNode(n); });
  }

  /* ── Desktop: hover ── */
  if (isHoverDevice) {
    nodes.forEach(function (node) {
      var leaveTimer = null;

      node.addEventListener('mouseenter', function () {
        clearTimeout(leaveTimer);
        nodes.forEach(function (n) { if (n !== node) closeNode(n); });
        openNode(node);
      });

      node.addEventListener('mouseleave', function () {
        /* Short buffer prevents flicker when cursor crosses into panel */
        leaveTimer = setTimeout(function () { closeNode(node); }, 80);
      });
    });

  /* ── Mobile / touch: click ── */
  } else {
    nodes.forEach(function (node) {
      var trigger = node.querySelector('.journey-node__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function () {
        var isOpen = node.classList.contains('journey-node--open');
        closeAll();
        if (!isOpen) openNode(node);
      });
    });
  }

  /* ── Scroll reveal ── */
  var revealEls = document.querySelectorAll('.journey .reveal');
  if (!revealEls.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach(function (el) { observer.observe(el); });
})();



 /**
  WORK SECTION 
   */

  document.querySelectorAll('.project-img').forEach(imgContainer => {
    const scroller  = imgContainer.querySelector('.project-img-scroll');
    const hint      = imgContainer.querySelector('.scroll-hint');

    let inside      = false;
    let resetTimer  = null;
    let animFrame   = null;

    // ── Track cursor presence ──────────────────────────
    imgContainer.addEventListener('mouseenter', () => {
      inside = true;
      clearTimeout(resetTimer);
      if (animFrame) cancelAnimationFrame(animFrame);
    });

    imgContainer.addEventListener('mouseleave', () => {
      inside = false;
      // Smooth reset after a brief pause
      resetTimer = setTimeout(() => smoothScrollToTop(scroller), 200);
    });

    // ── Isolate wheel events ───────────────────────────
    imgContainer.addEventListener('wheel', e => {
      if (!inside) return;

      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const atTop    = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;

      // If not at a boundary, consume the event entirely
      if (!atTop && !atBottom) {
        e.preventDefault();
        e.stopPropagation();
        scroller.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    }, { passive: false });

    // ── Hint fade on scroll ────────────────────────────
    scroller.addEventListener('scroll', () => {
      if (scroller.scrollTop > 24) {
        hint.classList.add('hidden');
      } else {
        hint.classList.remove('hidden');
      }
    }, { passive: true });

    // ── Smooth reset util ──────────────────────────────
    function smoothScrollToTop(el) {
      const start     = el.scrollTop;
      const duration  = 420; // ms
      let   startTime = null;

      function step(now) {
        if (!startTime) startTime = now;
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        el.scrollTop = start * (1 - ease);

        if (progress < 1) {
          animFrame = requestAnimationFrame(step);
        } else {
          el.scrollTop = 0;
          hint.classList.remove('hidden');
        }
      }

      animFrame = requestAnimationFrame(step);
    }
  });