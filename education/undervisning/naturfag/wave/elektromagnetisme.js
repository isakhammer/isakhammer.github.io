(() => {
function mountModel(panelId, prefix, receiverType) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const element = id => document.getElementById(id.replace(/^em/, prefix));
    const canvas = element('emCanvas');
    const ctx = canvas.getContext('2d');
    const play = element('em-play');
    const frequency = element('em-frequency');
    const slow = element('em-slow');
    const status = element('em-receiver-status');
    const number = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 2 });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const amplitudeControl = element('em-amplitude');
    const distanceControl = element('em-distance');
    const resonanceControl = receiverType === 'ring' ? element('em-resonance') : null;
    const resonanceLock = receiverType === 'ring' ? element('em-resonance-lock') : null;
    let amplitude = Number(amplitudeControl.value) / 100;
    const lightSpeed = 4.8;
    const integrationStep = 1 / 160;
    const initial = { x: 0, y: amplitude, vx: 0, vy: 0, ax: 0, ay: 0 };
    let running = true;
    let time = 0;
    let ticks = 0;
    let remainder = 0;
    let lastFrame = null;
    let frame = null;
    let width = 0;
    let height = 0;
    let receiverY = amplitude;
    let receiverVelocity = 0;
    let gapCharge = 0;
    let ringCurrent = 0;
    let sparkRemaining = 0;
    let sparkDirection = 1;
    let sparkCount = 0;
    // Relative circuit units: L = 1, C sets resonance; the gap breaks down at a
    // chosen voltage. These are teaching parameters, not air-breakdown data.
    const gapBreakdownVoltage = 1.3;
    const ringResistance = 0.6;
    function ringCapacitance() { return 1 / (2 * Math.PI * Number(resonanceControl.value)) ** 2; }
    let statusKey = '';
    let manual = { ...initial };
    let target = { x: initial.x, y: initial.y };
    let history = [{ ...initial }];
    let historyStart = 0;
    let firstChange = null;
    let pointer = null;
    let dragOffset = { x: 0, y: 0 };

    // Analytic oscillation, or the recorded trajectory of the manually moved charge.
    // Keeping past positions lets a distant receiver react at the correct time.
    function source(t) {
        if (t <= 0) return initial;
        if (Number(frequency.value) > 0) {
            const omega = 2 * Math.PI * Number(frequency.value);
            if (receiverType === 'ring') {
                // A smooth start avoids a broadband kick that can trigger a
                // spark unrelated to the selected steady driving frequency.
                const u = Math.min(1, t / 2);
                const envelope = u ** 3 * (10 - 15 * u + 6 * u * u);
                const rate = u < 1 ? 15 * u * u * (1 - u) ** 2 : 0;
                const curvature = u < 1 ? 15 * u * (1 - u) * (1 - 2 * u) : 0;
                const cosine = Math.cos(omega * t);
                const sine = Math.sin(omega * t);
                return { x: 0, y: amplitude * (1 + envelope * (cosine - 1)), vx: 0,
                    vy: amplitude * (rate * (cosine - 1) - envelope * omega * sine), ax: 0,
                    ay: amplitude * (curvature * (cosine - 1) - 2 * rate * omega * sine - envelope * omega * omega * cosine) };
            }
            return { x: 0, y: amplitude * Math.cos(omega * t), vx: 0,
                vy: -amplitude * omega * Math.sin(omega * t), ax: 0,
                ay: -amplitude * omega * omega * Math.cos(omega * t) };
        }
        const index = t / integrationStep - historyStart;
        const left = Math.floor(index);
        if (left < 0) return history[0];
        if (left >= history.length - 1) return history[history.length - 1];
        const a = history[left];
        const b = history[left + 1];
        const mix = index - left;
        return { x: a.x + (b.x - a.x) * mix, y: a.y + (b.y - a.y) * mix,
            vx: a.vx + (b.vx - a.vx) * mix, vy: a.vy + (b.vy - a.vy) * mix,
            ax: a.ax + (b.ax - a.ax) * mix, ay: a.ay + (b.ay - a.ay) * mix };
    }

    // Liénard–Wiechert E field in the drawing plane, with kq = 1.
    // Both components of position, velocity and acceleration enter the retarded field.
    function field(x, y, t) {
        const current = source(t);
        let retarded = t - Math.hypot(x - current.x, y - current.y) / lightSpeed;
        for (let i = 0; i < 7; i++) {
            const s = source(retarded);
            const r = Math.max(0.015, Math.hypot(x - s.x, y - s.y));
            const nv = ((x - s.x) * s.vx + (y - s.y) * s.vy) / r;
            retarded -= (retarded + r / lightSpeed - t) / (1 - nv / lightSpeed);
            retarded = Math.min(t, retarded);
        }
        const s = source(retarded);
        const r = Math.max(0.015, Math.hypot(x - s.x, y - s.y));
        const nx = (x - s.x) / r;
        const ny = (y - s.y) / r;
        const bx = s.vx / lightSpeed;
        const by = s.vy / lightSpeed;
        const k = 1 - nx * bx - ny * by;
        const velocity = (1 - bx * bx - by * by) / (k ** 3 * r * r);
        const na = nx * s.ax + ny * s.ay;
        const acceleration = 1 / (lightSpeed * lightSpeed * k ** 3 * r);
        // The source is an electron, so its electric field points inward.
        return { x: -((nx - bx) * velocity + ((nx - bx) * na - s.ax * k) * acceleration),
            y: -((ny - by) * velocity + ((ny - by) * na - s.ay * k) * acceleration) };
    }

    function geometry() {
        return { sx: width * 0.22, rx: width * (0.22 + 0.34 * Number(distanceControl.value)), cy: height * 0.49, scale: width * 0.24, ringRadius: width * 0.24 * 0.5 };
    }
    function moveSource(h) {
        // Smooth pointer motion and keep the source below the model's light speed.
        let ax = 90 * (target.x - manual.x) - 18 * manual.vx;
        let ay = 90 * (target.y - manual.y) - 18 * manual.vy;
        const accelerationScale = Math.min(1, 8 / (Math.hypot(ax, ay) || 1));
        ax *= accelerationScale;
        ay *= accelerationScale;
        let vx = manual.vx + ax * h;
        let vy = manual.vy + ay * h;
        const velocityScale = Math.min(1, lightSpeed * 0.55 / (Math.hypot(vx, vy) || 1));
        vx *= velocityScale;
        vy *= velocityScale;
        manual = { x: manual.x + (manual.vx + vx) * h / 2,
            y: manual.y + (manual.vy + vy) * h / 2, vx, vy,
            ax: (vx - manual.vx) / h, ay: (vy - manual.vy) / h };
        history.push(manual);
        // The visible scene needs less than 8 s of trajectory. Retain 10–20 s.
        if (history.length > 3200) {
            history = history.slice(1600);
            historyStart += 1600;
        }
    }
    function advance(dt) {
        const g = geometry();
        const ringX = (g.rx - g.sx) / g.scale;
        const radius = g.ringRadius / g.scale;
        remainder += dt;
        while (remainder >= integrationStep) {
            remainder -= integrationStep;
            ticks++;
            time = ticks * integrationStep;
            if (Number(frequency.value) === 0) moveSource(integrationStep);
            if (receiverType === 'single') {
                const e = field(ringX, receiverY, time);
                const acceleration = -18 * e.y - 7 * receiverVelocity - 20 * (receiverY - initial.y);
                receiverVelocity += acceleration * integrationStep;
                receiverY += receiverVelocity * integrationStep;
                if (Math.abs(receiverY - initial.y) > 0.36) {
                    receiverY = initial.y + Math.sign(receiverY - initial.y) * 0.36;
                    receiverVelocity = 0;
                }
            } else {
                // The external field integrated along the open conductor drives a damped LC model.
                // gapCharge represents excess electrons at one side of the gap.
                let emf = 0;
                const samples = 24;
                const capacitance = ringCapacitance();
                for (let i = 0; i < samples; i++) {
                    const arcSpan = 2 * Math.PI - 0.44;
                    const theta = -Math.PI / 2 + 0.22 + (i + 0.5) * arcSpan / samples;
                    const x = ringX + radius * Math.cos(theta);
                    const y = -radius * Math.sin(theta);
                    const e = field(x, y, time);
                    const baseline = field(x, y, 0);
                    emf -= ((e.x - baseline.x) * -Math.sin(theta) - (e.y - baseline.y) * Math.cos(theta)) * radius * arcSpan / samples;
                }
                ringCurrent += (emf - ringResistance * ringCurrent - gapCharge / capacitance) * integrationStep;
                gapCharge += ringCurrent * integrationStep;
                sparkRemaining = Math.max(0, sparkRemaining - integrationStep);
                if (Math.abs(gapCharge / capacitance) >= gapBreakdownVoltage && sparkRemaining === 0) {
                    sparkDirection = Math.sign(gapCharge);
                    sparkCount++;
                    sparkRemaining = 0.12;
                    gapCharge *= 0.15;
                    ringCurrent *= 0.2;
                }

            }
        }
    }
    function arrow(x, y, dx, dy, color, lineWidth = 2) {
        const length = Math.hypot(dx, dy);
        if (length < 1) return;
        const a = Math.atan2(dy, dx);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.lineTo(x + dx - 7 * Math.cos(a - 0.45), y + dy - 7 * Math.sin(a - 0.45));
        ctx.lineTo(x + dx - 7 * Math.cos(a + 0.45), y + dy - 7 * Math.sin(a + 0.45));
        ctx.fill();
    }
    function charge(x, y, sign, color, radius = 13) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.round(radius * 1.6)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sign, x, y);
    }
    function fieldLines(g) {
        const position = source(time);
        const lineCount = 16;
        const increment = 0.035;
        for (let line = 0; line < lineCount; line++) {
            const angle = line * 2 * Math.PI / lineCount;
            let x = position.x + 0.075 * Math.cos(angle);
            let y = position.y + 0.075 * Math.sin(angle);
            ctx.beginPath();
            ctx.moveTo(g.sx + x * g.scale, g.cy - y * g.scale);
            const heads = [];
            for (let i = 0; i < 220; i++) {
                const e = field(x, y, time);
                const magnitude = Math.hypot(e.x, e.y);
                if (magnitude < 1e-8) break;
                // Midpoint integration of instantaneous field-line direction.
                const mid = field(x - increment * e.x / magnitude / 2, y - increment * e.y / magnitude / 2, time);
                const midMagnitude = Math.hypot(mid.x, mid.y);
                if (midMagnitude < 1e-8) break;
                x -= increment * mid.x / midMagnitude;
                y -= increment * mid.y / midMagnitude;
                const px = g.sx + x * g.scale;
                const py = g.cy - y * g.scale;
                ctx.lineTo(px, py);
                if (i === 16 || i === 43 || i === 85) heads.push([px, py, 10 * mid.x / midMagnitude, -10 * mid.y / midMagnitude]);
                if (px < -15 || px > width + 15 || py < -15 || py > height + 15) break;
            }
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = '#2563eb90';
            ctx.stroke();
            heads.forEach(p => arrow(...p, '#2563eb', 1.4));
        }
    }
    function updateStatus() {
        let key = 'rest';
        let text = receiverType === 'single' ? 'Hva skjer hvis du flytter senderen?' : 'Kan du få en gnist?';
        if (firstChange) {
            const g = geometry();
            const arrival = Math.max(0, Math.hypot((g.rx - g.sx) / g.scale - firstChange.x, (receiverType === 'ring' ? 0 : initial.y) - firstChange.y) - (receiverType === 'ring' ? g.ringRadius / g.scale : 0)) / lightSpeed;
            key = time < firstChange.time + arrival ? 'waiting' : 'arrived';
            text = key === 'waiting' ? 'Følg endringen fra senderen. Når reagerer mottakeren?' : 'Prøv en annen avstand eller frekvens. Hva endrer seg?';
        }
        if (receiverType === 'ring' && sparkRemaining > 0) { key = 'spark'; text = 'Gnist! Hva skjer med opphopningen nå?'; }
        if (statusKey !== key) { status.textContent = text; statusKey = key; }
    }
    function drawSingle(g) {
        const center = g.cy - initial.y * g.scale;
        const y = g.cy - receiverY * g.scale;
        ctx.fillStyle = '#ffffffdd';
        ctx.fillRect(g.rx - 22, center - 95, 44, 190);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(g.rx - 22, center - 95, 44, 190);
        ctx.beginPath();
        ctx.moveTo(g.rx, center - 95);
        for (let i = 1; i <= 12; i++) ctx.lineTo(g.rx + (i === 12 ? 0 : i % 2 ? 5 : -5), center - 95 + (y - 16 - center + 95) * i / 12);
        ctx.stroke();
        const e = field((g.rx - g.sx) / g.scale, receiverY, time);
        const magnitude = Math.hypot(e.x, e.y);
        if (magnitude > 1e-8) {
            const length = Math.min(70, 200 * magnitude);
            arrow(g.rx - 16 * e.x / magnitude, y + 16 * e.y / magnitude, -length * e.x / magnitude, length * e.y / magnitude, '#c2410c', 3);
        }
        charge(g.rx, y, '−', '#6d28d9');
    }
    function draw() {
        if (!width || panel.hidden) return;
        ctx.clearRect(0, 0, width, height);
        const g = geometry();
        fieldLines(g);
        if (firstChange && time > firstChange.time) {
            const radius = lightSpeed * (time - firstChange.time) * g.scale;
            ctx.beginPath();
            ctx.arc(g.sx + firstChange.x * g.scale, g.cy - firstChange.y * g.scale, radius, 0, 2 * Math.PI);
            ctx.setLineDash([5, 6]);
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.setLineDash([]);
        }
        const position = source(time);
        const sourceX = g.sx + position.x * g.scale;
        const sourceY = g.cy - position.y * g.scale;
        if (Number(frequency.value) > 0) {
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(g.sx, g.cy - amplitude * g.scale - 22);
            ctx.lineTo(g.sx, g.cy + amplitude * g.scale + 22);
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            ctx.beginPath();
            ctx.arc(sourceX, sourceY, 23, 0, Math.PI * 2);
            ctx.fillStyle = '#dc262612';
            ctx.fill();
            ctx.strokeStyle = '#dc262660';
            ctx.stroke();
        }
        charge(sourceX, sourceY, '−', '#dc2626');
        if (receiverType === 'single') {
            drawSingle(g);
        } else {
            const radius = g.ringRadius;
            const ringY = g.cy;
            const voltage = gapCharge / ringCapacitance();
            const level = Math.abs(voltage) / gapBreakdownVoltage;
            const distribution = Math.max(-0.23, Math.min(0.23, 0.18 * voltage / gapBreakdownVoltage));
            const gapAngle = 0.22;
            const start = -Math.PI / 2 + gapAngle;
            const span = 2 * Math.PI - 2 * gapAngle;
            ctx.beginPath();
            ctx.arc(g.rx, ringY, radius, start, start + span);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 9;
            ctx.stroke();
            const count = 16;
            const dotRadius = width < 450 ? 4 : 5;
            for (let i = 0; i < count; i++) {
                const u = (i + 0.5) / count;
                const ionTheta = start + u * span;
                charge(g.rx + (radius + 8) * Math.cos(ionTheta), ringY + (radius + 8) * Math.sin(ionTheta), '+', '#b45309', dotRadius);
                // A monotone redistribution: positive gapCharge crowds electrons near
                // the end of the arc, and negative gapCharge crowds the other end.
                const shifted = u + distribution * 4 * u * (1 - u);
                const theta = start + shifted * span;
                if (!(sparkRemaining > 0 && i === (sparkDirection > 0 ? count - 1 : 0))) {
                    charge(g.rx + (radius - 6) * Math.cos(theta), ringY + (radius - 6) * Math.sin(theta), '−', '#6d28d9', dotRadius);
                }
            }
            const gapHalf = radius * Math.sin(gapAngle);
            const gapY = ringY - radius * Math.cos(gapAngle);
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#475569';
            ctx.fillText('Gnistgap', g.rx, gapY - 19);
            if (level > 0.2) {
                ctx.fillStyle = '#6d28d9';
                ctx.font = 'bold 15px Arial';
                ctx.fillText(gapCharge > 0 ? '−' : '+', g.rx - gapHalf - 7, gapY - 6);
                ctx.fillText(gapCharge > 0 ? '+' : '−', g.rx + gapHalf + 7, gapY - 6);
            }
            if (sparkRemaining > 0) {
                ctx.beginPath();
                ctx.moveTo(g.rx - gapHalf, gapY);
                for (let i = 1; i <= 6; i++) ctx.lineTo(g.rx - gapHalf + 2 * gapHalf * i / 6, gapY + (i === 6 ? 0 : i % 2 ? -5 : 5));
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 3;
                ctx.stroke();
                const progress = 1 - sparkRemaining / 0.12;
                const jump = sparkDirection > 0 ? progress : 1 - progress;
                charge(g.rx - gapHalf + 2 * gapHalf * jump, gapY, '−', '#6d28d9', dotRadius);
            }
        }
        ctx.font = width < 450 ? '12px Arial' : '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#334155';
        ctx.fillText(Number(frequency.value) > 0 ? 'Svingende elektron' : 'Dra elektronet', g.sx, height - 33);
        ctx.fillText(receiverType === 'single' ? 'Mottaker' : 'Mottakerring', g.rx, height - 33);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText(width < 450 ? 'Forenklet modell · ikke i målestokk' : 'Pilene viser retning. Figuren er ikke i målestokk.', width / 2, height - 12);
        element('em-clock').textContent = `Tid: ${time.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} s`;
        updateStatus();
    }
    function tick(now) {
        frame = null;
        if (panel.hidden || document.hidden) { lastFrame = null; return; }
        if (running && lastFrame !== null) advance(Math.min((now - lastFrame) / 1000, 0.05) * (slow.checked ? 0.25 : 1));
        lastFrame = now;
        draw();
        if (running) frame = requestAnimationFrame(tick);
    }
    function schedule() {
        if (frame === null && !panel.hidden && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function updatePlay() {
        play.textContent = running ? 'Pause' : time === 0 ? 'Start' : 'Fortsett';
    }
    function endDrag() {
        if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
        pointer = null;
        canvas.style.cursor = 'default';
    }
    function restart(autoPlay) {
        endDrag();
        initial.y = amplitude;
        time = 0;
        ticks = 0;
        remainder = 0;
        manual = { ...initial };
        target = { x: initial.x, y: initial.y };
        history = [{ ...initial }];
        historyStart = 0;
        firstChange = Number(frequency.value) > 0 ? { time: 0, x: 0, y: amplitude } : null;
        receiverY = initial.y;
        receiverVelocity = 0;
        gapCharge = 0;
        ringCurrent = 0;
        sparkRemaining = 0;
        sparkCount = 0;
        lastFrame = null;
        statusKey = '';
        running = autoPlay;
        updatePlay();
        draw();
        schedule();
    }
    function setTarget(x, y) {
        const g = geometry();
        target.x = Math.max((24 - g.sx) / g.scale, Math.min((Math.min(width * 0.46, g.rx - (receiverType === 'ring' ? g.ringRadius + 36 : 50)) - g.sx) / g.scale, x));
        target.y = Math.max((g.cy - height + 68) / g.scale, Math.min((g.cy - 28) / g.scale, y));
        if (!firstChange && Math.hypot(target.x - manual.x, target.y - manual.y) > 0.001) {
            firstChange = { time, x: manual.x, y: manual.y };
        }
        if (!running) lastFrame = null;
        running = true;
        updatePlay();
        schedule();
    }
    function pointerPosition(event) {
        const bounds = canvas.getBoundingClientRect();
        const g = geometry();
        return { x: (event.clientX - bounds.left - g.sx) / g.scale,
            y: (g.cy - event.clientY + bounds.top) / g.scale };
    }
    canvas.addEventListener('pointerdown', event => {
        if (Number(frequency.value) > 0 || event.button !== 0 || pointer !== null) return;
        const p = pointerPosition(event);
        const g = geometry();
        if (Math.hypot(p.x - manual.x, p.y - manual.y) * g.scale > 32) return;
        event.preventDefault();
        canvas.focus({ preventScroll: true });
        pointer = event.pointerId;
        dragOffset = { x: p.x - manual.x, y: p.y - manual.y };
        canvas.setPointerCapture(pointer);
        canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', event => {
        const p = pointerPosition(event);
        if (pointer !== null && event.pointerId === pointer) {
            event.preventDefault();
            setTarget(p.x - dragOffset.x, p.y - dragOffset.y);
        } else {
            const near = Math.hypot(p.x - manual.x, p.y - manual.y) * geometry().scale < 32;
            canvas.style.cursor = Number(frequency.value) === 0 && near ? 'grab' : 'default';
        }
    });
    canvas.addEventListener('pointerup', event => { if (event.pointerId === pointer) endDrag(); });
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('lostpointercapture', () => { pointer = null; canvas.style.cursor = 'default'; });
    canvas.addEventListener('keydown', event => {
        if (Number(frequency.value) > 0) return;
        const shifts = { ArrowUp: [0, 0.1], ArrowDown: [0, -0.1], ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0] };
        if (!shifts[event.key]) return;
        event.preventDefault();
        const [dx, dy] = shifts[event.key];
        setTarget(target.x + dx, target.y + dy);
    });
    play.addEventListener('click', () => { endDrag(); running = !running; lastFrame = null; updatePlay(); schedule(); });
    element('em-reset').addEventListener('click', () => {
        if (resonanceLock) resonanceLock.checked = false;
        frequency.disabled = false;
        frequency.value = '0';
        updateFrequency();
        restart(false);
    });
    function updateFrequency() {
        const f = Number(frequency.value);
        element('em-frequency-value').textContent = `${number.format(f)} Hz`;
        element('em-period').textContent = f === 0
            ? 'Ingen automatisk svingning · flytt elektronet selv'
            : `${number.format(f)} ${f === 1 ? 'hel svingning' : 'hele svingninger'} per sekund · T = ${number.format(1 / f)} s`;
        element('em-drag-help').textContent = f === 0
            ? 'Dra det røde elektronet med mus eller finger ved 0 Hz. Du kan også velge figuren og bruke piltastene.'
            : resonanceLock && resonanceLock.checked
            ? 'Senderen følger ringens egenfrekvens. Slå av «Perfekt egenfrekvens» for å velge frekvens selv.'
            : 'Elektronet svinger automatisk. Velg 0 Hz for å flytte den selv.';
    }
    frequency.addEventListener('input', () => { updateFrequency(); restart(Number(frequency.value) > 0 && !reducedMotion.matches); });
    amplitudeControl.addEventListener('input', () => {
        amplitude = Number(amplitudeControl.value) / 100;
        element('em-amplitude-value').textContent = `${Math.round(Number(amplitudeControl.value) / 28 * 100)} %`;
        if (Number(frequency.value) > 0) restart(!reducedMotion.matches);
    });
    distanceControl.addEventListener('input', () => {
        element('em-distance-value').textContent = `${number.format(Number(distanceControl.value))}×`;
        restart(Number(frequency.value) > 0 && !reducedMotion.matches);
    });
    if (resonanceControl) {
        resonanceLock.addEventListener('change', () => {
            frequency.disabled = resonanceLock.checked;
            if (resonanceLock.checked) {
                frequency.value = resonanceControl.value;
            }
            updateFrequency();
            if (resonanceLock.checked) {
                restart(!reducedMotion.matches);
            }
        });
        resonanceControl.addEventListener('input', () => {
            element('em-resonance-value').textContent = `${number.format(Number(resonanceControl.value))} Hz`;
            if (resonanceLock.checked) {
                frequency.value = resonanceControl.value;
                updateFrequency();
            }
            restart(Number(frequency.value) > 0 && !reducedMotion.matches);
        });
    }
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
    new MutationObserver(() => { lastFrame = null; if (panel.hidden) endDrag(); if (!panel.hidden) { resize(); schedule(); } }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('visibilitychange', () => { lastFrame = null; if (document.hidden) endDrag(); schedule(); });
    resize();
    updateFrequency();
    restart(receiverType === 'single' && !reducedMotion.matches);
}
mountModel('panel-em-2', 'em2', 'single');
mountModel('panel-em-3', 'em', 'ring');
})();
