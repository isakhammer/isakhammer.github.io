(() => {
    // Et sammensatt signal med en gjentakende form på 10 m.
    const rawRadioSignal = phase => Math.sin(phase) + 0.3 * Math.sin(2 * phase);
    let radioPeak = 0;
    for (let sample = 0; sample < 4096; sample++) {
        radioPeak = Math.max(radioPeak, Math.abs(rawRadioSignal(sample / 4096 * 2 * Math.PI)));
    }
    const radioSignal = phase => rawRadioSignal(phase) / (radioPeak + 0.00001);
    function initializeInterference(suffix) {
        const element = id => document.getElementById(`${id}${suffix}`);
        const isRadioSignal = suffix === "-2";
        const canvas = element("interferenceCanvas");
        const ctx = canvas.getContext("2d");
        const shift = element("waveShift");
        const amplitude1 = element("amplitude1");
        const amplitude2 = element("amplitude2");
        const counterAmplitude = element("counterAmplitude");
        const counterWavelength = element("counterWavelength");
        const counterShift = element("counterShift");
        const amplitudeValues = [element("amplitude1Value"), element("amplitude2Value")];
        const status = element("interferenceStatus");
        const play = element("interferencePlay");
        const resultToggle = element(isRadioSignal ? "useCounter" : "showResult");
        const resultDetails = [status, element("interferenceExplanation")].filter(Boolean);
        const colors = isRadioSignal ? ["#2563eb", "#dc2626", "#7c3aed", "#15803d"] : ["#2563eb", "#dc2626", "#15803d"];
        const pixelsPerUnit = 50;
        const format = value => value.toLocaleString("nb-NO", { maximumFractionDigits: 2 });
        const controls = [shift, amplitude1, amplitude2, counterAmplitude, counterWavelength, counterShift].filter(Boolean);
        controls.forEach(input => { input.value = input.defaultValue; });
        resultToggle.checked = resultToggle.defaultChecked;
        // Radiosignalets form gjentas hver 10. meter. Støyens bølgelengde er 2,5 m.
        const noiseWavelength = 2.5;
        const currentRatio = () => isRadioSignal ? noiseWavelength / 10 : 1;
        const firstAmplitude = () => isRadioSignal ? 1 : Number(amplitude1.value);
        const secondAmplitude = () => isRadioSignal ? 0.5 : Number(amplitude2.value);
        const shiftValue = () => isRadioSignal ? 25 : Number(shift.value);
        // Behold siste gyldige verdi mens eleven skriver i et tallfelt.
        let counter = { amplitude: 0, wavelength: 1, shift: 0 };
        const activeCounterAmplitude = () => isRadioSignal && resultToggle.checked ? counter.amplitude : 0;
        let moving = isRadioSignal;
        let travel = 0;
        let previousTime = null;
        let frame = null;

        function drawAxis(left, right, center, maximum) {
            ctx.font = isRadioSignal ? "16px Arial" : "18px Arial";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            for (let value = -maximum; value <= maximum; value += isRadioSignal ? 0.5 : 1) {
                const y = center - value * pixelsPerUnit;
                ctx.beginPath();
                ctx.moveTo(left, y);
                ctx.lineTo(right, y);
                ctx.strokeStyle = value === 0 ? "#94a3b8" : "#dbe3ed";
                ctx.lineWidth = value === 0 ? 1.5 : 1;
                ctx.stroke();
                ctx.fillStyle = "#475569";
                ctx.fillText(value > 0 ? `+${format(value)}` : value < 0 ? `−${format(-value)}` : "0", left - 10, y);
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

        function drawDistanceAxis(left, right, center, maximum) {
            const bottom = center + maximum * pixelsPerUnit;
            ctx.font = right - left < 340 ? "13px Arial" : "16px Arial";
            ctx.fillStyle = "#475569";
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1;
            ctx.textAlign = "center";
            for (let meters = 0; meters <= 25; meters += 2.5) {
                const x = left + meters / 25 * (right - left);
                ctx.beginPath();
                ctx.moveTo(x, bottom);
                ctx.lineTo(x, bottom + 6);
                ctx.stroke();
                if (right - left >= 250 || meters % 5 === 0) ctx.fillText(format(meters), x, bottom + 22);
            }
            ctx.textAlign = "right";
            ctx.fillText("Avstand (m)", right, bottom + 43);
            ctx.textAlign = "left";
        }

        function draw() {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            if (!width || !height) return;
            ctx.clearRect(0, 0, width, height);
            const compact = isRadioSignal && width >= 750;
            const tileWidth = compact ? (width - 24) / 2 : width;
            const a1 = firstAmplitude();
            const a2 = secondAmplitude();
            const ratio = currentRatio();
            const offset = shiftValue() / 100 * 2 * Math.PI;
            const rawSumAmplitude = Math.sqrt(Math.max(0, a1*a1 + a2*a2 + 2*a1*a2*Math.cos(offset)));
            const a3 = rawSumAmplitude < 1e-9 ? 0 : rawSumAmplitude;
            const amplitudes = isRadioSignal ? [a1, a2, activeCounterAmplitude()] : [a1, a2, a3];
            const centers = isRadioSignal ? compact ? [100, 100, 450, 450] : [340, 110, 570, 1050] : [90, 270, 510];
            const labelPositions = isRadioSignal ? compact ? [20, 20, 240, 240] : [250, 20, 480, 820] : [20, 200, 390];
            const resultRow = centers.length - 1;
            const reveal = isRadioSignal || resultToggle.checked;
            const labels = isRadioSignal ? [
                "Bølge 1 – Radiosignal",
                "Bølge 2 – Støy",
                resultToggle.checked ? "Bølge 3 – Motsignal" : "Bølge 3 – Motsignal av",
                "Mottatt radiosignal"
            ] : [
                `Bølge 1 · amplitude ${format(a1)}`,
                `Bølge 2 · amplitude ${format(a2)}`,
                !reveal ? "Bølge 3 · skjult" : ratio === 1
                    ? `Bølge 3 · amplitude ${format(a3)}` : "Bølge 3 · summen"
            ];
            centers.forEach((center, row) => {
                const column = row === 0 ? 1 : row === 1 ? 0 : row % 2;
                const tileLeft = compact && column === 1 ? tileWidth + 24 : 0;
                const left = tileLeft + (isRadioSignal ? 62 : 48);
                const right = tileLeft + tileWidth - 18;
                const period = (right - left) / 2.5;
                ctx.fillStyle = colors[row];
                ctx.font = compact ? "bold 18px Arial" : "bold 20px Arial";
                ctx.fillText(labels[row], left, labelPositions[row], right - left);
                if (isRadioSignal && row === resultRow) {
                    ctx.fillStyle = resultToggle.checked ? "#6d28d9" : "#334155";
                    ctx.fillRect(left, labelPositions[row] + 12, Math.min(right - left, 230), 32);
                    ctx.fillStyle = "white";
                    ctx.font = "bold 20px Arial";
                    ctx.fillText(resultToggle.checked ? "MED MOTSIGNAL" : "UTEN MOTSIGNAL", left + 10, labelPositions[row] + 35, right - left - 20);
                }
                const maximum = row === resultRow ? (isRadioSignal ? 3 : 2) : 1;
                drawAxis(left, right, center, maximum);
                if (isRadioSignal) drawDistanceAxis(left, right, center, maximum);
                if (row === resultRow && !reveal) {
                    ctx.fillStyle = "#475569";
                    ctx.font = "18px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText(isRadioSignal ? "Gjett formen på det mottatte signalet" : "Gjett formen før du viser bølge 3", (left + right) / 2, center - 22, right - left - 16);
                    ctx.textAlign = "left";
                    return;
                }
                ctx.beginPath();
                for (let x = left; x <= right; x++) {
                    const phase = 2 * Math.PI * (x - left) / period - travel;
                    const first = a1 * (isRadioSignal ? radioSignal(phase) : Math.sin(phase));
                    // Begge bølger beveger seg med samme hastighet. Forskyvningen måles i λ_blå.
                    const second = a2 * Math.sin((phase - offset) / ratio);
                    // Forskyvningen til motsignalet måles i dets egen bølgelengde.
                    const third = isRadioSignal ? activeCounterAmplitude() * Math.sin(phase / (counter.wavelength / 10) - counter.shift * 2 * Math.PI) : 0;
                    const displacement = row === 0 ? first : row === 1 ? second
                        : isRadioSignal && row === 2 ? third : first + second + third;
                    const y = center - displacement * pixelsPerUnit;
                    if (x === left) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = colors[row];
                ctx.lineWidth = 4;
                ctx.stroke();
                // Summen har én sinusamplitude bare når bølgelengdene er like.
                if (row < resultRow || (!isRadioSignal && ratio === 1)) {
                    const arrowX = right - 4;
                    const top = center - amplitudes[row] * pixelsPerUnit;
                    if (isRadioSignal && row < resultRow) {
                        ctx.beginPath();
                        ctx.setLineDash([5, 5]);
                        ctx.moveTo(left, top);
                        ctx.lineTo(arrowX, top);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
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
            if (compact) return;
            const left = isRadioSignal ? 62 : 48;
            const right = width - 18;
            ctx.font = "bold 26px Arial";
            ctx.fillStyle = "#555";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("+", (left + right) / 2, isRadioSignal ? 220 : 165);
            if (isRadioSignal) ctx.fillText("+", (left + right) / 2, 450);
            ctx.fillText("=", (left + right) / 2, isRadioSignal ? 800 : 350);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
        }

        function resize() {
            if (!canvas.clientWidth) return;
            if (isRadioSignal) {
                const compact = canvas.clientWidth >= 750;
                canvas.style.height = compact ? "680px" : "1300px";
                element("radioPlots").setAttribute("data-layout", compact ? "grid" : "stacked");
            }
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(canvas.clientWidth * dpr);
            canvas.height = Math.round(canvas.clientHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            draw();
        }

        function update() {
            if (isRadioSignal) {
                for (const [input, key] of [[counterAmplitude, "amplitude"], [counterWavelength, "wavelength"]]) {
                    if (input.value.trim() !== "" && input.validity.valid) counter[key] = Number(input.value);
                }
                counter.shift = Number(counterShift.value) / 100;
                const description = `${format(counter.shift)} λ₃ · ${format(counter.shift * counter.wavelength)} m`;
                counterShift.setAttribute("aria-valuetext", description);
            }
            const value = shiftValue();
            const first = firstAmplitude();
            const second = secondAmplitude();
            const ratio = currentRatio();
            [first, second].forEach((amplitude, index) => {
                if (!amplitudeValues[index]) return;
                amplitudeValues[index].textContent = format(amplitude);
                [amplitude1, amplitude2][index].setAttribute("aria-valuetext", format(amplitude));
            });
            const reveal = isRadioSignal || resultToggle.checked;
            resultDetails.forEach(element => { element.hidden = !reveal; });
            let text;
            if (first === 0 && second === 0) text = "Begge amplitudene er null, så alle tre bølgene er flate.";
            else if (first === 0 || second === 0) text = "Én amplitude er null. Bølge 3 følger den andre bølgen.";
            else if (isRadioSignal) {
                const cancels = resultToggle.checked && Math.abs(counter.amplitude - second) < 1e-9
                    && Math.abs(counter.wavelength - noiseWavelength) < 1e-9
                    && Math.abs(Math.cos(counter.shift * 2 * Math.PI - value / 100 * 2 * Math.PI / ratio) + 1) < 1e-9;
                text = !resultToggle.checked ? "Uten motsignal: Du mottar radiosignalet pluss støyen. Slå på motsignalet for å sammenligne."
                    : cancels ? "Støyen er kansellert! Det mottatte radiosignalet er lik bølge 1."
                    : counter.amplitude === 0 ? "Motsignalet er flatt. Det mottatte signalet er radiosignalet pluss støyen."
                    : "Det mottatte signalet er summen av radiosignalet, støyen og motsignalet. Prøv å få det til å følge bølge 1.";
            }
            else if (value === 0 || value === 100) text = "Topper sammen: Amplitude 1 + amplitude 2 = amplitude 3. Den blå og den røde bølgen forsterker hverandre.";
            else if (value === 50) text = first === second
                ? "En halv bølgelengde: Topp møter bunn. Like store utslag i motsatt retning opphever hverandre, og bølge 3 blir helt flat."
                : "En halv bølgelengde: Topp møter bunn. Bølgene svekker hverandre. Fordi amplitudene er ulike, blir det et utslag igjen i bølge 3.";
            else text = "Bølgene er forskjøvet: Utslagene på samme sted legges sammen.";
            if (status) status.textContent = reveal ? text : "";
            const explanation = element("interferenceExplanation");
            if (explanation) explanation.textContent = isRadioSignal
                ? resultToggle.checked
                    ? "Med motsignal: Utslagene fra bølge 1, 2 og 3 legges sammen i det mottatte signalet. Alle bølgene beveger seg med samme hastighet."
                    : "Uten motsignal: Bare utslagene fra bølge 1 og 2 legges sammen. Innstillingene for bølge 3 beholdes når du slår motsignalet av."
                : ratio === 1
                ? "På hvert sted legges utslagene sammen. Når toppene ligger sammen, legges amplitudene sammen. Like store utslag i motsatt retning opphever hverandre."
                : "På hvert sted legges utslagene sammen. Begge bølger beveger seg med samme hastighet. Bølge 2 har en annen bølgelengde, så topper og bunner møtes på ulike steder.";
            canvas.setAttribute("aria-label", isRadioSignal
                ? `Bølge 1: sammensatt radiosignal (blå), maksimalt utslag 1, formen gjentas hver 10. meter. Bølge 2: støy (rød), amplitude 0,5 og bølgelengde ${format(noiseWavelength)} meter. ${resultToggle.checked ? `MED MOTSIGNAL. Bølge 3: motsignal (lilla), amplitude ${format(counter.amplitude)}, bølgelengde ${format(counter.wavelength)} meter. Mottatt radiosignal (grønn) er summen av alle tre.` : "UTEN MOTSIGNAL. Motsignalet er av. Mottatt radiosignal (grønn) er summen av bølge 1 og 2."} X-aksene viser 0 til 25 meter, og y-aksene har samme skala med trinn på 0,5.`
                : reveal
                ? "Blå bølge 1 pluss rød bølge 2 er lik grønn bølge 3. Samme skala: utslag fra −1 til 1 i de to første grafene og fra −2 til 2 i den tredje."
                : "Blå bølge 1 og rød bølge 2. Bølge 3 er skjult; et tomt koordinatsystem fra −2 til 2 lar deg gjette summen.");
            const descriptions = {0: "0 λ · ingen forskyvning", 25: "¼ λ · en kvart bølgelengde", 50: "½ λ · en halv bølgelengde", 75: "¾ λ · tre kvart bølgelengde", 100: "1 λ · en hel bølgelengde"};
            const description = descriptions[value] || `${format(value / 100)} λ · bølgelengder`;
            if (shift) {
                element("shiftReadout").textContent = description;
                shift.setAttribute("aria-valuetext", description);
            }
            draw();
        }

        function animate(timestamp) {
            if (!moving) return;
            if (previousTime !== null && !element("panel-interference").hidden) travel += Math.min((timestamp - previousTime) / 1000, 0.1) * 1.1;
            previousTime = timestamp;
            draw();
            frame = requestAnimationFrame(animate);
        }
        controls.forEach(input => input.addEventListener("input", update));
        resultToggle.addEventListener("change", update);
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
        play.textContent = moving ? "Sett på pause" : "Start bevegelse";
        play.setAttribute("aria-pressed", String(moving));
        if (moving) frame = requestAnimationFrame(animate);
    }
    ["", "-2"].forEach(initializeInterference);
})();
