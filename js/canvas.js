/* ============================================================
   CANVAS v3.1 — خلفية جزيئات (الكمبيوتر فقط)
   ============================================================ */
(function () {
    'use strict';

    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;

    /* ---------- Device detection ---------- */
    const UA = navigator.userAgent;
    const isMobile  = /iPhone|iPad|iPod|Android/i.test(UA);
    const isLowEnd  = (navigator.hardwareConcurrency || 8) <= 4;
    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ✅ تعطيل تماماً على الجوال والأجهزة الضعيفة
    if (isMobile || isLowEnd || prefersReduced) {
        canvas.style.display = 'none';
        return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0, dpr = 1;
    let raf = null;
    let paused = false;
    let last = 0;

    const TARGET_FPS = 30;
    const FRAME_MS   = 1000 / TARGET_FPS;

    function computeParticles() {
        const area = window.innerWidth * window.innerHeight;
        return Math.min(18, Math.max(8, Math.round(area / 90000)));
    }

    let PARTICLE_COUNT = computeParticles();

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        PARTICLE_COUNT = computeParticles();
        while (particles.length < PARTICLE_COUNT) particles.push(new Particle());
        particles.length = PARTICLE_COUNT;
    }

    class Particle {
        constructor() { this.reset(true); }
        reset(initial) {
            this.x = Math.random() * W;
            this.y = initial ? Math.random() * H : (Math.random() < 0.5 ? -60 : H + 60);
            this.size   = 40 + Math.random() * 80;
            this.speedX = (Math.random() - 0.5) * 0.35;
            this.speedY = (Math.random() - 0.5) * 0.35;
            this.alpha  = 0.02 + Math.random() * 0.05;
            this.angle  = Math.random() * Math.PI * 2;
            this.spin   = (Math.random() - 0.5) * 0.012;
            this.hue    = 40 + Math.random() * 15;
        }
        update(dt) {
            const k = dt / FRAME_MS;
            this.x     += this.speedX * k;
            this.y     += this.speedY * k;
            this.angle += this.spin   * k;
            const s = this.size;
            if (this.x < -s)     this.x = W + s;
            if (this.x > W + s)  this.x = -s;
            if (this.y < -s)     this.y = H + s;
            if (this.y > H + s)  this.y = -s;
        }
        draw() {
            const s = this.size;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = `hsla(${this.hue}, 60%, 55%, ${this.alpha})`;
            ctx.beginPath();
            ctx.moveTo(0, -s / 2);
            ctx.bezierCurveTo( s / 3, -s / 2,  s / 2,  s / 4, 0, s / 2);
            ctx.bezierCurveTo(-s / 2,  s / 4, -s / 3, -s / 2, 0, -s / 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function loop(now) {
        raf = requestAnimationFrame(loop);
        if (paused) return;
        const dt = now - last;
        if (dt < FRAME_MS) return;
        last = now;
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(dt);
            particles[i].draw();
        }
    }

    function start() { if (raf === null) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    function stop()  { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { paused = true; stop(); }
        else { paused = false; start(); }
    });

    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(resize, 150);
    }, { passive: true });

    resize();
    start();
})();