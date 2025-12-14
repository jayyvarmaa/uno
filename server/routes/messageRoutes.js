const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// @route   GET /api/messages
// @desc    Get messages for a game
router.get('/', async (req, res) => {
    try {
        const { game_id, sort, limit } = req.query;

        if (!game_id) {
            return res.status(400).json({ message: 'game_id is required' });
        }

        const sortOption = sort === 'created_date' ? { createdAt: 1 } : { createdAt: -1 };
        const limitNum = parseInt(limit) || 50;

        const messages = await Message.find({ game_id }).sort(sortOption).limit(limitNum);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/messages
// @desc    Create a new message
router.post('/', async (req, res) => {
    try {
        const { game_id, sender_email, sender_name, content } = req.body;

        const message = await Message.create({
            game_id,
            sender_email,
            sender_name,
            content
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
