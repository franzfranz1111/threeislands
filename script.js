// Konstanten
const ACCESS_CODE = 'moin';
const SNAKE_CONFIG = {
    gridSize: 16,
    speed: 166.67, // 6 cells per second = 1000/6 ms
    color: '#00FF66',
    backgroundColor: '#000000',
    maxFPS: 30
};

// Globale Variablen
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let canvas, ctx;
let gameLoop;
let gridWidth, gridHeight;
let lastFrameTime = 0;
let isTabActive = true;
let food = [];
let foodTypes = [
    { type: 'fahrradfahrer', symbol: '🚴', growth: 1, size: 4 },
    { type: 'fahrrad', symbol: '🚲', growth: 1, size: 4 }
];
let pulseEffect = 0; // Frames remaining for pulse effect
let gameOverEffect = 0; // Frames for game over blink effect

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const accessCodeInput = document.getElementById('accessCode');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');
const mainMenu = document.getElementById('mainMenu');
const backButton = document.getElementById('backToMenu');
const logoutButton = document.getElementById('logoutButton');
const navButtons = document.querySelectorAll('.nav-button');
const contentSections = document.querySelectorAll('.content-section');
const trailerVideo = document.getElementById('trailerVideo');
const telegramLink = document.getElementById('telegramLink');

// Initialisierung
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Snake Canvas Setup
    setupSnakeAnimation();
    
    // Event Listeners
    setupEventListeners();
    
    // Login-Status prüfen oder Login-Screen zeigen (nur auf Hauptseite)
    if (loginScreen && mainApp) {
        const urlHash = window.location.hash;
        if (urlHash === '#menu') {
            // Direkt zum Menü springen wenn #menu in URL
            sessionStorage.setItem('cobras_logged_in', 'true');
            showMainApp();
        } else if (!checkLoginStatus()) {
            showLoginScreen();
        }
    }
    
    // YouTube Video Setup
    setupVideo();
    
    // External Links Setup
    setupExternalLinks();
}

function setupSnakeAnimation() {
    canvas = document.getElementById('snakeCanvas');
    ctx = canvas.getContext('2d');
    
    // Canvas Größe setzen
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Snake initialisieren
    initSnake();
    
    // Animation immer starten (Debug)
    console.log('Starting snake animation...');
    startSnakeAnimation();
    
    // Initial draw
    drawSnake();
    
    // Tab Visibility API für Performance
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // CSS-Größe setzen
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    
    // Tatsächliche Canvas-Auflösung für scharfe Pixel
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    // Context für HiDPI skalieren
    ctx.scale(dpr, dpr);
    
    // Grid-Größe basierend auf logischer Größe berechnen
    gridWidth = Math.floor(window.innerWidth / SNAKE_CONFIG.gridSize);
    gridHeight = Math.floor(window.innerHeight / SNAKE_CONFIG.gridSize);
    
    // Snake neu positionieren wenn Canvas größer wird
    if (snake.length > 0) {
        snake.forEach(segment => {
            segment.x = Math.min(segment.x, gridWidth - 1);
            segment.y = Math.min(segment.y, gridHeight - 1);
        });
    }
}

function initSnake() {
    // Snake links oben starten mit fester Länge
    const startX = 10;
    const startY = 10;
    const snakeLength = 8;
    
    snake = [];
    for (let i = 0; i < snakeLength; i++) {
        snake.push({ x: startX - i, y: startY });
    }
    
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    
    // Food initialisieren
    food = [];
    spawnFood();
    
    console.log('Snake initialized:', snake);
    console.log('Grid size:', gridWidth, 'x', gridHeight);
}

function startSnakeAnimation() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    console.log('Animation loop starting with speed:', SNAKE_CONFIG.speed);
    
    gameLoop = setInterval(() => {
        if (isTabActive) {
            updateSnake();
            drawSnake();
        }
    }, SNAKE_CONFIG.speed);
}

