(() => {
    const canvas = document.getElementById("interferenceCanvas");
    const ctx = canvas.getContext("2d");
    const shift = document.getElementById("waveShift");
    const amplitude1 = document.getElementById("amplitude1");
    const amplitude2 = document.getElementById("amplitude2");
    const status = document.getElementById("interferenceStatus");
    const play = document.getElementById("interferencePlay");
    const presets = document.querySelectorAll("[data-shift]");
    const colors = ["#2563eb", "#c2410c", "#15803d"];
    let moving = false;
    let travel = 0;
    let previousTime = null;
    let frame = null;

    function showSum(first, second) {
        const values = [Math.round(first), Math.round(second)];
        values.push(values[0] + values[1]);
        values.forEach((value, index) => {
            const height = Math.abs(value) * 0.32;
            const bar = document.getElementById(`sum-bar-${index + 1}`);
            bar.setAttribute("y", value >= 0 ? 75 - height : 75);
            bar.setAttribute("height", height);
            document.getElementById(`sum-value-${index + 1}`).textContent = value === 0
                ? "0 · ingen utslag" : `${Math.abs(value)} ${value > 0 ? "opp" : "ned"}`;
        });
    }

    function draw() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;
        ctx.clearRect(0, 0, width, height);
        const left = 12;
        const right = width - 18;
        const period = (right - left) / 2.5;
        const a1 = Number(amplitude1.value) * 0.5;
        const a2 = Number(amplitude2.value) * 0.5;
        const offset = Number(shift.value) / 100 * 2 * Math.PI;
        const a3 = Math.sqrt(Math.max(0, a1*a1 + a2*a2 + 2*a1*a2*Math.cos(offset)));
        const amplitudes = [a1, a2, a3];
        const centers = [90, 250, 440];
        const labels = ["Bølge 1 · amplitude 1", "Bølge 2 · amplitude 2", "Bølge 3 · amplitude 3"];
        const marker = left + period / 4;
        ctx.beginPath();
        ctx.moveTo(marker, 35);
        ctx.lineTo(marker, height - 12);
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        centers.forEach((center, row) => {
            ctx.fillStyle = colors[row];
            ctx.font = "bold 17px Arial";
            ctx.fillText(labels[row], left, row === 0 ? 20 : row === 1 ? 180 : 320);
            ctx.beginPath();
            ctx.moveTo(left, center);
            ctx.lineTo(right, center);
            ctx.strokeStyle = "#d1d5db";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            for (let x = left; x <= right; x++) {
                const phase = 2 * Math.PI * (x - left) / period - travel;
                const first = a1 * Math.sin(phase);
                const second = a2 * Math.sin(phase - offset);
                const displacement = row === 0 ? first : row === 1 ? second : first + second;
                const y = center - displacement;
                if (x === left) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = colors[row];
            ctx.lineWidth = 4;
            ctx.stroke();
            // Braketten viser største utslag, også når den merkede prikken ikke er på en topp.
            const arrowX = right - 4;
            ctx.beginPath();
            ctx.moveTo(arrowX, center);
            ctx.lineTo(arrowX, center - amplitudes[row]);
            ctx.moveTo(arrowX - 5, center);
            ctx.lineTo(arrowX + 5, center);
            ctx.moveTo(arrowX - 5, center - amplitudes[row]);
            ctx.lineTo(arrowX + 5, center - amplitudes[row]);
            ctx.lineWidth = 2;
            ctx.stroke();
            const phase = Math.PI / 2 - travel;
            const first = a1 * Math.sin(phase);
            const second = a2 * Math.sin(phase - offset);
            const displacement = row === 0 ? first : row === 1 ? second : first + second;
            ctx.beginPath();
            ctx.moveTo(marker, center);
            ctx.lineTo(marker, center - displacement);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(marker, center - displacement, 6, 0, 2 * Math.PI);
            ctx.fill();
        });
        ctx.font = "bold 26px Arial";
        ctx.fillStyle = "#555";
        ctx.textAlign = "center";
        ctx.fillText("+", width / 2, 170);
        ctx.fillText("=", width / 2, 310);
        ctx.textAlign = "left";
        showSum(Number(amplitude1.value) * Math.cos(travel), Number(amplitude2.value) * Math.cos(travel + offset));
    }

    function resize() {
        if (!canvas.clientWidth) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
    }

    function update() {
        const value = Number(shift.value);
        const equal = amplitude1.value === amplitude2.value;
        const zero = amplitude1.value === "0" && amplitude2.value === "0";
        let text;
        if (zero) text = "Begge amplitudene er null, så alle tre bølgene er flate.";
        else if (value === 0 || value === 100) text = "Topper sammen: Amplitude 1 + amplitude 2 = amplitude 3. Den blå og den oransje bølgen forsterker hverandre.";
        else if (value === 50) text = equal
            ? "En halv bølgelengde: Topp møter bunn. Like store utslag i motsatt retning opphever hverandre, og bølge 3 blir helt flat."
            : "En halv bølgelengde: Topp møter bunn. Bølgene svekker hverandre. Fordi amplitudene er ulike, blir det et utslag igjen i bølge 3.";
        else text = "Bølgene er forskjøvet: Utslagene på samme sted legges sammen. Se ved den stiplede linjen hvordan oppover og nedover påvirker summen.";
        status.textContent = text;
        const descriptions = {0: "0 λ · ingen forskyvning", 25: "¼ λ · en kvart bølgelengde", 50: "½ λ · en halv bølgelengde", 75: "¾ λ · tre kvart bølgelengde", 100: "1 λ · en hel bølgelengde"};
        const description = descriptions[value] || `${(value / 100).toLocaleString("nb-NO")} λ · bølgelengder`;
        document.getElementById("shiftReadout").textContent = description;
        shift.setAttribute("aria-valuetext", description);
        presets.forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.shift) === value)));
        draw();
    }

    function animate(timestamp) {
        if (!moving) return;
        if (previousTime !== null && !document.getElementById("panel-interference").hidden) travel = (travel + Math.min((timestamp - previousTime) / 1000, 0.1) * 1.1) % (2 * Math.PI);
        previousTime = timestamp;
        draw();
        frame = requestAnimationFrame(animate);
    }
    [shift, amplitude1, amplitude2].forEach(input => input.addEventListener("input", update));
    presets.forEach(button => button.addEventListener("click", () => { shift.value = button.dataset.shift; update(); }));
    play.addEventListener("click", () => {
        moving = !moving;
        play.textContent = moving ? "Sett på pause" : "Start bevegelse";
        play.setAttribute("aria-pressed", String(moving));
        previousTime = null;
        if (moving) frame = requestAnimationFrame(animate);
        else cancelAnimationFrame(frame);
    });
    new ResizeObserver(resize).observe(canvas);
    window.addEventListener("resize", resize);
    resize();
    update();
})();
