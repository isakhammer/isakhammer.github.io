(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const hashes = ["#en-bolge", "#interferens", "#interferens-2"];
    function selectTab(tab, updateUrl = true) {
        tabs.forEach(item => {
            const selected = item === tab;
            item.setAttribute("aria-selected", String(selected));
            item.tabIndex = selected ? 0 : -1;
            document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
        });
        if (updateUrl) history.replaceState(null, "", hashes[tabs.indexOf(tab)]);
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => selectTab(tab));
        tab.addEventListener("keydown", event => {
            let next;
            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault();
            selectTab(tabs[next]);
            tabs[next].focus();
        });
    });
    function readHash() { selectTab(tabs[Math.max(0, hashes.indexOf(location.hash))], false); }
    window.addEventListener("hashchange", readHash);
    readHash();
})();
