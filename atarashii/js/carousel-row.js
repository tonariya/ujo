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
            ease: 'none'
        });
    });
});