// Adaptive quality: measure the frame rate shortly after load and switch to a lighter mode on
// devices that struggle (lower-res sky, no foreground clouds, no focus blur, still grain).
// Force a mode with ?quality=full or ?quality=lite.
import { gsap } from './lib.js';

const SAMPLE_FRAMES = 60;
const LITE_BELOW_FPS = 40;

const listeners = new Set();
export const quality = { lite: false };

export function onQualityChange(fn) {
    listeners.add(fn);
}

function setLite(lite) {
    if (quality.lite === lite) return;
    quality.lite = lite;
    document.documentElement.classList.toggle('lite', lite);
    listeners.forEach((fn) => fn(quality));
}

const forced = new URLSearchParams(window.location.search).get('quality');

if (forced === 'lite' || forced === 'full') {
    setLite(forced === 'lite');
} else {
    // skip the first second (fonts, shader compile, first layout), then sample
    window.addEventListener('load', () => {
        setTimeout(() => {
            let frames = 0;
            let total = 0;

            const sample = (time, deltaTime) => {
                total += deltaTime;
                if (++frames < SAMPLE_FRAMES) return;
                gsap.ticker.remove(sample);
                setLite(1000 / (total / frames) < LITE_BELOW_FPS);
            };

            gsap.ticker.add(sample);
        }, 1000);
    });
}
