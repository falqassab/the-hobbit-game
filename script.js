// STORY AND LEVELS
const story = [
  {
    level: 1,
    title: "The Journey Begins",
    text: "In the quiet hills, our little adventurer sets out to recover the lost Rings of Power. The first rings lie in the Misty Caves — collect them all to continue your quest!"
  },
  {
    level: 2,
    title: "The Dragon’s Lair",
    text: "You enter deeper tunnels where dragons guard their treasure. Stay sharp, collect all rings, and survive the heat!"
  }
];

// MAZES: add E for enemies (dragons)
const mazes = [
  [
    ['W','W','W','W','W','W','W'],
    ['W',' ','R',' ',' ',' ','W'],
    ['W',' ','W','W',' ','R','W'],
    ['W',' ',' ',' ',' ',' ','W'],
    ['W','R','W','W',' ',' ','W'],
    ['W',' ',' ',' ',' ',' ','W'],
    ['W','W','W','W','W','W','W']
  ],
  [
    ['W','W','W','W','W','W','W'],
    ['W','R',' ','W',' ','R','W'],
    ['W',' ','E','W',' ',' ','W'],
    ['W',' ',' ',' ','R',' ','W'],
    ['W',' ','W','W',' ','E','W'],
    ['W',' ',' ',' ',' ','R','W'],
    ['W','W','W','W','W','W','W']
  ]
];

let currentLevel = 0;
let playerPos = { row: 1, col: 1 };
let ringsCollected = 0;
let totalRings = 0;
let enemies = [];
let enemyIntervals = [];

const startScreen = document.getElementById('start-screen');
const storyScreen = document.getElementById('story-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const mazeContainer = document.getElementById('maze');
const scoreEl = document.getElementById('score');
const storyTitle = document.getElementById('story-title');
const storyText = document.getElementById('story-text');

const playerEl = document.createElement('div');
playerEl.classList.add('player');

// START GAME
document.getElementById('start-btn').addEventListener('click', () => {
  startScreen.classList.add('hidden');
  showStory(0);
});

document.getElementById('start-level-btn').addEventListener('click', () => {
  storyScreen.classList.add('hidden');
  startLevel(currentLevel);
});

document.getElementById('restart-btn').addEventListener('click', () => {
  endScreen.classList.add('hidden');
  ringsCollected = 0;
  currentLevel = 0;
  showStory(0);
});

// STORY
function showStory(level) {
  const s = story[level];
  storyTitle.textContent = s.title;
  storyText.textContent = s.text;
  storyScreen.classList.remove('hidden');
}

// GAMEPLAY
function startLevel(level) {
  stopEnemies();
  mazeContainer.innerHTML = '';
  gameScreen.classList.remove('hidden');
  const maze = mazes[level];
  enemies = [];

  maze.forEach((row, r) => {
    row.forEach((cell, c) => {
      const div = document.createElement('div');
      div.classList.add('cell');
      if (cell === 'W') div.classList.add('wall');
      else if (cell === 'R') div.classList.add('ring');
      else div.classList.add('path');
      div.id = `cell-${r}-${c}`;
      mazeContainer.appendChild(div);

      // Create enemy
      if (cell === 'E') {
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
        mazeContainer.appendChild(enemy);
        enemies.push({ el: enemy, row: r, col: c, dir: 1 }); // 1=down, -1=up
        moveEnemy(enemy, r, c);
      }
    });
  });

  // Set player starting position
  playerPos = { row: 1, col: 1 };
  mazeContainer.appendChild(playerEl);
  movePlayerTo(playerPos.row, playerPos.col);

  // Count rings
  totalRings = document.querySelectorAll('.ring').length;
  updateScore();

  startEnemies();
}

// Move Player
function movePlayerTo(row, col) {
  playerEl.style.top = `${row * 42}px`;
  playerEl.style.left = `${col * 42}px`;
}

document.addEventListener('keydown', (e) => {
  if (gameScreen.classList.contains('hidden')) return;

  let newRow = playerPos.row;
  let newCol = playerPos.col;

  if (e.key === 'ArrowUp') newRow--;
  if (e.key === 'ArrowDown') newRow++;
  if (e.key === 'ArrowLeft') newCol--;
  if (e.key === 'ArrowRight') newCol++;

  const cell = document.getElementById(`cell-${newRow}-${newCol}`);
  if (!cell || cell.classList.contains('wall')) return;

  if (cell.classList.contains('ring')) {
    cell.classList.remove('ring');
    ringsCollected++;
    updateScore();
    checkLevelComplete();
  }

  playerPos = { row: newRow, col: newCol };
  movePlayerTo(newRow, newCol);
  checkCollision();
});

// Score and Level Complete
function updateScore() {
  scoreEl.textContent = ringsCollected;
}

function checkLevelComplete() {
  if (document.querySelectorAll('.ring').length === 0) {
    stopEnemies();
    gameScreen.classList.add('hidden');
    currentLevel++;
    if (currentLevel < mazes.length) {
      showStory(currentLevel);
    } else {
      endScreen.classList.remove('hidden');
    }
  }
}

// Enemy logic
function moveEnemy(enemyEl, row, col) {
  enemyEl.style.top = `${row * 42}px`;
  enemyEl.style.left = `${col * 42}px`;
}

function startEnemies() {
  enemies.forEach((enemy) => {
    const interval = setInterval(() => {
      const nextRow = enemy.row + enemy.dir;
      const nextCell = document.getElementById(`cell-${nextRow}-${enemy.col}`);
      if (!nextCell || nextCell.classList.contains('wall')) {
        enemy.dir *= -1; // change direction
      } else {
        enemy.row = nextRow;
        moveEnemy(enemy.el, enemy.row, enemy.col);
      }
      checkCollision();
    }, 500);
    enemyIntervals.push(interval);
  });
}

function stopEnemies() {
  enemyIntervals.forEach(clearInterval);
  enemyIntervals = [];
}

// Collision
function checkCollision() {
  for (let enemy of enemies) {
    if (enemy.row === playerPos.row && enemy.col === playerPos.col) {
      playerDies();
      break;
    }
  }
}

function playerDies() {
  alert("💀 The dragon caught you! Try again!");
  startLevel(currentLevel);
}
