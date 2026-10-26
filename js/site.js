(() => {
  const body = document.body;
  const drawer = document.querySelector('.site-nav');
  const drawerOverlay = document.querySelector('[data-drawer-overlay]');
  const drawerOpen = document.querySelector('[data-open-drawer]');
  const drawerClose = document.querySelector('[data-close-drawer]');
  const modal = document.querySelector('[data-contact-modal]');
  const form = document.querySelector('[data-contact-form]');
  const backToTop = document.querySelector('[data-back-to-top]');
  const scrollProgress = document.querySelector('[data-scroll-progress]');
  let modalOpener = null;

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasReducedMotion = prefersReducedMotion;

  const visibleFocusable = (root) => [...root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.offsetParent !== null);

  const setBodyLock = () => {
    const locked = drawer?.classList.contains('is-open') || modal?.classList.contains('is-open');
    body.classList.toggle('body-locked', Boolean(locked));
  };

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawerOverlay.classList.add('is-open');
    body.classList.add('drawer-open');
    drawerOpen.setAttribute('aria-expanded', 'true');
    setBodyLock();
    drawerClose.focus();
    window.requestAnimationFrame(() => document.dispatchEvent(new CustomEvent('drawerstatechange')));
  };

  const closeDrawer = (restoreFocus = true) => {
    drawer.classList.remove('is-open');
    drawerOverlay.classList.remove('is-open');
    body.classList.remove('drawer-open');
    drawerOpen.setAttribute('aria-expanded', 'false');
    setBodyLock();
    if (restoreFocus) drawerOpen.focus();
  };

  const openModal = (opener) => {
    modalOpener = opener;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setBodyLock();
    modal.querySelector('input').focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    setBodyLock();
    modalOpener?.focus();
  };

  drawerOpen?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', () => closeDrawer());
  drawerOverlay?.addEventListener('click', () => closeDrawer());
  drawer?.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeDrawer(false);
  }));

  document.querySelectorAll('[data-open-contact]').forEach((button) => {
    button.addEventListener('click', () => openModal(button));
  });
  document.querySelectorAll('[data-close-contact]').forEach((button) => button.addEventListener('click', closeModal));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (modal?.classList.contains('is-open')) closeModal();
      else if (drawer?.classList.contains('is-open')) closeDrawer();
    }
    if (event.key === 'Tab' && modal?.classList.contains('is-open')) {
      const focusable = visibleFocusable(modal);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const updateScrollUI = () => {
    backToTop?.classList.toggle('is-visible', window.scrollY >= 400);
    if (scrollProgress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      scrollProgress.style.width = `${progress * 100}%`;
    }
  };

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI);
  updateScrollUI();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const modeLinks = [...document.querySelectorAll('.mode-link')];
  let activeMaskLink = null;
  const startModeMask = (link) => {
    modeLinks.forEach((candidate) => {
      if (candidate === link) return;
      candidate.classList.remove('is-mask-active', 'is-mask-resetting');
    });
    link.classList.remove('is-mask-active', 'is-mask-resetting');
    void link.offsetWidth;
    link.classList.add('is-mask-active');
    activeMaskLink = link;
  };
  const resetModeMask = (link) => {
    if (activeMaskLink !== link) return;
    link.classList.remove('is-mask-active');
    void link.offsetWidth;
    link.classList.add('is-mask-resetting');
    activeMaskLink = null;
  };

  modeLinks.forEach((link) => {
    link.addEventListener('pointerenter', () => startModeMask(link));
    link.addEventListener('pointerleave', () => resetModeMask(link));
    link.addEventListener('focus', () => startModeMask(link));
    link.addEventListener('blur', () => resetModeMask(link));
    link.addEventListener('animationend', () => {
      if (link.classList.contains('is-mask-resetting')) link.classList.remove('is-mask-resetting');
    });
  });

  const currentModeLink = document.querySelector('.mode-link.is-active');
  if (currentModeLink) {
    const modeMarker = document.createElement('div');
    modeMarker.className = 'mode-marker';
    modeMarker.setAttribute('aria-hidden', 'true');
    modeMarker.innerHTML = '<b>←</b><span>You are here</span>';
    body.append(modeMarker);
    const positionModeMarker = () => {
      const panelRect = currentModeLink.closest('.mode-panel').getBoundingClientRect();
      const linkRect = currentModeLink.getBoundingClientRect();
      const markerWidth = 124;
      const markerX = window.innerWidth <= 768
        ? Math.max(10, panelRect.right - markerWidth - 8)
        : panelRect.right - 54;
      modeMarker.style.setProperty('--marker-x', `${markerX}px`);
      modeMarker.style.setProperty('--marker-y', `${linkRect.top + (linkRect.height / 2)}px`);
    };
    positionModeMarker();
    window.addEventListener('resize', positionModeMarker);
    drawer?.addEventListener('scroll', positionModeMarker, { passive: true });
    document.addEventListener('drawerstatechange', positionModeMarker);
    window.setTimeout(() => modeMarker.classList.add('is-visible'), 4000);
  }

  const revealTargets = [...document.querySelectorAll([
    '.section-heading',
    '.feature-card',
    '.case-card',
    '.band-list > div',
    '.domain-block',
    '.credential-grid article',
    '.switch-banner > *'
  ].join(','))];

  revealTargets.forEach((element, index) => {
    element.classList.add('reveal-item');
    element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
  });

  if ('IntersectionObserver' in window && !hasReducedMotion()) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add('is-revealed'));
  }

  document.querySelectorAll('.case-card .tag-list').forEach((list) => {
    [...list.children].forEach((tag, index) => tag.style.setProperty('--tag-index', index));
  });

  const impactNumbers = [...document.querySelectorAll('[data-impact-count]')];
  const impactLabel = (element, value) => `${element.dataset.prefix || ''}${value}${element.dataset.suffix || ''}`;
  const animateImpactNumber = (element) => {
    const target = Number(element.dataset.impactCount);
    if (!Number.isFinite(target)) return;
    const finalLabel = impactLabel(element, target);
    element.setAttribute('aria-label', finalLabel);

    if (hasReducedMotion()) {
      element.textContent = finalLabel;
      return;
    }

    const duration = 1400;
    const startedAt = performance.now();
    element.classList.add('is-counting');

    const update = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - ((1 - progress) ** 3);
      element.textContent = impactLabel(element, Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(update);
      else element.textContent = finalLabel;
    };

    requestAnimationFrame(update);
  };

  if ('IntersectionObserver' in window) {
    const impactObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateImpactNumber(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    impactNumbers.forEach((element) => impactObserver.observe(element));
  } else {
    impactNumbers.forEach(animateImpactNumber);
  }

  const runModeShift = (link) => {
    const destination = link.dataset.destination;
    const label = destination === 'product' ? 'Switching to Product Mode' : 'Switching to Software Testing';
    const direction = destination === 'product' ? 1 : -1;
    const stage = document.createElement('div');
    stage.className = 'shift-stage';
    stage.style.setProperty('--shift-direction', direction);
    stage.setAttribute('aria-hidden', 'true');

    const blockColors = ['#1a1a1a', '#7f1d1d', '#b91c1c', '#f59e0b', '#eab308', '#ffd600', '#00c853'];
    for (let index = 0; index < 12; index += 1) {
      const block = document.createElement('div');
      block.className = 'shift-block';
      block.style.setProperty('--block-index', index);
      block.style.setProperty('--block-color', blockColors[index % blockColors.length]);
      stage.append(block);
    }

    const shiftLabel = document.createElement('div');
    shiftLabel.className = 'shift-label';
    shiftLabel.innerHTML = `<span>Portfolio mode</span>${label}<small>Same experience. Different perspective.</small>`;
    stage.append(shiftLabel);
    body.append(stage);
    requestAnimationFrame(() => stage.classList.add('is-active'));
    window.setTimeout(() => window.location.assign(link.href), 1360);
  };

  document.querySelectorAll('[data-mode-switch]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || hasReducedMotion()) return;
      event.preventDefault();
      runModeShift(link);
    });
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('[data-submit-label]');
    const fields = [...form.querySelectorAll('input, textarea')];
    let valid = true;

    fields.forEach((field) => {
      const invalid = !field.checkValidity();
      field.classList.toggle('is-invalid', invalid);
      field.setAttribute('aria-invalid', String(invalid));
      valid = valid && !invalid;
    });

    if (!valid) {
      status.textContent = 'Check the highlighted fields and try again.';
      status.className = 'form-status is-error';
      fields.find((field) => field.classList.contains('is-invalid'))?.focus();
      return;
    }

    if (form.action.includes('REPLACE_ME')) {
      status.innerHTML = 'The form endpoint still needs to be connected. Email <a href="mailto:hanzla.sajid@gmx.de">hanzla.sajid@gmx.de</a> instead.';
      status.className = 'form-status is-error';
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = '';
    status.className = 'form-status';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Form submission failed');
      form.reset();
      status.textContent = 'Message sent. I will reply by email.';
      status.className = 'form-status is-success';
    } catch {
      status.innerHTML = 'The message did not send. Try again or email <a href="mailto:hanzla.sajid@gmx.de">hanzla.sajid@gmx.de</a>.';
      status.className = 'form-status is-error';
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send message';
    }
  });
})();
