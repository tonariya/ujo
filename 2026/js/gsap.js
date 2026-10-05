gsap.registerPlugin(ScrollTrigger);

const mobileBreakpoint = 991;

window.mobileBreakpoint = mobileBreakpoint;

document.addEventListener('DOMContentLoaded', function () {
    const heroSection = document.querySelector('.hero-section');
    const nav = document.querySelector('nav');

    const heroTitle = document.querySelector('.hero-section h1');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    // hero screen transition (desktop and mobile)
    if (window.innerWidth > mobileBreakpoint) {
        gsap.timeline({
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: '+=500%',
                scrub: true,
                pin: true,
                // onEnter: () => {
                //     document.querySelectorAll('.nav-menu-dropdown-col').forEach((anchor) => {
                //         anchor.classList.remove('ready');
                //         document.body.classList.add('toggle-btn-expanded');
                //         document.body.classList.add('menu-open');
                //     });
                // },
                // onEnterBack: () => {
                //     document.querySelectorAll('.nav-menu-dropdown-col').forEach((anchor) => {
                //         anchor.classList.remove('ready');
                //         document.body.classList.remove('toggle-btn-expanded');
                //         document.body.classList.remove('menu-open');
                //     });
                // }
            }
        })
            .from('.cloud-canvas-container', {
                xPercent: 40,
                yPercent: -10,
                duration: .8,
                ease: 'power1.out'
            })
            .to('.cloud-canvas-container', {
                width: () => `${heroSection.offsetWidth+10}px`,
                height: () => `${heroSection.offsetHeight+10}px`,
                duration: 1,
                ease: 'power2.out',
            }, "-=.5")
            .to(heroSubtitle, {
                delay: .1,
                filter: 'blur(8px)',
                opacity: '0',
                duration: .8,
                scale: 1.5,
                // xPercent: -150,
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
        }).to('.cloud-canvas-container', {
            width: () => `${heroSection.offsetWidth + 10}px`,
            height: () => `${heroSection.offsetHeight}px`,
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
    const splitTextTitle = new SplitType(heroTitle, { types: 'chars' });
    const splitTextSubtitle = new SplitType(heroSubtitle, { types: 'lines' });

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
        .from(splitTextSubtitle.lines, {
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
            // scale: 1.5,
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
