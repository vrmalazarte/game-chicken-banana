const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

function generateGameState() {
  const NUM_TILES = 16;
  const NUM_CHICKENS = NUM_TILES / 2; // 8 chickens, 8 bananas

  const tiles = Array(NUM_TILES).fill().map(() => ({
    isChicken: true,
    revealed: false,
  }));

  const bananaIndices = new Set();
  while (bananaIndices.size < NUM_CHICKENS) {
    bananaIndices.add(Math.floor(Math.random() * NUM_TILES));
  }

  bananaIndices.forEach(i => {
    tiles[i].isChicken = false;
  });

  return {
    tiles,
    gameOver: false,
  };
}

let gameState = generateGameState();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  socket.emit('init', gameState);

  socket.on('makeMove', ({ index, mode }) => {
    if (gameState.gameOver || gameState.tiles[index].revealed) return;

    gameState.tiles[index].revealed = true;

    const tile = gameState.tiles[index];
    const mistake = (mode === 'banana' && tile.isChicken) ||
                    (mode === 'chicken' && !tile.isChicken);

    if (mistake) {
      gameState.gameOver = true;
    }

    io.emit('update', gameState);
  });

  socket.on('restart', () => {
    gameState = generateGameState();
    io.emit('init', gameState);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));