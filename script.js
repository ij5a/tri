(() => {
  const nav = document.getElementById('nav');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelectorAll('.nav__links a');
  const themeBtn = document.querySelector('.nav__theme');
  const root = document.documentElement;

  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add('nav--scrolled');
    else nav.classList.remove('nav--scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.forEach((a) => {
    a.addEventListener('click', () => {
      if (nav.classList.contains('nav--open')) {
        nav.classList.remove('nav--open');
        toggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });

  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
    }
    if (themeBtn) {
      themeBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  };

  setTheme(root.dataset.theme || 'light', false);

  themeBtn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  mq?.addEventListener?.('change', (e) => {
    try {
      if (localStorage.getItem('theme')) return;
    } catch (err) { /* ignore */ }
    setTheme(e.matches ? 'dark' : 'light', false);
  });

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
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
