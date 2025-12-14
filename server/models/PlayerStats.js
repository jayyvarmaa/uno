const mongoose = require('mongoose');

const playerStatsSchema = new mongoose.Schema({
    player_email: {
        type: String,
        required: true,
        unique: true
    },
    player_name: {
        type: String
    },
    games_played: {
        type: Number,
        default: 0
    },
    wins: {
        type: Number,
        default: 0
    },
    cards_played: {
        type: Number,
        default: 0
    },
    special_cards_played: {
        type: Number,
        default: 0
    },
    wild_cards_played: {
        type: Number,
        default: 0
    },
    skip_cards_used: {
        type: Number,
        default: 0
    },
    reverse_cards_used: {
        type: Number,
        default: 0
    },
    draw_cards_used: {
        type: Number,
        default: 0
    },
    average_cards_left: {
        type: Number,
        default: 0
    },
    total_cards_left: {
        type: Number,
        default: 0
    },
    favorite_color: {
        type: String
    },
    color_usage: {
        type: Map,
        of: Number,
        default: {}
    },
    early_wild_usage: {
        type: Number,
        default: 0
    },
    late_wild_usage: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PlayerStats', playerStatsSchema);
