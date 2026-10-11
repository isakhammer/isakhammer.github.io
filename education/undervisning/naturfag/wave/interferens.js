(() => {
    const canvas = document.getElementById("interferenceCanvas");
    const ctx = canvas.getContext("2d");
    const shift = document.getElementById("waveShift");
    const amplitude1 = document.getElementById("amplitude1");
    const amplitude2 = document.getElementById("amplitude2");
    const amplitudeValues = [document.getElementById("amplitude1Value"), document.getElementById("amplitude2Value")];
    const status = document.getElementById("interferenceStatus");
    const play = document.getElementById("interferencePlay");
    const resultToggle = document.getElementById("showResult");
    const experimentToggle = document.getElementById("wavelengthExperimentToggle");
    const experimentPanel = document.getElementById("wavelengthExperiment");
    const wavelengthRatio = document.getElementById("wavelengthRatio");
    const wavelengthRatioValue = document.getElementById("wavelengthRatioValue");
    const resultDetails = [status, document.getElementById("interferenceExplanation")];
    const colors = ["#2563eb", "#dc2626", "#15803d"];
    const pixelsPerUnit = 50;
    const format = value => value.toLocaleString("nb-NO", { maximumFractionDigits: 2 });
    [shift, amplitude1, amplitude2].forEach(input => { input.value = input.defaultValue; });
    resultToggle.checked = resultToggle.defaultChecked;
    experimentToggle.checked = experimentToggle.defaultChecked;
    wavelengthRatio.value = wavelengthRatio.defaultValue;
    let wavelengthSelection = Number(wavelengthRatio.value);
    let moving = false;
    let travel = 0;
    let previousTime = null;
    let frame = null;

    function currentRatio() {
        return experimentToggle.checked ? Number(wavelengthRatio.value) : 1;
    }

    function drawAxis(left, right, center, maximum) {
        ctx.font = "18px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (let value = -maximum; value <= maximum; value++) {
            const y = center - value * pixelsPerUnit;
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.strokeStyle = value === 0 ? "#94a3b8" : "#dbe3ed";
            ctx.lineWidth = value === 0 ? 1.5 : 1;
            ctx.stroke();
            ctx.fillStyle = "#475569";
            ctx.fillText(value > 0 ? `+${value}` : value < 0 ? `−${-value}` : "0", left - 10, y);
        }
        ctx.beginPath();
        ctx.moveTo(left, center - maximum * pixelsPerUnit);
        ctx.lineTo(left, center + maximum * pixelsPerUnit);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
    }

    function draw() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;
        ctx.clearRect(0, 0, width, height);
        const left = 48;
        const right = width - 18;
        const period = (right - left) / 2.5;
        const a1 = Number(amplitude1.value);
        const a2 = Number(amplitude2.value);
        const offset = Number(shift.value) / 100 * 2 * Math.PI;
        const ratio = currentRatio();
        const rawSumAmplitude = Math.sqrt(Math.max(0, a1*a1 + a2*a2 + 2*a1*a2*Math.cos(offset)));
        const a3 = rawSumAmplitude < 1e-9 ? 0 : rawSumAmplitude;
        const amplitudes = [a1, a2, a3];
        const centers = [90, 270, 510];
        const labelPositions = [20, 200, 390];
        const reveal = resultToggle.checked;
        const labels = [
            `Bølge 1 · amplitude ${format(a1)}`,
            `Bølge 2 · amplitude ${format(a2)}`,
            !reveal ? "Bølge 3 · skjult" : ratio === 1
                ? `Bølge 3 · amplitude ${format(a3)}` : "Bølge 3 · summen"
        ];
        centers.forEach((center, row) => {
            ctx.fillStyle = colors[row];
            ctx.font = "bold 20px Arial";
            ctx.fillText(labels[row], left, labelPositions[row], right - left);
            drawAxis(left, right, center, row === 2 ? 2 : 1);
            if (row === 2 && !reveal) {
                ctx.fillStyle = "#475569";
                ctx.font = "18px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Gjett formen før du viser bølge 3", (left + right) / 2, center - 22, right - left - 16);
                ctx.textAlign = "left";
                return;
            }
            ctx.beginPath();
            for (let x = left; x <= right; x++) {
                const phase = 2 * Math.PI * (x - left) / period - travel;
                const first = a1 * Math.sin(phase);
                // Begge bølger beveger seg med samme hastighet. Forskyvningen måles i λ_blå.
                const second = a2 * Math.sin((phase - offset) / ratio);
                const displacement = row === 0 ? first : row === 1 ? second : first + second;
                const y = center - displacement * pixelsPerUnit;
                if (x === left) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = colors[row];
            ctx.lineWidth = 4;
            ctx.stroke();
            // Braketten viser amplitude, uavhengig av hvor bølgen er i bevegelsen.
            if (row < 2 || ratio === 1) {
                const arrowX = right - 4;
                const top = center - amplitudes[row] * pixelsPerUnit;
                ctx.beginPath();
                ctx.moveTo(arrowX, center);
                ctx.lineTo(arrowX, top);
                ctx.moveTo(arrowX - 5, center);
                ctx.lineTo(arrowX + 5, center);
                ctx.moveTo(arrowX - 5, top);
                ctx.lineTo(arrowX + 5, top);
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
        ctx.font = "bold 26px Arial";
        ctx.fillStyle = "#555";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("+", (left + right) / 2, 165);
        ctx.fillText("=", (left + right) / 2, 350);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
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
        const first = Number(amplitude1.value);
        const second = Number(amplitude2.value);
        [first, second].forEach((amplitude, index) => {
            amplitudeValues[index].textContent = format(amplitude);
            [amplitude1, amplitude2][index].setAttribute("aria-valuetext", format(amplitude));
        });
        const reveal = resultToggle.checked;
        const ratio = currentRatio();
        experimentPanel.disabled = !experimentToggle.checked;
        experimentPanel.hidden = !experimentToggle.checked;
        wavelengthRatioValue.textContent = format(ratio);
        wavelengthRatio.setAttribute("aria-valuetext", `${format(ratio)} ganger den blå bølgens bølgelengde`);
        resultDetails.forEach(element => { element.hidden = !reveal; });
        let text;
        if (first === 0 && second === 0) text = "Begge amplitudene er null, så alle tre bølgene er flate.";
        else if (first === 0 || second === 0) text = "Én amplitude er null. Bølge 3 følger den andre bølgen.";
        else if (ratio !== 1) text = "Ulik bølgelengde: Bølgene forsterker hverandre noen steder og svekker hverandre andre steder. Summen får en annen form enn de to bølgene.";
        else if (value === 0 || value === 100) text = "Topper sammen: Amplitude 1 + amplitude 2 = amplitude 3. Den blå og den røde bølgen forsterker hverandre.";
        else if (value === 50) text = first === second
            ? "En halv bølgelengde: Topp møter bunn. Like store utslag i motsatt retning opphever hverandre, og bølge 3 blir helt flat."
            : "En halv bølgelengde: Topp møter bunn. Bølgene svekker hverandre. Fordi amplitudene er ulike, blir det et utslag igjen i bølge 3.";
        else text = "Bølgene er forskjøvet: Utslagene på samme sted legges sammen.";
        status.textContent = reveal ? text : "";
        document.getElementById("interferenceExplanation").textContent = ratio === 1
            ? "På hvert sted legges utslagene sammen. Når toppene ligger sammen, legges amplitudene sammen. Like store utslag i motsatt retning opphever hverandre."
            : "Bølgene har ulik bølgelengde og beveger seg med samme hastighet. Hvor toppene og bunnene møtes, varierer langs grafen. På hvert sted legges de to utslagene sammen til bølge 3.";
        canvas.setAttribute("aria-label", reveal
            ? "Blå bølge 1 pluss rød bølge 2 er lik grønn bølge 3. Samme skala: utslag fra −1 til 1 i de to første grafene og fra −2 til 2 i den tredje."
            : "Blå bølge 1 og rød bølge 2. Bølge 3 er skjult; et tomt koordinatsystem fra −2 til 2 lar deg gjette summen.");
        const descriptions = {0: "0 λ · ingen forskyvning", 25: "¼ λ · en kvart bølgelengde", 50: "½ λ · en halv bølgelengde", 75: "¾ λ · tre kvart bølgelengde", 100: "1 λ · en hel bølgelengde"};
        const description = descriptions[value] || `${format(value / 100)} λ · bølgelengder`;
        document.getElementById("shiftReadout").textContent = description;
        shift.setAttribute("aria-valuetext", description);
        draw();
    }

    function animate(timestamp) {
        if (!moving) return;
        if (previousTime !== null && !document.getElementById("panel-interference").hidden) travel = (travel + Math.min((timestamp - previousTime) / 1000, 0.1) * 1.1) % (2 * Math.PI);
        previousTime = timestamp;
        draw();
        frame = requestAnimationFrame(animate);
    }
    [shift, amplitude1, amplitude2, wavelengthRatio].forEach(input => input.addEventListener("input", update));
    resultToggle.addEventListener("change", update);
    experimentToggle.addEventListener("change", () => {
        if (experimentToggle.checked) wavelengthRatio.value = String(wavelengthSelection);
        else {
            wavelengthSelection = Number(wavelengthRatio.value);
            wavelengthRatio.value = wavelengthRatio.defaultValue;
        }
        update();
    });
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
