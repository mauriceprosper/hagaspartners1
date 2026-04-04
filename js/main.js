/* ============================================================
   HAGAS & PARTNERS — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Year ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     NAVBAR
     ============================================================ */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  // Scroll class toggle
  const handleNavScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ============================================================
     ACTIVE NAV LINK (scroll spy)
     ============================================================ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const setActiveLink = () => {
    const scrollY = window.scrollY + 100;
    let currentId = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) currentId = sec.id;
    });
    [...navLinks, ...mobileLinks].forEach(link => {
      link.classList.remove('active-nav');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active-nav');
      }
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ============================================================
     GALLERY FILTER
     ============================================================ */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const INITIAL_VISIBLE = 12;
  let currentFilter = 'all';
  let showAll = false;

  const applyFilter = () => {
    let count = 0;
    galleryItems.forEach(item => {
      const match = currentFilter === 'all' || item.dataset.category === currentFilter;
      if (match) {
        count++;
        if (!showAll && count > INITIAL_VISIBLE) {
          item.classList.add('hidden');
        } else {
          item.classList.remove('hidden');
        }
      } else {
        item.classList.add('hidden');
      }
    });

    const loadBtn = document.getElementById('loadMoreBtn');
    const totalVisible = [...galleryItems].filter(i => !i.classList.contains('hidden')).length;
    const totalMatch   = [...galleryItems].filter(i =>
      currentFilter === 'all' || i.dataset.category === currentFilter
    ).length;
    if (loadBtn) {
      loadBtn.style.display = totalMatch > INITIAL_VISIBLE && !showAll ? 'inline-flex' : 'none';
    }
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      showAll = false;
      applyFilter();
    });
  });

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      showAll = true;
      applyFilter();
    });
  }

  applyFilter(); // initial render

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  const lightbox   = document.getElementById('lightbox');
  const lbBackdrop = document.getElementById('lbBackdrop');
  const lbImg      = document.getElementById('lbImg');
  const lbCaption  = document.getElementById('lbCaption');
  const lbClose    = document.getElementById('lbClose');
  const lbPrev     = document.getElementById('lbPrev');
  const lbNext     = document.getElementById('lbNext');

  let currentLbItems = [];
  let currentLbIndex = 0;

  const openLightbox = (items, index) => {
    currentLbItems = items;
    currentLbIndex = index;
    showLbImage();
    lightbox.classList.add('active');
    lbBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lbBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  };

  const showLbImage = () => {
    const item = currentLbItems[currentLbIndex];
    lbImg.style.opacity = '0';
    lbImg.src = item.dataset.src || item.querySelector('img').src;
    lbImg.alt = item.querySelector('img').alt;
    lbCaption.textContent = item.querySelector('img').alt;
    lbImg.onload = () => { lbImg.style.opacity = '1'; };
    lbImg.style.transition = 'opacity 0.25s ease';
  };

  const prevImage = () => {
    currentLbIndex = (currentLbIndex - 1 + currentLbItems.length) % currentLbItems.length;
    showLbImage();
  };
  const nextImage = () => {
    currentLbIndex = (currentLbIndex + 1) % currentLbItems.length;
    showLbImage();
  };

  // Attach click to gallery items
  const attachGalleryClicks = () => {
    document.querySelectorAll('.gallery-item:not(.hidden)').forEach(item => {
      item.removeEventListener('click', item._lbHandler);
    });

    document.querySelectorAll('.gallery-item').forEach(item => {
      item._lbHandler = () => {
        const visibleItems = [...document.querySelectorAll('.gallery-item:not(.hidden)')];
        const idx = visibleItems.indexOf(item);
        if (idx !== -1) openLightbox(visibleItems, idx);
      };
      item.addEventListener('click', item._lbHandler);
    });
  };
  attachGalleryClicks();

  // Re-attach after filter
  filterBtns.forEach(btn => btn.addEventListener('click', () => setTimeout(attachGalleryClicks, 50)));
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => setTimeout(attachGalleryClicks, 50));

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const name    = contactForm.name.value.trim();
      const email   = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      // Basic validation
      if (!name || !email || !message) {
        showFeedback('Please fill in all required fields.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFeedback('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate submission (replace with your actual endpoint)
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      await new Promise(r => setTimeout(r, 1200));
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      showFeedback('Thank you! Your message has been received. We\'ll be in touch soon.', 'success');
      contactForm.reset();
    });
  }

  function showFeedback(msg, type) {
    formFeedback.textContent = msg;
    formFeedback.className = `form-feedback ${type}`;
    setTimeout(() => {
      formFeedback.className = 'form-feedback';
      formFeedback.textContent = '';
    }, 6000);
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  // Add reveal classes to key elements dynamically
  const addReveals = () => {
    const selectors = [
      '.about-image-wrap', '.about-content',
      '.vm-card',
      '.service-card',
      '.gallery-item',
      '.client-logo-wrap',
      '.contact-info', '.contact-form',
      '.footer-brand', '.footer-col'
    ];
    selectors.forEach((sel, si) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        if (!el.classList.contains('reveal')) {
          el.classList.add('reveal');
          // Stagger within each group
          const delay = (i % 4) * 0.1;
          el.style.transitionDelay = `${delay}s`;
          revealObserver.observe(el);
        }
      });
    });
  };
  addReveals();

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  const backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     SMOOTH SCROLL for anchor links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});