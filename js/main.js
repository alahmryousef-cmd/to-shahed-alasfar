/* ============================================================
   MAIN v2.3.3 — متوافق مع مجلد img الفعلي
   ============================================================ */
(function () {
    'use strict';

    /* ============================================================
       📸 CONFIG — يتطابق مع الصور الموجودة في مجلدك
       ============================================================ */

    // ✅ المعرض الرئيسي — 16 صورة (art1 → art15 + art17)
    // ملاحظة: art16 مفقود، لذلك نستخدم art17 بدلاً منه
    const GALLERY_IMAGES = [
        'art1.png',
        'art2.png',
        'art3.png',
        'art4.png',
        'art5.png',
        'art6.png',
        'art7.png',
        'art8.png',
        'art9.png',
        'art10.png',
        'art11.png',
        'art12.png',
        'art13.png',
        'art14.png',
        'art15.png',
        'art17.png',    // ← لأن art16 مفقود في مجلدك
    ];

    // ✅ Special — 3 صور (لأن special4-6 غير موجودة)
    const SPECIAL_IMAGES = [
        'special1.png',
        'special2.png',
        'special3.png',
    ];

    // ✅ المتجر — 6 منتجات (store5-7 بصيغة PNG)
    const STORE_PRODUCTS = [
        {
            title: 'مرآة الفنانين',
            priceValue: '1300',
            priceCurrency: '﷼',
            region: 'sa',
            regionLabel: 'متوفر بالسعودية',
            size: '100 × 60',
            description: 'عمل فني على مرآة يجمع ملامح وجوه فنية خالدة بالأبيض والأسود.',
            images: ['img/store1.jpg'],
        },
        {
            title: 'الأيدي والخيوط الحمراء',
            priceValue: '770',
            priceCurrency: '﷼',
            region: 'sa',
            regionLabel: 'متوفر بالسعودية',
            size: '40 × 40 (×4 قطع)',
            description: 'عمل فني من أربع لوحات تتشابك بينها الخيوط الحمراء.',
            images: ['img/store3.jpg', 'img/store3-1.jpg'],
        },
        {
            title: 'فيودور دوستويفسكي',
            priceValue: '450',
            priceCurrency: '﷼',
            region: 'sa',
            regionLabel: 'متوفر بالسعودية',
            size: '60 × 40',
            description: 'بورتريه عملاق الأدب الروسي: فيودور دوستويفسكي.',
            images: ['img/store4.jpg', 'img/store4-1.jpg'],
        },
        {
            title: 'Flamingo Night',
            priceValue: '850',
            priceCurrency: '﷼',
            region: 'sa',
            regionLabel: 'متوفر بالسعودية',
            size: '90 × 70',
            description: 'عمل فني بروح ليلية ساحرة — الفلامنجو في ضوء القمر.',
            images: ['img/store5.png'],   // ← PNG
        },
        {
            title: 'Rays of Light',
            priceValue: '75',
            priceCurrency: 'د.أ',
            region: 'jo',
            regionLabel: 'متوفر بالأردن',
            size: '70 × 50',
            description: 'أشعة النور تتسلل بين الخطوط — عمل فني يعكس الأمل.',
            images: ['img/store6.png'],   // ← PNG
        },
        {
            title: 'Regret',
            priceValue: '85',
            priceCurrency: 'د.أ',
            region: 'jo',
            regionLabel: 'متوفر بالأردن',
            size: '70 × 50',
            description: 'بورتريه يعكس مشاعر الندم — لحظة صمت أبدية.',
            images: ['img/store7.png'],   // ← PNG
        },
    ];

    /* ============================================================
       بناء المصفوفات
       ============================================================ */
    const galleryItems = GALLERY_IMAGES.map((filename) => ({
        title: 'Shahed',
        description: 'Original hand-painted portrait by Shahed Alasfar.',
        images: [`img/${filename}`],
    }));

    const specialItems = SPECIAL_IMAGES.map((filename) => ({
        title: 'Shahed',
        description: 'Original hand-painted portrait by Shahed Alasfar.',
        images: [`img/${filename}`],
    }));

    const storeProducts = STORE_PRODUCTS;

    /* ============================================================
       INTRO
       ============================================================ */
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

    /* ---------- Build Special ---------- */
    function buildSpecial() {
        const grid = document.getElementById('specialGrid');
        if (!grid) return;
        const frag = document.createDocumentFragment();

        specialItems.forEach((item, i) => {
            const el = document.createElement('div');
            el.className = 'special-item fade-in';
            el.style.setProperty('--i', i);
            el.innerHTML = `
                <div class="special-frame" data-tilt>
                    <div class="special-glow"></div>

                    <span class="special-badge">
                        <i class="fas fa-star"></i>Special
                    </span>

                    <div class="special-outer">
                        <span class="special-edge special-edge--top"></span>
                        <span class="special-edge special-edge--right"></span>
                        <span class="special-edge special-edge--bottom"></span>
                        <span class="special-edge special-edge--left"></span>

                        <div class="special-mat">
                            <span class="special-mat-line"></span>
                            <img src="${item.images[0]}"
                                 class="special-img"
                                 alt="${item.title} — Special ${i + 1}"
                                 loading="lazy"
                                 decoding="async">
                        </div>
                    </div>

                    <span class="special-shine"></span>

                    <span class="special-sparkle special-sparkle--tl"></span>
                    <span class="special-sparkle special-sparkle--tr"></span>
                    <span class="special-sparkle special-sparkle--bl"></span>
                    <span class="special-sparkle special-sparkle--br"></span>
                </div>
                <div class="special-label">shahed</div>
            `;
            el.addEventListener('click', () => openLightbox('special', i));
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
                    <span class="store-region-badge store-region-badge--${p.region}">
                        <i class="fas fa-check-circle"></i>
                        ${p.regionLabel}
                    </span>
                    <div class="store-overlay">
                        <p><i class="fas fa-search-plus"></i> Click to view details</p>
                    </div>
                </div>
                <div class="store-info">
                    <div class="store-info-head">
                        <h3 class="store-title">${p.title}</h3>
                        <span class="store-size-badge">${p.size}</span>
                    </div>
                    <p class="store-price">
                        <i class="fas fa-tag"></i>
                        <bdi class="price-value">${p.priceValue}</bdi>
                        <bdi class="price-currency">${p.priceCurrency}</bdi>
                    </p>
                    <p class="store-description">${p.description}</p>
                    <div class="store-cta">
                        <i class="fab fa-instagram"></i>
                        Order via Instagram
                    </div>
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

    function getArrForMode(mode) {
        if (mode === 'store')   return storeProducts;
        if (mode === 'special') return specialItems;
        return galleryItems;
    }

    function openLightbox(mode, index) {
        cacheLightbox();
        if (!lb.root) return;
        lb.mode      = mode;
        lb.index     = index;
        lb.lastFocus = document.activeElement;
        const arr    = getArrForMode(mode);
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
        const arr = getArrForMode(lb.mode);
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
                <p class="gallery-product-price">
                    <i class="fas fa-tag"></i>
                    <bdi class="price-value">${p.priceValue}</bdi>
                    <bdi class="price-currency">${p.priceCurrency}</bdi>
                </p>
                <div class="gallery-product-meta">
                    <span class="gallery-meta-badge gallery-meta-badge--size">
                        <i class="fas fa-ruler-combined"></i> ${p.size}
                    </span>
                    <span class="gallery-meta-badge gallery-meta-badge--${p.region}">
                        <i class="fas fa-check-circle"></i> ${p.regionLabel}
                    </span>
                </div>
                <p class="gallery-product-description">${p.description}</p>
                <a href="https://www.instagram.com/s.hahed_alasfar" target="_blank" rel="noopener" class="store-btn">Order via Instagram</a>
            `;
        } else if (lb.mode === 'special') {
            const g = specialItems[lb.index];
            lb.info.innerHTML = `
                <h3 class="gallery-product-title">${g.title}</h3>
                <p class="gallery-product-description">${g.description}</p>
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
        buildSpecial();
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
