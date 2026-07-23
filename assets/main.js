// joedong.ai — minimal enhancement: theme toggle, scroll reveal, colophon year.
// The page is fully functional and readable without this file (a head-script failsafe
// reveals all content after ~2s if this script never loads or throws).
(function () {
  'use strict';
  var root = document.documentElement;

  function revealAll() {
    var els = document.querySelectorAll('.reveal');
    for (var i = 0; i < els.length; i++) { els[i].classList.add('in'); }
  }

  // --- Theme toggle (persisted; no-flash init already ran in <head>) ---
  var btn = document.getElementById('theme-toggle');
  function syncBtn() {
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  }
  syncBtn();
  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncBtn();
    });
  }

  // --- Colophon year ---
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  // --- Arc figure: refine the to-scale axis so "drawn to scale" is true to the day.
  // Static CSS fallback values are correct as of deploy; this recomputes boundaries
  // against today so the indigo segment grows ~1px every few weeks.
  var ax = document.querySelector('.axis');
  if (ax) {
    var now = new Date();
    var ye = (now - new Date(2010, 0, 1)) / (365.25 * 24 * 3600 * 1000);
    if (ye > 15.6) { // sanity: never let a bad clock shrink the axis below deploy-time truth
      ax.style.setProperty('--x14', (4 / ye * 100).toFixed(2) + '%');
      ax.style.setProperty('--x19', (9 / ye * 100).toFixed(2) + '%');
      ax.style.setProperty('--x25', (15 / ye * 100).toFixed(2) + '%');
      ax.title = '2010 → ' + now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + ', drawn to scale';
    }
  }

  // --- Scroll reveal (skipped under reduced-motion or when IntersectionObserver is absent) ---
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    revealAll();
    return; // head-script failsafe timer fires harmlessly (~2s) and re-adds .in (idempotent)
  }
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) { entries[i].target.classList.add('in'); io.unobserve(entries[i].target); }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  var els = document.querySelectorAll('.reveal');
  for (var i = 0; i < els.length; i++) { io.observe(els[i]); }

  // Reached the end successfully: cancel the failsafe so scroll-reveal behaves normally.
  try { clearTimeout(window.__revealTimer); } catch (e) {}
})();
