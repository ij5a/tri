(() => {
  const nav = document.getElementById('nav');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelectorAll('.nav__links a');
  const themeBtn = document.querySelector('.nav__theme');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const root = document.documentElement;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const THEME_COLORS = { light: '#fbf7f3', dark: '#14100f' };

  // Throttled scroll → toggle .nav--scrolled. rAF-coalesced.
  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 20);
      scrollTicking = false;
    });
  };
  nav.classList.toggle('nav--scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });

  // iOS-safe scroll lock: pin <body> at the current scroll offset while the
  // mobile drawer is open. Plain overflow:hidden lets iOS Safari momentum-scroll
  // through the underlying page; this pattern stops it.
  let lockedScrollY = 0;
  const lockBodyScroll = () => {
    lockedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };
  const unlockBodyScroll = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, lockedScrollY);
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!nav.classList.contains('nav--open')) return;
    nav.classList.remove('nav--open');
    toggle?.setAttribute('aria-expanded', 'false');
    unlockBodyScroll();
    if (returnFocus) toggle?.focus();
  };

  toggle?.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('nav--open');
    if (willOpen) {
      lockBodyScroll();
      nav.classList.add('nav--open');
      toggle.setAttribute('aria-expanded', 'true');
      if (links[0]) requestAnimationFrame(() => links[0].focus());
    } else {
      closeMenu();
    }
  });

  links.forEach((a) => {
    a.addEventListener('click', () => closeMenu());
  });

  document.addEventListener('keydown', (err) => {
    if (err.key === 'Escape') closeMenu({ returnFocus: true });
  });

  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem('theme', theme); } catch (err) { /* ignore */ }
    }
    if (themeBtn) {
      themeBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
    if (themeMeta && THEME_COLORS[theme]) {
      themeMeta.setAttribute('content', THEME_COLORS[theme]);
    }
  };

  setTheme(root.dataset.theme || 'light', false);

  themeBtn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  mq?.addEventListener?.('change', (event) => {
    try {
      if (localStorage.getItem('theme')) return;
    } catch (err) { /* ignore */ }
    setTheme(event.matches ? 'dark' : 'light', false);
  });

  // Reveal-on-scroll. Honour prefers-reduced-motion by revealing immediately.
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  }

  // Assemble obfuscated mailto links from data attributes (light spam-bot mitigation).
  document.querySelectorAll('a[data-u][data-d]').forEach((el) => {
    const addr = `${el.dataset.u}@${el.dataset.d}`;
    el.href = `mailto:${addr}`;
    el.setAttribute('title', addr);
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
