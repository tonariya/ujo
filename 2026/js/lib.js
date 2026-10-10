// Shared libraries. GSAP, ScrollTrigger and SplitText are loaded as plain scripts from vendor/
// (see index.html) and exposed as globals; plugins are registered once here.
const { gsap, ScrollTrigger, SplitText } = window;

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
