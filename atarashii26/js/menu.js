document.addEventListener('DOMContentLoaded', () => {
    const mobileBreakpoint = 991;
    const menuOptions = document.querySelectorAll('.nav-menu-dropdown-col');
    const dropdownContainer = document.querySelector('.nav-menu-dropdown-container');
    const navMenuToggle = document.querySelector('.nav-menu-toggle-wrapper');
    const nav = document.querySelector('nav');

    menuOptions.forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (nav.classList.contains('ready')) {
                let goTo = anchor.getAttribute('data-go-to');
                const targetElement = document.getElementById(goTo);

                lenis.start();
                
                if (targetElement && window.lenis) {
                    window.lenis.scrollTo(targetElement);
                }

                dropdownContainer.classList.add("hide");
                closeMenu();
            }

        });
    });


    navMenuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!nav.classList.contains('open')) {
            // Animate in and add 'open' class
            openMenu();
        } else {
            // Animate out and remove 'open' class
            closeMenu();
        }
    });

    function openMenu() {
        console.log("Opening menu");
        nav.classList.add('open');
        document.body.classList.add('toggle-btn-expanded');
        document.body.classList.add('menu-open');
        dropdownContainer.classList.remove('hide');

        // desktop menu reveal
        if (window.innerWidth > mobileBreakpoint) {
            gsap.timeline()
                .to('.nav-menu-dropdown-container', {
                    opacity: 1,
                    duration: 0
                })
                .from('.nav-menu-dropdown-col.left, .nav-menu-dropdown-col.right', {
                    delay: .1,
                    yPercent: -100,
                    duration: 0.25,
                    ease: 'none'
                }, "<")
                .from('.nav-menu-dropdown-col.center', {
                    yPercent: 100,
                    duration: 0.25,
                    ease: 'none',
                }, "<");
        } else {
            // mobile menu reveal
            gsap.timeline()
                .to('.nav-menu-dropdown-container', {
                    opacity: 1,
                    duration: 0
                })
                .from('.nav-menu-dropdown-col.left, .nav-menu-dropdown-col.right', {
                    delay: .1,
                    xPercent: -100,
                    duration: 0.25,
                    ease: 'none'
                }, "<")
                .from('.nav-menu-dropdown-col.center', {
                    xPercent: 100,
                    duration: 0.25,
                    ease: 'none',
                }, "<");
        }

        // Start nav carousel animations
        const navCarousels = document.querySelectorAll('.nav-menu-dropdown-col .carousel_row');
        navCarousels.forEach(carousel => {
            if (carousel.carouselAnimation) {
                carousel.carouselAnimation.play();
                console.log("Animating carousel");
            }
        });

        lenis.stop();
    }

    function closeMenu() {
        console.log("Closing menu")
        nav.classList.remove('open');
        document.body.classList.remove('toggle-btn-expanded');
        document.body.classList.remove('menu-open');

        gsap.timeline()
            .to('.nav-menu-dropdown-container', {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.out',
                onComplete: () => {
                    // Reset opacity for next animation
                    gsap.set('.nav-menu-dropdown-col', { opacity: 1 });

                    // Pause nav carousel animations
                    const navCarousels = document.querySelectorAll('.nav-menu-dropdown-col .carousel_row');
                    navCarousels.forEach(carousel => {
                        if (carousel.carouselAnimation) {
                            carousel.carouselAnimation.pause();
                        }
                    });

                    lenis.start();
                }
            });
    }

    // Make functions globally accessible (similar to window.mobileBreakpoint)
    window.openMenu = openMenu;
    window.closeMenu = closeMenu;

});