'use strict';

const GA_MEASUREMENT_ID = 'G-EXAMPLE123'; // replace with your GA4 measurement ID

function loadGA(measurementId) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  script.onload = () => {
    gtag('config', measurementId, { page_path: location.pathname });
  };
  document.head.appendChild(script);
}

function setConsent(consent) {
  localStorage.setItem('analyticsConsent', consent ? 'granted' : 'denied');
  if (consent) loadGA(GA_MEASUREMENT_ID);
  const banner = document.getElementById('consentBanner');
  if (banner) banner.style.display = 'none';
}

(function initApp() {
  // Initialize navigation
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('primary-nav');
  function closeNav() {
    if (nav) {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  // Theme handling (Light/Dark)
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
  const themeToggle = document.getElementById('themeToggle');
  function updateThemeToggleLabel() {
    if (themeToggle) {
      themeToggle.textContent = root.getAttribute('data-theme') === 'light' ? 'Dark' : 'Light';
    }
  }
  updateThemeToggleLabel();
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (root.getAttribute('data-theme') === 'light') {
        root.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
      updateThemeToggleLabel();
    });
  }

  // Smooth scrolling for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetSelector = anchor.getAttribute('href');
      if (!targetSelector || targetSelector.charAt(0) !== '#') return;
      const target = document.querySelector(targetSelector);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Move focus for accessibility
        target.focus?.({ preventScroll: true });
      }
    });
  });

  // Newsletter form handling
  const newsletterForm = document.getElementById('newsletterForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const consentInput = document.getElementById('consent');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const consentError = document.getElementById('consentError');
  const statusDiv = document.getElementById('newsletterStatus');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      let valid = true;
      nameError.textContent = '';
      emailError.textContent = '';
      consentError.textContent = '';

      const nameVal = (nameInput.value || '').trim();
      const emailVal = (emailInput.value || '').trim();
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

      if (!nameVal) {
        nameError.textContent = 'Please enter your full name.';
        valid = false;
      }
      if (!emailVal || !emailRegex.test(emailVal)) {
        emailError.textContent = 'Please enter a valid email address.';
        valid = false;
      }
      if (!consentInput.checked) {
        consentError.textContent = 'You must agree to receive emails to subscribe.';
        valid = false;
      }

      if (!valid) return;

      const data = { name: nameVal, email: emailVal, ts: new Date().toISOString() };
      const existing = JSON.parse(localStorage.getItem('subscribers') || '[]');
      existing.push(data);
      localStorage.setItem('subscribers', JSON.stringify(existing));
      newsletterForm.reset();
      if (statusDiv) {
        statusDiv.textContent =
          'Thank you for subscribing! A confirmation email may be sent if you opted in.';
        statusDiv.style.display = 'block';
      }
    });
  }

  // Contact form handling
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const subject = document.getElementById('subject');
      const message = document.getElementById('message');
      const subjectError = document.getElementById('subjectError');
      const messageError = document.getElementById('messageError');
      subjectError.textContent = '';
      messageError.textContent = '';
      let ok = true;
      if (!subject.value.trim()) {
        subjectError.textContent = 'Please enter a subject.';
        ok = false;
      }
      if (!message.value.trim()) {
        messageError.textContent = 'Please enter a message.';
        ok = false;
      }
      if (!ok) return;
      const payload = {
        subject: subject.value.trim(),
        message: message.value.trim(),
        ts: new Date().toISOString(),
      };
      const list = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      list.push(payload);
      localStorage.setItem('contactMessages', JSON.stringify(list));
      contactForm.reset();
      const status = document.getElementById('contactStatus');
      if (status) {
        status.textContent = 'Message sent. We will get back to you shortly.';
        status.style.display = 'block';
      }
    });
  }

  // Analytics consent banner
  const banner = document.getElementById('consentBanner');
  const acceptGA = document.getElementById('acceptGA');
  const declineGA = document.getElementById('declineGA');
  if (banner && acceptGA && declineGA) {
    const current = localStorage.getItem('analyticsConsent');
    if (current === 'granted') {
      banner.style.display = 'none';
      loadGA(GA_MEASUREMENT_ID);
    } else {
      banner.style.display = 'flex';
    }
    acceptGA.addEventListener('click', () => setConsent(true));
    declineGA.addEventListener('click', () => setConsent(false));
  }

  // If consent was previously granted, ensure GA is loaded on page load
  if (localStorage.getItem('analyticsConsent') === 'granted') {
    loadGA(GA_MEASUREMENT_ID);
  }
})();
