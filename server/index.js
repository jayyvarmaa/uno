import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/authRoutes.js';

// Load env vars
dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/base44_uno';
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
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
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ["http://localhost:5173", "http://localhost:3000"];

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
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
const demoUsers = new Map(); // Store users: email -> { id, email, name, passwordHash }

const JWT_SECRET = process.env.JWT_SECRET || 'uno_showdown_secret_key_2024';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Demo Routes (work without MongoDB)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: mongoose.connection.readyState === 1 ? 'database' : 'demo' });
});

// Auth Middleware to switch between DB and Demo mode
app.use('/api/auth', (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return authRoutes(req, res, next);
  }
  next();
});

// Secure Demo Auth Routes (Fallback)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (demoUsers.has(email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = `demo_user_${Date.now()}`;
    const newUser = { id, email, name, password: hashedPassword };

    demoUsers.set(email, newUser);

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      token: generateToken(newUser.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = demoUsers.get(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      full_name: user.name,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user by ID in demoUsers
    let foundUser = null;
    for (const user of demoUsers.values()) {
      if (user.id === decoded.id) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      full_name: foundUser.name
    });
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
});

// Card scoring function
const getCardScore = (card) => {
  if (card.type === 'number') return parseInt(card.value, 10);
  if (card.type === 'special') return 20; // skip, reverse, draw2
  if (card.type === 'wild') return 50; // wild, wild_draw4
  return 0;
};

// Game routes (demo)
const generateDeck = () => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const deck = [];
  let cardId = 0;

  // Number cards: one 0, two of 1-9 per color
  colors.forEach(color => {
    // One zero
    deck.push({
      id: `card-${cardId++}`,
      color,
      type: 'number',
      value: '0',
      score: 0
    });

    // Two of each 1-9
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `card-${cardId++}`, color, type: 'number', value: String(i), score: i });
      deck.push({ id: `card-${cardId++}`, color, type: 'number', value: String(i), score: i });
    }
  });

  // Special cards: two of each per color
  colors.forEach(color => {
    // Skip
    deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'skip', score: 20 });
    deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'skip', score: 20 });
    // Reverse
    deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'reverse', score: 20 });
    deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'reverse', score: 20 });
    // Draw 2
    deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'draw2', score: 20 });
    deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'draw2', score: 20 });
  });

  // Wild cards: 4 of each
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `card-${cardId++}`, color: 'wild', type: 'wild', value: 'wild', score: 50 });
    deck.push({ id: `card-${cardId++}`, color: 'wild', type: 'wild', value: 'wild_draw4', score: 50 });
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
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
