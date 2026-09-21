/* ============================================================
   TILT v2.3.5 — Optimized (mobile-friendly, adaptive)
   ============================================================ */
(function () {
    'use strict';

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* ---------- Device detection ---------- */
    const UA = navigator.userAgent;
    const isMobile     = /iPhone|iPad|iPod|Android/i.test(UA);
    const isLowEnd     = (navigator.hardwareConcurrency || 8) <= 4;
    const isTouch      = matchMedia('(hover: none)').matches;

    // ✅ إيقاف تام على الأجهزة الضعيفة
    if (isMobile && isLowEnd) {
        console.log('[Tilt] Disabled on low-end mobile');
        return;
    }

    /* ---------- Config (adaptive) ---------- */
    const CFG = {
        maxTilt:      isMobile ? 6 : 12,
        maxMagnet:    isMobile ? 3 : 6,
        maxScale:     isMobile ? 1.02 : 1.035,
        ease:         0.14,
        easeEdge:     0.18,
    };

    const frames = [];

    function attach(frame) {
        if (frame.dataset.tiltInit) return;
        frame.dataset.tiltInit = '1';

        const s = {
            el:        frame,
            item:      frame.closest('.gallery-item, .special-item'),
            tRX: 0, tRY: 0,
            cRX: 0, cRY: 0,
            tTX: 0, tTY: 0,
            cTX: 0, cTY: 0,
            tMX: 50, tMY: 50,
            cMX: 50, cMY: 50,
            tS: 1, cS: 1,
            active: false,
            rafId: null,
        };
        frames.push(s);

        if (isTouch) {
            frame.addEventListener('touchstart',  (e) => onTouchStart(s, e), { passive: true });
            frame.addEventListener('touchmove',   (e) => onTouchMove(s, e),  { passive: true });
            frame.addEventListener('touchend',    () => onEnd(s),            { passive: true });
            frame.addEventListener('touchcancel', () => onEnd(s),            { passive: true });
        } else {
            frame.addEventListener('mouseenter', () => onStart(s));
            frame.addEventListener('mousemove',  (e) => onMove(s, e));
            frame.addEventListener('mouseleave', () => onEnd(s));
        }
    }

    function onStart(s) {
        s.active = true;
        s.el.classList.add('is-active');
        s.tS = CFG.maxScale;
        kick(s);
    }

    function onMove(s, e) {
        const r  = s.el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top)  / r.height;
        const cx = px - 0.5;
        const cy = py - 0.5;

        s.tRY =  cx * 2 * CFG.maxTilt;
        s.tRX = -cy * 2 * CFG.maxTilt;
        s.tTX =  cx * 2 * CFG.maxMagnet;
        s.tTY =  cy * 2 * CFG.maxMagnet;
        s.tMX = px * 100;
        s.tMY = py * 100;
        kick(s);
    }

    function onTouchStart(s, e) {
        if (!e.touches.length) return;
        s.active = true;
        s.el.classList.add('is-active');
        s.tS = CFG.maxScale;
        onTouchMove(s, e);
    }

    function onTouchMove(s, e) {
        if (!e.touches.length) return;
        const t  = e.touches[0];
        const r  = s.el.getBoundingClientRect();
        const px = clamp((t.clientX - r.left) / r.width,  -0.2, 1.2);
        const py = clamp((t.clientY - r.top)  / r.height, -0.2, 1.2);
        const cx = px - 0.5;
        const cy = py - 0.5;

        s.tRY =  cx * 2 * CFG.maxTilt;
        s.tRX = -cy * 2 * CFG.maxTilt;
        s.tTX =  cx * 2 * CFG.maxMagnet;
        s.tTY =  cy * 2 * CFG.maxMagnet;
        s.tMX = px * 100;
        s.tMY = py * 100;
        kick(s);
    }

    function onEnd(s) {
        s.active = false;
        s.el.classList.remove('is-active');
        s.tRX = 0; s.tRY = 0;
        s.tTX = 0; s.tTY = 0;
        s.tMX = 50; s.tMY = 50;
        s.tS  = 1;
        kick(s);
    }

    function kick(s) { if (!s.rafId) s.rafId = requestAnimationFrame(() => loop(s)); }

    function loop(s) {
        s.rafId = null;

        s.cRX = lerp(s.cRX, s.tRX, CFG.ease);
        s.cRY = lerp(s.cRY, s.tRY, CFG.ease);
        s.cTX = lerp(s.cTX, s.tTX, CFG.ease);
        s.cTY = lerp(s.cTY, s.tTY, CFG.ease);
        s.cMX = lerp(s.cMX, s.tMX, CFG.easeEdge);
        s.cMY = lerp(s.cMY, s.tMY, CFG.easeEdge);
        s.cS  = lerp(s.cS,  s.tS,  CFG.ease);

        s.el.style.setProperty('--rx', s.cRX.toFixed(3) + 'deg');
        s.el.style.setProperty('--ry', s.cRY.toFixed(3) + 'deg');
        s.el.style.setProperty('--tx', s.cTX.toFixed(2) + 'px');
        s.el.style.setProperty('--ty', s.cTY.toFixed(2) + 'px');
        s.el.style.setProperty('--mx', s.cMX.toFixed(2) + '%');
        s.el.style.setProperty('--my', s.cMY.toFixed(2) + '%');
        s.el.style.setProperty('--scale', s.cS.toFixed(4));

        const moving =
            Math.abs(s.tRX - s.cRX) > 0.02 ||
            Math.abs(s.tRY - s.cRY) > 0.02 ||
            Math.abs(s.tTX - s.cTX) > 0.05 ||
            Math.abs(s.tTY - s.cTY) > 0.05 ||
            Math.abs(s.tMX - s.cMX) > 0.15 ||
            Math.abs(s.tMY - s.cMY) > 0.15 ||
            Math.abs(s.tS  - s.cS ) > 0.0005;

        if (moving || s.active) {
            s.rafId = requestAnimationFrame(() => loop(s));
        } else {
            s.el.style.setProperty('--rx', s.tRX + 'deg');
            s.el.style.setProperty('--ry', s.tRY + 'deg');
            s.el.style.setProperty('--tx', s.tTX + 'px');
            s.el.style.setProperty('--ty', s.tTY + 'px');
            s.el.style.setProperty('--scale', String(s.tS));
        }
    }

    const lerp  = (a, b, t) => a + (b - a) * t;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    function scan() {
        document.querySelectorAll('[data-tilt]').forEach(attach);
    }

    function observe() {
        const mo = new MutationObserver(scan);
        mo.observe(document.body, { childList: true, subtree: true });
        scan();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observe);
    } else {
        observe();
    }
})();