function updateSnake() {
    // Game Over Effect handhaben
    if (gameOverEffect > 0) {
        gameOverEffect--;
        if (gameOverEffect === 0) {
            // Spiel neu starten
            initSnake();
        }
        return; // Keine Bewegung während Game Over
    }
    
    // Pulse Effect reduzieren
    if (pulseEffect > 0) {
        pulseEffect--;
    }
    
    // Richtung aktualisieren
    direction = { ...nextDirection };
    
    // Kopf bewegen
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // Wrapping an den Rändern mit neuer Richtung
    if (head.x >= gridWidth) {
        head.x = 0;
        changeRandomDirection();
    }
    if (head.x < 0) {
        head.x = gridWidth - 1;
        changeRandomDirection();
    }
    if (head.y >= gridHeight) {
        head.y = 0;
        changeRandomDirection();
    }
    if (head.y < 0) {
        head.y = gridHeight - 1;
        changeRandomDirection();
    }
    
    // Neuen Kopf hinzufügen
    snake.unshift(head);
    
    // Food-Kollision prüfen
    let ateFood = false;
    food = food.filter(f => {
        const fSize = f.size || 1;
        
        // Prüfe alle Zellen des Foods
        let collision = false;
        for (let dx = 0; dx < fSize; dx++) {
            for (let dy = 0; dy < fSize; dy++) {
                if (f.x + dx === head.x && f.y + dy === head.y) {
                    collision = true;
                    break;
                }
            }
            if (collision) break;
        }
        
        if (collision) {
            // Food gegessen! Schlange wächst und pulsiert
            for (let i = 0; i < f.growth; i++) {
                const tail = snake[snake.length - 1];
                snake.push({ ...tail });
            }
            ateFood = true;
            pulseEffect = 8; // 8 Frames pulsieren
            return false; // Food entfernen
        }
        return true; // Food behalten
    });
    
    // Schwanz entfernen (nur wenn kein Food gegessen)
    if (!ateFood) {
        snake.pop();
    }
    
    // Neues Food spawnen
    if (Math.random() < 0.02) {
        spawnFood();
    }
    
    // Intelligente Bewegung: Auf Food zugehn oder zufällig
    if (food.length > 0 && Math.random() < 0.7) {
        // 70% Chance auf Snack zuzugehen
        moveTowardsFood();
    } else if (Math.random() < 0.15) {
        // 15% Chance auf zufällige Richtungsänderung
        changeRandomDirection();
    }
    
    // Kollision prüfen BEVOR der Kopf bewegt wird
    const potentialHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // Wrapping für potentiellen Kopf
    if (potentialHead.x >= gridWidth) potentialHead.x = 0;
    if (potentialHead.x < 0) potentialHead.x = gridWidth - 1;
    if (potentialHead.y >= gridHeight) potentialHead.y = 0;
    if (potentialHead.y < 0) potentialHead.y = gridHeight - 1;
    
    // Prüfe Kollision mit sich selbst
    if (snake.some(segment => segment.x === potentialHead.x && segment.y === potentialHead.y)) {
        // Versuche eine sichere Richtung zu finden
        if (!findSafeDirection()) {
            // Keine sichere Richtung gefunden - Game Over!
            gameOverEffect = 16;
            pulseEffect = 0;
            return;
        }
        // Neue Richtung wurde gesetzt, Head nochmal berechnen
        head.x += nextDirection.x;
        head.y += nextDirection.y;
    }
}

function checkSelfCollision(head) {
    return snake.slice(1).some(segment => 
        segment.x === head.x && segment.y === head.y
    );
}

function findSafeDirection() {
    const head = snake[0];
    const directions = [
        { x: 1, y: 0 },   // rechts
        { x: -1, y: 0 },  // links  
        { x: 0, y: 1 },   // runter
        { x: 0, y: -1 }   // hoch
    ];
    
    // Filtere sichere Richtungen
    const safeDirections = directions.filter(dir => {
        // Keine Rückwärts-Bewegung
        if (dir.x === -direction.x && dir.y === -direction.y) return false;
        
        // Simuliere nächste Position
        const nextHead = {
            x: head.x + dir.x,
            y: head.y + dir.y
        };
        
        // Wrapping berücksichtigen
        if (nextHead.x >= gridWidth) nextHead.x = 0;
        if (nextHead.x < 0) nextHead.x = gridWidth - 1;
        if (nextHead.y >= gridHeight) nextHead.y = 0;
        if (nextHead.y < 0) nextHead.y = gridHeight - 1;
        
        // Prüfe ob diese Position sicher ist
        return !snake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y);
    });
    
    if (safeDirections.length > 0) {
        // Wähle eine sichere Richtung
        nextDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)];
        return true;
    }
    
    return false; // Keine sichere Richtung gefunden
}

