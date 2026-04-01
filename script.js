// ── Mobile nav toggle ──
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  links.classList.toggle('active');
  toggle.classList.toggle('open');
});

// Close menu on link click
links.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    links.classList.remove('active');
    toggle.classList.remove('open');
  });
});

// ── Scroll animations ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(
  '.service-card, .founder-card, .step, .contact__info, .contact__form'
).forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// ── Nav background on scroll ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.style.boxShadow = '0 1px 12px rgba(0,0,0,0.06)';
  } else {
    nav.style.boxShadow = 'none';
  }
});

// ── Form handler ──
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwzPqTGdAZMA7H1NYK6sAd_miPqTE-zkx3R6Nbuy_fivkcX4IO6JXOgYTQ_aDkbu7ZV/exec';

document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  // Obtener cookies de Meta (fbp y fbc)
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
  }

  // Obtener fbclid de la URL (para fbc)
  function getFbc() {
    var stored = getCookie('_fbc');
    if (stored) return stored;
    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get('fbclid');
    if (fbclid) return 'fb.1.' + Date.now() + '.' + fbclid;
    return '';
  }

  const data = {
    nombre: form.querySelector('input[type="text"]').value,
    email: form.querySelector('input[type="email"]').value,
    empresa: form.querySelectorAll('input[type="text"]')[1].value,
    servicio: form.querySelector('select').value,
    mensaje: form.querySelector('textarea').value,
    user_agent: navigator.userAgent,
    page_url: window.location.href,
    fbp: getCookie('_fbp'),
    fbc: getFbc(),
  };

  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(() => {
      // Enviar evento de lead a Google Analytics
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          event_category: 'formulario',
          event_label: data.servicio,
          value: 1,
        });
      }
      // Enviar evento Lead a Meta Pixel
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name: data.servicio,
          content_category: 'formulario_contacto',
        });
      }
      btn.textContent = 'Enviado!';
      btn.style.background = 'linear-gradient(135deg, #84cc16 0%, #06b6d4 100%)';
      form.reset();
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    })
    .catch(() => {
      btn.textContent = 'Error, intenta de nuevo';
      btn.style.background = '#ef4444';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    });
});
