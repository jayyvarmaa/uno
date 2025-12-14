const express = require('express');
const PlayerStats = require('../models/PlayerStats');

const router = express.Router();

// @route   GET /api/stats
// @desc    Get player stats (filter by query or get leaderboard)
router.get('/', async (req, res) => {
    try {
        const { player_email, sort, limit } = req.query;

        if (player_email) {
            const stats = await PlayerStats.findOne({ player_email });
            return res.json(stats ? [stats] : []);
        }

        // Leaderboard: sort by wins descending
        const sortOption = sort === '-wins' ? { wins: -1 } : { wins: -1 };
        const limitNum = parseInt(limit) || 10;

        const leaderboard = await PlayerStats.find().sort(sortOption).limit(limitNum);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/stats
// @desc    Create or update player stats
router.post('/', async (req, res) => {
    try {
        const { player_email, ...statsData } = req.body;

        let stats = await PlayerStats.findOne({ player_email });

        if (stats) {
            Object.assign(stats, statsData);
            await stats.save();
        } else {
            stats = await PlayerStats.create({ player_email, ...statsData });
        }

        res.status(201).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/stats/:id
// @desc    Update player stats by ID
router.put('/:id', async (req, res) => {
    try {
        const stats = await PlayerStats.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!stats) {
            return res.status(404).json({ message: 'Stats not found' });
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
