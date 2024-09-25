let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let ballRadius = 6;
let ballSpeed = 3;  // Задаем статичную скорость
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = ballSpeed;
let dy = -ballSpeed;
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let brickRowCount = 5;
let brickColumnCount = 4;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2; // Центрируем кирпичи
let score = 0;
let lives = 3;
let bricks = [];
let isGameRunning = false;
let isGameOver = false;
let isPaused = false;

// Получение DOM-элементов
const scoreContainer = document.getElementById('score-container');
const livesContainer = document.getElementById('lives-container');
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const returnMenuBtn = document.getElementById('return-menu-btn');
const gameMessage = document.getElementById('game-message');

// Отображаем главное меню при загрузке
mainMenu.classList.add('active');

// Запуск игры при нажатии на "Start"
startBtn.addEventListener('click', () => {
    mainMenu.classList.remove('active');
    gameContainer.classList.add('active');
    startGame();
});

// Перезапуск игры при нажатии на "Restart"
restartBtn.addEventListener('click', () => {
    resetGame();
    draw();
});

// Возврат в меню при нажатии на "Return to Menu"
returnMenuBtn.addEventListener('click', () => {
    resetGame();
    gameContainer.classList.remove('active');
    mainMenu.classList.add('active');
});

// Пауза игры при уходе курсора за пределы игрового окна
canvas.addEventListener('mouseleave', () => {
    if (isGameRunning && !isGameOver) {
        isPaused = true;
        showGameMessage('Paused');
    }
});

// Продолжение игры при возврате курсора в игровое окно
canvas.addEventListener('mouseenter', () => {
    if (isPaused && !isGameOver) {
        isPaused = false;
        hideGameMessage();
        draw();
    }
});

// Запуск игры
function startGame() {
    resetGame();
    isGameRunning = true;
    draw();
}

// Сброс игры
function resetGame() {
    score = 0;
    lives = 3;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = ballSpeed;
    dy = -ballSpeed;
    paddleX = (canvas.width - paddleWidth) / 2;
    isGameRunning = true;
    isGameOver = false;
    isPaused = false;
    hideGameMessage();

    // Сброс всех кирпичей
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    updateScore();
    updateLives();
}

// Функция отображения сообщений (выигрыш, проигрыш, пауза)
function showGameMessage(message) {
    gameMessage.textContent = message;
    gameMessage.classList.add('active');
}

// Скрыть сообщение
function hideGameMessage() {
    gameMessage.classList.remove('active');
}

function draw() {
    if (!isGameRunning || isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            updateLives();
            if (!lives) {
                gameOver("You Lose!");
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = ballSpeed;
                dy = -ballSpeed;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// Функция для обработки выигрыша
function gameWin() {
    gameOver("You Win!");
}

// Функция для обработки проигрыша
function gameOver(message) {
    isGameRunning = false;
    isGameOver = true;
    showGameMessage(message);
}

// Отрисовка мяча
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#61dafb";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#61dafb";
    ctx.fill();
    ctx.closePath();
}

// Отрисовка ракетки
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#f4f4f9";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#f4f4f9";
    ctx.fill();
    ctx.closePath();
}

// Отрисовка кирпичей
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = r * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = c * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "orange";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "orange";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Проверка столкновений
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    updateScore();
                    if (score == brickRowCount * brickColumnCount) {
                        gameWin(); // Победа
                    }
                }
            }
        }
    }
}

// Обновление счёта
function updateScore() {
    scoreContainer.textContent = `Score: ${score}`;
}

// Обновление количества жизней
function updateLives() {
    livesContainer.textContent = `Lives: ${lives}`;
}

// Обработчики событий для управления клавишами
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}
