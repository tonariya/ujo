document.addEventListener("DOMContentLoaded", (event) => {
    console.log("Doc Loaded");

    // swiper init
    // const swiper = new Swiper('.swiper', {
    //     direction: 'vertical',
    //     loop: true,
    // });

    // Lenis Scroll Init
    // Initialize Lenis
    const lenis = new Lenis({
        autoRaf: true,
        // infinite: true,
        // syncTouch: true
    });

    const canvas = document.querySelector('canvas');
    let previousScroll = 0;
    let negAcc = 1;

    // Hero Reveal
    gsap.from('.gline-vertical', {
        height: "0%",
        duration: 1.8,
        ease: "power4.out",
        stagger: .24
    });
    gsap.from('.gline-horizontal', {
        width: "0%",
        delay: .2,
        duration: 1.8,
        ease: "power4.out",
        stagger: .24
    });

    /* Carousel Horizontal */
    const wrapper = document.querySelector('.carousel-wrapper');

    let duration = 18;

    for (let i = 0; i < 2; i++) {
        let duplicate = wrapper.cloneNode(true);
        wrapper.parentNode.insertBefore(duplicate, wrapper.nextSibling);
    }

    let wrapperWidth = wrapper.offsetWidth;

    const wrapperList = gsap.utils.toArray('.carousel-wrapper');

    let looper = gsap.fromTo(wrapperList, {
        x: 0
    }, {
        repeat: -1,
        x: () => -wrapperWidth * (wrapperList.length - 2),
        duration: duration,
        ease: 'none'
    });

    window.addEventListener('scroll', () => {
        let currentScroll = window.scrollY;

        // scrolling down
        if (currentScroll > previousScroll) {
            console.log("going down");
            negAcc = -1;
        } else if (currentScroll < previousScroll) {
            // scrolling up
            console.log("going up");
            negAcc = 1;
        }

        previousScroll = currentScroll;

    });

    // Works Carousel Vertical
    const worksWrapper = document.querySelector('.swiper-wrapper');

    for (let i = 0; i < 2; i++) {
        let duplicate = worksWrapper.cloneNode(true);
        worksWrapper.parentNode.insertBefore(duplicate, worksWrapper.nextSibling);
    }

    let worksWrapperWidth = worksWrapper.offsetHeight;

    const worksWrapperList = gsap.utils.toArray('.swiper-wrapper');

    let workHover = false;

    let worksLooper = gsap.fromTo(worksWrapperList, {
        y: 0
    }, {
        repeat: -1,
        y: () => -worksWrapperWidth * (worksWrapperList.length - 2),
        duration: 6,
        ease: 'none'
    });

    const worksList = document.querySelectorAll(".swiper-slide");
    worksList.forEach((slide)=> {
        slide.addEventListener("mouseover", ()=> {
            workHover = true;
            worksLooper.pause();
        });

        slide.addEventListener("mouseout", ()=> {
            workHover = false;
            worksLooper.play();
        });
    });


    // get date
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const seconds = now.getUTCSeconds();

    function getUTCTimeInAMPM() {// Months are zero-based
        const now = new Date();

        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(now.getUTCDate()).padStart(2, '0');
        let hours = now.getUTCHours();
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');

        // determine AM or PM suffix
        const ampm = hours >= 12 ? 'pm' : 'am';

        // convert hours from 24-hour to 12-hour format
        hours = hours % 12;
        hours = hours ? String(hours).padStart(2, '0') : '12'; // the hour '0' should be '12'

        return `${hours}:${minutes}:${seconds}${ampm} UTC`;
    }

    const timeText = document.querySelector('.time-text');
    function updateClock() {
        timeText.textContent = getUTCTimeInAMPM();
    }

    // update the clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);




});