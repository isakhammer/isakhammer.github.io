(() => {
    const panel = document.getElementById('panel-em-1');
    if (!panel) return;
    const canvas = document.getElementById('em1Canvas');
    const ctx = canvas.getContext('2d');
    const showField = document.getElementById('em1-field');
    const anchors = [
        { x: 1.2, y: 1.65, q: -2 },
        { x: 3.1, y: 1.05, q: -1 },
        { x: 4.5, y: 2.35, q: -1 }
    ];
    let nodes = [];
    let baseline = [];
    let width = 0;
    let height = 0;
    let frame = null;
    let lastFrame = null;
    let active = false;
    let pointer = null;
    let offset = { x: 0, y: 0 };

    function geometry() {
        const scale = Math.min(width / 6, height / 3.4);
        return { scale, left: (width - 6 * scale) / 2, top: (height - 3.4 * scale) / 2 };
    }
    function electricForce(index) {
        let x = 0;
        let y = 0;
        nodes.forEach((other, j) => {
            if (index === j) return;
            const dx = nodes[index].x - other.x;
            const dy = nodes[index].y - other.y;
            const denominator = (dx * dx + dy * dy + 0.14 ** 2) ** 1.5;
            // Two negative charges repel. The soft core keeps close drags finite.
            const chargeProduct = nodes[index].q * other.q;
            x += 0.55 * chargeProduct * dx / denominator;
            y += 0.55 * chargeProduct * dy / denominator;
        });
        return { x, y };
    }
    function advance(dt) {
        let unsettled = false;
        const steps = Math.max(1, Math.ceil(dt * 160));
        const h = dt / steps;
        for (let step = 0; step < steps; step++) {
            const forces = nodes.map((_, i) => i ? electricForce(i) : { x: 0, y: 0 });
            for (let i = 1; i < nodes.length; i++) {
                const node = nodes[i];
                let ax = forces[i].x - baseline[i].x - 4 * (node.x - anchors[i].x) - 3 * node.vx;
                let ay = forces[i].y - baseline[i].y - 4 * (node.y - anchors[i].y) - 3 * node.vy;
                const limit = Math.min(1, 16 / (Math.hypot(ax, ay) || 1));
                ax *= limit;
                ay *= limit;
                node.vx += ax * h;
                node.vy += ay * h;
                node.x += node.vx * h;
                node.y += node.vy * h;
                if (node.x < 0.18 || node.x > 5.82) { node.x = Math.max(0.18, Math.min(5.82, node.x)); node.vx *= -0.2; }
                if (node.y < 0.18 || node.y > 3.22) { node.y = Math.max(0.18, Math.min(3.22, node.y)); node.vy *= -0.2; }
                if (Math.hypot(node.vx, node.vy) > 0.0003 || Math.hypot(ax, ay) > 0.003) unsettled = true;
            }
        }
        return unsettled;
    }
    function fieldArrows(g) {
        const spacing = width < 450 ? 42 : 56;
        ctx.strokeStyle = '#2563ebaa';
        ctx.lineWidth = 1.6;
        for (let py = 20; py < height - 15; py += spacing) {
            for (let px = 20; px < width - 15; px += spacing) {
                const x = (px - g.left) / g.scale;
                const y = (py - g.top) / g.scale;
                if (nodes.some((n, i) => Math.hypot(n.x - x, n.y - y) * g.scale < (i === 0 ? 30 : 22))) continue;
                let ex = 0;
                let ey = 0;
                nodes.forEach(n => {
                    const dx = n.x - x;
                    const dy = n.y - y;
                    const divisor = (dx * dx + dy * dy + 0.14 ** 2) ** 1.5;
                    ex += -n.q * dx / divisor;
                    ey += -n.q * dy / divisor;
                });
                const magnitude = Math.hypot(ex, ey);
                if (magnitude < 1e-6) continue;
                const length = Math.min(spacing * 0.72, 12 + 6 * Math.log1p(magnitude));
                const dx = ex / magnitude;
                const dy = ey / magnitude;
                const tx = px + length * dx / 2;
                const ty = py + length * dy / 2;
                ctx.beginPath();
                ctx.moveTo(px - length * dx / 2, py - length * dy / 2);
                ctx.lineTo(tx, ty);
                ctx.moveTo(tx - 6 * dx - 4 * dy, ty - 6 * dy + 4 * dx);
                ctx.lineTo(tx, ty);
                ctx.lineTo(tx - 6 * dx + 4 * dy, ty - 6 * dy - 4 * dx);
                ctx.stroke();
            }
        }
    }
    function draw() {
        if (!width || panel.hidden) return;
        ctx.clearRect(0, 0, width, height);
        const g = geometry();
        if (showField.checked) fieldArrows(g);
        nodes.forEach((node, i) => {
            const x = g.left + node.x * g.scale;
            const y = g.top + node.y * g.scale;
            if (i === 0) {
                ctx.beginPath();
                ctx.arc(x, y, 28, 0, 2 * Math.PI);
                ctx.fillStyle = '#dc262615';
                ctx.fill();
                ctx.strokeStyle = '#dc262650';
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(x, y, i === 0 ? 18 : 11, 0, 2 * Math.PI);
            ctx.fillStyle = i === 0 ? '#dc2626' : '#6d28d9';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${i === 0 ? 13 : 11}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i === 0 ? '−2q' : '−q', x, y);
        });
    }
    function tick(now) {
        frame = null;
        if (panel.hidden || document.hidden) { lastFrame = null; return; }
        if (lastFrame !== null && active) active = advance(Math.min(0.04, (now - lastFrame) / 1000));
        lastFrame = now;
        draw();
        if (active || pointer !== null) schedule();
    }
    function schedule() {
        if (frame === null && !panel.hidden && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function move(x, y) {
        nodes[0].x = Math.max(0.2, Math.min(5.8, x));
        nodes[0].y = Math.max(0.2, Math.min(3.2, y));
        active = true;
        schedule();
    }
    function position(event) {
        const bounds = canvas.getBoundingClientRect();
        const g = geometry();
        return { x: (event.clientX - bounds.left - g.left) / g.scale, y: (event.clientY - bounds.top - g.top) / g.scale };
    }
    function endDrag() {
        if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
        pointer = null;
        canvas.style.cursor = 'default';
    }
    canvas.addEventListener('pointerdown', event => {
        if (event.button !== 0 || pointer !== null) return;
        const p = position(event);
        if (Math.hypot(p.x - nodes[0].x, p.y - nodes[0].y) * geometry().scale > 32) return;
        event.preventDefault();
        canvas.focus({ preventScroll: true });
        pointer = event.pointerId;
        offset = { x: p.x - nodes[0].x, y: p.y - nodes[0].y };
        canvas.setPointerCapture(pointer);
        canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', event => {
        const p = position(event);
        if (event.pointerId === pointer) { event.preventDefault(); move(p.x - offset.x, p.y - offset.y); }
        else canvas.style.cursor = Math.hypot(p.x - nodes[0].x, p.y - nodes[0].y) * geometry().scale < 32 ? 'grab' : 'default';
    });
    canvas.addEventListener('pointerup', event => { if (event.pointerId === pointer) endDrag(); });
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('lostpointercapture', () => { pointer = null; canvas.style.cursor = 'default'; });
    canvas.addEventListener('keydown', event => {
        const shifts = { ArrowUp: [0, -0.18], ArrowDown: [0, 0.18], ArrowLeft: [-0.18, 0], ArrowRight: [0.18, 0] };
        if (!shifts[event.key]) return;
        event.preventDefault();
        move(nodes[0].x + shifts[event.key][0], nodes[0].y + shifts[event.key][1]);
    });
    function reset() {
        endDrag();
        nodes = anchors.map(anchor => ({ ...anchor, vx: 0, vy: 0 }));
        baseline = nodes.map((_, i) => electricForce(i));
        active = false;
        lastFrame = null;
        draw();
    }
    document.getElementById('em1-reset').addEventListener('click', reset);
    showField.addEventListener('change', draw);
    function resize() {
        if (panel.hidden) return;
        const bounds = canvas.getBoundingClientRect();
        width = bounds.width;
        height = bounds.height;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
    }
    new ResizeObserver(resize).observe(canvas);
    new MutationObserver(() => {
        lastFrame = null;
        if (panel.hidden) endDrag();
        else { resize(); if (active) schedule(); }
    }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('visibilitychange', () => {
        lastFrame = null;
        if (document.hidden) endDrag();
        else if (active) schedule();
    });
    reset();
    resize();
})();
