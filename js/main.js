
(function () {
    'use strict';

    const S = window.SITE;
    if (!S) return;

    const { Img, isArabic, INSTAGRAM, GALLERY, STORE, WORKSHOPS, TRAIL, TEASER, STORY, COUNTRY } = S;
    const html = document.documentElement;
    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
    const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
    const icon = (id) => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ratio = (key) => Img.dims(key).ratio.toFixed(4);
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    function picture(key, alt, sizes, extra, deferred) {
        const d = Img.dims(key);
        const src = deferred ? `data-src="${Img.smallest(key)}" data-srcset="${Img.srcset(key)}"`
                             : `src="${Img.smallest(key)}" srcset="${Img.srcset(key)}"`;
        return `<img ${src} sizes="${sizes}"
                     width="${d.w}" height="${d.h}" style="--ar:${ratio(key)}"
                     alt="${esc(alt)}" loading="lazy" decoding="async" ${extra || ''}>`;
    }

    function buildGallery() {
        const root = $('#galleryGrid');
        if (!root) return;
        root.innerHTML = GALLERY.map((g, i) => `
            <li class="work reveal" style="--i:${(i % 5) + Math.floor(i / 5)}">
                <button class="work__btn" type="button" data-open="gallery:${i}">
                    <span class="work__img">${picture(g.images[0], g.alt, '(min-width: 1000px) 400px, (min-width: 620px) 46vw, 92vw', `data-thumb="gallery:${i}:0"`, true)}</span>
                </button>
                <p class="work__label">${esc(g.label)}</p>
            </li>`).join('');
    }

    function buildTeaser() {
        const root = $('#galleryTeaser');
        if (!root) return;
        root.innerHTML = `<div class="teaser__row">${TEASER.map((key, i) => {
            const d = Img.dims(key);
            return `<span class="teaser__item" style="--i:${i};--ar:${ratio(key)}">
                <img src="${Img.smallest(key)}" width="${d.w}" height="${d.h}" alt="" loading="lazy" decoding="async"></span>`;
        }).join('')}</div>`;
    }


    const FLAGS = {
        sa: '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="20" fill="#0c7a43"/><rect x="7" y="13.4" width="16" height="1.4" fill="#fff"/><rect x="21.6" y="12.6" width="1.4" height="3" fill="#fff"/></svg>',
        jo: '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="6.67" fill="#111"/><rect y="6.67" width="30" height="6.66" fill="#fff"/><rect y="13.33" width="30" height="6.67" fill="#0b7d3e"/><path d="M0 0 15 10 0 20Z" fill="#ce1126"/><polygon points="6.00,7.40 6.46,9.05 8.03,8.38 7.02,9.77 8.53,10.58 6.82,10.65 7.13,12.34 6.00,11.05 4.87,12.34 5.18,10.65 3.47,10.58 4.98,9.77 3.97,8.38 5.54,9.05" fill="#fff"/></svg>',
    };

    function sizeTag(size) {
        const m = /^(.*?)\s*(\(.*\))$/.exec(size);
        const inner = m ? `${esc(m[1])} <bdi dir="rtl" lang="ar">${esc(m[2])}</bdi>` : esc(size);
        return `<span class="tag" dir="ltr">${inner}</span>`;
    }

    function productDetails(p) {
        const country = COUNTRY[p.region];
        return `
            <h3 class="product__title" lang="${isArabic(p.title) ? 'ar' : 'en'}">${esc(p.title)}</h3>
            <p class="price"><bdi class="price__v">${esc(p.priceValue)}</bdi><bdi class="price__c" lang="ar">${esc(p.priceCurrency)}</bdi></p>
            <div class="tags">
                ${country ? `<span class="country" lang="en" dir="ltr">${FLAGS[p.region] || ''}${esc(country.name)}</span>` : ''}
                <span class="tag" lang="ar" dir="rtl">${esc(p.regionLabel)}</span>
                ${sizeTag(p.size)}
            </div>
            ${p.description ? `<p class="product__desc" lang="ar">${esc(p.description)}</p>` : ''}`;
    }

    const orderLink = (cls) => `<a class="btn ${cls}" lang="en" dir="ltr" href="${INSTAGRAM}" target="_blank" rel="noopener">Order via Instagram ${icon('arrow-up-right')}</a>`;

    function buildStore() {
        const root = $('#storeGrid');
        if (!root) return;
        root.innerHTML = STORE.map((p, i) => {
            const rtl = isArabic(p.title);
            const first = p.images[0];
            const thumbs = p.images.length > 1 ? `
                <div class="product__thumbs">
                    ${p.images.map((k, j) => `
                        <button class="thumb" type="button" data-open="store:${i}:${j}" aria-label="View image ${j + 1} of ${p.images.length}: ${esc(p.title)}">
                            <img src="${Img.smallest(k)}" alt="" width="56" height="56" loading="lazy" decoding="async" ${j ? `data-thumb="store:${i}:${j}"` : ''}>
                        </button>`).join('')}
                </div>` : '';
            return `
            <li class="product reveal" data-region="${p.region}">
                <div class="product__media">
                    <div class="product__plate">
                        <button class="product__open" type="button" data-open="store:${i}" style="--ar:${ratio(first)}" aria-label="Enlarge: ${esc(p.title)}">
                            ${picture(first, p.title, '(min-width: 860px) 44vw, 92vw', `data-thumb="store:${i}:0"`)}
                        </button>
                    </div>
                    ${thumbs}
                </div>
                <div class="product__info" lang="${rtl ? 'ar' : 'en'}" dir="${rtl ? 'rtl' : 'ltr'}">
                    ${productDetails(p)}
                    ${orderLink('btn--line')}
                </div>
            </li>`;
        }).join('');
    }

    function viewerInfo(p) {
        const frag = document.createDocumentFragment();
        const wrap = document.createElement('div');
        const rtl = isArabic(p.title);
        wrap.lang = rtl ? 'ar' : 'en';
        wrap.dir = rtl ? 'rtl' : 'ltr';
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;gap:1rem;width:100%';
        wrap.innerHTML = productDetails(p);
        const cta = document.createElement('div');
        cta.className = 'viewer__cta';
        cta.innerHTML = orderLink('btn--solid');
        frag.append(wrap, cta);
        return frag;
    }

    const viewerItems = (list) => list.map((x) => ({ images: [x.key], alt: x.alt, label: x.label || '' }));

    function initOpeners() {
        window.SiteViewer && window.SiteViewer.init({
            collections: {
                gallery: GALLERY,
                store: STORE,
                ws1: viewerItems(WORKSHOPS.ws1),
                ws2: viewerItems(WORKSHOPS.ws2),
                posters: viewerItems(WORKSHOPS.posters),
            },
            renderInfo: viewerInfo,
        });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-open]');
            if (!btn || !window.SiteViewer) return;
            const [mode, idx, img] = btn.dataset.open.split(':');
            const srcImg = btn.querySelector('.work__img img, .product__open img, .ws-photo__btn img, .ws-poster__btn img') || btn.querySelector('img');
            window.SiteViewer.open(mode, Number(idx), Number(img || 0), srcImg);
        });
    }

    let revealIO = null;
    function observeReveals(root) {
        const items = $$('.reveal, .child', root);
        if (!revealIO) { items.forEach((n) => n.classList.add('is-in')); return; }
        items.forEach((n) => { if (!n.classList.contains('is-in')) revealIO.observe(n); });
    }
    function unobserveReveals(root) {
        $$('.reveal', root).forEach((n) => { if (revealIO) revealIO.unobserve(n); });
    }
    function initReveal() {
        if ('IntersectionObserver' in window) {
            revealIO = new IntersectionObserver((entries) => {
                entries.forEach((en) => {
                    if (!en.isIntersecting) return;
                    en.target.classList.add('is-in');
                    revealIO.unobserve(en.target);
                });
            }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        }
        observeReveals();
    }

    function initHeader() {
        const header = $('#header');
        const sentinel = $('#topSentinel');
        if (header && sentinel && 'IntersectionObserver' in window) {
            new IntersectionObserver(([en]) => header.classList.toggle('is-scrolled', !en.isIntersecting)).observe(sentinel);
        }
        if (!('IntersectionObserver' in window)) return;
        const order = $$('.nav a[href^="#"]').map((a) => a.getAttribute('href').slice(1));
        const links = new Map($$('.nav a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
        const visible = new Set();
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((en) => { if (en.isIntersecting) visible.add(en.target.id); else visible.delete(en.target.id); });
            const current = order.filter((id) => visible.has(id)).pop();
            links.forEach((a, id) => { if (id === current) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
        }, { rootMargin: '-45% 0px -50% 0px' });
        order.forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
    }

    function initMenu() {
        const btn = $('#menuBtn'), menu = $('#menu'), closeBtn = $('#menuClose');
        if (!btn || !menu || typeof menu.showModal !== 'function') return;
        btn.addEventListener('click', () => { menu.showModal(); html.classList.add('is-locked'); });
        closeBtn.addEventListener('click', () => menu.close());
        menu.addEventListener('close', () => { html.classList.remove('is-locked'); btn.focus({ preventScroll: true }); });
        $$('.menu__nav a', menu).forEach((a) => a.addEventListener('click', () => {
            html.classList.remove('is-locked');
            menu.close();
        }));
        matchMedia('(min-width: 861px)').addEventListener('change', (m) => { if (m.matches && menu.open) menu.close(); });
    }

    function applyPortrait() {
        const cfg = STORY.portrait;
        const story = $('.story');
        if (!cfg || !story || !Img.has(cfg.key)) return;
        const d = Img.dims(cfg.key);
        story.style.setProperty('--ar', d.ratio.toFixed(4));
        $$('.slice img', $('#portrait')).forEach((im, i) => {
            im.src = Img.largest(cfg.key);
            im.srcset = Img.srcset(cfg.key);
            im.width = d.w;
            im.height = d.h;
            im.alt = i === 0 ? (cfg.alt || '') : '';
        });
    }

    function applyChild() {
        const cfg = STORY.child;
        const slot = $('#childSlot');
        if (!cfg || !slot || !Img.has(cfg.key)) return;
        const d = Img.dims(cfg.key);
        const slices = [2, 1, 0, 1, 2].map((k, i) => `
            <span class="slice" style="--i:${i};--k:${k}"${i ? ' aria-hidden="true"' : ''}>
                <img src="${Img.largest(cfg.key)}" srcset="${Img.srcset(cfg.key)}" sizes="(min-width: 1024px) 36vw, 92vw"
                     width="${d.w}" height="${d.h}" alt="${i ? '' : esc(cfg.alt || '')}" loading="lazy" decoding="async"></span>`).join('');
        slot.innerHTML = `<figure class="child"><div class="child__frame" style="--car:${ratio(cfg.key)}">${slices}</div></figure>`;
        slot.classList.add('has-child');
    }

    function initStory() {
        const story = $('.story');
        if (!story) return;
        applyPortrait();
        applyChild();
        observeReveals($('#childSlot'));  

        const pinWrap = $('#portraitPin'), portrait = $('#portrait'), copy = $('#heroCopy'), text = $('.about__text');
        const slot = $('#heroSlot'), frame = $('#dockFrame'), about = $('#about'), pin = $('.story__pin');
        const canScrub = () => !reduceMq.matches && window.CSS && CSS.supports('animation-timeline: scroll()');
        const sync = () => html.classList.toggle('no-st', !canScrub());
        sync();
        reduceMq.addEventListener('change', sync);

        let lastW = 0, lastH = 0, raf = 0;
        function measure() {
            raf = 0;
            const vh = window.innerHeight;
            const sRect = slot.getBoundingClientRect();
            const pRect = pin.getBoundingClientRect();
            const fRect = frame.getBoundingClientRect();
            const aRect = about.getBoundingClientRect();
            const slotX = sRect.left, slotY = sRect.top - pRect.top;
            const dockX = fRect.left, dockY = about.offsetTop + (fRect.top - aRect.top);
            const Sw = sRect.width, Dw = fRect.width;
            const L = Math.max(Sw, Dw);
            const headerH = parseFloat(getComputedStyle(html).getPropertyValue('--header-h')) * parseFloat(getComputedStyle(html).fontSize) || 64;
            const land = Math.max(headerH + 24, vh * 0.16);
            const end = Math.max(Math.min(dockY - land, about.offsetTop - headerH - 8), vh * 0.6);
            const hold = Math.min(vh * 0.42, end * 0.45);

            pinWrap.style.setProperty('--pw', `${L}px`);
            pinWrap.style.setProperty('--p-dx', `${slotX - dockX}px`);
            pinWrap.style.setProperty('--p-dy', `${slotY - dockY}px`);
            pinWrap.style.setProperty('--p-hold', `${hold}px`);
            portrait.style.setProperty('--p-dx', `${slotX - dockX}px`);
            portrait.style.setProperty('--p-dy', `${slotY - dockY}px`);
            portrait.style.setProperty('--p-hold', `${hold}px`);
            portrait.style.setProperty('--p-end', `${end}px`);
            portrait.style.setProperty('--p-s0', (Sw / L).toFixed(4));
            portrait.style.setProperty('--p-s1', (Dw / L).toFixed(4));
            copy.style.setProperty('--p-hold', `${hold}px`);
            text.style.setProperty('--p-hold', `${hold}px`);
            text.style.setProperty('--p-end', `${end}px`);
            const tRect = text.getBoundingClientRect();
            let from = 0.55;
            if (tRect.left > fRect.right - 1) {
                const slotRight = slotX + Sw, dockRight = dockX + Dw;
                const u = (tRect.left - 24 - slotRight) / (dockRight - slotRight);
                from = clamp(u, 0.3, 0.92);
            }
            text.style.setProperty('--p-text-a', from.toFixed(3));
            text.style.setProperty('--p-text-b', clamp(from + 0.28, 0.5, 1).toFixed(3));
            html.classList.add('story-ready');
        }
        const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
        const onSize = () => {
            const w = window.innerWidth, h = window.innerHeight;
            if (w === lastW && Math.abs(h - lastH) < 120 && lastH) return;
            lastW = w; lastH = h; schedule();
        };
        window.addEventListener('resize', onSize);
        if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(story);
        lastW = window.innerWidth; lastH = window.innerHeight;
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(schedule);
        } else {
            measure();
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([en]) => story.classList.toggle('is-about', en.isIntersecting),
                { rootMargin: '0px 0px -42% 0px' }).observe(about);
        }
    }

    function initGallery() {
        const section = $('#gallery'), toggle = $('#galleryToggle'), label = $('#galleryToggleLabel');
        const panel = $('#galleryPanel'), closeBtn = $('#galleryClose'), teaser = $('#galleryTeaser');
        const head = section && $('.gallery__head', section);
        if (!section || !toggle || !panel) return;
        let open = false, settle = 0, hydrated = false;
        const hydrate = () => {
            if (hydrated) return;
            hydrated = true;
            $$('img[data-src]', panel).forEach((im) => { im.srcset = im.dataset.srcset; im.src = im.dataset.src; });
        };

        function setOpen(next) {
            if (next === open) return;
            open = next;
            clearTimeout(settle);
            const behavior = reduceMq.matches ? 'auto' : 'smooth';
            toggle.setAttribute('aria-expanded', String(open));
            label.textContent = open ? 'Close the gallery' : 'Open the gallery';
            if (open) {
                hydrate();
                panel.inert = false;
                section.classList.remove('is-settled');
                section.classList.add('is-open');
                observeReveals(panel);
                head.scrollIntoView({ behavior, block: 'start' });
                settle = setTimeout(() => section.classList.add('is-settled'), reduceMq.matches ? 0 : 1500);
            } else {
                const top = head.getBoundingClientRect().top;
                if (top < 0 || top > window.innerHeight * 0.5) head.scrollIntoView({ behavior, block: 'start' });
                section.classList.remove('is-settled', 'is-open');
                $$('.work', panel).forEach((w) => { if (revealIO) revealIO.unobserve(w); w.classList.remove('is-in'); });
                if (panel.contains(document.activeElement)) toggle.focus({ preventScroll: true });
                settle = setTimeout(() => { panel.inert = true; }, reduceMq.matches ? 0 : 1000);
            }
        }
        toggle.addEventListener('click', () => setOpen(!open));
        closeBtn.addEventListener('click', () => setOpen(false));
        if (teaser) teaser.addEventListener('click', () => setOpen(true));
    }

    function initTrail() {
        const layer = $('#trail');
        if (!layer || !window.PixelatedImageTrail) return;
        const fine = matchMedia('(hover: hover) and (pointer: fine)');
        let trail = null;
        const start = () => {
            if (trail || reduceMq.matches) return;
            const keys = fine.matches ? TRAIL : TRAIL.slice(0, 6);
            trail = new window.PixelatedImageTrail(layer, {
                images: keys.map((k) => ({ src: Img.smallest(k), ratio: Img.dims(k).ratio })),
                imageSize: clamp(window.innerWidth * 0.14, 130, 200),
            });
        };
        const stop = () => { if (trail) { trail.destroy(); trail = null; } };
        reduceMq.addEventListener('change', () => (reduceMq.matches ? stop() : start()));
        const idle = window.requestIdleCallback ? (fn) => window.requestIdleCallback(fn, { timeout: 2500 }) : (fn) => setTimeout(fn, 800);
        idle(start);
    }

    function initAmbient() {
        const root = $('#ambientMotes');
        if (!root || reduceMq.matches) return;
        const count = window.innerWidth < 700 ? 9 : 16;
        let seed = 7;
        const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i += 1) {
            const m = document.createElement('i');
            m.className = 'mote';
            m.style.cssText = `--x:${(rnd() * 100).toFixed(1)}%;--s:${(1.5 + rnd() * 2).toFixed(1)}px;--o:${(0.18 + rnd() * 0.3).toFixed(2)};` +
                `--d:${(28 + rnd() * 34).toFixed(1)}s;--w:${(-rnd() * 40).toFixed(1)}s;--dx:${((rnd() - 0.5) * 18).toFixed(1)}vw`;
            frag.appendChild(m);
        }
        root.appendChild(frag);
    }

    /* ---------- Intro: brief, skippable, once per session ---------- */
    function initIntro() {
        const intro = $('#intro');
        if (!intro || !html.classList.contains('intro-on')) return;
        const t0 = performance.now();
        let finished = false;
        const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
        const finish = () => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            events.forEach((ev) => window.removeEventListener(ev, finish));
            if (performance.now() - t0 < 1700) html.classList.add('intro-skip');
            intro.classList.add('is-out');
            setTimeout(() => {
                html.classList.remove('intro-on', 'intro-skip');
                try { sessionStorage.setItem('sa-intro', '1'); } catch (e) { /* storage unavailable */ }
            }, 1050);
        };
        const timer = setTimeout(finish, 1900);
        events.forEach((ev) => window.addEventListener(ev, finish, { passive: true }));
    }

    function boot() {
        html.classList.add('js-ready');

        window.SiteUI = { observeReveals, unobserveReveals };
        buildGallery();
        buildTeaser();
        buildStore();
        initOpeners();
        initReveal();
        initHeader();
        initMenu();
        initStory();
        initGallery();
        initAmbient();
        initTrail();
        initIntro();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
