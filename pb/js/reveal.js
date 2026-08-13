/* Scroll reveal and smooth motion.
   Replaces WOW.js so every section uses one easing curve.
   Safety first: nothing on this page may stay invisible. The observer is the
   nice path, a throttled scroll check is the backstop, and a timer sweeps up
   anything the other two missed. */
(function () {
    "use strict";

    var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) { return; }

    function showAll() { items.forEach(function (el) { el.classList.add('is-in'); }); }

    // No motion for people who asked their system not to animate.
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) { showAll(); return; }

    items.forEach(function (el) {
        var d = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        if (d) { el.style.transitionDelay = d + 'ms'; }
    });

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('is-in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.01, rootMargin: '0px 0px -5% 0px' });

    items.forEach(function (el) { io.observe(el); });

    // Backstop: anything already scrolled into view gets revealed even if the
    // observer callback was skipped during a fast scroll.
    var ticking = false;
    function sweep() {
        ticking = false;
        var limit = window.innerHeight * 0.96;
        items.forEach(function (el) {
            if (el.classList.contains('is-in')) { return; }
            if (el.getBoundingClientRect().top < limit) {
                el.classList.add('is-in');
                io.unobserve(el);
            }
        });
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(sweep); }
    }, { passive: true });
    window.addEventListener('resize', sweep, { passive: true });
    window.addEventListener('load', sweep);
    setTimeout(sweep, 1200);

    // Client wall filter.
    var filters = [].slice.call(document.querySelectorAll('.pb-filter'));
    var wallItems = [].slice.call(document.querySelectorAll('.pb-logo-item'));
    if (filters.length && wallItems.length) {
        filters.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var want = btn.getAttribute('data-filter');
                filters.forEach(function (b) { b.classList.remove('is-on'); });
                btn.classList.add('is-on');
                wallItems.forEach(function (li, i) {
                    var show = (want === 'all' || li.getAttribute('data-sector') === want);
                    li.classList.toggle('is-out', !show);
                    li.classList.remove('is-in-view');
                    if (show) {
                        // restagger so the surviving tiles animate back in
                        li.style.animationDelay = Math.min(i, 12) * 22 + 'ms';
                        void li.offsetWidth;
                        li.classList.add('is-in-view');
                    }
                });
            });
        });
    }

    // Back to top button: fade in past the first screen.
    var top = document.querySelector('.go-top');
    if (top) {
        var onScroll = function () {
            top.classList.toggle('is-on', window.pageYOffset > window.innerHeight * 0.7);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
}());
