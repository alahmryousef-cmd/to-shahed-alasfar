/* ============================================================
   MAIN v2.1 — Intro, Menu, Gallery, Store, Lightbox
   ============================================================ */
(function () {
    'use strict';

    const ART_COUNT = 16;

    const galleryItems = Array.from({ length: ART_COUNT }, (_, i) => ({
        title: 'Shahed',
        description:
            i === 15
                ? 'Art 16 — A portrait of collective silence before truth.'
                : 'Original hand-painted portrait by Shahed Alasfar.',
        images: [`img/art${i + 1}.png`],
    }));

    const storeProducts = [
        {
            title: 'مرآة الفنانين',
            price: '1300 ﷼',
            description: '100 × 60 — عمل فني على مرآة يجمع ملامح وجوه فنية خالدة بالأبيض والأسود.',
            images: ['img/store1.jpg'],
        },
        {
            title: 'الأيدي والخيوط الحمراء',
            price: '770 ﷼',
            description: 'أربع قطع، اللوحة الواحدة 40 × 40 — عمل فني تتشابك بينه الخيوط الحمراء.',
            images: ['img/store3.jpg', 'img/store3-1.jpg'],
        },
        {
            title: 'فيودور دوستويفسكي',
            price: '450 ﷼',
            description: '60 × 40 — بورتريه عملاق الأدب الروسي: فيودور دوستويفسكي.',
            images: ['img/store4.jpg', 'img/store4-1.jpg'],
        },
    ];

    /* ---------- INTRO ---------- */
    function runIntro() {
        const screen  = document.getElementById('introScreen');
        const name    = document.getElementById('introName');
        const sig     = document.getElementById('introSignature');
        const tagline = document.getElementById('introTagline');
        if (!screen) return;

        [
            [200,  () => name?.classList.add('visible')],
            [1500, () => sig?.classList.add('visible')],
            [2700, () => tagline?.classList.add('visible')],
            [4200, () => screen.classList.add('fade-out')],
            [5300, () => screen.classList.add('hidden')],
        ].forEach(([t, fn]) => setTimeout(fn, t));
    }

    /* ---------- Header scroll ---------- */
    function initScrollHeader() {
        const header = document.getElementById('header');
        if (!header) return;
        let ticking = false;
        window.addEventListener(
            'scroll',
            () => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 50);
                    ticking = false;
                });
            },
            { passive: true }
        );
    }

    /* ---------- Fade-in ---------- */
    function initFadeIn() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible');
                        observer.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );
        document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    }

    /* ---------- Mobile menu ---------- */
    function initMobileMenu() {
        const btn     = document.getElementById('mobileMenuBtn');
        const menu    = document.getElementById('mobileMenu');
        const close   = document.getElementById('mobileMenuClose');
        const overlay = document.getElementById('overlay');
        if (!btn || !menu || !close || !overlay) return;

        const open  = () => {
            menu.classList.add('active');
            overlay.classList.add('active');
            menu.setAttribute('aria-hidden', 'false');
            document.body.classList.add('no-scroll');
        };
        const closeFn = () => {
            menu.classList.remove('active');
            overlay.classList.remove('active');
            menu.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
        };
        btn.addEventListener('click', open);
        close.addEventListener('click', closeFn);
        overlay.addEventListener('click', closeFn);
        menu.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', closeFn));
    }

    /* ---------- Smooth anchors ---------- */
    function initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', function (e) {
                const id = this.getAttribute('href');
                if (!id || id === '#' || id.length < 2) return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 72;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });
        window.scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ---------- Build Gallery ---------- */
    function buildGallery() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;
        const frag = document.createDocumentFragment();

        galleryItems.forEach((item, i) => {
            const el = document.createElement('div');
            el.className = 'gallery-item fade-in';
            el.style.setProperty('--i', i);
            el.innerHTML = `
                <div class="painting-frame" data-tilt>
                    <div class="frame-glow"></div>

                    <div class="frame-outer">
                        <span class="frame-edge frame-edge--top"></span>
                        <span class="frame-edge frame-edge--right"></span>
                        <span class="frame-edge frame-edge--bottom"></span>
                        <span class="frame-edge frame-edge--left"></span>

                        <span class="frame-inner-mat"></span>

                        <div class="frame-mat">
                            <span class="frame-mat-line"></span>
                            <img src="${item.images[0]}"
                                 class="gallery-img"
                                 alt="${item.title} — Artwork ${i + 1}"
                                 loading="lazy"
                                 decoding="async">
                        </div>
                    </div>

                    <span class="frame-shine"></span>

                    <span class="frame-sparkle frame-sparkle--tl"></span>
                    <span class="frame-sparkle frame-sparkle--tr"></span>
                    <span class="frame-sparkle frame-sparkle--bl"></span>
                    <span class="frame-sparkle frame-sparkle--br"></span>
                </div>
                <div class="painting-label">shahed</div>
            `;
            el.addEventListener('click', () => openLightbox('gallery', i));
            frag.appendChild(el);
        });
        grid.appendChild(frag);
    }

    /* ---------- Build Store ---------- */
    function buildStore() {
        const grid = document.getElementById('storeGrid');
        if (!grid) return;
        const frag = document.createDocumentFragment();
        storeProducts.forEach((p, i) => {
            const el = document.createElement('div');
            el.className = 'store-item fade-in';
            el.innerHTML = `
                <div class="store-images">
                    <img src="${p.images[0]}" class="store-img" alt="${p.title}" loading="lazy" decoding="async">
                    <div class="store-overlay"><p>Click to view details</p></div>
                </div>
                <div class="store-info">
                    <h3 class="store-title">${p.title}</h3>
                    <p class="store-price">${p.price}</p>
                    <p>${p.description}</p>
                </div>
            `;
            el.addEventListener('click', () => openLightbox('store', i));
            frag.appendChild(el);
        });
        grid.appendChild(frag);
    }

    /* ---------- Lightbox ---------- */
    const lb = {
        root: null, img: null, thumbs: null, info: null,
        closeBtn: null, prevBtn: null, nextBtn: null,
        mode: 'gallery', index: 0, images: [], lastFocus: null,
    };

    function cacheLightbox() {
        lb.root     = document.getElementById('fullscreenGallery');
        lb.img      = document.getElementById('galleryMainImage');
        lb.thumbs   = document.getElementById('galleryThumbnails');
        lb.info     = document.getElementById('galleryInfo');
        lb.closeBtn = document.getElementById('galleryClose');
        lb.prevBtn  = document.getElementById('galleryPrev');
        lb.nextBtn  = document.getElementById('galleryNext');
    }

    function openLightbox(mode, index) {
        cacheLightbox();
        if (!lb.root) return;
        lb.mode      = mode;
        lb.index     = index;
        lb.lastFocus = document.activeElement;
        const arr    = mode === 'store' ? storeProducts : galleryItems;
        lb.images    = arr[index].images;
        renderLightbox();
        lb.root.classList.add('active');
        lb.root.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        lb.closeBtn?.focus();
    }

    function closeLightbox() {
        if (!lb.root) return;
        lb.root.classList.remove('active');
        lb.root.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        if (lb.lastFocus && typeof lb.lastFocus.focus === 'function') lb.lastFocus.focus();
    }

    function navigateLightbox(dir) {
        const arr = lb.mode === 'store' ? storeProducts : galleryItems;
        lb.index  = (lb.index + dir + arr.length) % arr.length;
        lb.images = arr[lb.index].images;
        renderLightbox();
    }

    function renderLightbox() {
        lb.img.src = lb.images[0];
        lb.thumbs.innerHTML = '';

        if (lb.images.length > 1) {
            lb.thumbs.style.display = 'flex';
            lb.images.forEach((src, i) => {
                const t = document.createElement('img');
                t.src = src;
                t.className = 'gallery-thumbnail' + (i === 0 ? ' active' : '');
                t.alt = '';
                t.addEventListener('click', () => {
                    lb.img.src = src;
                    lb.thumbs.querySelectorAll('.gallery-thumbnail').forEach((x) => x.classList.remove('active'));
                    t.classList.add('active');
                });
                lb.thumbs.appendChild(t);
            });
        } else {
            lb.thumbs.style.display = 'none';
        }

        if (lb.mode === 'store') {
            const p = storeProducts[lb.index];
            lb.info.innerHTML = `
                <h3 class="gallery-product-title">${p.title}</h3>
                <p class="gallery-product-price">${p.price}</p>
                <p class="gallery-product-description">${p.description}</p>
                <a href="https://www.instagram.com/s.hahed_alasfar" target="_blank" rel="noopener" class="store-btn">Order via Instagram</a>
            `;
        } else {
            const g = galleryItems[lb.index];
            lb.info.innerHTML = `
                <h3 class="gallery-product-title">${g.title}</h3>
                <p class="gallery-product-description">${g.description}</p>
            `;
        }
    }

    function initLightboxEvents() {
        cacheLightbox();
        if (!lb.root) return;
        lb.closeBtn.addEventListener('click', closeLightbox);
        lb.prevBtn.addEventListener('click',  () => navigateLightbox(-1));
        lb.nextBtn.addEventListener('click',  () => navigateLightbox(1));
        lb.root.addEventListener('click', (e) => { if (e.target === lb.root) closeLightbox(); });
        document.addEventListener('keydown', (e) => {
            if (!lb.root.classList.contains('active')) return;
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowLeft')  navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        });
    }

    /* ---------- Boot ---------- */
    function boot() {
        runIntro();
        initScrollHeader();
        initMobileMenu();
        initSmoothAnchors();
        buildGallery();
        buildStore();
        initFadeIn();
        initLightboxEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();