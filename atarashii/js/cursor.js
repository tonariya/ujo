const cursorFollower = document.querySelector('.cursor-follower');
const cursorFollowerInner = document.querySelector('.cursor-follower-inner');
const cursorFollowerInnerFade = document.querySelector('.cursor-follower-inner.fade');

const offset = 10;

// Create optimized GSAP quickTo functions for smooth cursor following
const xTo = gsap.quickTo(cursorFollower, 'x', { duration: 0.6, ease: 'power3.out' });
const yTo = gsap.quickTo(cursorFollower, 'y', { duration: 0.6, ease: 'power3.out' });

// Track mouse position and update cursor follower
document.addEventListener('mousemove', (e) => {
    xTo(e.clientX + offset);
    yTo(e.clientY + offset * .85);
});

// Click animation with water ripple effect
// document.addEventListener('click', () => {
//     gsap.timeline()
//         .set(cursorFollowerInnerFade, {
//             opacity: 1
//         })
//         .to(cursorFollowerInnerFade, {
//             width: "2.5rem",
//             opacity: 0,
//             duration: 0.8,
//             ease: 'power2.out'
//         })
//         .set(cursorFollowerInnerFade, {
//             width: "1rem",
//         });
// });
