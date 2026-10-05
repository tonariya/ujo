// works.js — Interactive floating window for the Works section

const worksList      = document.getElementById('worksList');
const floatingWindow = document.getElementById('worksFloatingWindow');
const windowTitle    = document.getElementById('worksWindowTitle');

if (worksList && floatingWindow) {

    const listItems = [...worksList.querySelectorAll('.works-list-item')];
    const panels    = [...floatingWindow.querySelectorAll('.works-panel')];
    const cursor    = document.querySelector('.cursor-follower');

    // Linear interpolation helper
    const lerp = (a, b, t) => a + (b - a) * t;

    // Animation state — all targets default to the idle oscillation
    const s = {
        tx: 0,   ty: 0,
        rotY: 0, rotZ: 0,
        targetX: 0,    targetY: 0,
        targetRotY: 0, targetRotZ: 0,
        isHovered: false,
    };

    function applyTransform() {
        floatingWindow.style.transform =
            `perspective(900px) translateX(${s.tx}px) translateY(${s.ty}px) rotateY(${s.rotY}deg) rotateZ(${s.rotZ}deg)`;
    }

    function showPanel(id) {
        panels.forEach(p =>
            p.classList.toggle('works-panel--active', p.dataset.panel === String(id))
        );
    }

    function getWindowCenterY() {
        const r = floatingWindow.getBoundingClientRect();
        return r.top + r.height / 2;
    }

    // RAF loop — idle float when not hovered, magnetic drift when hovered
    (function tick() {
        if (!s.isHovered) {
            const t = Date.now() / 1000;
            s.targetX    = 0;
            s.targetY    = Math.sin(t * 0.55) * 10;
            s.targetRotY = Math.sin(t * 0.4)  * 3;
            s.targetRotZ = Math.sin(t * 0.35) * 1.8;
        }

        s.tx   = lerp(s.tx,   s.targetX,    0.06);
        s.ty   = lerp(s.ty,   s.targetY,    0.06);
        s.rotY = lerp(s.rotY, s.targetRotY, 0.06);
        s.rotZ = lerp(s.rotZ, s.targetRotZ, 0.06);

        applyTransform();
        requestAnimationFrame(tick);
    })();

    // List item — hover in
    listItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            s.isHovered = true;

            const itemRect   = item.getBoundingClientRect();
            const itemCenterY = itemRect.top + itemRect.height / 2;
            const deltaY      = itemCenterY - getWindowCenterY();

            s.targetX    =  20;
            s.targetY    =  deltaY * 0.1;
            s.targetRotY = -6;
            s.targetRotZ =  deltaY * 0.008;

            showPanel(item.dataset.index);

            if (windowTitle) {
                windowTitle.textContent =
                    item.querySelector('.works-item-title')?.textContent ?? 'preview.exe';
            }

            cursor?.classList.add('cursor--works-hover');
        });
    });

    // List — mouse leaves entirely, reset everything
    worksList.addEventListener('mouseleave', () => {
        s.isHovered  = false;
        s.targetX    = 0;
        s.targetY    = 0;
        s.targetRotY = 0;
        s.targetRotZ = 0;

        showPanel('default');

        if (windowTitle) windowTitle.textContent = 'preview.exe';

        cursor?.classList.remove('cursor--works-hover');
    });

}
