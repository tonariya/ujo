import { gsap, ScrollTrigger, SplitText } from './lib.js';

const mobileBreakpoint = 991;

window.mobileBreakpoint = mobileBreakpoint;

document.addEventListener('DOMContentLoaded', function () {
    const heroSection = document.querySelector('.hero-section');
    const nav = document.querySelector('nav');

    const heroTitle = document.querySelector('.hero-section h1');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    // desktop sky box: 35% of the viewport width, always 4:3
    const boxWidth = () => window.innerWidth * .35;
    const boxHeight = () => boxWidth() * 3 / 4;

    // hero screen transition (desktop and mobile)
    if (window.innerWidth > mobileBreakpoint) {
        gsap.timeline({
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: '+=500%',
                scrub: true,
                pin: true,
                invalidateOnRefresh: true,
            }
        })
            // box offset: right of centre by 40% of its width, up by 10% of its height
            .from('.cloud-canvas-container', {
                '--ox': () => `${boxWidth() * .4}px`,
                '--oy': () => `${boxHeight() * -.1}px`,
                duration: .8,
                ease: 'power1.out'
            })
            // box size grows to cover the screen
            .fromTo('.cloud-canvas-container', {
                '--bw': () => `${boxWidth()}px`,
                '--bh': () => `${boxHeight()}px`,
            }, {
                '--bw': () => `${heroSection.offsetWidth + 10}px`,
                '--bh': () => `${heroSection.offsetHeight + 10}px`,
                duration: 1,
                ease: 'power2.out',
            }, "-=.5")
            .to(heroSubtitle, {
                delay: .1,
                filter: 'blur(8px)',
                opacity: '0',
                duration: .8,
                scale: 1.5,
                ease: 'power2.out'
            }, "<")
            .to(heroTitle, {
                filter: 'blur(12px)',
                opacity: '0',
                duration: .6,
                scale: 1.5,
                ease: 'power2.out'
            }, "<")
            .fromTo('.nav-menu-dropdown-col.left, .nav-menu-dropdown-col.right', {
                yPercent: -100,
            }, {
                yPercent: 0,
                duration: 0.25,
                ease: 'none',
                onStart: () => {
                    gsap.set('.nav-menu-dropdown-container', {
                        opacity: 1,
                    });
                }
            }, "-=.45")
            .fromTo('.nav-menu-dropdown-col.center', {
                yPercent: 100
            }, {
                yPercent: 0,
                duration: 0.25,
                ease: 'none',
                onComplete: () => {
                    nav.classList.add('ready');
                    window.openMenu();
                },
                onReverseComplete: () => {
                    nav.classList.remove('ready');
                    window.closeMenu();
                }
            }, "-=.4");
    } else {
        // Tablet devices and below
        gsap.timeline({
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: '+=500%',
                scrub: true,
                pin: true,
                invalidateOnRefresh: true,
                onEnter: () => {
                    document.querySelectorAll('.nav-menu-dropdown-col').forEach((anchor) => {
                        anchor.classList.remove('ready');
                    });
                },
                onEnterBack: () => {
                    document.querySelectorAll('.nav-menu-dropdown-col').forEach((anchor) => {
                        anchor.classList.remove('ready');
                    });
                }
            }
        }).fromTo('.cloud-canvas-container', {
            '--bw': () => `${window.innerWidth * .8}px`,
            '--bh': () => `${heroSection.offsetHeight * .55}px`,
        }, {
            '--bw': () => `${heroSection.offsetWidth + 10}px`,
            '--bh': () => `${heroSection.offsetHeight}px`,
            duration: 1,
            ease: 'power2.out',
        })
            .to(heroSubtitle, {
                delay: .1,
                filter: 'blur(8px)',
                opacity: '0',
                duration: .5,
                scale: 1.2,
                ease: 'power2.out'
            }, "<")
            .to(heroTitle, {
                filter: 'blur(12px)',
                opacity: '0',
                duration: .6,
                scale: 1.5,
                ease: 'power2.out'
            }, "-=.65")
            .fromTo('.nav-menu-dropdown-col.left, .nav-menu-dropdown-col.right', {
                xPercent: -100,
            }, {
                xPercent: 0,
                duration: 0.25,
                ease: 'none',
                onStart: () => {
                    gsap.set('.nav-menu-dropdown-container', {
                        opacity: 1,
                    });
                }
            }, "-=.25")
            .fromTo('.nav-menu-dropdown-col.center', {
                xPercent: 100
            }, {
                xPercent: 0,
                duration: 0.25,
                ease: 'none',
                onComplete: () => {
                    nav.classList.add('ready');
                    window.openMenu();
                },
                onReverseComplete: () => {
                    nav.classList.remove('ready');
                    window.closeMenu();
                }
            }, "<");
    }

    // hero text reveal (generic)
    const splitTextTitle = SplitText.create(heroTitle, { type: 'chars' });
    // the subtitle is a single line: animate it as one block (splitting broke it at the 年)
    const subtitleText = heroSubtitle.querySelector('p');

    gsap.timeline()
        .from(splitTextTitle.chars, {
            delay: .5,
            yPercent: 25,
            opacity: 0,
            duration: 1,
            stagger: 0.05,
            filter: 'blur(8px)',
            ease: 'power2.out'
        })
        .from(subtitleText, {
            yPercent: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            filter: 'blur(4px)',
            ease: 'power2.out'
        }, "-=.7");



    // works reveal
    const worksContainers = document.querySelectorAll('.works-window-container');

    gsap.timeline({
        scrollTrigger: {
            trigger: '.works-section',
            start: 'top center',
            scrub: false,
            toggleActions: 'play none none reverse'
        }
    })
        .to(worksContainers, {
            opacity: 0,
            duration: 0.02,
            stagger: 0.02,
            repeat: 5,
            yoyo: true,
            ease: 'linear'
        })
        .from(worksContainers, {
            delay: 0.2,
            yPercent: () => gsap.utils.random(-20, 50),
            xPercent: () => gsap.utils.random(-50, 50),
            width: '0px',
            duration: 0.25,
            stagger: 0.05,
            ease: 'power3.inOut'
        }, "-=.5")
        .fromTo('.works-carousel', {
            yPercent: 100,
            opacity: 0,
            filter: 'blur(8px)',
        }, {
            yPercent: 0,
            opacity: 1,
            filter: 'none',
            delay: .2,
            duration: 1,
            ease: 'power2.out'
        }, "<");


    ScrollTrigger.refresh();
});
