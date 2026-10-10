// Single entry point. Order matters: later modules rely on globals set by earlier ones
// (window.mobileBreakpoint from gsap.js, window.lenis from lenis.js, window.openMenu/closeMenu from menu.js).
import './cursor.js';
import './gsap.js';
import './lenis.js';
import './main2.js';     // sky shader
import './shape.js';     // menu toggle shape
import './menu.js';
import './carousel-row.js';
import './space.js';
