gsap.registerPlugin(ScrollTrigger);

const mobileBreakpoint = 991;

window.mobileBreakpoint = mobileBreakpoint;

document.addEventListener('DOMContentLoaded', function () {
    const heroSection = document.querySelector('.hero-section');
    const nav = document.querySelector('nav');

    // hero screen transition (desktop and mobile)
    if (window.innerWidth > mobileBreakpoint) {
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
        }).to('.canvas-container-inner', {
            width: () => `${heroSection.offsetWidth}px`,
            duration: 1,
            ease: 'power2.out',
        })
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
            }, "-=.25")
            .fromTo('.nav-menu-dropdown-col.center', {
                yPercent: 100
            }, {
                yPercent: 0,
                duration: 0.25,
                ease: 'none',
                onComplete: () => {
                    nav.classList.add('ready');
                    document.querySelector('nav').classList.add('open');

                    // stop lenis - only when scrolling down
                    lenis.stop();
                },
                onReverseComplete: () => {
                    nav.classList.remove('ready');
                    document.querySelector('nav').classList.remove('open');
                }
            }, "<");
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
        }).to('.canvas-container-inner', {
            height: () => `${heroSection.offsetHeight}px`,
            duration: 1,
            ease: 'power2.out',
        })
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
                    document.querySelector('nav').classList.add('open');

                    // stop lenis - only when scrolling down
                    lenis.stop();
                },
                onReverseComplete: () => {
                    nav.classList.remove('ready');
                    document.querySelector('nav').classList.remove('open');
                }
            }, "<");
    }

        ease: 'power2.out'
    })



    const fadeInSections = document.querySelectorAll('.section-fade-in');

    // generic section fade-in
    fadeInSections.forEach((section) => {

        gsap.from(section, {
            opacity: 0,
            duration: .8,
            ease: 'power2.out',
            scrollTrigger: {
                markers: true,
                trigger: section,
                start: 'top 40%',
                scrub: false,
                toggleActions: 'play reverse play reverse'
            }
        });

    });
});