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
  const motionToggle = document.querySelector('[data-motion-toggle]');
  const motionState = document.querySelector('[data-motion-state]');
  let modalOpener = null;
  let reducedByChoice = false;

  try {
    reducedByChoice = window.localStorage.getItem('portfolio-motion') === 'reduced';
  } catch {
    reducedByChoice = false;
  }

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasReducedMotion = () => reducedByChoice || prefersReducedMotion();

  const applyMotionPreference = () => {
    document.documentElement.toggleAttribute('data-motion', reducedByChoice);
    if (reducedByChoice) document.documentElement.dataset.motion = 'reduced';
    motionToggle?.setAttribute('aria-pressed', String(reducedByChoice));
    if (motionState) motionState.textContent = reducedByChoice ? 'Reduced' : 'Full';
  };

  applyMotionPreference();

  const visibleFocusable = (root) => [...root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.offsetParent !== null);

  const setBodyLock = () => {
    const locked = drawer?.classList.contains('is-open') || modal?.classList.contains('is-open');
    body.classList.toggle('body-locked', Boolean(locked));
  };

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawerOverlay.classList.add('is-open');
    drawerOpen.setAttribute('aria-expanded', 'true');
    setBodyLock();
    drawerClose.focus();
  };

  const closeDrawer = (restoreFocus = true) => {
    drawer.classList.remove('is-open');
    drawerOverlay.classList.remove('is-open');
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

  motionToggle?.addEventListener('click', () => {
    reducedByChoice = !reducedByChoice;
    try {
      window.localStorage.setItem('portfolio-motion', reducedByChoice ? 'reduced' : 'full');
    } catch {
      // Motion preference still applies for the current page.
    }
    applyMotionPreference();
  });

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

  const finePointer = window.matchMedia('(pointer: fine)');
  if (finePointer.matches) {
    document.querySelectorAll('.feature-card, .case-card, .credential-grid article').forEach((card) => {
      card.classList.add('tilt-reactive');
      card.addEventListener('pointermove', (event) => {
        if (hasReducedMotion()) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--tilt-x', `${x * 7}deg`);
        card.style.setProperty('--tilt-y', `${y * -7}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });

    const cursor = document.createElement('span');
    cursor.className = 'cursor-echo';
    cursor.setAttribute('aria-hidden', 'true');
    body.append(cursor);
    let lastGhost = 0;

    window.addEventListener('pointermove', (event) => {
      if (hasReducedMotion()) return;
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.classList.toggle('is-interactive', Boolean(event.target.closest('a, button, input, textarea')));

      const now = performance.now();
      if (now - lastGhost < 65) return;
      lastGhost = now;
      const ghost = document.createElement('span');
      ghost.className = 'cursor-ghost';
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
      ghost.style.background = getComputedStyle(cursor).backgroundColor;
      body.append(ghost);
      ghost.addEventListener('animationend', () => ghost.remove(), { once: true });
    }, { passive: true });
  }

  const runModeShift = (link) => {
    const destination = link.dataset.destination;
    const label = destination === 'product' ? 'Switching to Product Mode' : 'Switching to Software Testing';
    const direction = destination === 'product' ? 1 : -1;
    const stage = document.createElement('div');
    stage.className = 'shift-stage';
    stage.style.setProperty('--shift-direction', direction);
    stage.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < 4; index += 1) {
      const echo = document.createElement('div');
      echo.className = 'shift-echo';
      echo.style.setProperty('--echo-index', index);
      const pageClone = document.querySelector('.main').cloneNode(true);
      pageClone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
      pageClone.setAttribute('inert', '');
      pageClone.style.top = `${-window.scrollY}px`;
      echo.append(pageClone);
      stage.append(echo);
    }

    const lines = document.createElement('div');
    lines.className = 'shift-lines';
    const flash = document.createElement('div');
    flash.className = 'shift-flash';
    const shiftLabel = document.createElement('div');
    shiftLabel.className = 'shift-label';
    shiftLabel.innerHTML = `<span>Portfolio mode</span>${label}<small>Same experience. Different perspective.</small>`;
    stage.append(lines, flash, shiftLabel);
    body.append(stage);
    requestAnimationFrame(() => stage.classList.add('is-active'));

    try {
      window.sessionStorage.setItem('mode-shift-arrival', '1');
    } catch {
      // The destination still loads if browser storage is unavailable.
    }
    window.setTimeout(() => window.location.assign(link.href), 1360);
  };

  document.querySelectorAll('[data-mode-switch]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || hasReducedMotion()) return;
      event.preventDefault();
      runModeShift(link);
    });
  });

  try {
    if (window.sessionStorage.getItem('mode-shift-arrival') === '1') {
      window.sessionStorage.removeItem('mode-shift-arrival');
      body.classList.add('shift-arrival');
      window.setTimeout(() => body.classList.remove('shift-arrival'), 920);
    }
  } catch {
    // Arrival accent is optional.
  }

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
