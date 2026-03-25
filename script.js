/* ============================================
   Nippon Matcha — Landing Page Scripts
   ============================================ */

(function () {
  'use strict';

  // ---- Scroll Handler Throttling (rAF-based) ----

  const scrollCallbacks = [];
  let scrollTicking = false;

  function onScroll() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(function () {
        for (let i = 0; i < scrollCallbacks.length; i++) {
          scrollCallbacks[i]();
        }
        scrollTicking = false;
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Intersection Observer: Entrance Animations ----

  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => {
    animObserver.observe(el);
  });

  // ---- Scene 2: Scroll-Linked Tin Rotation ----

  const scene2 = document.querySelector('.scene-2');
  const tinRotate = document.querySelector('.tin-rotate');
  let currentRotation = 0;
  let targetRotation = 0;
  let rotationActive = false;
  let rotationRAF = 0;

  if (scene2 && tinRotate) {
    scrollCallbacks.push(function () {
      const rect = scene2.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
      targetRotation = progress * 360;
    });

    function animateRotation() {
      currentRotation += (targetRotation - currentRotation) * 0.08;
      const radians = (currentRotation * Math.PI) / 180;
      const scaleX = Math.max(Math.abs(Math.cos(radians)), 0.3);
      tinRotate.style.transform =
        'rotateY(' + currentRotation + 'deg) scaleX(' + scaleX + ')';
      if (rotationActive) {
        rotationRAF = requestAnimationFrame(animateRotation);
      }
    }

    const rotationObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!rotationActive) {
              rotationActive = true;
              rotationRAF = requestAnimationFrame(animateRotation);
            }
          } else {
            rotationActive = false;
            cancelAnimationFrame(rotationRAF);
          }
        });
      },
      { threshold: 0, rootMargin: '100px 0px' }
    );
    rotationObserver.observe(scene2);
  }

  // ---- Below-fold Video Prefetching ----
  // Start loading video data when user is ~1 viewport away

  const belowFoldVideos = document.querySelectorAll('video[preload="none"]');
  if (belowFoldVideos.length > 0) {
    const prefetchObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.preload = 'auto';
            prefetchObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100% 0px' }
    );
    belowFoldVideos.forEach(function (v) { prefetchObserver.observe(v); });
  }

  // ---- Scene 3: Ritual Video — Play Once on Visible ----

  const ritualVideo = document.querySelector('.ritual-video');
  if (ritualVideo) {
    const ritualObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ritualVideo.play().catch(function () {});
          } else {
            ritualVideo.pause();
          }
        });
      },
      { threshold: 0.15 }
    );
    ritualObserver.observe(ritualVideo);
  }

  // ---- Scene 7: Ready Bowl Video — Play/Pause on Visibility ----

  const readyVideo = document.querySelector('.ready-video');
  if (readyVideo) {
    const readyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            readyVideo.play().catch(function () {});
          } else {
            readyVideo.pause();
          }
        });
      },
      { threshold: 0.15 }
    );
    readyObserver.observe(readyVideo);
  }

  // ---- Scene 7: CTA Pulse after entrance ----

  const scene7Cta = document.querySelector('.scene-7__cta');
  if (scene7Cta) {
    const pulseObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(function () {
              scene7Cta.classList.add('pulse');
            }, 1000);
            pulseObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    pulseObserver.observe(scene7Cta);
  }

  // ---- Floating Header ----

  const scene1 = document.querySelector('.scene-1');
  const header = document.querySelector('.floating-header');

  if (scene1 && header) {
    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            header.classList.remove('visible');
            header.setAttribute('aria-hidden', 'true');
          } else if (!entry.isIntersecting) {
            header.classList.add('visible');
            header.setAttribute('aria-hidden', 'false');
          }
        });
      },
      { threshold: [0, 0.5] }
    );
    headerObserver.observe(scene1);
  }

  // ---- Mobile Sticky CTA Bar ----

  const scene3 = document.querySelector('.scene-3');
  const mobileCta = document.querySelector('.mobile-cta-bar');

  if (scene3 && mobileCta) {
    const mobileCtaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show bar when scene 3 exits the viewport (scrolled past)
          if (!entry.isIntersecting) {
            const rect = scene3.getBoundingClientRect();
            if (rect.bottom < 0) {
              mobileCta.classList.add('visible');
            }
          }
        });
      },
      { threshold: 0 }
    );
    mobileCtaObserver.observe(scene3);

    // Also check scroll to handle scroll back up (throttled via rAF)
    scrollCallbacks.push(function () {
      const rect = scene3.getBoundingClientRect();
      if (rect.bottom < 0) {
        mobileCta.classList.add('visible');
        mobileCta.setAttribute('aria-hidden', 'false');
      } else {
        mobileCta.classList.remove('visible');
        mobileCta.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ---- Parallax: Scene 4 Image Placeholders ----

  const parallaxImages = document.querySelectorAll('.parallax-image');

  if (parallaxImages.length > 0) {
    scrollCallbacks.push(function () {
      for (let i = 0; i < parallaxImages.length; i++) {
        var img = parallaxImages[i];
        var rect = img.getBoundingClientRect();
        var viewH = window.innerHeight;
        if (rect.top < viewH && rect.bottom > 0) {
          var scrollDelta = rect.top - viewH / 2;
          img.style.transform = 'translateY(' + (scrollDelta * 0.4) + 'px)';
        }
      }
    });
  }

  // ---- Sakura Particle Generator ----

  const sakuraContainer = document.querySelector('.sakura-container');

  if (sakuraContainer) {
    const isMobile = window.innerWidth < 768;
    const petalCount = isMobile ? 5 : 10;
    const colors = ['#F7D1D5', '#EDAFCA', '#E8A0BF', '#D4A0A0'];

    const petalSVG =
      '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M10 0 C12 4, 16 8, 10 12 C4 8, 8 4, 10 0Z" fill="currentColor" opacity="0.6"/>' +
        '<path d="M10 0 C14 2, 18 10, 10 12 C2 10, 6 2, 10 0Z" fill="currentColor" opacity="0.4"/>' +
      '</svg>';

    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('div');
      petal.className = 'sakura-petal';
      petal.innerHTML = petalSVG;

      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 10 + Math.random() * 10;
      const leftPos = Math.random() * 100;
      const opacity = 0.12 + Math.random() * 0.16;
      const fallDuration = 15 + Math.random() * 13;
      const swayDuration = 4 + Math.random() * 4;
      const spinDuration = 8 + Math.random() * 7;
      const spinDir = Math.random() > 0.5 ? '360deg' : '-360deg';
      const delay = Math.random() * fallDuration;

      petal.style.cssText =
        'left:' + leftPos + '%;' +
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'color:' + color + ';' +
        'opacity:' + opacity + ';' +
        '--fall-duration:' + fallDuration + 's;' +
        '--sway-duration:' + swayDuration + 's;' +
        '--spin-duration:' + spinDuration + 's;' +
        '--spin-dir:' + spinDir + ';' +
        '--fall-delay:-' + delay + 's;';

      sakuraContainer.appendChild(petal);
    }
  }
})();
