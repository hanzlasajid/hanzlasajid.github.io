(() => {
  const body = document.body;
  const drawer = document.querySelector('.site-nav');
  const drawerOverlay = document.querySelector('[data-drawer-overlay]');
  const drawerOpen = document.querySelector('[data-open-drawer]');
  const drawerClose = document.querySelector('[data-close-drawer]');
  const modal = document.querySelector('[data-contact-modal]');
  const form = document.querySelector('[data-contact-form]');
  const backToTop = document.querySelector('[data-back-to-top]');
  let modalOpener = null;

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

  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('is-visible', window.scrollY >= 400);
  }, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
