// Continuous "floating space": depth parallax with focus in/out, scroll-linked text reveals,
// foreground clouds and the HUD. Everything here is an enhancement: the page reads fine without it.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.innerWidth <= (window.mobileBreakpoint || 991);

// Live location clock. TODO: confirm city/timezone
const LOCATION = { label: 'LIS', timeZone: 'Europe/Lisbon' };

document.addEventListener('DOMContentLoaded', () => {
    initHud();
    initBackToSky();

    // wait for fonts so text is split on its final line breaks
    document.fonts.ready.then(() => {
        if (!reduceMotion) {
            initTextReveals();
            initDepth();
            initDrift();
            initForegroundClouds();
        }

        ScrollTrigger.refresh();
    });
});


// DEPTH + FOCUS
// [data-depth] < 1 is far (slower, smaller as it leaves), > 1 is near (faster, grows as it leaves).
// Everything is sharp around the middle of the viewport and blurs/fades towards the edges.
function initDepth() {
    const floats = gsap.utils.toArray('[data-depth]');
    const range = () => isMobile() ? 60 : 180;

    floats.forEach((el) => {
        const depth = parseFloat(el.dataset.depth) || 1;
        // respect opacity set in CSS (labels, captions)
        const baseOpacity = parseFloat(getComputedStyle(el).opacity) || 1;

        const apply = (progress) => {
            const amp = (1 - depth) * range();
            // 0 around the viewport centre, 1 at either edge
            const edge = gsap.utils.clamp(0, 1, (Math.abs(progress - .5) * 2 - .4) / .6);

            gsap.set(el, {
                y: gsap.utils.interpolate(-amp, amp, progress),
                scale: 1 + edge * (depth - 1) * .3,
                opacity: baseOpacity * (1 - edge * .85),
            });
            // clear the inline filter when in focus so CSS filters (hover shadows etc.) still apply
            el.style.filter = edge > 0 ? `blur(${(edge * 10).toFixed(2)}px)` : '';
        };

        ScrollTrigger.create({
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => apply(self.progress),
            onRefresh: (self) => apply(self.progress),
        });
    });

    // measure untransformed positions
    ScrollTrigger.addEventListener('refreshInit', () => {
        gsap.set(floats, { clearProps: 'transform' });
    });
}


// Horizontal drift for large type, so it slides across instead of just rising
function initDrift() {
    gsap.utils.toArray('[data-drift="x"]').forEach((el) => {
        gsap.fromTo(el, { xPercent: 8 }, {
            xPercent: -6,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        });
    });
}


// Words surface as their paragraph scrolls up, and sink back when scrolling up again
function initTextReveals() {
    gsap.utils.toArray('[data-reveal="words"]').forEach((el) => {
        const split = new SplitType(el, { types: 'words' });

        gsap.fromTo(split.words, { yPercent: 60, opacity: 0 }, {
            yPercent: 0,
            opacity: 1,
            stagger: .05,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 45%', scrub: .6 },
        });
    });
}


// Soft cloud banks that pass in front of the content, faster than the scroll, forever
function initForegroundClouds() {
    const clouds = gsap.utils.toArray('.fg-cloud').map((el, i) => ({
        el,
        speed: 1.4 + i * .3,
        offset: i / 3 + Math.random() * .2,
        x: gsap.utils.random(-15, 55),
        h: el.offsetHeight,
    }));

    const measure = () => clouds.forEach((c) => { c.h = c.el.offsetHeight; });
    window.addEventListener('resize', measure);

    gsap.ticker.add(() => {
        const vh = window.innerHeight;
        const sy = window.scrollY;

        clouds.forEach((c) => {
            // each cloud crosses the screen roughly once every couple of viewports
            const span = vh * 2.5 + c.h;
            const pos = (((c.offset * span - sy * c.speed) % span) + span) % span;
            gsap.set(c.el, { y: pos - c.h, xPercent: c.x });
        });
    });
}


// HUD: current area, altitude readout, live clock, and colour switch once the sky takes over
function initHud() {
    const hud = document.querySelector('.hud');
    if (!hud) return;

    const areaEl = hud.querySelector('.hud-area');
    const altEl = hud.querySelector('.hud-alt');
    const timeEl = hud.querySelector('.hud-time');

    // clock
    const clock = new Intl.DateTimeFormat('en-GB', {
        timeZone: LOCATION.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const tick = () => { timeEl.textContent = `${LOCATION.label} ${clock.format(new Date())}`; };
    tick();
    setInterval(tick, 1000);

    // sky mode: the hero starts on paper, the HUD and foreground clouds switch once the sky fills the screen
    ScrollTrigger.create({
        start: () => window.innerHeight * .8,
        onEnter: () => document.body.classList.add('in-sky'),
        onLeaveBack: () => document.body.classList.remove('in-sky'),
    });

    // altitude: 12,000m at the top, touchdown at the bottom
    ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
            const alt = Math.round((1 - self.progress) * 12000 / 10) * 10;
            altEl.textContent = `ALT ${alt.toLocaleString('en-US').padStart(6, '0')}m`;
        },
    });

    // current area
    let currentArea = null;
    gsap.utils.toArray('[data-area]').forEach((area) => {
        ScrollTrigger.create({
            trigger: area,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
                if (self.isActive) currentArea = area;
                else if (currentArea === area) currentArea = null;
                areaEl.textContent = currentArea ? `— ${currentArea.dataset.area}` : '— SKY';
            },
        });
    });
}


// "back to the sky" uses Lenis so it glides through the whole descent
function initBackToSky() {
    const link = document.querySelector('.touchdown-back');
    if (!link) return;

    link.addEventListener('click', (e) => {
        if (!window.lenis) return;
        e.preventDefault();
        window.lenis.scrollTo(0, { duration: 3 });
    });
}