function moveTowardsFood() {
    if (food.length === 0) return;
    
    const head = snake[0];
    
    // Finde nächstes Food
    let closestFood = food[0];
    let minDistance = Math.abs(head.x - closestFood.x) + Math.abs(head.y - closestFood.y);
    
    food.forEach(f => {
        const distance = Math.abs(head.x - f.x) + Math.abs(head.y - f.y);
        if (distance < minDistance) {
            closestFood = f;
            minDistance = distance;
        }
    });
    
    // Berechne ideale Richtung zum Food
    const deltaX = closestFood.x - head.x;
    const deltaY = closestFood.y - head.y;
    
    const possibleDirections = [];
    
    // Priorisiere Richtung basierend auf Entfernung
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal wichtiger
        if (deltaX > 0) possibleDirections.push({ x: 1, y: 0, priority: 3 });
        if (deltaX < 0) possibleDirections.push({ x: -1, y: 0, priority: 3 });
        if (deltaY > 0) possibleDirections.push({ x: 0, y: 1, priority: 2 });
        if (deltaY < 0) possibleDirections.push({ x: 0, y: -1, priority: 2 });
    } else {
        // Vertikal wichtiger
        if (deltaY > 0) possibleDirections.push({ x: 0, y: 1, priority: 3 });
        if (deltaY < 0) possibleDirections.push({ x: 0, y: -1, priority: 3 });
        if (deltaX > 0) possibleDirections.push({ x: 1, y: 0, priority: 2 });
        if (deltaX < 0) possibleDirections.push({ x: -1, y: 0, priority: 2 });
    }
    
    // Filtere gültige UND sichere Richtungen
    const head_copy = snake[0];
    const safeDirections = possibleDirections.filter(dir => {
        // Keine Rückwärts-Bewegung
        if (dir.x === -direction.x && dir.y === -direction.y) return false;
        
        // Simuliere nächste Position
        const nextHead = {
            x: head_copy.x + dir.x,
            y: head_copy.y + dir.y
        };
        
        // Wrapping berücksichtigen
        if (nextHead.x >= gridWidth) nextHead.x = 0;
        if (nextHead.x < 0) nextHead.x = gridWidth - 1;
        if (nextHead.y >= gridHeight) nextHead.y = 0;
        if (nextHead.y < 0) nextHead.y = gridHeight - 1;
        
        // Prüfe Kollision
        return !snake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y);
    });
    
    if (safeDirections.length > 0) {
        // Wähle sichere Richtung mit höchster Priorität
        const bestPriority = Math.max(...safeDirections.map(d => d.priority));
        const bestDirections = safeDirections.filter(d => d.priority === bestPriority);
        const chosen = bestDirections[Math.floor(Math.random() * bestDirections.length)];
        nextDirection = { x: chosen.x, y: chosen.y };
    } else {
        // Keine sichere Richtung zum Food - nimm sichere alternative Richtung
        findSafeDirection();
    }
}

function changeRandomDirection() {
    // Versuche zuerst eine sichere Richtung zu finden
    if (findSafeDirection()) {
        return; // Sichere Richtung gefunden
    }
    
    // Fallback zu alter Logik falls keine sichere Richtung existiert
    const directions = [
        { x: 1, y: 0 },   // rechts
        { x: -1, y: 0 },  // links  
        { x: 0, y: 1 },   // runter
        { x: 0, y: -1 }   // hoch
    ];
    
    // Keine Rückwärts-Bewegung
    const validDirections = directions.filter(dir => 
        !(dir.x === -direction.x && dir.y === -direction.y)
    );
    
    nextDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
}

