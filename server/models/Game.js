const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    color: { type: String, enum: ['red', 'blue', 'green', 'yellow', 'wild'] },
    type: { type: String, enum: ['number', 'skip', 'reverse', 'draw2', 'wild', 'wild_draw4'] },
    value: { type: mongoose.Schema.Types.Mixed }, // Can be number or string like 'S', 'R', '+2', 'W', '+4'
    id: { type: String }
}, { _id: false });

const playerSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String },
    cards: [cardSchema],
    card_count: { type: Number, default: 7 }
}, { _id: false });

const gameSchema = new mongoose.Schema({
    room_code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    status: {
        type: String,
        enum: ['waiting', 'playing', 'finished'],
        default: 'waiting'
    },
    players: [playerSchema],
    current_player_index: {
        type: Number,
        default: 0
    },
    direction: {
        type: Number,
        default: 1 // 1 = clockwise, -1 = counter-clockwise
    },
    deck: [cardSchema],
    discard_pile: [cardSchema],
    current_color: {
        type: String,
        enum: ['red', 'blue', 'green', 'yellow']
    },
    max_players: {
        type: Number,
        default: 10
    },
    min_players: {
        type: Number,
        default: 3
    },
    winner_email: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);
