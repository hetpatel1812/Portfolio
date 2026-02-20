// Always start at the top on page load / refresh
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Throttle function for performance
const throttle = (fn, delay) => {
    let last = 0;
    return (...args) => {
        const now = new Date().getTime();
        if (now - last < delay) return;
        last = now;
        return fn(...args);
    };
};

/* ============================================================
   Het Patel Portfolio – script.js
   ============================================================ */

'use strict';

// ── Theme ───────────────────────────────────────────────────
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

let isDark = true; // default dark

function applyTheme(dark) {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeIcon.textContent = dark ? '☀️' : '🌙';
    themeLabel.textContent = dark ? 'Light' : 'Dark';
    localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light');
    isDark = dark;
}

// Load saved preference
(function initTheme() {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light') {
        applyTheme(false);
    } else {
        applyTheme(true); // dark default
    }
})();

themeToggle.addEventListener('click', () => applyTheme(!isDark));

// ── Navbar ──────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const allLinks = document.querySelectorAll('.nav-link');

// Sticky shadow on scroll
window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 40 ? '0 4px 24px rgba(0,0,0,0.4)' : 'none';
}, { passive: true });

// Hamburger toggle
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});

// Close menu on link click (mobile)
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Active link highlight on scroll
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
            allLinks.forEach(l => {
                l.classList.remove('active');
                if (l.getAttribute('href') === `#${id}`) l.classList.add('active');
            });
        }
    });
}
updateActiveLink();

// ── Back to Top ──────────────────────────────────────────────
const backToTopBtn = document.getElementById('backToTop');

function toggleBackToTop() {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
}

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

const throttledScroll = throttle(() => {
    updateActiveLink();
    toggleBackToTop();
}, 60);

window.addEventListener('scroll', throttledScroll, { passive: true });

toggleBackToTop();

// ── Scroll Animations ────────────────────────────────────────
const animatedEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            // Stagger sibling cards
            const parent = entry.target.parentElement;
            const siblings = parent ? [...parent.querySelectorAll('.fade-up, .fade-left, .fade-right')] : [];
            const idx = siblings.indexOf(entry.target);
            const delay = idx >= 0 ? Math.min(idx * 120, 600) : 0;

            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

animatedEls.forEach(el => observer.observe(el));

// ── Lightbox for Certificates ────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.cert-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        // Only open lightbox for local images
        if (href && (href.endsWith('.png') || href.endsWith('.jpg') || href.endsWith('.jpeg'))) {
            e.preventDefault();
            lightboxImg.src = href;
            lightboxImg.alt = link.closest('.cert-card')?.querySelector('.cert-title')?.textContent || 'Certificate';
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    });
});

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ── Contact Form ─────────────────────────────────────────────
function handleFormSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('contactForm');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const formNote = document.getElementById('formNote');
    const submitBtn = document.getElementById('submitBtn');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
        formNote.textContent = 'Please fill in all fields.';
        formNote.className = 'form-note error';
        return;
    }

    // Show loading
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;
    formNote.textContent = '';
    formNote.className = 'form-note';

    // Since no backend: open mailto: link with prefilled data
    const subject = encodeURIComponent(`Portfolio Contact: ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailto = `mailto:hetpce2005@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
        window.location.href = mailto;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
        formNote.textContent = '✅ Your email client has been opened with the message!';
        formNote.className = 'form-note success';
        form.reset();
        setTimeout(() => { formNote.textContent = ''; formNote.className = 'form-note'; }, 6000);
    }, 1000);
}

// Expose to HTML onsubmit
window.handleFormSubmit = handleFormSubmit;

// ── Smooth reveal on first load ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Hero items animate immediately
    document.querySelectorAll('.hero .fade-up').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.12}s`;
        setTimeout(() => el.classList.add('visible'), 100 + i * 120);
    });
});

// ── Typing effect for hero subtitle ─────────────────────────
(function typeEffect() {
    const target = document.querySelector('.hero-sub');
    if (!target) return;
    const roles = ['ML & Data Science Engineer', 'Python Developer', 'AI Solutions Builder', 'Data Analyst'];
    let roleIdx = 0, charIdx = 0, deleting = false;

    const originalText = target.textContent;
    target.textContent = '';
    target.style.borderRight = '2px solid var(--accent)';
    target.style.paddingRight = '4px';
    target.style.whiteSpace = 'nowrap';
    target.style.overflow = 'hidden';
    target.style.display = 'inline-block';

    function tick() {
        const current = roles[roleIdx];
        if (!deleting) {
            charIdx++;
            target.textContent = current.slice(0, charIdx);
            if (charIdx === current.length) {
                deleting = true;
                setTimeout(tick, 2200);
                return;
            }
            setTimeout(tick, 70);
        } else {
            charIdx--;
            target.textContent = current.slice(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
                setTimeout(tick, 400);
                return;
            }
            setTimeout(tick, 35);
        }
    }

    // Start after hero visible
    setTimeout(tick, 1200);
})();

// ── Hybrid Cursor Logic ──────────────────────────────────────
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

if (cursorDot && cursorRing && window.innerWidth >= 992) {
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    // Track mouse position
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // 1. Dot moves instantly (for precision)
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // 2. Ring moves with smooth delay (Lerp)
    const animateRing = () => {
        const speed = 0.15; // Delay factor

        ringX += (mouseX - ringX) * speed;
        ringY += (mouseY - ringY) * speed;

        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;

        requestAnimationFrame(animateRing);
    };
    animateRing();

    // Hover Effects
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-card, .cert-card');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

