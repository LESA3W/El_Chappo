// État des moteurs
const motorValues = {
    m1: 90,  // Base
    m2: 90,  // Épaule
    m3: 90,  // Coude
    m4: 90,  // Poignet Vertical
    m5: 90,  // Poignet Rotation
    m6: 10   // Pince (10=ouverte, 73=fermée)
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

// Initialisation des joysticks
initJoystick('joystick-left', 'left-handle', (x, y) => {
    // Contrôle M1 (base) et M2 (épaule)
    const newM1 = Math.max(0, Math.min(180, Math.round(90 + (x * 90))));
    const newM2 = Math.max(15, Math.min(165, Math.round(90 + (y * 45))));
    
    updateMotorValue(1, newM1);
    updateMotorValue(2, newM2);
});

initJoystick('joystick-middle', 'middle-handle', (x, y) => {
    // Contrôle M3 (coude) et M4 (poignet vertical)
    const newM3 = Math.max(0, Math.min(180, Math.round(90 + (y * 90))));
    const newM4 = Math.max(0, Math.min(180, Math.round(90 + (x * 90))));
    
    updateMotorValue(3, newM3);
    updateMotorValue(4, newM4);
});

initJoystick('joystick-right', 'right-handle', (x, y, isPressed) => {
    // Contrôle M5 (rotation poignet) et M6 (pince)
    const newM5 = Math.max(0, Math.min(180, Math.round(90 + (x * 90))));
    
    if (isPressed) {
        const newM6 = motorValues.m6 === 10 ? 73 : 10;
        updateMotorValue(6, newM6);
    } else {
        updateMotorValue(5, newM5);
    }
});









// Bouton réinitialisation
resetBtn.addEventListener('click', () => {
    // Animation du bouton
    resetBtn.classList.add('active');
    setTimeout(() => resetBtn.classList.remove('active'), 300);
    
    // Affiche "Réinitialisation..."
    statusText.textContent = "Réinitialisation...";

    // Réinitialisation des moteurs à la position par défaut
    updateMotorValue(1, 90);
    updateMotorValue(2, 90);
    updateMotorValue(3, 90);
    updateMotorValue(4, 90);
    updateMotorValue(5, 90);
    updateMotorValue(6, 73);

    // Réinitialisation visuelle des joysticks
    document.getElementById('left-handle').style.transform = 'translate(0, 0)';
    document.getElementById('middle-handle').style.transform = 'translate(0, 0)';
    document.getElementById('right-handle').style.transform = 'translate(0, 0)';

    // 🔁 Vérifie périodiquement si toutes les valeurs sont bonnes
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
            clearInterval(checkInterval); // on arrête de vérifier
            statusText.textContent = "Connecté"; // ✅ on remet à jour
        }
    }, 100); // vérifie toutes les 100ms
});









// Simuler la connexion Bluetooth
setTimeout(() => {
    statusDot.classList.add('connected');
    statusText.textContent = "Connecté";
}, 1500);

// Fonctions utilitaires
function updateMotorValue(motor, value) {
    const key = `m${motor}`;
    if (motorValues[key] !== value) {
        motorValues[key] = value;
        
        // Mise à jour de l'affichage avec animation
        const element = motorValueElements[key];
        element.textContent = motor === 6 ? (value === 10 ? "Ouverte" : "Fermée") : `${value}°`;
        
        // Animation de changement
        element.classList.add('changed');
        setTimeout(() => element.classList.remove('changed'), 500);
        
        // Envoi de la commande
        sendMotorCommand(motor, value);
    }
}

function sendMotorCommand(motor, value) {
    const command = {
        motor,
        value,
        timestamp: Date.now()
    };
    
    console.log('Envoi commande:', command);
    
    // À implémenter avec votre connexion Bluetooth
    // Exemple: bluetoothConnection.send(JSON.stringify(command));
}

function initJoystick(containerId, handleId, callback) {
    const container = document.getElementById(containerId);
    const handle = document.getElementById(handleId);
    const rect = container.getBoundingClientRect();
    const radius = rect.width / 2;
    
    let isDragging = false;
    let isPressed = false;
    let touchId = null;
    
    // Gestion des événements tactiles
    container.addEventListener('touchstart', handleStart);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    
    // Gestion des événements souris
    container.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    function handleStart(e) {
        e.preventDefault();
        isDragging = true;
        isPressed = true;
        
        if (e.type === 'touchstart') {
            touchId = e.changedTouches[0].identifier;
        }
        
        if (containerId === 'joystick-right') {
            callback(0, 0, isPressed);
            isPressed = false;
        }
    }
    
    function handleMove(e) {
        if (!isDragging) return;
        
        let clientX, clientY;
        
        if (e.type === 'touchmove') {
            // Trouver le bon touch point si plusieurs doigts
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
        
        // Limiter au cercle
        const distance = Math.sqrt(x * x + y * y);
        if (distance > radius) {
            x = x * radius / distance;
            y = y * radius / distance;
        }
        
        // Déplacer le handle
        handle.style.transform = `translate(${x}px, ${y}px)`;
        
        // Normaliser les valeurs (-1 à 1)
        const normalizedX = x / radius;
        const normalizedY = y / radius;
        
        callback(normalizedX, normalizedY, false);
    }
    
    function handleEnd(e) {
        if (!isDragging) return;
        
        if (e.type === 'touchend') {
            // Vérifier que c'est le bon touch point
            const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
            if (!touch) return;
        }
        
        // Recentrer le joystick
        handle.style.transform = 'translate(0, 0)';
        isDragging = false;
        touchId = null;
        
        callback(0, 0, false);
    }
}
