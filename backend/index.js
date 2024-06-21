const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = 5000;

let players = [];
let waitingList = [];
let games = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (username) => {
    players.push({ id: socket.id, username, score: 0 });
    io.emit('updatePlayers', players);
  });

  socket.on('startGame', (opponentId) => {
    if (games[socket.id] || games[opponentId]) {
      waitingList.push(socket.id);
    } else {
      games[socket.id] = { opponentId, move: null };
      games[opponentId] = { opponentId: socket.id, move: null };
      io.to(socket.id).emit('gameStarted', opponentId);
      io.to(opponentId).emit('gameStarted', socket.id);
    }
  });

  socket.on('play', ({ move, opponentId }) => {
    if (games[socket.id]) {
      games[socket.id].move = move;
      if (games[opponentId] && games[opponentId].move !== null) {
        io.to(socket.id).emit('opponentMove', games[opponentId].move);
        io.to(opponentId).emit('opponentMove', move);
        determineResult(socket.id, opponentId);
      } else {
        io.to(socket.id).emit('waitingForOpponent'); 
      }
    }
  });

  const determineResult = (player1Id, player2Id) => {
    const move1 = games[player1Id].move;
    const move2 = games[player2Id].move;

    let result1, result2;
    if (move1 === move2) {
      result1 = result2 = 'Draw';
    } else if (
      (move1 === 'rock' && move2 === 'scissors') ||
      (move1 === 'scissors' && move2 === 'paper') ||
      (move1 === 'paper' && move2 === 'rock')
    ) {
      result1 = 'You Win!';
      result2 = 'You Lose!';
      updateScore(player1Id);
    } else {
      result1 = 'You Lose!';
      result2 = 'You Win!';
      updateScore(player2Id);
    }

    io.to(player1Id).emit('gameResult', result1);
    io.to(player2Id).emit('gameResult', result2);

    delete games[player1Id];
    delete games[player2Id];

    if (waitingList.length > 0) {
      let nextPlayer = waitingList.shift();
      games[nextPlayer] = { opponentId: player2Id, move: null };
      games[player2Id] = { opponentId: nextPlayer, move: null };
      io.to(nextPlayer).emit('gameStarted', player2Id);
      io.to(player2Id).emit('gameStarted', nextPlayer);
    }
  };

  const updateScore = (winnerId) => {
    players = players.map(player => {
      if (player.id === winnerId) player.score++;
      return player;
    });
    io.emit('updatePlayers', players);
  };

  socket.on('playAgain', (opponentId) => {
    games[socket.id] = { opponentId, move: null };
    games[opponentId] = { opponentId: socket.id, move: null };
    io.to(opponentId).emit('resetGame');
  });

  socket.on('disconnect', () => {
    players = players.filter(player => player.id !== socket.id);
    io.emit('updatePlayers', players);

    if (games[socket.id]) {
      let opponentId = games[socket.id].opponentId;
      delete games[socket.id];
      delete games[opponentId];
      if (waitingList.length > 0) {
        let nextPlayer = waitingList.shift();
        games[nextPlayer] = { opponentId, move: null };
        games[opponentId] = { opponentId: nextPlayer, move: null };
        io.to(nextPlayer).emit('gameStarted', opponentId);
        io.to(opponentId).emit('gameStarted', nextPlayer);
      } else {
        io.to(opponentId).emit('opponentDisconnected');
      }
    }
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
