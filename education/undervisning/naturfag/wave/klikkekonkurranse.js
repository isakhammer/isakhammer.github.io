(() => {
    const element = id => document.getElementById(id);
    const panel = element("panel-click");
    const start = element("clickStart");
    const pad = element("clickPad");
    const prompt = element("clickPrompt");
    const count = element("clickCount");
    const timer = element("clickTimer");
    const status = element("clickStatus");
    const marks = element("clickMarks");
    const intervalMarks = element("clickIntervalMarks");
    const duration = 10;
    const format = value => value.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let state = "ready";
    let deadline = 0;
    let startedAt = 0;
    let clicks = 0;
    let clickTimes = [];
    let round = 0;
    let frame = null;

    const timelineX = time => 25 + (time - startedAt) / (duration * 1000) * 850;

    function markInterval(index, label, value, y, color, radius) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        function append(tag, attributes, text) {
            const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
            Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
            if (text) node.textContent = text;
            group.append(node);
        }
        const left = timelineX(clickTimes[index]);
        const right = timelineX(clickTimes[index + 1]);
        [left, right].forEach(x => {
            append("line", { x1: x, y1: y, x2: x, y2: 110, stroke: color, "stroke-dasharray": "4 4", opacity: 0.6 });
            append("line", { x1: x, y1: y - 5, x2: x, y2: y + 5, stroke: color, "stroke-width": 2 });
            append("circle", { cx: x, cy: 110, r: radius, fill: "none", stroke: color, "stroke-width": 2 });
        });
        append("line", { x1: left, y1: y, x2: right, y2: y, stroke: color, "stroke-width": 3 });
        const labelX = Math.max(130, Math.min(770, (left + right) / 2));
        append("rect", { x: labelX - 125, y: y - 29, width: 250, height: 24, rx: 4, fill: "white" });
        append("text", { x: labelX, y: y - 11, fill: color, "font-size": 20, "font-weight": "bold", "text-anchor": "middle" }, `${label}: ${value} s`);
        intervalMarks.append(group);
    }

    function finish() {
        state = "finished";
        cancelAnimationFrame(frame);
        pad.disabled = true;
        start.disabled = false;
        start.textContent = "Start ny runde";
        prompt.textContent = "Tiden er ute!";
        timer.textContent = "10 sekunder er gått";
        const period = clicks > 0 ? duration / clicks : null;
        const frequency = period === null ? 0 : 1 / period;
        const intervals = clickTimes.slice(1).map((time, index) => (time - clickTimes[index]) / 1000);
        const formatInterval = value => value.toLocaleString("nb-NO", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
        const shortest = intervals.length ? Math.min(...intervals) : null;
        const longest = intervals.length ? Math.max(...intervals) : null;
        if (intervals.length) {
            markInterval(intervals.indexOf(shortest), "Korteste T", formatInterval(shortest), 35, "#7c3aed", 6);
            markInterval(intervals.indexOf(longest), "Lengste T", formatInterval(longest), 75, "#b45309", 9);
        }
        element("clickShortest").textContent = shortest === null ? "– s" : `${formatInterval(shortest)} s`;
        element("clickLongest").textContent = longest === null ? "– s" : `${formatInterval(longest)} s`;
        element("clickIntervalNote").textContent = intervals.length
            ? `Målt mellom påfølgende klikk: ${intervals.length} perioder. Liten forskjell mellom korteste og lengste tid betyr jevn klikking.`
            : "Minst to klikk trengs for å måle tiden mellom klikkene.";
        element("clickFrequency").textContent = `${format(frequency)} Hz`;
        element("clickPeriod").textContent = period === null ? "– s" : `${format(period)} s`;
        element("clickFrequencyFormula").textContent = period === null
            ? "Ingen klikk gir frekvens 0 Hz."
            : `f = 1 / T ≈ ${format(frequency)} Hz`;
        element("clickPeriodFormula").textContent = period === null
            ? "Periodetiden kan ikke beregnes uten klikk."
            : `T = 10 s / ${clicks} ≈ ${format(period)} s`;
        status.textContent = clicks === 0 ? "Ingen klikk ble registrert. Prøv en ny runde."
            : `${clicks} klikk på 10 sekunder. Gjennomsnittlig periodetid: ${format(period)} sekunder. Frekvens: ${format(frequency)} Hz.`;
        if (intervals.length) status.textContent += ` Korteste periodetid: ${formatInterval(shortest)} sekunder. Lengste: ${formatInterval(longest)} sekunder.`;
        const row = document.createElement("tr");
        const label = document.createElement("th");
        label.scope = "row";
        label.textContent = String(++round);
        row.append(label);
        [String(clicks), format(frequency), period === null ? "–" : format(period)].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
        });
        element("clickRounds").prepend(row);
        while (element("clickRounds").children.length > 5) element("clickRounds").lastElementChild.remove();
        element("clickHistory").hidden = false;
        element("clickTimeline").setAttribute("aria-label", `${clicks} klikk fordelt over 10 sekunder. Hver prikk viser tidspunktet for ett klikk.${intervals.length ? ` Korteste periodetid er markert i lilla: ${formatInterval(shortest)} sekunder. Lengste er markert i oransje: ${formatInterval(longest)} sekunder.` : ""}`);
    }

    function tick(now) {
        if (state === "countdown") {
            if (now >= deadline) {
                // Start from this visible frame so every round gets a full ten seconds.
                state = "running";
                startedAt = now;
                deadline = now + duration * 1000;
                pad.disabled = false;
                prompt.textContent = "Klikk her!";
                status.textContent = "Klikk så raskt og jevnt du kan!";
                pad.focus({ preventScroll: true });
            } else {
                prompt.textContent = `Start om ${Math.ceil((deadline - now) / 1000)} …`;
            }
        }
        if (state === "running") {
            if (now >= deadline) {
                finish();
                return;
            }
            timer.textContent = `${((deadline - now) / 1000).toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s igjen`;
        }
        frame = requestAnimationFrame(tick);
    }

    start.addEventListener("click", () => {
        if (state === "running" || state === "countdown") return;
        clicks = 0;
        clickTimes = [];
        count.textContent = "0 klikk";
        marks.replaceChildren();
        intervalMarks.replaceChildren();
        element("clickTimeline").setAttribute("aria-label", "Tidslinje fra 0 til 10 sekunder. Hvert klikk vises som en prikk.");
        element("clickFrequency").textContent = "– Hz";
        element("clickPeriod").textContent = "– s";
        element("clickShortest").textContent = "– s";
        element("clickLongest").textContent = "– s";
        element("clickIntervalNote").textContent = "Måles mellom to påfølgende klikk. Minst to klikk trengs.";
        element("clickFrequencyFormula").textContent = "f = 1 / T";
        element("clickPeriodFormula").textContent = "T = 10 s / antall klikk";
        start.disabled = true;
        pad.disabled = true;
        state = "countdown";
        deadline = performance.now() + 3000;
        timer.textContent = "Gjør deg klar – 10 sekunder med klikk";
        status.textContent = "Runden starter om tre sekunder.";
        tick(performance.now());
    });

    pad.addEventListener("click", () => {
        if (state !== "running") return;
        const now = performance.now();
        if (now >= deadline) {
            finish();
            return;
        }
        clicks++;
        clickTimes.push(now);
        count.textContent = `${clicks} klikk`;
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", String(timelineX(now)));
        dot.setAttribute("cy", "110");
        dot.setAttribute("r", "4");
        marks.append(dot);
    });

    pad.addEventListener("keydown", event => {
        // Holding a key must not generate a stream of automatic clicks.
        if (event.repeat && (event.key === " " || event.key === "Enter")) event.preventDefault();
    });

    function cancelHiddenRound() {
        if ((!panel.hidden && !document.hidden) || (state !== "running" && state !== "countdown")) return;
        state = "ready";
        cancelAnimationFrame(frame);
        start.disabled = false;
        start.textContent = "Start ny runde";
        pad.disabled = true;
        prompt.textContent = "Runden ble avbrutt";
        timer.textContent = "Måletid: 10 sekunder";
        status.textContent = "Start en ny runde når du er klar. Den avbrutte runden er ikke lagret.";
    }
    new MutationObserver(cancelHiddenRound).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    document.addEventListener("visibilitychange", cancelHiddenRound);
})();
