document.addEventListener('DOMContentLoaded', () => {
    const menuOptions = document.querySelectorAll('.nav-menu-dropdown-col');
    const dropdownContainer = document.querySelector('.nav-menu-dropdown-container');
    const navMenuToggle = document.querySelector('.nav-menu-toggle');
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
        nav.classList.add('open');

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

        lenis.stop();
    }

    function closeMenu() {
        gsap.timeline()
            .to('.nav-menu-dropdown-container', {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.out',
                onComplete: () => {
                    nav.classList.remove('open');
                    // Reset opacity for next animation
                    gsap.set('.nav-menu-dropdown-col', { opacity: 1 });

                    lenis.start();
                }
            });
    }

});