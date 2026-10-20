
(function () {
    'use strict';

    const S = window.SITE;
    const dlg = document.getElementById('viewer');
    if (!S || !dlg || typeof dlg.showModal !== 'function') return;

    const { Img, INSTAGRAM } = S;
    const html = document.documentElement;
    const $ = (id) => document.getElementById(id);
    const el = {
        img: $('viewerImg'), stage: $('viewerStage'), prev: $('viewerPrev'), next: $('viewerNext'),
        thumbs: $('viewerThumbs'), caption: $('viewerCaption'), info: $('viewerInfo'),
        close: $('viewerClose'), status: $('viewerStatus'),
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const STATUS_LABEL = { gallery: 'Artwork', store: 'Product', ws1: 'Workshop One photo', ws2: 'Workshop Two photo', posters: 'Poster' };

    let collections = {};
    let renderInfo = null;
    const state = { mode: 'gallery', index: 0, img: 0, opener: null, token: 0 };

    const canMorph = () => 'startViewTransition' in document && !reduce.matches;
    const inViewport = (node) => {
        if (!node || !node.isConnected) return false;
        const r = node.getBoundingClientRect();
        return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    };

    function best(key) {
        const widths = Img.widths(key);
        const need = Math.min(1600, Math.round(Math.max(innerWidth, innerHeight) * Math.min(devicePixelRatio || 1, 2)));
        const w = widths.find((x) => x >= need) || widths[widths.length - 1];
        return Img.url(key, w);
    }

    function current() {
        const items = collections[state.mode] || [];
        return items[state.index];
    }

    function render(hintSrc) {
        const items = collections[state.mode];
        const item = items[state.index];
        const key = item.images[state.img];
        const isProduct = state.mode === 'store';
        const token = ++state.token;

        dlg.classList.toggle('viewer--product', isProduct);

        const d = Img.dims(key);
        const target = best(key);
        el.img.width = d.w;
        el.img.height = d.h;
        el.img.alt = isProduct ? item.title : item.alt;
        el.img.classList.remove('is-loading');
        el.img.src = hintSrc || target;
        if (hintSrc && hintSrc !== target) {
            const pre = new Image();
            pre.src = target;
            (pre.decode ? pre.decode() : Promise.resolve()).then(() => {
                if (token === state.token) el.img.src = target;
            }).catch(() => {});
        }

        el.thumbs.replaceChildren();
        if (item.images.length > 1) {
            item.images.forEach((k, i) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'thumb';
                b.setAttribute('aria-label', `Image ${i + 1} of ${item.images.length}`);
                b.setAttribute('aria-current', i === state.img ? 'true' : 'false');
                const t = document.createElement('img');
                t.src = Img.smallest(k);
                t.alt = '';
                t.width = 56; t.height = 56;
                b.appendChild(t);
                b.addEventListener('click', () => { state.img = i; render(); });
                el.thumbs.appendChild(b);
            });
            el.thumbs.hidden = false;
        } else {
            el.thumbs.hidden = true;
        }

        if (isProduct && renderInfo) {
            el.info.replaceChildren(renderInfo(item, true));
            el.info.hidden = false;
            el.caption.textContent = '';
        } else {
            el.info.replaceChildren();
            el.info.hidden = true;
            el.caption.textContent = item.label || '';
        }

        el.status.textContent = `${STATUS_LABEL[state.mode]} ${state.index + 1} of ${items.length}`;
        preloadNeighbours();
    }

    function preloadNeighbours() {
        const items = collections[state.mode];
        const go = () => [-1, 1].forEach((dir) => {
            const n = items[(state.index + dir + items.length) % items.length];
            const p = new Image();
            p.src = best(n.images[0]);
        });
        if (window.requestIdleCallback) window.requestIdleCallback(go, { timeout: 600 });
        else setTimeout(go, 200);
    }

    function navigate(dir) {
        const items = collections[state.mode];
        state.index = (state.index + dir + items.length) % items.length;
        state.img = 0;
        render();
    }

    function lock(on) { html.classList.toggle('is-locked', on); }

    function open(mode, index, imgIndex, srcEl) {
        if (!collections[mode] || !collections[mode][index]) return;
        state.mode = mode;
        state.index = index;
        state.img = imgIndex || 0;
        state.opener = document.activeElement;

        const hint = srcEl && srcEl.currentSrc ? srcEl.currentSrc : '';
        const show = () => {
            render(hint);
            dlg.showModal();
            lock(true);
        };

        if (canMorph() && srcEl && inViewport(srcEl)) {
            html.classList.add('vt-active');
            srcEl.style.viewTransitionName = 'art';
            const t = document.startViewTransition(() => {
                srcEl.style.viewTransitionName = '';
                show();
                el.img.style.viewTransitionName = 'art';
                return Promise.race([
                    el.img.decode ? el.img.decode().catch(() => {}) : Promise.resolve(),
                    new Promise((r) => setTimeout(r, 300)),
                ]);
            });
            t.updateCallbackDone.catch((err) => console.error('Viewer open failed:', err));
            t.finished.catch(() => {}).finally(() => {
                el.img.style.viewTransitionName = '';
                srcEl.style.viewTransitionName = '';
                html.classList.remove('vt-active');
            });
        } else {
            show();
        }
    }

    function close() {
        if (!dlg.open) return;
        const sel = `[data-thumb="${state.mode}:${state.index}:${state.img}"]`;
        const target = document.querySelector(sel);
        if (canMorph() && inViewport(target)) {
            html.classList.add('vt-active');
            el.img.style.viewTransitionName = 'art';
            const t = document.startViewTransition(() => {
                el.img.style.viewTransitionName = '';
                dlg.close();
                target.style.viewTransitionName = 'art';
            });
            t.updateCallbackDone.catch((err) => console.error('Viewer close failed:', err));
            t.finished.catch(() => {}).finally(() => {
                target.style.viewTransitionName = '';
                el.img.style.viewTransitionName = '';
                html.classList.remove('vt-active');
            });
        } else {
            dlg.close();
        }
    }

    el.close.addEventListener('click', close);
    el.prev.addEventListener('click', () => navigate(-1));
    el.next.addEventListener('click', () => navigate(1));
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    dlg.addEventListener('close', () => {
        lock(false);
        const o = state.opener;
        if (o && o.isConnected && typeof o.focus === 'function') o.focus({ preventScroll: true });
        state.opener = null;
    });
    dlg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
    });
    el.stage.addEventListener('click', (e) => {
        if (e.target === el.stage || e.target.classList.contains('viewer__figure')) close();
    });

    let sx = 0, sy = 0, st = 0, tracking = false;
    el.stage.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        tracking = true; sx = e.clientX; sy = e.clientY; st = performance.now();
    });
    el.stage.addEventListener('pointerup', (e) => {
        if (!tracking) return;
        tracking = false;
        const dx = e.clientX - sx, dy = e.clientY - sy, dt = Math.max(1, performance.now() - st);
        if (Math.abs(dx) > Math.abs(dy) * 1.5 && (Math.abs(dx) > 56 || (Math.abs(dx) > 24 && Math.abs(dx) / dt > 0.11))) {
            navigate(dx < 0 ? 1 : -1);
        }
    });
    el.stage.addEventListener('pointercancel', () => { tracking = false; });

    el.img.addEventListener('error', () => { el.img.classList.remove('is-loading'); });

    window.SiteViewer = {
        init(opts) { collections = opts.collections; renderInfo = opts.renderInfo; },
        open,
        close,
    };
})();
