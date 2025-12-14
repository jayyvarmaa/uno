/**
 * AI Player Logic for UNO Game
 * This class handles AI decision making during gameplay
 */

export default class AIPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.weights = this.getWeights();
    }

    getWeights() {
        switch (this.difficulty) {
            case 'easy':
                return { special: 0.3, wild: 0.2, colorMatch: 0.4, random: 0.5 };
            case 'hard':
                return { special: 0.8, wild: 0.9, colorMatch: 0.7, random: 0.1 };
            default: // medium
                return { special: 0.5, wild: 0.5, colorMatch: 0.6, random: 0.3 };
        }
    }

    /**
     * Analyze game state and return the best card to play
     * @param {Object} gameState - Current game state
     * @param {Array} hand - AI player's cards
     * @returns {Object|null} - Card to play or null to draw
     */
    selectCard(gameState, hand) {
        const { discard_pile, current_color, players, current_player_index, direction } = gameState;
        const topCard = discard_pile[discard_pile.length - 1];
        const activeColor = current_color || topCard.color;

        // Get all playable cards
        const playableCards = hand.filter(card => this.isPlayable(card, topCard, activeColor));

        if (playableCards.length === 0) return null;

        // Score each playable card
        const scoredCards = playableCards.map(card => ({
            card,
            score: this.scoreCard(card, gameState, hand)
        }));

        // Sort by score (descending)
        scoredCards.sort((a, b) => b.score - a.score);

        // Add some randomness based on difficulty
        if (Math.random() < this.weights.random) {
            const randomIndex = Math.floor(Math.random() * Math.min(3, scoredCards.length));
            return scoredCards[randomIndex].card;
        }

        return scoredCards[0].card;
    }

    isPlayable(card, topCard, activeColor) {
        if (card.color === 'wild') return true;
        if (card.color === activeColor) return true;
        if (card.type === topCard.type && card.value === topCard.value) return true;
        return false;
    }

    scoreCard(card, gameState, hand) {
        let score = 0;
        const { players, current_player_index, direction } = gameState;

        // Check next player's card count
        const nextPlayerIndex = (current_player_index + direction + players.length) % players.length;
        const nextPlayerCards = players[nextPlayerIndex]?.card_count || 7;

        // Prefer to play cards that hurt opponents with few cards
        if (nextPlayerCards <= 2) {
            if (card.type === 'skip') score += 30 * this.weights.special;
            if (card.type === 'draw2') score += 35 * this.weights.special;
            if (card.type === 'wild_draw4') score += 40 * this.weights.wild;
        }

        // Save wilds for later if we have many cards
        if (card.color === 'wild') {
            if (hand.length > 4) {
                score -= 10 * this.weights.wild;
            } else {
                score += 15 * this.weights.wild;
            }
        }

        // Prefer to play cards of colors we have most of
        const colorCounts = this.countColors(hand);
        if (card.color !== 'wild') {
            score += (colorCounts[card.color] || 0) * 5 * this.weights.colorMatch;
        }

        // Number cards are generally okay to play
        if (card.type === 'number') {
            score += 10;
        }

        // Reverse is good to keep turn or skip back
        if (card.type === 'reverse') {
            score += 15 * this.weights.special;
        }

        return score;
    }

    countColors(hand) {
        const counts = { red: 0, blue: 0, green: 0, yellow: 0 };
        hand.forEach(card => {
            if (card.color !== 'wild') {
                counts[card.color] = (counts[card.color] || 0) + 1;
            }
        });
        return counts;
    }

    /**
     * Choose a color when playing a wild card
     * @param {Array} hand - Remaining cards in hand
     * @returns {string} - Chosen color
     */
    chooseColor(hand) {
        const colorCounts = this.countColors(hand);
        let maxColor = 'red';
        let maxCount = 0;

        Object.entries(colorCounts).forEach(([color, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxColor = color;
            }
        });

        // Add some randomness for easy difficulty
        if (this.difficulty === 'easy' && Math.random() < 0.3) {
            const colors = ['red', 'blue', 'green', 'yellow'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        return maxColor;
    }
}
