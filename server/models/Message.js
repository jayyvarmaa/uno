const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    game_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    sender_email: {
        type: String,
        required: true
    },
    sender_name: {
        type: String
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
