import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load env vars
dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/base44_uno';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    console.log('Running in demo mode without database...');
    return false;
  }
};

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_game', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// In-memory storage for demo mode
const demoGames = new Map();
const demoStats = new Map();

// Demo Routes (work without MongoDB)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: mongoose.connection.readyState === 1 ? 'database' : 'demo' });
});

// Auth routes (demo)
app.post('/api/auth/register', (req, res) => {
  const { email, name } = req.body;
  res.json({ id: 'demo_user', email, name, full_name: name, token: 'demo_token' });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  res.json({ id: 'demo_user', email, name: email.split('@')[0], full_name: email.split('@')[0], token: 'demo_token' });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ id: 'demo_user', email: 'demo@user.com', name: 'Demo User', full_name: 'Demo User' });
});

// Game routes (demo)
const generateDeck = () => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const deck = [];

  colors.forEach(color => {
    deck.push({ color, type: 'number', value: 0, id: `${color}-0` });
    for (let i = 1; i <= 9; i++) {
      deck.push({ color, type: 'number', value: i, id: `${color}-${i}-1` });
      deck.push({ color, type: 'number', value: i, id: `${color}-${i}-2` });
    }
  });

  colors.forEach(color => {
    deck.push({ color, type: 'skip', value: 'S', id: `${color}-skip-1` });
    deck.push({ color, type: 'skip', value: 'S', id: `${color}-skip-2` });
    deck.push({ color, type: 'reverse', value: 'R', id: `${color}-reverse-1` });
    deck.push({ color, type: 'reverse', value: 'R', id: `${color}-reverse-2` });
    deck.push({ color, type: 'draw2', value: '+2', id: `${color}-draw2-1` });
    deck.push({ color, type: 'draw2', value: '+2', id: `${color}-draw2-2` });
  });

  for (let i = 1; i <= 4; i++) {
    deck.push({ color: 'wild', type: 'wild', value: 'W', id: `wild-${i}` });
  }
  for (let i = 1; i <= 4; i++) {
    deck.push({ color: 'wild', type: 'wild_draw4', value: '+4', id: `wild4-${i}` });
  }

  return deck.sort(() => Math.random() - 0.5);
};

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

app.post('/api/games', (req, res) => {
  const { player_email, player_name, max_players = 10, is_public = false } = req.body;

  const roomCode = generateRoomCode();
  const deck = generateDeck();
  const initialCards = deck.splice(0, 7);

  let startCardIndex = deck.findIndex(c => c.type === 'number');
  if (startCardIndex === -1) startCardIndex = 0;
  const startCard = deck.splice(startCardIndex, 1)[0];

  const game = {
    _id: `game_${Date.now()}`,
    room_code: roomCode,
    status: 'waiting',
    is_public: is_public,
    room_type: is_public ? 'public' : 'private',
    host_name: player_name,
    players: [{
      email: player_email,
      name: player_name,
      cards: initialCards,
      card_count: 7
    }],
    current_player_index: 0,
    direction: 1,
    deck,
    discard_pile: [startCard],
    current_color: startCard.color,
    max_players,
    min_players: 3,
    created_at: new Date().toISOString()
  };

  demoGames.set(game._id, game);
  demoGames.set(roomCode, game);

  res.status(201).json(game);
});

// Get all public waiting games
app.get('/api/games/public', (req, res) => {
  const publicGames = [];
  demoGames.forEach((game, key) => {
    // Only add games by their _id key (avoid duplicates from roomCode keys)
    if (key.startsWith('game_') && game.is_public && game.status === 'waiting') {
      // Return safe version without full card data
      publicGames.push({
        _id: game._id,
        room_code: game.room_code,
        host_name: game.host_name,
        player_count: game.players?.length || 0,
        max_players: game.max_players,
        status: game.status,
        created_at: game.created_at
      });
    }
  });
  // Sort by creation time, newest first
  publicGames.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(publicGames);
});

app.get('/api/games', (req, res) => {
  const { room_code, id } = req.query;

  if (room_code) {
    const game = demoGames.get(room_code.toUpperCase());
    return res.json(game ? [game] : []);
  }

  if (id) {
    const game = demoGames.get(id);
    return res.json(game ? [game] : []);
  }

  res.json([]);
});

app.get('/api/games/:id', (req, res) => {
  const game = demoGames.get(req.params.id);
  if (!game) return res.status(404).json({ message: 'Game not found' });
  res.json(game);
});

app.put('/api/games/:id', (req, res) => {
  const game = demoGames.get(req.params.id);
  if (!game) return res.status(404).json({ message: 'Game not found' });

  Object.assign(game, req.body);
  demoGames.set(req.params.id, game);

  res.json(game);
});

app.post('/api/games/:id/join', (req, res) => {
  const { player_email, player_name } = req.body;
  const game = demoGames.get(req.params.id);

  if (!game) return res.status(404).json({ message: 'Game not found' });
  if (game.status !== 'waiting') return res.status(400).json({ message: 'Game has already started' });
  if (game.players.some(p => p.email === player_email)) return res.json(game);
  if (game.players.length >= game.max_players) return res.status(400).json({ message: 'Game is full' });

  const newCards = game.deck.splice(0, 7);
  game.players.push({
    email: player_email,
    name: player_name,
    cards: newCards,
    card_count: 7
  });

  res.json(game);
});

// Stats routes (demo)
app.get('/api/stats', (req, res) => {
  res.json([]);
});

app.post('/api/stats', (req, res) => {
  res.json(req.body);
});

// Messages routes (demo)
app.get('/api/messages', (req, res) => {
  res.json([]);
});

app.post('/api/messages', (req, res) => {
  res.json({ ...req.body, _id: `msg_${Date.now()}` });
});

const PORT = process.env.PORT || 5000;

// Start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