function drawSnake() {
    // Hintergrund mit Game Over Blink-Effekt
    if (gameOverEffect > 0) {
        // Blink-Effekt: Hell bei Frames 16-13, 8-5 (zweimal blinken)
        const shouldBlink = (gameOverEffect > 12) || (gameOverEffect > 4 && gameOverEffect <= 8);
        ctx.fillStyle = shouldBlink ? '#FFFFFF' : SNAKE_CONFIG.backgroundColor;
    } else {
        ctx.fillStyle = SNAKE_CONFIG.backgroundColor;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Food zeichnen
    food.forEach(f => {
        const fSize = f.size || 1;
        const pixelSize = SNAKE_CONFIG.gridSize * fSize;
        
        // Emoji-Symbol rendern
        const emoji = f.symbol;
        let fontSize = 17; // Standard (1px größer)
        if (fSize === 2) fontSize = 25; // Größer für 2x2 (1px größer)
        if (fSize === 3) fontSize = 33; // Noch größer für 3x3 (1px größer)
        if (fSize === 4) fontSize = 40; // Noch größer für 4x4
        
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = f.x * SNAKE_CONFIG.gridSize + (pixelSize / 2);
        const centerY = f.y * SNAKE_CONFIG.gridSize + (pixelSize / 2);
        
        ctx.fillText(emoji, centerX, centerY);
    });
    
    // Snake zeichnen mit Pulse-Effekt
    snake.forEach((segment, index) => {
        // Pulse-Effekt berechnen
        const pulseScale = pulseEffect > 0 ? 1 + (pulseEffect * 0.1) : 1;
        const pulseBrightness = pulseEffect > 0 ? Math.min(255, 102 + pulseEffect * 20) : 102;
        
        if (index === 0) {
            // Kopf heller, mit Pulse-Effekt
            if (pulseEffect > 0) {
                ctx.fillStyle = `rgb(${Math.min(255, pulseBrightness)}, 255, ${Math.min(255, 153 + pulseEffect * 10)})`;
            } else {
                ctx.fillStyle = '#00FF99';
            }
        } else {
            // Körper mit Pulse-Effekt
            const alpha = 1 - (index * 0.05);
            if (pulseEffect > 0) {
                ctx.fillStyle = `rgb(0, ${pulseBrightness}, ${Math.floor(pulseBrightness * 0.65)})`;
                ctx.globalAlpha = Math.max(alpha, 0.8);
            } else {
                ctx.fillStyle = SNAKE_CONFIG.color;
                ctx.globalAlpha = Math.max(alpha, 0.7);
            }
        }
        
        // Größe mit Pulse-Effekt
        const size = SNAKE_CONFIG.gridSize * pulseScale;
        const offset = (SNAKE_CONFIG.gridSize - size) / 2;
        
        // Pixel-perfekte Rechtecke (klassischer Snake-Look)
        ctx.fillRect(
            segment.x * SNAKE_CONFIG.gridSize + offset,
            segment.y * SNAKE_CONFIG.gridSize + offset,
            size,
            size
        );
        
        // Schwarzer Rand
        ctx.strokeStyle = pulseEffect > 0 ? '#003300' : '#000';
        ctx.lineWidth = pulseEffect > 0 ? 2 : 1;
        ctx.strokeRect(
            segment.x * SNAKE_CONFIG.gridSize + offset,
            segment.y * SNAKE_CONFIG.gridSize + offset,
            size,
            size
        );
    });
    
    ctx.globalAlpha = 1;
}

function spawnFood() {
    // Nur spawnen wenn nicht zu viel Food da ist
    if (food.length >= 3) return;
    
    let attempts = 0;
    let foodPos;
    const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    const foodSize = foodType.size || 1;
    
    // Versuche eine freie Position zu finden
    do {
        foodPos = {
            x: Math.floor(Math.random() * (gridWidth - foodSize + 1)),
            y: Math.floor(Math.random() * (gridHeight - foodSize + 1))
        };
        attempts++;
    } while (attempts < 50 && isFoodPositionBlocked(foodPos, foodSize));
    
    if (attempts < 50) {
        food.push({
            x: foodPos.x,
            y: foodPos.y,
            type: foodType.type,
            symbol: foodType.symbol,
            growth: foodType.growth,
            size: foodSize
        });
    }
}

function isFoodPositionBlocked(pos, size) {
    // Prüfe alle Zellen die das Food belegen würde
    for (let dx = 0; dx < size; dx++) {
        for (let dy = 0; dy < size; dy++) {
            const checkX = pos.x + dx;
            const checkY = pos.y + dy;
            
            // Prüfe Kollision mit Snake
            if (snake.some(s => s.x === checkX && s.y === checkY)) {
                return true;
            }
            
            // Prüfe Kollision mit anderem Food
            if (food.some(f => {
                const fSize = f.size || 1;
                for (let fx = 0; fx < fSize; fx++) {
                    for (let fy = 0; fy < fSize; fy++) {
                        if (f.x + fx === checkX && f.y + fy === checkY) {
                            return true;
                        }
                    }
                }
                return false;
            })) {
                return true;
            }
        }
    }
    return false;
}

function handleVisibilityChange() {
    isTabActive = !document.hidden;
    
    if (isTabActive && gameLoop) {
        // Animation wieder aufnehmen
        lastFrameTime = performance.now();
    }
}

function setupEventListeners() {
    // Login (nur wenn Elemente existieren)
    if (loginButton && accessCodeInput) {
        loginButton.addEventListener('click', handleLogin);
        accessCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    // Navigation (nur wenn Elemente existieren)
    if (navButtons && navButtons.length > 0) {
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                showContent(target);
            });
        });
    }
    
    // Back Button (nur wenn Element existiert)
    if (backButton) {
        backButton.addEventListener('click', showMainMenu);
    }
    
    // Logout Button (nur wenn Element existiert)
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginScreen && !loginScreen.classList.contains('hidden')) {
            showMainMenu();
        }
    });
}

