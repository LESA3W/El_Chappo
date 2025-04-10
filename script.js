// État des moteurs
const motorValues = {
    m1: 90,
    m2: 90,
    m3: 90,
    m4: 90,
    m5: 90,
    m6: 10
};

// Éléments DOM
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const resetBtn = document.getElementById('reset-btn');
const motorValueElements = {
    m1: document.getElementById('m1-value'),
    m2: document.getElementById('m2-value'),
    m3: document.getElementById('m3-value'),
    m4: document.getElementById('m4-value'),
    m5: document.getElementById('m5-value'),
    m6: document.getElementById('m6-value')
};


// Image de base selon état de la pince
document.getElementById('handle-right').style.backgroundImage = motorValues.m6 === 73
    ? "url('assets/pince-closed.png')"
    : "url('assets/pince-open.png')";

// Initialisation des joysticks
initJoystick('joystick-left', 'handle-left', (x, y) => {
    const newM1 = Math.max(0, Math.min(180, Math.round(motorValues.m1 + (x * 5))));
    const newM2 = Math.max(0, Math.min(180, Math.round(motorValues.m2 + (y * 5))));
    updateMotorValue(1, newM1);
    updateMotorValue(2, newM2);
});

initJoystick('joystick-middle', 'handle-middle', (x, y) => {
    const newM3 = Math.max(0, Math.min(180, Math.round(motorValues.m3 + (y * 5))));
    const newM4 = Math.max(0, Math.min(180, Math.round(motorValues.m4 + (x * 5))));
    updateMotorValue(3, newM3);
    updateMotorValue(4, newM4);
});

initJoystick('joystick-right', 'handle-right', (x, y, isPressed) => {
    const newM5 = Math.max(0, Math.min(180, Math.round(motorValues.m5 + (x * 5))));
    if (isPressed) {
        const newM6 = motorValues.m6 === 10 ? 73 : 10;
        updateMotorValue(6, newM6);
        
    } else {
        updateMotorValue(5, newM5);
    }
});

resetBtn.addEventListener('click', () => {
    resetBtn.classList.add('active');
    setTimeout(() => resetBtn.classList.remove('active'), 300);

    statusText.textContent = "Loading...";
    resetBtn.classList.add('pulse-feedback');

    if (navigator.vibrate) {
        navigator.vibrate([250, 750, 250, 750, 250]);
    }

    setTimeout(() => {
        resetBtn.classList.remove('pulse-feedback');
        statusText.textContent = "Réinitialisation...";

        updateMotorValue(1, 90);
        updateMotorValue(2, 90);
        updateMotorValue(3, 90);
        updateMotorValue(4, 90);
        updateMotorValue(5, 90);
        updateMotorValue(6, 73);

        document.getElementById('handle-left').style.transform = 'translate(-50%, -50%)';
        document.getElementById('handle-middle').style.transform = 'translate(-50%, -50%)';
        document.getElementById('handle-right').style.transform = 'translate(-50%, -50%)';

        const checkInterval = setInterval(() => {
            const allAtDefault = (
                motorValues.m1 === 90 &&
                motorValues.m2 === 90 &&
                motorValues.m3 === 90 &&
                motorValues.m4 === 90 &&
                motorValues.m5 === 90 &&
                motorValues.m6 === 73
            );
            if (allAtDefault) {
                clearInterval(checkInterval);
                statusText.textContent = "Connecté";
            }
        }, 100);
    }, 3000);
});

setTimeout(() => {
    statusDot.classList.add('connected');
    statusText.textContent = "Connecté";
}, 1500);

function updateMotorValue(motor, value) {
    const key = `m${motor}`;
    if (motorValues[key] !== value) {
        motorValues[key] = value;
        const element = motorValueElements[key];
        element.textContent = motor === 6
            ? (value === 10 ? "Ouverte" : "Fermée")
            : `${value}°`;
        element.classList.add('changed');
        setTimeout(() => element.classList.remove('changed'), 500);

        if (motor === 6) {
            const handleImage = document.getElementById('handle-right-image');
            const newImage = value === 73
                ? "url('assets/pince-closed.png')"
                : "url('assets/pince-open.png')";
        
            handleImage.style.backgroundImage = newImage;
        
            // 🔁 Force relance animation
            handleImage.classList.remove('pulse-image');
            void handleImage.offsetWidth;
            handleImage.classList.add('pulse-image');
        }

        sendMotorCommand(motor, value);
    }
}

function sendMotorCommand(motor, value) {
    const command = { motor, value, timestamp: Date.now() };
    console.log('Envoi commande:', command);
}

function initJoystick(containerId, handleId, callback) {
    const container = document.getElementById(containerId);
    const handle = document.getElementById(handleId);
    const rect = container.getBoundingClientRect();
    const radius = rect.width / 2;

    let isDragging = false;
    let isPressed = false;
    let touchId = null;

    container.addEventListener('touchstart', handleStart);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    container.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    function handleStart(e) {
        e.preventDefault();
        isDragging = true;
        isPressed = true;
        pressStartTime = Date.now(); // ← on démarre le chrono ici
    
        if (e.type === 'touchstart') {
            touchId = e.changedTouches[0].identifier;
        }
    }
    

    function handleMove(e) {
        if (!isDragging) return;
        let clientX, clientY;
        if (e.type === 'touchmove') {
            const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
            if (!touch) return;
            e.preventDefault();
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let x = clientX - centerX;
        let y = clientY - centerY;
        const distance = Math.sqrt(x * x + y * y);
        if (distance > radius) {
            x = x * radius / distance;
            y = y * radius / distance;
        }

        handle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        const normalizedX = x / radius;
        const normalizedY = y / radius;
        callback(normalizedX, normalizedY, false);
    }

    function handleEnd(e) {
        if (!isDragging) return;
        if (e.type === 'touchend') {
            const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
            if (!touch) return;
        }
        handle.style.transform = `translate(-50%, -50%)`;
        isDragging = false;
        
        if (containerId === 'joystick-right') {
            const duration = Date.now() - pressStartTime;
            if (duration < 300) {
                // 👆 Touche courte → déclenche ouverture/fermeture
                callback(0, 0, true);
            }
        }
        

        touchId = null;
    }

    document.getElementById('custom-btn').addEventListener('click', () => {
        statusText.textContent = "Animation en cours...";
    
        const sequence = [
            { m3: 60, m4: 120 }, // coude vers le haut, poignet vers l'extérieur
            { m3: 100, m4: 70 }, // coude vers le bas, poignet vers l'intérieur
            { m3: 60, m4: 120 }, // répète
            { m3: 90, m4: 90 }   // revient au neutre
        ];
    
        let step = 0;
        const interval = setInterval(() => {
            const move = sequence[step];
            if (move.m3 !== undefined) updateMotorValue(3, move.m3);
            if (move.m4 !== undefined) updateMotorValue(4, move.m4);
            step++;
    
            if (step >= sequence.length) {
                clearInterval(interval);
                statusText.textContent = "Connecté";
            }
        }, 600);
    });
    

}
