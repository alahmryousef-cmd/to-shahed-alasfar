
(function () {
    'use strict';

    const INSTAGRAM = 'https://www.instagram.com/s.hahed_alasfar';

    const GALLERY = [
        { key: 'art1',  alt: 'Hand-painted leather bag with an orange and blue portrait of a bearded man' },
        { key: 'art2',  alt: 'Oil portrait of a bearded man on an easel, with brushes and a palette beside it' },
        { key: 'art3',  alt: 'Black and white ink portraits on a mirrored panel beside small canvases of hands' },
        { key: 'art4',  alt: 'Four small canvases of hands holding red thread, hung on a wall' },
        { key: 'art5',  alt: 'Painted stone-like portrait bust on denim' },
        { key: 'art6',  alt: 'Black ink figures painted across a cream jacket' },
        { key: 'art7',  alt: 'Pencil portrait of an elderly man with a long beard' },
        { key: 'art8',  alt: 'Horse head mural painted on a brick wall' },
        { key: 'art9',  alt: 'Wallet hand-painted with a white horse, resting in its box' },
        { key: 'art10', alt: 'Painting of three skulls crossed by red bars on a grey textured ground' },
        { key: 'art11', alt: 'Line drawing of a figure with hands on its face on a mirror, beside small painted portraits' },
        { key: 'art12', alt: 'White tumbler hand-painted with a black and white wave illustration' },
        { key: 'art13', alt: 'Cream handbag hand-painted with a pink lily' },
        { key: 'art14', alt: 'Oil portrait of a man looking upward in warm, dark light' },
        { key: 'art15', alt: 'White handbag hand-painted with swirling blue night-sky patterns' },
    ].map((g) => ({ images: [g.key], alt: g.alt, label: '' }));

    const STORE = [
        {
            title: 'مرآة الفنانين',
            priceValue: '1300',
            priceCurrency: '﷼',
            region: 'sa',
            regionLabel: 'متوفر بالسعودية',
            size: '100 × 60',
            description: 'عمل فني على مرآة يجمع ملامح وجوه فنية خالدة بالأبيض والأسود.',
            images: ['store1'],
        },
        {
            title: 'الأيدي والخيوط الحمراء',
            priceValue: '770',
            priceCurrency: '﷼',
            region: 'sa',
            regionLabel: 'متوفر بالسعودية',
            size: '40 × 40 (×4 قطع)',
            description: 'عمل فني من أربع لوحات تتشابك بينها الخيوط الحمراء.',
            images: ['store3', 'store3-1'],
        },
        {
            title: 'فيودور دوستويفسكي',
            priceValue: '450',
            priceCurrency: '﷼',
            region: 'sa',
            regionLabel: 'متوفر بالسعودية',
            size: '60 × 40',
            description: 'بورتريه عملاق الأدب الروسي: فيودور دوستويفسكي.',
            images: ['store4', 'store4-1'],
        },
        {
            title: 'Flamingo Night',
            priceValue: '850',
            priceCurrency: '﷼',
            region: 'sa',
            regionLabel: 'متوفر بالسعودية',
            size: '90 × 70',
            description: '',
            images: ['store5'],
        },
        {
            title: 'Rays of Light',
            priceValue: '75',
            priceCurrency: 'د.أ',
            region: 'jo',
            regionLabel: 'متوفر بالأردن',
            size: '70 × 50',
            description: '',
            images: ['store6'],
        },
        {
            title: 'Regret',
            priceValue: '85',
            priceCurrency: 'د.أ',
            region: 'jo',
            regionLabel: 'متوفر بالأردن',
            size: '70 × 50',
            description: '',
            images: ['store7'],
        },
    ];


    const TRAIL = ['art1', 'special3', 'art4', 'art14', 'art15', 'art8', 'art5', 'special2', 'art13', 'art3', 'art10', 'art7'];


    const STORY = {
        portrait: {
            key: 'shahed',
            alt: 'Portrait of Shahed Alasfar, with short dark hair and bangs, smiling slightly with her arms crossed, in a denim shirt',
        },
        child: {
            key: 'artchild',
            alt: 'Childhood drawing by Shahed: a smiling girl with red hair beside a house, two flowers and a tree, with a bee, a heart and a sun above',
        },
    };


    const WORKSHOPS = {
        posters: [
            { key: 'poster1', label: 'Workshop One',
              alt: 'Poster for the oil colours workshop at The Cultural House, Damam Public Library, Dammam: Saturday 16/8, 6:00 to 8:00 PM, for youth and adults, with an easel holding a portrait of a bearded man' },
            { key: 'poster2', label: 'Workshop Two',
              alt: 'Poster for Pass the Palette with Shahed, a collaborative canvas painting experience guided by an artist, Saturday 29 Aug at 18:00, with a line drawing of an easel and a table' },
        ],
        ws1: [
            { key: 'workshop1-1', alt: 'A finished oil portrait of a bearded man on an easel beside a teal chair, with a paint box on a table' },
            { key: 'workshop1-2', alt: 'Participants painting at easels in a bright room with floor-to-ceiling windows at dusk' },
            { key: 'workshop1-3', alt: 'Participants seated at easels and tables, painting during the oil colours workshop' },
            { key: 'workshop1-4', alt: 'The instructor speaking to participants in the workshop room, with easels in the foreground' },
            { key: 'workshop1-5', alt: 'A paint box and easel in the foreground of a room of tables and chairs beside a glass wall' },
            { key: 'workshop1-6', alt: 'The workshop room set out with easels, chairs and tables before the session' },
            { key: 'workshop1-7', alt: 'A small oil portrait on an easel next to a teal chair and a table of painting supplies' },
        ],
        ws2: [
            { key: 'workshop2-1',   alt: 'A woman in a beige blazer painting on a white canvas at a cafe table' },
            { key: 'workshop2-2',   alt: 'A woman in a beige blazer painting at a table, with a paint palette and a lit candle beside her' },
            { key: 'workshop2-4',   alt: 'A cafe table set with a blank canvas, a paint palette and a vase of flowers' },
            { key: 'workshop2-5',   alt: 'Two smiling people posing with thumbs up at the workshop' },
            { key: 'workshop2-6',   alt: 'Guests bending over canvases at tables in a bright cafe during the workshop' },
            { key: 'workshop2-7',   alt: 'A woman in a beige blazer painting on a canvas, seen from the side of the table' },
            { key: 'workshop2-8',   alt: 'An overhead view of a table covered with paint palettes, flowers and colourful canvases being painted' },
            { key: 'workshop2-9',   alt: 'A blank canvas and a paint palette on a table with a pink bottle and a candle' },
            { key: 'workshop2-10',  alt: 'Participants painting around a long table with palettes, snacks and finished flower paintings' },
            { key: 'workshop2-11',  alt: 'A participant painting a small figure on a white canvas' },
            { key: 'workshop2-13',  alt: 'An overhead view of colourful canvases with trees, sky and furniture drawings on a cafe table' },
            { key: 'workshop2-13b', alt: 'Four people wearing lanyards standing together in the cafe' },
            { key: 'workshop2-14',  alt: 'A group of participants holding their finished paintings outside the venue in the evening' },
        ],
    };

    const TEASER = ['art1', 'art14', 'art4', 'art15', 'art8', 'art5', 'art13', 'art3'];


    const COUNTRY = {
        sa: { code: 'SA', name: 'Saudi Arabia' },
        jo: { code: 'JO', name: 'Jordan' },
    };

    const M = window.IMAGE_MANIFEST || {};
    const entry = (key) => {
        const e = M[key];
        if (!e) return null;
        return e.alias ? Object.assign({ key: e.alias }, M[e.alias]) : Object.assign({ key }, e);
    };
    const Img = {
        has: (key) => !!entry(key),
        dims: (key) => { const e = entry(key); return e ? { w: e.w, h: e.h, ratio: e.w / e.h } : { w: 4, h: 3, ratio: 4 / 3 }; },
        url: (key, w) => { const e = entry(key); return e ? `img/opt/${e.key}-${w}.webp` : ''; },
        widths: (key) => { const e = entry(key); return e ? e.widths : []; },
        smallest: (key) => { const w = Img.widths(key); return Img.url(key, w[0]); },
        largest: (key) => { const w = Img.widths(key); return Img.url(key, w[w.length - 1]); },
        srcset: (key) => Img.widths(key).map((w) => `${Img.url(key, w)} ${w}w`).join(', '),
    };

    const isArabic = (s) => /[\u0600-\u06FF]/.test(s || '');

    window.SITE = { INSTAGRAM, GALLERY, STORE, WORKSHOPS, TRAIL, TEASER, STORY, COUNTRY, Img, isArabic };
})();
