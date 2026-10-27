// Phone mode: previews the controller inside an iPhone 17 frame held in landscape.
// Self-contained so the rest of the site stays untouched.
(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.has("phone-embed")) return; // the copy shown inside the frame gets no button

    // iPhone 17 viewport in landscape, in CSS pixels
    const SCREEN_W = 874;
    const SCREEN_H = 402;
    // Where the screen sits inside assets/iphone17-landscape.png (481 x 231 source grid)
    const HOLE = { left: 8 / 481, top: 9 / 231, width: 464 / 481, height: 214 / 231 };
    const FRAME_W = SCREEN_W / HOLE.width;
    const FRAME_H = SCREEN_H / HOLE.height;
    const SIZE = 0.8; // share of the available space the phone takes

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

        /* Draws the eye to the button when the page opens */
        .phone-mode-btn.attention {
            animation: pm-pop 0.6s ease-out 0.4s both, pm-glow 1.6s ease-in-out 1s 3;
            border-color: #1e88e5;
        }
        .phone-mode-btn.attention svg { animation: pm-tilt 1.6s ease-in-out 1s 3; }
        .phone-mode-btn.attention::after {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            border: 2px solid #1e88e5;
            animation: pm-ring 1.6s ease-out 1s 3;
            opacity: 0;
            pointer-events: none;
        }
        @keyframes pm-pop {
            0% { transform: translateY(-14px) scale(0.85); opacity: 0; }
            60% { transform: translateY(0) scale(1.08); opacity: 1; }
            100% { transform: translateY(0) scale(1); }
        }
        @keyframes pm-glow {
            0%, 100% { box-shadow: 0 0 0 rgba(30, 136, 229, 0); }
            50% { box-shadow: 0 0 22px rgba(30, 136, 229, 0.75); }
        }
        @keyframes pm-ring {
            0% { transform: scale(1); opacity: 0.9; }
            100% { transform: scale(1.45, 1.9); opacity: 0; }
        }
        @keyframes pm-tilt {
            0%, 40%, 100% { transform: rotate(0deg); }
            10%, 30% { transform: rotate(-90deg); }
        }
        @media (prefers-reduced-motion: reduce) {
            .phone-mode-btn.attention,
            .phone-mode-btn.attention svg,
            .phone-mode-btn.attention::after { animation: none; }
        }

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
        }
        .phone-mode-stage iframe {
            position: absolute;
            left: ${HOLE.left * 100}%;
            top: ${HOLE.top * 100}%;
            width: ${SCREEN_W}px;
            height: ${SCREEN_H}px;
            border: 0;
            border-radius: 44px;
            background: #000;
        }
        .phone-mode-stage img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            user-select: none;
        }
    `;
    document.head.appendChild(style);

    const phoneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="3"/><line x1="5.5" y1="10.5" x2="5.5" y2="13.5"/></svg>';

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "phone-mode-btn attention";
    btn.innerHTML = phoneIcon + "<span>Phone mode</span>";

    const overlay = document.createElement("div");
    overlay.className = "phone-mode-overlay";
    const stage = document.createElement("div");
    stage.className = "phone-mode-stage";
    const frame = document.createElement("img");
    frame.src = "assets/iphone17-landscape.png";
    frame.alt = "";
    stage.appendChild(frame);
    overlay.appendChild(stage);

    function fit() {
        const scale = SIZE * Math.min(window.innerWidth * 0.92 / FRAME_W, window.innerHeight * 0.85 / FRAME_H, 1.2);
        stage.style.transform = "scale(" + scale + ")";
    }

    function stopAttention() {
        btn.classList.remove("attention");
    }

    function open() {
        stopAttention();
        if (!stage.querySelector("iframe")) {
            const screen = document.createElement("iframe");
            const url = new URL(window.location.href);
            url.searchParams.set("phone-embed", "1");
            screen.src = url.toString();
            screen.title = "El-Chappo on iPhone 17";
            stage.insertBefore(screen, frame);
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
    btn.addEventListener("mouseenter", stopAttention);
    btn.addEventListener("animationend", function (e) {
        if (e.animationName === "pm-glow") stopAttention();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
    });
    window.addEventListener("resize", fit);

    document.body.appendChild(overlay);
    document.body.appendChild(btn);
})();
