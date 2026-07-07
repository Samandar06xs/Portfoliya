// ============ Language switcher (UZ / EN / RU) ============
const LANG_KEY = 'sm_portfolio_lang';
let currentLang = localStorage.getItem(LANG_KEY) || 'uz';

function applyLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const value = TRANSLATIONS[lang][el.dataset.i18n];
    if (value !== undefined) el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const value = TRANSLATIONS[lang][el.dataset.i18nHtml];
    if (value !== undefined) el.innerHTML = value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const value = TRANSLATIONS[lang][el.dataset.i18nPlaceholder];
    if (value !== undefined) el.setAttribute('placeholder', value);
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  localStorage.setItem(LANG_KEY, lang);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

applyLanguage(currentLang);

// ============ Year ============
document.getElementById('year').textContent = new Date().getFullYear();

// ============ Navbar scroll state ============
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ============ Mobile burger menu ============
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('mobile-open');
  navLinks.style.display = navLinks.classList.contains('mobile-open') ? 'flex' : 'none';
  if (navLinks.classList.contains('mobile-open')) {
    Object.assign(navLinks.style, {
      position: 'fixed', top: '64px', left: '0', right: '0', flexDirection: 'column',
      background: 'rgba(5,7,13,0.97)', padding: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)'
    });
  }
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  if (window.innerWidth <= 980) { navLinks.classList.remove('mobile-open'); navLinks.style.display = 'none'; }
}));

// ============ Active nav link on scroll ============
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(link => {
        link.classList.toggle('active', link.dataset.section === entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
sections.forEach(s => sectionObserver.observe(s));

// ============ Reveal on scroll ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
  revealObserver.observe(el);
});

// ============ Animated counters ============
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ============ Language bars ============
const langObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
      langObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.lang-fill').forEach(el => langObserver.observe(el));


// ============ Cursor glow ============
const glow = document.getElementById('cursorGlow');
if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
  window.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

// ============ Contact form (Web3Forms) ============
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const subjectPrefixByLang = {
  uz: 'Portfolio orqali yangi xabar',
  en: 'New message via Portfolio',
  ru: 'Новое сообщение через портфолио'
};
const formStatusMsg = {
  sending: { uz: 'Yuborilmoqda...', en: 'Sending...', ru: 'Отправка...' },
  success: { uz: 'Xabar yuborildi! Tez orada javob beraman.', en: 'Message sent! I will reply soon.', ru: 'Сообщение отправлено! Скоро отвечу.' },
  error: { uz: 'Xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring yoki to\'g\'ridan-to\'g\'ri email yozing.', en: 'Something went wrong. Please try again later or email directly.', ru: 'Произошла ошибка. Попробуйте позже или напишите на email напрямую.' }
};
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  contactForm.subject.value = `${subjectPrefixByLang[currentLang]} — ${contactForm.name.value.trim()}`;
  submitBtn.disabled = true;
  formNote.classList.remove('form-note-error');
  formNote.textContent = formStatusMsg.sending[currentLang];
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
    });
    const data = await res.json();
    if (data.success) {
      formNote.textContent = formStatusMsg.success[currentLang];
      contactForm.reset();
    } else {
      formNote.classList.add('form-note-error');
      formNote.textContent = formStatusMsg.error[currentLang];
    }
  } catch {
    formNote.classList.add('form-note-error');
    formNote.textContent = formStatusMsg.error[currentLang];
  } finally {
    submitBtn.disabled = false;
  }
});
