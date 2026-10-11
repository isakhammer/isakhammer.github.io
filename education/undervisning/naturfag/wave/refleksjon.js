(() => {
    const canvas = document.getElementById("reflectionCanvas");
    const ctx = canvas.getContext("2d");
    const progress = document.getElementById("reflectionProgress");
    const status = document.getElementById("reflectionStatus");
    const play = document.getElementById("reflectionPlay");
    const ends = document.querySelectorAll("[data-end]");
    let end = "fixed";
    let moving = false;
    let position = 0.15;
    let previousTime = null;
    let frame = null;
    function draw() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;
        ctx.clearRect(0, 0, width, height);
        const left = 12;
        const right = width - 35;
        const center = 150;
        const pulseCenter = 0.12 + 1.76 * position;
        const reflectedCenter = 2 - pulseCenter;
        const pulse = x => 40 * Math.exp(-Math.pow((x - pulseCenter) / 0.07, 2));
        const reflected = x => (end === "fixed" ? -1 : 1) * 40 * Math.exp(-Math.pow((x - reflectedCenter) / 0.07, 2));
        ctx.beginPath();ctx.moveTo(left, center);ctx.lineTo(right, center);
        ctx.strokeStyle = "#cbd5e1";ctx.lineWidth = 1;ctx.stroke();
        ctx.beginPath();
        for (let x = left; x <= right; x++) {
            const normalized = (x - left) / (right - left);
            const y = center - pulse(normalized) - reflected(normalized);
            if (x === left) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = position < 0.5 ? "#2563eb" : "#dc2626";
        ctx.lineWidth = 4;ctx.stroke();
        ctx.fillStyle = "#475569";
        if (end === "fixed") ctx.fillRect(right, center - 65, 8, 130);
        else {
            ctx.fillRect(right + 4, center - 65, 3, 130);
            ctx.beginPath();ctx.arc(right, center - pulse(1) - reflected(1), 7, 0, 2 * Math.PI);
            ctx.fillStyle = "#dc2626";ctx.fill();
        }
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#334155";
        ctx.fillText(position < 0.45 ? "På vei mot enden →" : position > 0.55 ? "← På vei tilbake" : "Bølgen møter enden", left, 35);
        ctx.font = "16px Arial";
        ctx.fillText(end === "fixed" ? "Fast ende" : "Fri ende", Math.max(left, right - 80), 255);
    }
    function resize() {
        if (!canvas.clientWidth) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);draw();
    }
    function update() {
        const phase = position < 0.45 ? "På vei mot enden" : position > 0.55 ? "På vei tilbake" : "Møter enden";
        const text = position < 0.45 ? "Bølgen beveger seg mot enden av snora. Gjett hvordan den vil komme tilbake."
            : end === "fixed" ? "Ved en fast ende snus bølgen opp ned. Et utslag oppover kommer tilbake som et utslag nedover."
            : "Ved en fri ende kommer bølgen tilbake uten å snus opp ned. Et utslag oppover kommer tilbake som et utslag oppover.";
        if (status.textContent !== text) status.textContent = text;
        progress.setAttribute("aria-valuetext", phase);
        draw();
    }
    function stop() {
        moving = false;cancelAnimationFrame(frame);previousTime = null;
        play.textContent = "Start bevegelse";play.setAttribute("aria-pressed", "false");
    }
    function animate(timestamp) {
        if (!moving) return;
        if (previousTime !== null && !document.getElementById("panel-reflection").hidden) position = Math.min(1, position + Math.min((timestamp - previousTime) / 1000, 0.1) * 0.14);
        previousTime = timestamp;progress.value = String(Math.round(position * 100));update();
        if (position >= 1) { stop();return; }
        frame = requestAnimationFrame(animate);
    }
    progress.addEventListener("input", () => { stop();position = Number(progress.value) / 100;update(); });
    ends.forEach(button => button.addEventListener("click", () => {
        end = button.dataset.end;
        ends.forEach(item => item.setAttribute("aria-pressed", String(item === button)));update();
    }));
    play.addEventListener("click", () => {
        if (moving) { stop();return; }
        if (position >= 1) { position = 0;progress.value = "0"; }
        moving = true;previousTime = null;play.textContent = "Sett på pause";play.setAttribute("aria-pressed", "true");
        frame = requestAnimationFrame(animate);
    });
    document.getElementById("reflectionReset").addEventListener("click", () => { stop();position = 0;progress.value = "0";update(); });
    new ResizeObserver(resize).observe(canvas);window.addEventListener("resize", resize);resize();update();
})();
