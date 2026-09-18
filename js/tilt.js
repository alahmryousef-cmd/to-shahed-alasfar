/* ============================================================
   TILT v2.1 — Ultra-interactive 3D frames
   Mouse  : precise 3D tilt + magnet + shine + edge lighting
   Touch  : single-finger drag tilt, snaps back
   Gyro   : optional device orientation on supported phones
   ============================================================ */
(function () {
    'use strict';

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* ---------- Config ---------- */
    const CFG = {
        maxTilt:       12,      // deg
        maxMagnet:     6,       // px, frame pulls toward cursor
        maxScale:      1.035,   // slight lift on hover
        ease:          0.14,
        easeEdge:      0.18,
        gyroEnabled:   false,   // flip to true if you want gyro
        gyroMaxTilt:   6,
        gyroEase:      0.05,
    };

    const isTouch = matchMedia('(hover: none)').matches;
    const frames  = [];

    /* ---------- Frame controller ---------- */
    function attach(frame) {
        if (frame.dataset.tiltInit) return;
        frame.dataset.tiltInit = '1';

        const s = {
            el:        frame,
            item:      frame.closest('.gallery-item'),
            // 3D state
            tRX: 0, tRY: 0,       // target rotate
            cRX: 0, cRY: 0,       // current rotate
            // magnet (shift)
            tTX: 0, tTY: 0,
            cTX: 0, cTY: 0,
            // shine position
            tMX: 50, tMY: 50,
            cMX: 50, cMY: 50,
            // scale
            tS: 1, cS: 1,
            // interaction
            active: false,
            rafId: null,
            // gyro (optional)
            gyroRX: 0, gyroRY: 0,
            gyroBase: null,
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
        const px = (e.clientX - r.left) / r.width;    // 0..1
        const py = (e.clientY - r.top)  / r.height;   // 0..1

        const cx = px - 0.5;   // -0.5..0.5
        const cy = py - 0.5;

        // 3D rotation
        s.tRY =  cx * 2 * CFG.maxTilt;
        s.tRX = -cy * 2 * CFG.maxTilt;

        // Magnet: pull the whole frame slightly toward the cursor
        s.tTX =  cx * 2 * CFG.maxMagnet;
        s.tTY =  cy * 2 * CFG.maxMagnet;

        // Shine position
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

        // Smooth lerp
        s.cRX = lerp(s.cRX, s.tRX + s.gyroRX, CFG.ease);
        s.cRY = lerp(s.cRY, s.tRY + s.gyroRY, CFG.ease);
        s.cTX = lerp(s.cTX, s.tTX, CFG.ease);
        s.cTY = lerp(s.cTY, s.tTY, CFG.ease);
        s.cMX = lerp(s.cMX, s.tMX, CFG.easeEdge);
        s.cMY = lerp(s.cMY, s.tMY, CFG.easeEdge);
        s.cS  = lerp(s.cS,  s.tS,  CFG.ease);

        // Write CSS variables — CSS handles the transform
        s.el.style.setProperty('--rx', s.cRX.toFixed(3) + 'deg');
        s.el.style.setProperty('--ry', s.cRY.toFixed(3) + 'deg');
        s.el.style.setProperty('--tx', s.cTX.toFixed(2) + 'px');
        s.el.style.setProperty('--ty', s.cTY.toFixed(2) + 'px');
        s.el.style.setProperty('--mx', s.cMX.toFixed(2) + '%');
        s.el.style.setProperty('--my', s.cMY.toFixed(2) + '%');
        s.el.style.setProperty('--scale', s.cS.toFixed(4));

        // Continue if still moving
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
            // Snap exactly to targets
            s.el.style.setProperty('--rx', s.tRX + 'deg');
            s.el.style.setProperty('--ry', s.tRY + 'deg');
            s.el.style.setProperty('--tx', s.tTX + 'px');
            s.el.style.setProperty('--ty', s.tTY + 'px');
            s.el.style.setProperty('--scale', String(s.tS));
        }
    }

    /* ---------- Helpers ---------- */
    const lerp  = (a, b, t) => a + (b - a) * t;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    /* ---------- Optional gyroscope (device tilt) ---------- */
    function initGyro() {
        if (!CFG.gyroEnabled || !window.DeviceOrientationEvent) return;
        let permissionGranted = !isTouch; // desktop: n/a, mobile: ask
        const handler = (e) => {
            if (e.beta === null || e.gamma === null) return;
            const { beta, gamma } = e;
            if (!frames[0].gyroBase) {
                frames[0].gyroBase = { beta, gamma };
            }
            const base = frames[0].gyroBase;
            const dBeta  = clamp(beta  - base.beta,  -20, 20);
            const dGamma = clamp(gamma - base.gamma, -20, 20);
            frames.forEach((s) => {
                s.gyroRX = -dBeta  / 20 * CFG.gyroMaxTilt;
                s.gyroRY =  dGamma / 20 * CFG.gyroMaxTilt;
                kick(s);
            });
        };
        window.addEventListener('deviceorientation', handler, true);
    }

    /* ---------- Auto-attach to new frames ---------- */
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