gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', function() {
    const heroSection = document.querySelector('.hero-section');
    const nav = document.querySelector('nav');

    gsap.timeline({
        scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: '+=500%',
            scrub: true,
            pin: true
        }
    }).to('.canvas-container-inner', {
        width: ()=> `${heroSection.offsetWidth}px`,
        duration: 1,
        ease: 'power2.out'
    })
    .from('.nav-menu-dropdown-col.left, .nav-menu-dropdown-col.right', {
        yPercent: -100,
        duration: 0.25,
        ease: 'none'
    }, "-=.25")
    .from('.nav-menu-dropdown-col.center', {
        yPercent: 100,
        duration: 0.25,
        ease: 'none',
    }, "<");
});