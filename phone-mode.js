// Phone mode: previews the controller inside an iPhone 17 frame held in landscape.
// Self-contained so the rest of the site stays untouched.
(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.has("phone-embed")) return; // the copy shown inside the frame gets no button

    // iPhone 17 viewport in landscape, in CSS pixels
    const SCREEN_W = 874;
    const SCREEN_H = 402;
    const BEZEL = 14;        // black border around the screen
    const BAND = 5;          // titanium band around the bezel
    const INSET = BEZEL + BAND;
    const FRAME_W = SCREEN_W + 2 * INSET;
    const FRAME_H = SCREEN_H + 2 * INSET;
    const SCREEN_R = 56;
    const OUTER_R = SCREEN_R + INSET;

    // Drawn as SVG so the frame stays sharp at any zoom level
    const frameSvg = `
        <svg viewBox="-6 -6 ${FRAME_W + 12} ${FRAME_H + 12}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="pm-titanium" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#e9e3f1"/>
                    <stop offset="0.45" stop-color="#b9b0c8"/>
                    <stop offset="0.55" stop-color="#d8d0e3"/>
                    <stop offset="1" stop-color="#a69cb7"/>
                </linearGradient>
            </defs>
            <rect x="120" y="-4" width="56" height="7" rx="3" fill="#b9b0c8"/>
            <rect x="196" y="-4" width="56" height="7" rx="3" fill="#b9b0c8"/>
            <rect x="80" y="-4" width="26" height="7" rx="3" fill="#b9b0c8"/>
            <rect x="${FRAME_W - 260}" y="${FRAME_H - 3}" width="90" height="7" rx="3" fill="#b9b0c8"/>
            <path fill-rule="evenodd" fill="url(#pm-titanium)" d="
                M ${OUTER_R} 0 H ${FRAME_W - OUTER_R} A ${OUTER_R} ${OUTER_R} 0 0 1 ${FRAME_W} ${OUTER_R}
                V ${FRAME_H - OUTER_R} A ${OUTER_R} ${OUTER_R} 0 0 1 ${FRAME_W - OUTER_R} ${FRAME_H}
                H ${OUTER_R} A ${OUTER_R} ${OUTER_R} 0 0 1 0 ${FRAME_H - OUTER_R}
                V ${OUTER_R} A ${OUTER_R} ${OUTER_R} 0 0 1 ${OUTER_R} 0 Z
                M ${OUTER_R} ${BAND} A ${OUTER_R - BAND} ${OUTER_R - BAND} 0 0 0 ${BAND} ${OUTER_R}
                V ${FRAME_H - OUTER_R} A ${OUTER_R - BAND} ${OUTER_R - BAND} 0 0 0 ${OUTER_R} ${FRAME_H - BAND}
                H ${FRAME_W - OUTER_R} A ${OUTER_R - BAND} ${OUTER_R - BAND} 0 0 0 ${FRAME_W - BAND} ${FRAME_H - OUTER_R}
                V ${OUTER_R} A ${OUTER_R - BAND} ${OUTER_R - BAND} 0 0 0 ${FRAME_W - OUTER_R} ${BAND} Z"/>
            <path fill-rule="evenodd" fill="#050506" d="
                M ${OUTER_R} ${BAND} A ${OUTER_R - BAND} ${OUTER_R - BAND} 0 0 0 ${BAND} ${OUTER_R}
                V ${FRAME_H - OUTER_R} A ${OUTER_R - BAND} ${OUTER_R - BAND} 0 0 0 ${OUTER_R} ${FRAME_H - BAND}
                H ${FRAME_W - OUTER_R} A ${OUTER_R - BAND} ${OUTER_R - BAND} 0 0 0 ${FRAME_W - BAND} ${FRAME_H - OUTER_R}
                V ${OUTER_R} A ${OUTER_R - BAND} ${OUTER_R - BAND} 0 0 0 ${FRAME_W - OUTER_R} ${BAND} Z
                M ${INSET + SCREEN_R} ${INSET} A ${SCREEN_R} ${SCREEN_R} 0 0 0 ${INSET} ${INSET + SCREEN_R}
                V ${INSET + SCREEN_H - SCREEN_R} A ${SCREEN_R} ${SCREEN_R} 0 0 0 ${INSET + SCREEN_R} ${INSET + SCREEN_H}
                H ${INSET + SCREEN_W - SCREEN_R} A ${SCREEN_R} ${SCREEN_R} 0 0 0 ${INSET + SCREEN_W} ${INSET + SCREEN_H - SCREEN_R}
                V ${INSET + SCREEN_R} A ${SCREEN_R} ${SCREEN_R} 0 0 0 ${INSET + SCREEN_W - SCREEN_R} ${INSET} Z"/>
            <rect x="${INSET + 11}" y="${FRAME_H / 2 - 62}" width="35" height="124" rx="17.5" fill="#000"/>
            <circle cx="${INSET + 28.5}" cy="${FRAME_H / 2 + 42}" r="6" fill="#0d1424"/>
        </svg>`;

    const style = document.createElement("style");
    style.textContent = `
        .phone-mode-btn {
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 14px;
            border: 1px solid #2f3540;
            border-radius: 999px;
            background: #1c1f26;
            color: #fff;
            font-family: "Montserrat", sans-serif;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s;
        }
        .phone-mode-btn:hover { background: #242936; border-color: #1e88e5; }
        .phone-mode-btn.active { background: #1e88e5; border-color: #1e88e5; }
        .phone-mode-btn svg { width: 16px; height: 16px; }
        .phone-mode-overlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 50% 40%, #23262d 0%, #0b0c0f 75%);
        }
        .phone-mode-overlay.open { display: flex; }
        .phone-mode-stage {
            position: relative;
            width: ${FRAME_W}px;
            height: ${FRAME_H}px;
            flex-shrink: 0;
            transform-origin: center;
            border-radius: ${OUTER_R}px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.55);
        }
        .phone-mode-stage iframe {
            position: absolute;
            left: ${INSET}px;
            top: ${INSET}px;
            width: ${SCREEN_W}px;
            height: ${SCREEN_H}px;
            border: 0;
            border-radius: ${SCREEN_R}px;
            background: #000;
        }
        .phone-mode-stage > svg {
            position: absolute;
            left: -6px;
            top: -6px;
            width: ${FRAME_W + 12}px;
            height: ${FRAME_H + 12}px;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    const phoneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="3"/><line x1="5.5" y1="10.5" x2="5.5" y2="13.5"/></svg>';

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "phone-mode-btn";
    btn.innerHTML = phoneIcon + "<span>Phone mode</span>";

    const overlay = document.createElement("div");
    overlay.className = "phone-mode-overlay";
    const stage = document.createElement("div");
    stage.className = "phone-mode-stage";
    stage.innerHTML = frameSvg;
    overlay.appendChild(stage);

    function fit() {
        const scale = Math.min(window.innerWidth * 0.92 / FRAME_W, window.innerHeight * 0.85 / FRAME_H, 1.2);
        stage.style.transform = "scale(" + scale + ")";
    }

    function open() {
        if (!stage.querySelector("iframe")) {
            const screen = document.createElement("iframe");
            const url = new URL(window.location.href);
            url.searchParams.set("phone-embed", "1");
            screen.src = url.toString();
            screen.title = "El-Chappo on iPhone 17";
            stage.insertBefore(screen, stage.firstChild);
        }
        overlay.classList.add("open");
        btn.classList.add("active");
        btn.querySelector("span").textContent = "Exit phone mode";
        fit();
    }

    function close() {
        overlay.classList.remove("open");
        btn.classList.remove("active");
        btn.querySelector("span").textContent = "Phone mode";
    }

    btn.addEventListener("click", function () {
        overlay.classList.contains("open") ? close() : open();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
    });
    window.addEventListener("resize", fit);

    document.body.appendChild(overlay);
    document.body.appendChild(btn);
})();
