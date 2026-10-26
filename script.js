// Pratik Santhosh Portfolio - Smooth Scroll & Interactive Animations
document.addEventListener('DOMContentLoaded', () => {
  const headerWrapper = document.getElementById('headerWrapper');
  const scrollProgress = document.getElementById('scrollProgress');
  const nav = document.querySelector('.nav');
  const navIndicator = document.querySelector('.nav-indicator');
  const navLinks = nav ? Array.from(nav.querySelectorAll('a')) : [];
  const toggle = document.querySelector('.menu-toggle');
  const yearEl = document.querySelector('#year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Mobile Navigation Toggle ---
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // --- Scroll Progress Bar & Header Shadow ---
  function onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
    }

    if (headerWrapper) {
      if (scrollTop > 20) {
        headerWrapper.classList.add('is-scrolled');
      } else {
        headerWrapper.classList.remove('is-scrolled');
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Nav Pill Indicator Tracking ---
  let activeNavLink = null;

  function setIndicatorPosition(targetLink) {
    if (!navIndicator || !nav || window.innerWidth <= 640) {
      if (navIndicator) navIndicator.classList.remove('visible');
      return;
    }

    if (!targetLink) {
      navIndicator.classList.remove('visible');
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = targetLink.getBoundingClientRect();

    const left = linkRect.left - navRect.left;
    const width = linkRect.width;

    navIndicator.style.transform = `translateX(${left}px)`;
    navIndicator.style.width = `${width}px`;
    navIndicator.classList.add('visible');
  }

  function setActiveLink(link) {
    navLinks.forEach(l => l.classList.remove('active'));
    if (link) {
      link.classList.add('active');
      activeNavLink = link;
      setIndicatorPosition(link);
    } else {
      activeNavLink = null;
      setIndicatorPosition(null);
    }
  }

  // Hover preview on navigation links
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      setIndicatorPosition(link);
    });
    link.addEventListener('mouseleave', () => {
      setIndicatorPosition(activeNavLink);
    });
  });

  // Re-adjust indicator on window resize
  window.addEventListener('resize', () => {
    setIndicatorPosition(activeNavLink);
  });

  // --- Custom Smooth Scroll with Eased Physics ---
  let activeScrollAnim = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(targetY, onComplete) {
    if (activeScrollAnim) {
      cancelAnimationFrame(activeScrollAnim);
      activeScrollAnim = null;
    }

    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;

    if (Math.abs(distance) < 4) {
      if (onComplete) onComplete();
      return;
    }

    // Dynamic duration based on distance: snappy for close sections, cinematic for far
    const duration = Math.min(Math.max(520, Math.abs(distance) * 0.42), 920);
    let startTime = null;

    // Temporarily disable CSS scroll-behavior to prevent browser stutter
    const prevScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, Math.round(startY + distance * ease));

      if (progress < 1) {
        activeScrollAnim = requestAnimationFrame(step);
      } else {
        document.documentElement.style.scrollBehavior = prevScrollBehavior;
        activeScrollAnim = null;
        if (onComplete) onComplete();
      }
    }

    activeScrollAnim = requestAnimationFrame(step);

    // Cancel animation if user manually wheels or touches
    const cancelOnUserAction = () => {
      if (activeScrollAnim) {
        cancelAnimationFrame(activeScrollAnim);
        activeScrollAnim = null;
        document.documentElement.style.scrollBehavior = prevScrollBehavior;
      }
      window.removeEventListener('wheel', cancelOnUserAction);
      window.removeEventListener('touchstart', cancelOnUserAction);
    };

    window.addEventListener('wheel', cancelOnUserAction, { passive: true, once: true });
    window.addEventListener('touchstart', cancelOnUserAction, { passive: true, once: true });
  }

  // --- Section Arrival Pulse / Highlight Effect ---
  function triggerSectionArrival(section) {
    if (!section) return;
    section.classList.remove('section-active-pulse');
    // Force DOM reflow to restart animation reliably
    void section.offsetWidth;
    section.classList.add('section-active-pulse');

    setTimeout(() => {
      section.classList.remove('section-active-pulse');
    }, 1600);
  }

  // --- Click Ripple Micro-interaction ---
  function createRipple(e) {
    const target = e.currentTarget;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';

    const size = Math.max(rect.width, rect.height) * 1.8;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    target.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 650);
  }

  // Attach ripple effect to all clickable buttons and links
  const clickableElements = document.querySelectorAll(
    '.button, .nav a, .hero-socials a, .contact-links a, .scroll-explore-link, .brand, .footer a'
  );
  clickableElements.forEach(el => {
    el.addEventListener('click', createRipple);
  });

  // --- Handle Anchor Navigation Clicks with Custom Animation ---
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();

        // Close mobile nav if open
        if (nav && nav.classList.contains('open')) {
          nav.classList.remove('open');
          toggle?.setAttribute('aria-expanded', 'false');
        }

        // Calculate offset (account for sticky header height)
        const headerOffset = headerWrapper ? headerWrapper.offsetHeight + 12 : 88;
        const targetPosition = Math.max(
          0,
          targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset
        );

        // Highlight matching nav link immediately for fast visual feedback
        const matchingNavLink = navLinks.find(nl => nl.getAttribute('href') === href);
        if (matchingNavLink) {
          setActiveLink(matchingNavLink);
        }

        // Trigger smooth eased scroll
        smoothScrollTo(targetPosition, () => {
          // Trigger the arrival pulse when landed
          triggerSectionArrival(targetElement);
          if (history.pushState) {
            history.pushState(null, '', href);
          } else {
            location.hash = href;
          }
        });
      }
    });
  });

  // --- Scrollspy via IntersectionObserver ---
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -55% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver(entries => {
    // Only update if not currently in an active animated programmatic scroll
    if (activeScrollAnim) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const correspondingLink = navLinks.find(
          l => l.getAttribute('href') === `#${id}`
        );
        if (correspondingLink) {
          setActiveLink(correspondingLink);
        } else if (id === 'home') {
          setActiveLink(null);
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Initialize indicator based on current hash or initial position
  if (window.location.hash) {
    const initialLink = navLinks.find(l => l.getAttribute('href') === window.location.hash);
    if (initialLink) {
      setActiveLink(initialLink);
    }
  }
});
