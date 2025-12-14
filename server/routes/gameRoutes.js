const express = require('express');
const Game = require('../models/Game');

const router = express.Router();

// Helper: Generate deck
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
