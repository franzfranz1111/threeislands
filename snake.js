// Snake Animation Script - nur für Subsites
const SNAKE_CONFIG = {
    gridSize: 16,
    speed: 166.67,
    color: '#00FF66',
    backgroundColor: '#000000',
    maxFPS: 30
};

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let canvas, ctx;
let gameLoop;
let gridWidth, gridHeight;
let isTabActive = true;
let food = [];
let foodTypes = [
    { type: 'fahrradfahrer', symbol: '🚴', growth: 1, size: 4 },
    { type: 'fahrrad', symbol: '🚲', growth: 1, size: 4 }
];
let pulseEffect = 0;
let gameOverEffect = 0;

// Initialisierung
document.addEventListener('DOMContentLoaded', initSnakeAnimation);

function initSnakeAnimation() {
    canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    initSnake();
    startSnakeAnimation();
    drawSnake();
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    gridWidth = Math.floor(canvas.width / SNAKE_CONFIG.gridSize);
    gridHeight = Math.floor(canvas.height / SNAKE_CONFIG.gridSize);
    
    if (snake.length > 0) {
        snake.forEach(segment => {
            segment.x = Math.min(segment.x, gridWidth - 1);
            segment.y = Math.min(segment.y, gridHeight - 1);
        });
    }
}

function initSnake() {
    const startX = 10;
    const startY = 10;
    const snakeLength = 8;
    
    snake = [];
    for (let i = 0; i < snakeLength; i++) {
        snake.push({ x: startX - i, y: startY });
    }
    
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    
    food = [];
    spawnFood();
}

function startSnakeAnimation() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    gameLoop = setInterval(() => {
        if (isTabActive) {
            updateSnake();
            drawSnake();
        }
    }, SNAKE_CONFIG.speed);
}

function updateSnake() {
    if (gameOverEffect > 0) {
        gameOverEffect--;
        if (gameOverEffect === 0) {
            initSnake();
        }
        return;
    }
    
    if (pulseEffect > 0) {
        pulseEffect--;
    }
    
    direction = { ...nextDirection };
    
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
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
    
    snake.unshift(head);
    
    // Food-Kollision
    let ateFood = false;
    food = food.filter(f => {
        const fSize = f.size || 1;
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
            for (let i = 0; i < f.growth; i++) {
                snake.push({ ...snake[snake.length - 1] });
            }
            ateFood = true;
            pulseEffect = 8;
            return false;
        }
        return true;
    });
    
    if (!ateFood) {
        snake.pop();
    }
    
    if (Math.random() < 0.02) {
        spawnFood();
    }
    
    if (food.length > 0 && Math.random() < 0.7) {
        moveTowardsFood();
    } else if (Math.random() < 0.15) {
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
        if (!findSafeDirection()) {
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

function moveTowardsFood() {
    if (food.length === 0) return;
    
    const head = snake[0];
    let closestFood = food[0];
    let minDistance = Math.abs(head.x - closestFood.x) + Math.abs(head.y - closestFood.y);
    
    food.forEach(f => {
        const distance = Math.abs(head.x - f.x) + Math.abs(head.y - f.y);
        if (distance < minDistance) {
            closestFood = f;
            minDistance = distance;
        }
    });
    
    const deltaX = closestFood.x - head.x;
    const deltaY = closestFood.y - head.y;
    const possibleDirections = [];
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) possibleDirections.push({ x: 1, y: 0, priority: 3 });
        if (deltaX < 0) possibleDirections.push({ x: -1, y: 0, priority: 3 });
        if (deltaY > 0) possibleDirections.push({ x: 0, y: 1, priority: 2 });
        if (deltaY < 0) possibleDirections.push({ x: 0, y: -1, priority: 2 });
    } else {
        if (deltaY > 0) possibleDirections.push({ x: 0, y: 1, priority: 3 });
        if (deltaY < 0) possibleDirections.push({ x: 0, y: -1, priority: 3 });
        if (deltaX > 0) possibleDirections.push({ x: 1, y: 0, priority: 2 });
        if (deltaX < 0) possibleDirections.push({ x: -1, y: 0, priority: 2 });
    }
    
    const validDirections = possibleDirections.filter(dir => 
        !(dir.x === -direction.x && dir.y === -direction.y)
    );
    
    if (validDirections.length > 0) {
        const bestPriority = Math.max(...validDirections.map(d => d.priority));
        const bestDirections = validDirections.filter(d => d.priority === bestPriority);
        const chosen = bestDirections[Math.floor(Math.random() * bestDirections.length)];
        nextDirection = { x: chosen.x, y: chosen.y };
    } else {
        changeRandomDirection();
    }
}

function findSafeDirection() {
    const head = snake[0];
    const directions = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
    ];
    
    const safeDirections = directions.filter(dir => {
        if (dir.x === -direction.x && dir.y === -direction.y) return false;
        
        const nextHead = { x: head.x + dir.x, y: head.y + dir.y };
        
        if (nextHead.x >= gridWidth) nextHead.x = 0;
        if (nextHead.x < 0) nextHead.x = gridWidth - 1;
        if (nextHead.y >= gridHeight) nextHead.y = 0;
        if (nextHead.y < 0) nextHead.y = gridHeight - 1;
        
        return !snake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y);
    });
    
    if (safeDirections.length > 0) {
        nextDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)];
        return true;
    }
    return false;
}

function changeRandomDirection() {
    if (findSafeDirection()) {
        return;
    }
    
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];
    
    const validDirections = directions.filter(dir => 
        !(dir.x === -direction.x && dir.y === -direction.y)
    );
    
    nextDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
}

function drawSnake() {
    // Hintergrund mit Blink-Effekt
    if (gameOverEffect > 0) {
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
        
        // Emoji rendern
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
    
    snake.forEach((segment, index) => {
        const pulseScale = pulseEffect > 0 ? 1 + (pulseEffect * 0.1) : 1;
        const pulseBrightness = pulseEffect > 0 ? Math.min(255, 102 + pulseEffect * 20) : 102;
        
        if (index === 0) {
            if (pulseEffect > 0) {
                ctx.fillStyle = `rgb(${Math.min(255, pulseBrightness)}, 255, ${Math.min(255, 153 + pulseEffect * 10)})`;
            } else {
                ctx.fillStyle = '#00FF99';
            }
        } else {
            const alpha = 1 - (index * 0.05);
            if (pulseEffect > 0) {
                ctx.fillStyle = `rgb(0, ${pulseBrightness}, ${Math.floor(pulseBrightness * 0.65)})`;
                ctx.globalAlpha = Math.max(alpha, 0.8);
            } else {
                ctx.fillStyle = SNAKE_CONFIG.color;
                ctx.globalAlpha = Math.max(alpha, 0.7);
            }
        }
        
        const size = SNAKE_CONFIG.gridSize * pulseScale;
        const offset = (SNAKE_CONFIG.gridSize - size) / 2;
        
        ctx.fillRect(
            segment.x * SNAKE_CONFIG.gridSize + offset,
            segment.y * SNAKE_CONFIG.gridSize + offset,
            size,
            size
        );
        
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
    if (food.length >= 3) return;
    
    let attempts = 0;
    let foodPos;
    const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    const foodSize = foodType.size || 1;
    
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
    for (let dx = 0; dx < size; dx++) {
        for (let dy = 0; dy < size; dy++) {
            const checkX = pos.x + dx;
            const checkY = pos.y + dy;
            
            if (snake.some(s => s.x === checkX && s.y === checkY)) {
                return true;
            }
            
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
}