function handleLogin() {
    const inputValue = accessCodeInput.value.trim();
    
    if (inputValue === ACCESS_CODE) {
        // Loading-Zustand aktivieren
        loginButton.textContent = 'Lädt...';
        loginButton.disabled = true;
        loginButton.classList.add('loading');
        accessCodeInput.disabled = true;
        errorMessage.textContent = '';
        
        // Künstliche Verzögerung für besseres UX
        setTimeout(() => {
            showMainApp();
            // Hash entfernen falls vorhanden
            window.location.hash = '';
            
            // Button zurücksetzen (für eventuellen Logout)
            resetLoginButton();
        }, 1200); // 1.2 Sekunden Loading
        
    } else {
        // Fehler-Animation
        loginButton.textContent = 'Fehler!';
        loginButton.classList.add('error');
        
        setTimeout(() => {
            showError('Falsches Passwort, bitte erneut versuchen');
            accessCodeInput.value = '';
            accessCodeInput.focus();
            resetLoginButton();
        }, 800);
    }
}

function resetLoginButton() {
    loginButton.textContent = 'Einloggen';
    loginButton.disabled = false;
    loginButton.classList.remove('loading', 'error');
    accessCodeInput.disabled = false;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Error nach 3 Sekunden ausblenden
    setTimeout(() => {
        errorMessage.textContent = '';
    }, 3000);
}

function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    mainApp.classList.add('hidden');
    resetLoginButton();
    accessCodeInput.focus();
}

function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('cobras_logged_in');
    console.log('Checking login status:', isLoggedIn);
    if (isLoggedIn === 'true') {
        showMainApp();
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem('cobras_logged_in');
    showLoginScreen();
}

function showMainApp() {
    loginScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    showMainMenu();
    // Login-Status speichern
    sessionStorage.setItem('cobras_logged_in', 'true');
    console.log('Login saved to sessionStorage');
}

function showMainMenu() {
    // Alle Content Sections verstecken
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Main Menu zeigen
    mainMenu.classList.add('active');
    backButton.classList.add('hidden');
}

function showContent(targetId) {
    // Main Menu verstecken
    mainMenu.classList.remove('active');
    
    // Alle Content Sections verstecken
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Target Section zeigen
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
        backButton.classList.remove('hidden');
    }
    
    // Spezielle Aktionen für bestimmte Sections
    if (targetId === 'trailer') {
        loadVideo();
    }
}

function setupVideo() {
    // YouTube Video ID für den Trailer
    const videoId = '1yGEa39oH80';
    
    if (videoId) {
        trailerVideo.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&showinfo=0`;
    }
}

function loadVideo() {
    // Video Error Handling
    const iframe = trailerVideo;
    const fallback = document.querySelector('.video-fallback');
    
    iframe.addEventListener('error', () => {
        iframe.style.display = 'none';
        fallback.classList.remove('hidden');
    });
    
    // Wenn kein Video konfiguriert ist
    if (!trailerVideo.src || trailerVideo.src === window.location.href) {
        iframe.style.display = 'none';
        fallback.classList.remove('hidden');
        fallback.textContent = 'Video noch nicht verfügbar';
    }
}

function setupExternalLinks() {
    // Telegram Link konfigurieren
    const telegramGroupLink = ''; // Hier den echten Telegram Link eintragen
    
    if (telegramGroupLink) {
        telegramLink.href = telegramGroupLink;
    } else {
        telegramLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Telegram-Gruppe wird noch eingerichtet!');
        });
    }
}

// Performance Monitoring für schwache Geräte
function checkPerformance() {
    const startTime = performance.now();
    
    setTimeout(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Wenn Rendering langsam ist, FPS reduzieren
        if (renderTime > 50) {
            SNAKE_CONFIG.maxFPS = 20;
        }
    }, 1000);
}

// Performance Check nach dem Laden
window.addEventListener('load', checkPerformance);

// Service Worker für bessere Performance (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(err => console.log('SW registration failed'));
    });
}
