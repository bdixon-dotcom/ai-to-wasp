// Wasp micro-site — shared behaviors
document.addEventListener('DOMContentLoaded', () => {
  // highlight current page in nav (desktop mega menus + mobile panel + pricing link)
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.megamenu a, .mobile-panel a, .nav-actions > a.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href === here) {
      a.classList.add('active');
      const parentLink = a.closest('.nav-item')?.querySelector('.nav-link');
      if (parentLink) parentLink.classList.add('active');
    }
  });

  // mega menu backdrop dimming
  const megaItems = document.querySelectorAll('.nav-item.has-mega');
  const backdrop = document.querySelector('.megamenu-backdrop');
  if (backdrop) {
    megaItems.forEach(item => {
      item.addEventListener('mouseenter', () => backdrop.classList.add('open'));
      item.addEventListener('mouseleave', () => backdrop.classList.remove('open'));
    });
  }

  // mobile nav toggle
  const burger = document.querySelector('.burger');
  const panel = document.querySelector('.mobile-panel');
  if (burger && panel) {
    burger.addEventListener('click', () => {
      panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', panel.classList.contains('open'));
    });
  }

  // FAQ accordions
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.closest('.faq')?.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // pricing category picker — toggle selectable cards, RFID add-on linked to plan pricing
  document.querySelectorAll('.cat-card:not(.link)').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('on');
      card.classList.toggle('dim');
      const isOn = card.classList.contains('on');
      const checkSvg = card.querySelector('.check svg');
      if (checkSvg) checkSvg.style.color = isOn ? '#fff' : 'transparent';
      const checkWrap = card.querySelector('.check');
      if (checkWrap) {
        checkWrap.style.background = isOn ? '#17a673' : 'transparent';
        checkWrap.style.border = isOn ? 'none' : '1.5px solid var(--line)';
      }
      if (card.dataset.addon) {
        document.querySelectorAll(`[data-addon-note="${card.dataset.addon}"]`).forEach(note => {
          note.classList.toggle('show', isOn);
        });
      }
    });
  });

  // demo form — prevent actual submission, show confirmation
  const demoForm = document.querySelector('#demoForm');
  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = demoForm.querySelector('button[type="submit"]');
      if (btn) btn.textContent = 'Thanks — we\'ll be in touch!';
    });
  }

  // hosting toggle on pricing cards — updates price and caption per plan
  document.querySelectorAll('.host-toggle').forEach(toggle => {
    const plan = toggle.closest('.plan');
    const priceEl = plan?.querySelector('.price');
    const captionEl = plan?.querySelector('.hosted-caption');
    toggle.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        toggle.querySelectorAll('button').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        if (priceEl && btn.dataset.price) priceEl.innerHTML = btn.dataset.price;
        if (captionEl && btn.dataset.caption) captionEl.textContent = btn.dataset.caption;
      });
    });
  });

  // GPS Overview — Complete Visibility tabbed icons
  document.querySelectorAll('.cv-icons').forEach(iconRow => {
    const container = iconRow.parentElement;
    const panels = container.querySelectorAll('.cv-desc');
    iconRow.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        iconRow.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-cv-tab');
        panels.forEach(p => p.classList.toggle('active', p.getAttribute('data-cv-panel') === tab));
      });
    });
  });

  // ROI calculator — shared 3-step wizard wiring (step nav, pain-point rating).
  // Page-specific calculation logic hooks in via window.roiCalculate(getValues).
  const roiWizard = document.querySelector('.roi-wizard');
  if (roiWizard) {
    const steps = Array.from(roiWizard.querySelectorAll('.roi-stepper .step'));
    const bars = Array.from(roiWizard.querySelectorAll('.roi-stepper .bar'));
    const panels = Array.from(roiWizard.querySelectorAll('.roi-panel'));
    let current = 1;

    function goToStep(n) {
      current = n;
      panels.forEach(p => p.classList.toggle('active', Number(p.dataset.step) === n));
      steps.forEach(s => {
        const sn = Number(s.dataset.step);
        s.classList.toggle('active', sn === n);
        s.classList.toggle('done', sn < n);
      });
      bars.forEach((b, i) => b.classList.toggle('done', i + 1 < n));
      roiWizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    roiWizard.querySelectorAll('[data-roi-next]').forEach(btn => {
      btn.addEventListener('click', () => goToStep(Math.min(3, current + 1)));
    });
    roiWizard.querySelectorAll('[data-roi-back]').forEach(btn => {
      btn.addEventListener('click', () => goToStep(Math.max(1, current - 1)));
    });

    // pain-point circle rating (1-5)
    const tagWords = ['Minor friction', 'Noticeable drain', 'Noticeable drain', 'Significant cost', 'Major cost driver'];
    roiWizard.querySelectorAll('.roi-pain-item').forEach(item => {
      const circles = Array.from(item.querySelectorAll('.roi-scale .circles button'));
      const tag = item.querySelector('.roi-scale .tag');
      function setVal(v) {
        item.dataset.value = v;
        circles.forEach((c, i) => c.classList.toggle('on', i < v));
        if (tag) tag.textContent = tagWords[v - 1];
      }
      circles.forEach((c, i) => c.addEventListener('click', () => setVal(i + 1)));
      setVal(Number(item.dataset.value || 3));
    });

    // Calculate button → run page-specific calc, render results, go to step 3
    roiWizard.querySelectorAll('[data-roi-calculate]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof window.roiCalculate === 'function') window.roiCalculate(roiWizard);
        goToStep(3);
      });
    });
    roiWizard.querySelectorAll('[data-roi-recalculate]').forEach(btn => {
      btn.addEventListener('click', () => goToStep(1));
    });
  }
});
