// Oppgavene bruker et enkelt Markdown-format: ## overskrifter, avsnitt og - punktlister.
(() => {
    const scriptUrl = document.currentScript.src;
    function loadContainer(container) {
    const source = new URL(container.dataset.tasks, scriptUrl);

    function renderTasks(markdown) {
        const fragment = document.createDocumentFragment();
        let task = null;
        let paragraph = [];
        let list = null;
        let count = 0;

        function flushParagraph() {
            if (!paragraph.length) return;
            const p = document.createElement("p");
            p.textContent = paragraph.join(" ");
            task.append(p);
            paragraph = [];
        }

        for (const raw of markdown.split(/\r?\n/)) {
            const line = raw.trim();
            if (line.startsWith("## ")) {
                flushParagraph();
                list = null;
                task = document.createElement("article");
                task.className = "task";
                const heading = document.createElement("h3");
                heading.textContent = line.slice(3);
                task.append(heading);
                fragment.append(task);
                count++;
            } else if (!line || line.startsWith("# ")) {
                flushParagraph();
                list = null;
            } else if (task && line.startsWith("- ")) {
                flushParagraph();
                if (!list) {
                    list = document.createElement("ul");
                    task.append(list);
                }
                const item = document.createElement("li");
                item.textContent = line.slice(2);
                list.append(item);
            } else if (task) {
                list = null;
                paragraph.push(line);
            }
        }
        flushParagraph();
        if (!count) {
            const p = document.createElement("p");
            p.textContent = "Ingen oppgaver er lagt til ennå.";
            fragment.append(p);
        }
        container.replaceChildren(fragment);
    }

    async function loadTasks() {
        try {
            const response = await fetch(source);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            renderTasks(await response.text());
        } catch {
            const message = document.createElement("p");
            message.textContent = "Oppgavene kunne ikke lastes. Prøv å laste siden på nytt.";
            if (location.protocol === "file:") {
                message.textContent = "Åpne siden gjennom en lokal webserver for å vise oppgavene.";
            }
            const link = document.createElement("a");
            link.href = source.href;
            link.textContent = "Åpne oppgavefilen";
            container.replaceChildren(message, link);
        } finally {
            container.setAttribute("aria-busy", "false");
        }
    }
    loadTasks();
    }
    document.querySelectorAll("[data-tasks]").forEach(loadContainer);
})();
