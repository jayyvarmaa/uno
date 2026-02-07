const express = require('express');
const Game = require('../models/Game');

const router = express.Router();

// Helper: Generate deck - matches frontend cardUtils expected structure
const generateDeck = () => {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const deck = [];
    let cardId = 0;

    colors.forEach(color => {
        // Number 0 - one per color
        deck.push({ id: `card-${cardId++}`, color, type: 'number', value: '0' });
        // Numbers 1-9 - two per color
        for (let i = 1; i <= 9; i++) {
            deck.push({ id: `card-${cardId++}`, color, type: 'number', value: String(i) });
            deck.push({ id: `card-${cardId++}`, color, type: 'number', value: String(i) });
        }
    });

    // Special cards: skip, reverse, draw2 - two per color
    colors.forEach(color => {
        deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'skip' });
        deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'skip' });
        deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'reverse' });
        deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'reverse' });
        deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'draw2' });
        deck.push({ id: `card-${cardId++}`, color, type: 'special', value: 'draw2' });
    });

    // Wild cards - 4 of each
    for (let i = 0; i < 4; i++) {
        deck.push({ id: `card-${cardId++}`, color: 'wild', type: 'wild', value: 'wild' });
        deck.push({ id: `card-${cardId++}`, color: 'wild', type: 'wild', value: 'wild_draw4' });
    }

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
};

// Helper: Generate room code
const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// @route   POST /api/games
// @desc    Create a new game
router.post('/', async (req, res) => {
    try {
        const { player_email, player_name, max_players = 10 } = req.body;

        const roomCode = generateRoomCode();
        const deck = generateDeck();
        const initialCards = deck.splice(0, 7);

        let startCardIndex = deck.findIndex(c => c.type === 'number');
        if (startCardIndex === -1) startCardIndex = 0;
        const startCard = deck.splice(startCardIndex, 1)[0];

        const game = await Game.create({
            room_code: roomCode,
            status: 'waiting',
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
            min_players: 3
        });

        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/games
// @desc    Filter games by query params
router.get('/', async (req, res) => {
    try {
        const { room_code, id, status } = req.query;
        const filter = {};
        if (room_code) filter.room_code = room_code.toUpperCase();
        if (id) filter._id = id;
        if (status) filter.status = status;

        const games = await Game.find(filter);
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/games/:id
// @desc    Get single game by ID
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/games/:id
// @desc    Update game state
router.put('/:id', async (req, res) => {
    try {
        const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/games/:id/join
// @desc    Join an existing game
router.post('/:id/join', async (req, res) => {
    try {
        const { player_email, player_name } = req.body;
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (game.status !== 'waiting') {
            return res.status(400).json({ message: 'Game has already started' });
        }

        if (game.players.some(p => p.email === player_email)) {
            return res.json(game); // Already in game
        }

        if (game.players.length >= game.max_players) {
            return res.status(400).json({ message: 'Game is full' });
        }

        const newCards = game.deck.splice(0, 7);
        game.players.push({
            email: player_email,
            name: player_name,
            cards: newCards,
            card_count: 7
        });

        await game.save();
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
