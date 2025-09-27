document.addEventListener('DOMContentLoaded', function () {
    const wrappers = document.querySelectorAll('.carousel_row');
    let durationDefault = 30;


    // set duration based on screen size (default value above)
    if (window.innerWidth <= 991) {
        durationDefault = 45;
    }

    let duration = durationDefault;

    // clone original wrapper i number of times and append it to container
    wrappers.forEach((wrapper) => {

        let wrapperInner = wrapper.querySelector('.carousel_row_inner');

        for (let i = 0; i < 2; i++) {
            let duplicate = wrapperInner.cloneNode(true);
            wrapperInner .parentNode.insertBefore(duplicate, wrapperInner.nextSibling);
        }

        let wrapperWidth = wrapperInner.offsetWidth;

        const wrapperList = gsap.utils.toArray(wrapper.querySelectorAll('.carousel_row_inner'));


        // check for custom duration
        if(wrapper.getAttribute('loopDuration') !== null) {
            duration = wrapper.getAttribute('loopDuration');
        } else {
            duration = durationDefault;
        }

        // loop animation
        let looper = gsap.fromTo(wrapperList, {
            x: 0
        }, {
            repeat: -1,
            x: () => {
                if (wrapper.classList.contains('inverted')) {
                    return -wrapperWidth * (wrapperList.length - 2)
                } else {
                    return wrapperWidth * (wrapperList.length - 2)
                }
            },
            duration: duration,
            ease: 'none',
            paused: true
        });

        // Store animation reference on wrapper for external control
        wrapper.carouselAnimation = looper;
    });

    // Add ScrollTriggers after a delay to ensure DOM is fully settled
    setTimeout(() => {
        // ScrollTrigger for About section carousel
        ScrollTrigger.create({
        trigger: "#about",
        start: "top bottom",
        end: "bottom top",
        markers: true,
        onEnter: () => {
            const aboutCarousel = document.querySelector('#about .carousel_row');
            if (aboutCarousel && aboutCarousel.carouselAnimation) {
                aboutCarousel.carouselAnimation.play();
            }
        },
        onLeave: () => {
            const aboutCarousel = document.querySelector('#about .carousel_row');
            if (aboutCarousel && aboutCarousel.carouselAnimation) {
                aboutCarousel.carouselAnimation.pause();
            }
        },
        onEnterBack: () => {
            const aboutCarousel = document.querySelector('#about .carousel_row');
            if (aboutCarousel && aboutCarousel.carouselAnimation) {
                aboutCarousel.carouselAnimation.play();
            }
        },
        onLeaveBack: () => {
            const aboutCarousel = document.querySelector('#about .carousel_row');
            if (aboutCarousel && aboutCarousel.carouselAnimation) {
                aboutCarousel.carouselAnimation.pause();
            }
        }
    });

    // ScrollTrigger for Works section carousels
    ScrollTrigger.create({
        trigger: "#works",
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
            const worksCarousels = document.querySelectorAll('.works-carousel .carousel_row');
            worksCarousels.forEach(carousel => {
                if (carousel.carouselAnimation) {
                    carousel.carouselAnimation.play();
                }
            });
        },
        onLeave: () => {
            const worksCarousels = document.querySelectorAll('.works-carousel .carousel_row');
            worksCarousels.forEach(carousel => {
                if (carousel.carouselAnimation) {
                    carousel.carouselAnimation.pause();
                }
            });
        },
        onEnterBack: () => {
            const worksCarousels = document.querySelectorAll('.works-carousel .carousel_row');
            worksCarousels.forEach(carousel => {
                if (carousel.carouselAnimation) {
                    carousel.carouselAnimation.play();
                }
            });
        },
        onLeaveBack: () => {
            const worksCarousels = document.querySelectorAll('.works-carousel .carousel_row');
            worksCarousels.forEach(carousel => {
                if (carousel.carouselAnimation) {
                    carousel.carouselAnimation.pause();
                }
            });
        }
    });

        // Refresh ScrollTrigger after setup
        ScrollTrigger.refresh();
    }, 2000);
});