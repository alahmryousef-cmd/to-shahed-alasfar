
(function () {
    'use strict';

    const S = window.SITE;
    const root = document.getElementById('workshops');
    if (!S || !root || !S.WORKSHOPS) return;

    const { Img, WORKSHOPS } = S;
    const UI = window.SiteUI || {};
    const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
    const $ = (sel, scope) => (scope || document).querySelector(sel);
    const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const stage = $('.ws__stage', root);
    const panel = $('#wsPanel', root);
    const inner = $('.ws__inner', panel);
    const titleEl = $('#wsPanelTitle', panel);
    const toggles = $$('[data-ws-toggle]', root);
    const gals = { 1: $('#wsGal1', root), 2: $('#wsGal2', root) };
    const data = { 1: WORKSHOPS.ws1, 2: WORKSHOPS.ws2 };
    const NAME = { 1: 'Workshop One', 2: 'Workshop Two' };

    let current = 0;          
    let token = 0;           
    const timers = new Set();
    const hydrated = {};

    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

    function buildGallery(n) {
        const g = gals[n];
        g._figs = data[n].map((item, i) => {
            const d = Img.dims(item.key);
            const fig = document.createElement('figure');
            fig.className = 'ws-photo reveal';
            fig.setAttribute('role', 'listitem');
            fig.dataset.ratio = d.ratio.toFixed(4);
            fig.style.setProperty('--ar', d.ratio.toFixed(4));
            fig.style.setProperty('--i', String(Math.min(i, 9)));
            fig.innerHTML = `<button class="ws-photo__btn" type="button" data-open="ws${n}:${i}">` +
                `<img data-src="${Img.smallest(item.key)}" data-srcset="${Img.srcset(item.key)}" ` +
                `sizes="(min-width: 900px) 26vw, 46vw" width="${d.w}" height="${d.h}" ` +
                `alt="${esc(item.alt)}" loading="lazy" decoding="async" data-thumb="ws${n}:${i}:0"></button>`;
            return fig;
        });
        g.replaceChildren(...g._figs);
    }

    function hydrate(n) {
        if (hydrated[n]) return;
        hydrated[n] = true;
        $$('img[data-src]', gals[n]).forEach((im) => { im.srcset = im.dataset.srcset; im.src = im.dataset.src; });
    }

    root.addEventListener('error', (e) => {
        if (e.target && e.target.tagName === 'IMG') {
            const fig = e.target.closest('.ws-photo');
            if (fig) fig.classList.add('is-broken');
        }
    }, true);


    function plan(ratios, width, target, gap, maxPer, single) {
        const n = ratios.length;
        const best = new Array(n + 1).fill(Infinity);
        const prev = new Array(n + 1).fill(-1);
        best[0] = 0;
        for (let j = 1; j <= n; j += 1) {
            for (let k = 1; k <= maxPer && k <= j; k += 1) {
                const i = j - k;
                let sum = 0;
                for (let q = i; q < j; q += 1) sum += ratios[q];
                const h = (width - (k - 1) * gap) / sum;
                let cost;
                if (j === n && h > target * 1.25) {
                    const natural = target * sum + (k - 1) * gap;
                    const slack = (width - natural) / width;
                    cost = slack * slack * target * target * 0.35;
                } else {
                    cost = (h - target) * (h - target);
                }
                if (k === 1 && j !== n) cost += target * target * single;
                if (best[i] + cost < best[j]) { best[j] = best[i] + cost; prev[j] = i; }
            }
        }
        const rows = [];
        for (let j = n; j > 0; j = prev[j]) rows.unshift([prev[j], j]);
        return rows;
    }

    function layout(n) {
        const g = gals[n];
        const figs = g._figs;
        const width = Math.floor(inner.clientWidth);
        if (!width) return;
        const gap = parseFloat(getComputedStyle(g).rowGap) || 12;
        const narrow = width < 600, mid = width < 900;
        const target = narrow ? Math.min(width * 0.62, 260) : mid ? 280 : Math.min(360, width / 3.4);
        const maxPer = narrow ? 2 : 4;
        const key = [width, Math.round(target), maxPer, gap].join('|');
        if (g._key === key) return;
        g._key = key;

        const ratios = figs.map((f) => parseFloat(f.dataset.ratio));
        const rows = plan(ratios, width, target, gap, maxPer, narrow ? 0.08 : 0.5);
        const frag = document.createDocumentFragment();
        rows.forEach(([a, b], ri) => {
            const row = document.createElement('div');
            row.className = 'ws-row';
            let sum = 0;
            for (let i = a; i < b; i += 1) sum += ratios[i];
            const h = (width - (b - a - 1) * gap) / sum;
            const short = ri === rows.length - 1 && h > target * 1.25;
            if (short) row.classList.add('is-short');
            for (let i = a; i < b; i += 1) {
                figs[i].style.flex = short ? `0 0 ${(target * ratios[i]).toFixed(1)}px` : `${ratios[i]} 1 0`;
                row.appendChild(figs[i]);
            }
            frag.appendChild(row);
        });
        g.replaceChildren(frag);   
    }

    let ro = null, lastWidth = 0, raf = 0;
    function watch(on) {
        if (!('ResizeObserver' in window)) return;
        if (on && !ro) {
            lastWidth = inner.clientWidth;
            ro = new ResizeObserver(() => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    const w = inner.clientWidth;
                    if (current && w !== lastWidth) { lastWidth = w; layout(current); }
                });
            });
            ro.observe(inner);
        } else if (!on && ro) {
            ro.disconnect(); ro = null;
            if (raf) { cancelAnimationFrame(raf); raf = 0; }
        }
    }

    function setStates(n) {
        toggles.forEach((b) => {
            const k = Number(b.dataset.wsToggle);
            const open = k === n;
            b.setAttribute('aria-expanded', String(open));
            b.textContent = open ? 'Close gallery' : 'Explore workshop';
            b.setAttribute('aria-label', `${open ? 'Close gallery' : 'Explore workshop'}, ${NAME[k]}`);
        });
    }

    function scrollForOpen() {
        const behavior = reduceMq.matches ? 'auto' : 'smooth';
        const headerEl = document.querySelector('.header');
        const headerH = headerEl ? headerEl.getBoundingClientRect().height : 64;
        const panelTop = panel.getBoundingClientRect().top + window.scrollY;
        const target = Math.max(0, panelTop - Math.max(headerH + 150, window.innerHeight * 0.58));
        if (Math.abs(target - window.scrollY) > 40) window.scrollTo({ top: target, behavior });
    }

    function scrollForClose() {
        const r = stage.getBoundingClientRect();
        if (r.top < 0 || r.top > window.innerHeight * 0.4) {
            stage.scrollIntoView({ behavior: reduceMq.matches ? 'auto' : 'smooth', block: 'start' });
        }
    }

    function collapse() {
        const was = current;
        current = 0;
        root.classList.remove('is-settled');
        void root.offsetWidth;                       
        root.classList.remove('is-open');
        if (was) {
            const g = gals[was];
            if (UI.unobserveReveals) UI.unobserveReveals(g);
            g._figs.forEach((f) => f.classList.remove('is-in'));
        }
        setStates(0);
        watch(false);
        later(() => {
            if (current) return;                   
            panel.inert = true;
            gals[1].hidden = true; gals[1].inert = true;
            gals[2].hidden = true; gals[2].inert = true;
            root.removeAttribute('data-open');
        }, reduceMq.matches ? 0 : 950);
        root.removeAttribute('data-open');
        return was;
    }

    function show(n, t) {
        if (t !== token) return;
        current = n;
        const g = gals[n], other = gals[3 - n];
        other.hidden = true; other.inert = true;
        hydrate(n);
        g.hidden = false; g.inert = false;
        titleEl.textContent = NAME[n];
        inner.style.setProperty('--ox', n === 1 ? '24%' : '76%');   
        layout(n);
        panel.inert = false;
        root.dataset.open = String(n);
        root.classList.remove('is-settled');
        root.classList.add('is-open');
        setStates(n);
        if (UI.observeReveals) UI.observeReveals(g);
        watch(true);
        scrollForOpen();
        later(() => { if (t === token) root.classList.add('is-settled'); }, reduceMq.matches ? 0 : 1450);
    }

    function open(n) {
        const t = ++token;
        clearTimers();
        if (current && current !== n) {                
            collapse();
            later(() => show(n, t), reduceMq.matches ? 0 : 780);
        } else {
            show(n, t);
        }
    }

    function close(focusTarget) {
        token += 1;
        clearTimers();
        const was = collapse();
        scrollForClose();
        if (focusTarget && was) {
            const btn = toggles.find((b) => Number(b.dataset.wsToggle) === was);
            if (btn) btn.focus({ preventScroll: true });
        }
    }

    root.addEventListener('click', (e) => {
        const tog = e.target.closest('[data-ws-toggle]');
        if (tog) {
            const n = Number(tog.dataset.wsToggle);
            if (current === n) close(false); else open(n);
            return;
        }
        if (e.target.closest('#wsClose')) close(true);
    });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([en]) => root.classList.toggle('is-live', en.isIntersecting),
            { rootMargin: '10% 0px' }).observe(stage);
    }

    buildGallery(1);
    buildGallery(2);
    setStates(0);
})();
