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
                    document.querySelector('nav').classList.add('open');

                    // stop lenis - only when scrolling down
                    lenis.stop();
                },
                onReverseComplete: () => {
                    nav.classList.remove('ready');
                    document.querySelector('nav').classList.remove('open');
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
        }).to('.canvas-container-inner', {
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



    const fadeInSections = document.querySelectorAll('.section-fade-in');

    // generic section fade-in
    // fadeInSections.forEach((section) => {

    //     gsap.from(section.querySelector('.padding-global'), {
    //         scale: 1.1,
    //         // yPercent: 15,
    //         // xPercent: -25,
    //         opacity: 0,
    //         filter: 'blur(14px)',
    //         duration: 1.2,
    //         ease: 'power3.out',
    //         scrollTrigger: {
    //             markers: true,
    //             trigger: section,
    //             start: 'top 40%',
    //             scrub: false,
    //             toggleActions: 'play reverse play reverse'
    //         }
    //     });

    // });


    // about reveal
    const aboutH2 = document.querySelector('.about-text-content h2');
    const aboutP = document.querySelector('.about-text-content p');
    const splitAboutH2 = new SplitType(aboutH2, { types: 'words,lines' });
    const splitAboutP = new SplitType(aboutP, { types: 'words,lines' });

    gsap.timeline({
        scrollTrigger: {
            trigger: '.about-text-content',
            start: 'top 35%',
            scrub: false,
            toggleActions: 'play none none reverse'
        }
    })
        .from('.about-text-content', {
            scale: 1.8,
            yPercent: 25,
            xPercent: -50,
            filter: 'blur(14px)',
            duration: 2,
            ease: 'power3.out'
        })
        .from(splitAboutH2.words, {
            duration: 1,
            yPercent: 50,
            opacity: 0,
            stagger: 0.1,
            ease: 'power3.out'
        }, '<')
        .from(splitAboutP.words, {
            delay: .1,
            yPercent: 50,
            opacity: 0,
            duration: .8,
            stagger: 0.01,
            ease: 'power3.out'
        }, "<")
        .from('#about .carousel_container', {
            yPercent: 80,
            opacity: 0,
            duration: 1.5,
            ease: 'power3.out'
        }, "-=.8");


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
        .from('.works-carousel', {
            // scale: 1.5,
            delay: .25,
            yPercent: 100,
            opacity: 0,
            filter: 'blur(8px)',
            duration: 1,
            ease: 'power2.out'
        })
        .to(worksContainers, {
            opacity: 0,
            duration: 0.025,
            stagger: 0.02,
            repeat: 5,
            yoyo: true,
            ease: 'linear'
        }, "<")
        .from(worksContainers, {
            delay: 0.2,
            yPercent: () => {
                return Math.random(-20, 50)
            },
            xPercent: () => {
                return Math.random(-50, 50)
            },
            width: '0px',
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.inOut'
        }, "<");


    // contacts reveal
    const contactH2 = document.querySelector('.contact-content h2');
    const contactP = document.querySelector('.contact-content p');
    const splitContactH2 = new SplitType(contactH2, { types: 'lines, words' });
    const splitContactP = new SplitType(contactP, { types: 'lines, words' });

    const contactTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '#contact',
            start: 'top center',
            scrub: false,
            toggleActions: 'play none none reverse'
        }
    })
        .from('.contact-content', {
            scale: 1.8,
            yPercent: 25,
            xPercent: -50,
            filter: 'blur(14px)',
            duration: 2,
            ease: 'power3.out'
        });

    // add line animations to the previous timeline
    splitContactH2.lines.forEach((line, index) => {
        contactTimeline.from(line.querySelectorAll('.word'), {
            duration: 1,
            yPercent: 50,
            opacity: 0,
            ease: 'power3.out'
        }, `-=${2 - (index * 0.1)}`);
    });

    splitContactP.lines.forEach((line, index) => {
        contactTimeline.from(line.querySelectorAll('.word'), {
            duration: 0.8,
            yPercent: 50,
            opacity: 0,
            ease: 'power3.out'
        }, `-=${1.8 - (index * 0.05)}`);
    });

    contactTimeline.from('.social-btn', {
        yPercent: 50,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 1,
        stagger: .05,
        ease: 'power3.out'
    }, "-=.8");

    ScrollTrigger.refresh();
});