
(function () {
    'use strict';

    const DEFAULTS = {
        slices: 5,
        spawnThreshold: 32,
        smoothing: 0.32,
        imageSize: 200,
        maxActive: 14,
        imageLifespan: 1500,
        inDuration: 280,
        outDuration: 620,
        staggerIn: 12,
        staggerOut: 9,
        slideDuration: 1300,
        slideEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        zoneSelector: '[data-trail]',
        ignoreSelector: 'a, button, input, textarea, select, summary, dialog, [role="button"], [data-trail-ignore]',
        idleSleepMs: 700,
    };

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    class PixelatedImageTrail {
        /**
         * @param {HTMLElement} container fixed, pointer-events:none layer that receives the images
         * @param {{images:{src:string,ratio?:number}[]}} options
         */
        constructor(container, options) {
            this.container = container;
            this.o = Object.assign({}, DEFAULTS, options);
            this.sources = (this.o.images || []).map((i) => (typeof i === 'string' ? { src: i, ratio: 1 } : i));
            this.valid = [];
            this.index = 0;
            this.active = [];
            this.timeouts = new Set();
            this.raf = 0;
            this.looping = false;
            this.pointerActive = false;
            this.pointer = { x: 0, y: 0 };
            this.interp = { x: 0, y: 0 };
            this.lastSpawn = { x: 0, y: 0 };
            this.lastMove = 0;
            this.tap = null;
            this.destroyed = false;

            this.slices = Math.max(1, Math.floor(this.o.slices));
            this.smoothing = clamp(this.o.smoothing, 0.01, 1);
            this.threshold = Math.max(1, this.o.spawnThreshold);

            this.onMove = this.onMove.bind(this);
            this.onLeave = this.onLeave.bind(this);
            this.onDown = this.onDown.bind(this);
            this.onUp = this.onUp.bind(this);
            this.onHidden = this.onHidden.bind(this);
            this.render = this.render.bind(this);

            this.preload();
            document.addEventListener('pointermove', this.onMove, { passive: true });
            document.addEventListener('pointerdown', this.onDown, { passive: true });
            document.addEventListener('pointerup', this.onUp, { passive: true });
            document.documentElement.addEventListener('pointerleave', this.onLeave, { passive: true });
            document.addEventListener('visibilitychange', this.onHidden);
            window.addEventListener('blur', this.onLeave);
        }

        preload() {
            const loaded = new Array(this.sources.length);
            let pending = this.sources.length;
            const done = () => { pending -= 1; };
            this.sources.forEach((s, i) => {
                const im = new Image();
                im.decoding = 'async';
                im.onload = () => { loaded[i] = s; this.valid = loaded.filter(Boolean); done(); };
                im.onerror = done;
                im.src = s.src;
            });
            if (this.sources.length) this.index = Math.floor(Math.random() * this.sources.length);
        }

        schedule(fn, delay) {
            const id = window.setTimeout(() => { this.timeouts.delete(id); fn(); }, delay);
            this.timeouts.add(id);
            return id;
        }

        inZone(target) {
            if (!target || !target.closest) return false;
            if (target.closest(this.o.ignoreSelector)) return false;
            return !!target.closest(this.o.zoneSelector);
        }

        onMove(e) {
            if (e.pointerType === 'touch') return;
            if (!this.inZone(e.target)) { this.deactivate(); return; }
            const next = { x: e.clientX, y: e.clientY };
            this.pointer = next;
            this.lastMove = performance.now();
            if (!this.pointerActive) {
                this.pointerActive = true;
                this.interp = { x: next.x, y: next.y };
                this.lastSpawn = { x: next.x, y: next.y };
            }
            this.wake();
        }

        onLeave() { this.deactivate(); }
        onHidden() { if (document.hidden) this.deactivate(); }

        deactivate() { this.pointerActive = false; }

        onDown(e) {
            if (e.pointerType !== 'touch') return;
            this.tap = this.inZone(e.target) ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
        }

        onUp(e) {
            if (e.pointerType !== 'touch' || !this.tap) return;
            const t = this.tap;
            this.tap = null;
            const moved = Math.hypot(e.clientX - t.x, e.clientY - t.y);
            if (moved > 10 || performance.now() - t.t > 320) return;
            this.interp = { x: t.x, y: t.y };
            this.pointer = { x: t.x, y: t.y };
            this.spawn();
        }

        wake() {
            if (this.looping || this.destroyed) return;
            this.looping = true;
            this.raf = requestAnimationFrame(this.render);
        }

        render() {
            if (this.destroyed) return;
            if (this.pointerActive) {
                const i = this.interp, p = this.pointer;
                i.x += (p.x - i.x) * this.smoothing;
                i.y += (p.y - i.y) * this.smoothing;
                if (Math.hypot(i.x - this.lastSpawn.x, i.y - this.lastSpawn.y) > this.threshold) {
                    this.lastSpawn = { x: i.x, y: i.y };
                    this.spawn();
                }
                const settled = Math.hypot(p.x - i.x, p.y - i.y) < 0.5;
                if (settled && performance.now() - this.lastMove > this.o.idleSleepMs) {
                    this.looping = false;
                    return;
                }
            } else {
                this.looping = false;
                return;
            }
            this.raf = requestAnimationFrame(this.render);
        }

        size(ratio) {
            const long = this.o.imageSize * 1.15;
            const r = ratio > 0 ? ratio : 1;
            const w = r >= 1 ? long : long * r;
            const h = r >= 1 ? long / r : long;
            return { w: Math.max(80, w), h: Math.max(80, h) };
        }

        band(i) {
            const size = 100 / this.slices;
            return [i * size, (i + 1) * size];
        }
        delay(i, stagger) { return Math.abs(i - (this.slices - 1) / 2) * stagger; }
        collapsed(i) { const [a, b] = this.band(i); return `polygon(50% ${a}%, 50% ${a}%, 50% ${b}%, 50% ${b}%)`; }
        opened(i) { const [a, b] = this.band(i); return `polygon(0% ${a}%, 100% ${a}%, 100% ${b}%, 0% ${b}%)`; }

        spawn() {
            if (!this.valid.length) return;
            const o = this.o;
            const src = this.valid[this.index % this.valid.length];
            this.index = (this.index + 1) % this.valid.length;

            const { w, h } = this.size(src.ratio);
            const startX = this.interp.x - w / 2;
            const startY = this.interp.y - h / 2;
            const driftX = (this.pointer.x - this.interp.x) * 0.45;
            const driftY = (this.pointer.y - this.interp.y) * 0.45;

            const slide = document.createElement('div');
            slide.className = 'trail-img';
            slide.style.cssText = `left:${startX}px;top:${startY}px;width:${w}px;height:${h}px;` +
                `transition:transform ${o.slideDuration}ms ${o.slideEasing};`;

            const inner = document.createElement('div');
            inner.className = 'trail-img__inner';
            inner.style.transition = `transform ${o.outDuration}ms ${o.easing}, opacity ${o.outDuration}ms ${o.easing}`;

            const layers = [];
            const frag = document.createDocumentFragment();
            for (let i = 0; i < this.slices; i += 1) {
                const layer = document.createElement('div');
                layer.className = 'trail-img__slice';
                layer.style.backgroundImage = `url("${src.src}")`;
                layer.style.clipPath = this.collapsed(i);
                layer.style.transition = `clip-path ${o.inDuration}ms ${o.easing}`;
                layer.style.transitionDelay = `${this.delay(i, o.staggerIn)}ms`;
                frag.appendChild(layer);
                layers.push(layer);
            }
            inner.appendChild(frag);
            slide.appendChild(inner);
            this.container.appendChild(slide);
            this.active.push(slide);
            while (this.active.length > o.maxActive) {
                const old = this.active.shift();
                if (old) old.remove();
            }

            requestAnimationFrame(() => {
                if (slide.parentElement !== this.container) return;
                slide.style.transform = `translate3d(${driftX}px, ${driftY}px, 0)`;
                layers.forEach((layer, i) => { layer.style.clipPath = this.opened(i); });
            });

            this.schedule(() => {
                inner.style.opacity = '0';
                inner.style.transform = 'scale(0.24)';
                layers.forEach((layer, i) => {
                    layer.style.transition = `clip-path ${o.outDuration}ms ${o.easing}`;
                    layer.style.transitionDelay = `${this.delay(i, o.staggerOut)}ms`;
                    layer.style.clipPath = this.collapsed(i);
                });
                const maxDelay = ((this.slices - 1) / 2) * o.staggerOut;
                this.schedule(() => {
                    this.active = this.active.filter((el) => el !== slide);
                    slide.remove();
                }, o.outDuration + maxDelay);
            }, o.imageLifespan);
        }

        destroy() {
            this.destroyed = true;
            document.removeEventListener('pointermove', this.onMove);
            document.removeEventListener('pointerdown', this.onDown);
            document.removeEventListener('pointerup', this.onUp);
            document.documentElement.removeEventListener('pointerleave', this.onLeave);
            document.removeEventListener('visibilitychange', this.onHidden);
            window.removeEventListener('blur', this.onLeave);
            cancelAnimationFrame(this.raf);
            this.timeouts.forEach((id) => clearTimeout(id));
            this.timeouts.clear();
            this.active = [];
            this.container.replaceChildren();
            this.pointerActive = false;
            this.looping = false;
        }
    }

    window.PixelatedImageTrail = PixelatedImageTrail;
})();
