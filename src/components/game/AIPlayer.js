/**
 * Enhanced AI Player Logic for UNO Game
 * Features:
 * - Adaptive strategy based on game state
 * - Card counting and probability awareness
 * - Opponent targeting (players with few cards)
 * - Smart wild card usage
 * - UNO calling behavior
 */

import { getThrowableCards, getCardScore, CARD_COLORS } from '@/lib/cardUtils';

export class AIPlayer {
    constructor(difficulty = 'medium', name = 'AI') {
        this.difficulty = difficulty;
        this.name = name;
        this.playedCards = []; // Track cards that have been played
        this.colorPreferences = {}; // Track which colors were played by whom
    }

    /**
     * Main decision function - returns an action for the AI to take
     */
    async makeMove(hand, topCard, currentColor, gameState) {
        // Simulate thinking time for realism
        await this.simulateThinking();

        // Track the top card for counting
        if (topCard && !this.playedCards.find(c => c.id === topCard.id)) {
            this.playedCards.push(topCard);
        }

        // Get playable cards using proper validation
        const playableCards = getThrowableCards(hand, topCard, currentColor);

        if (playableCards.length === 0) {
            return { action: 'draw' };
        }

        // Select card based on difficulty
        let selectedCard;
        switch (this.difficulty) {
            case 'easy':
                selectedCard = this.selectEasyMove(playableCards);
                break;
            case 'hard':
                selectedCard = this.selectHardMove(playableCards, hand, gameState, currentColor);
                break;
            default:
                selectedCard = this.selectMediumMove(playableCards, hand, gameState);
        }

        const selectedIndex = hand.findIndex(c => c.id === selectedCard.id);

        // Choose color for wild cards
        let chosenColor = null;
        if (selectedCard.type === 'wild') {
            chosenColor = this.chooseOptimalColor(hand, gameState);
        }

        // Should call UNO? (when down to 2 cards and playing one)
        const shouldCallUno = hand.length === 2;

        return {
            action: 'play',
            card: selectedCard,
            cardIndex: selectedIndex,
            chosenColor,
            callUno: shouldCallUno
        };
    }

    /**
     * Easy AI: Mostly random with slight preference for matching colors
     */
    selectEasyMove(playableCards) {
        // 70% chance to pick randomly, 30% to pick color match
        if (Math.random() < 0.7) {
            return playableCards[Math.floor(Math.random() * playableCards.length)];
        }
        // Slight preference for non-wild cards
        const nonWild = playableCards.filter(c => c.type !== 'wild');
        if (nonWild.length > 0) {
            return nonWild[Math.floor(Math.random() * nonWild.length)];
        }
        return playableCards[0];
    }

    /**
     * Medium AI: Saves wilds, prefers special cards strategically
     */
    selectMediumMove(playableCards, hand, gameState) {
        const handSize = hand.length;

        // Filter out wild cards unless necessary
        const nonWild = playableCards.filter(c => c.type !== 'wild');

        if (nonWild.length > 0) {
            // If hand size is 4+, prioritize special cards
            if (handSize > 4) {
                const special = nonWild.filter(c =>
                    c.value === 'skip' || c.value === 'reverse' || c.value === 'draw2'
                );
                if (special.length > 0) {
                    return special[Math.floor(Math.random() * special.length)];
                }
            }

            // Play high value number cards first (to dump points)
            const numbers = nonWild.filter(c => c.type === 'number');
            if (numbers.length > 0) {
                numbers.sort((a, b) => getCardScore(b) - getCardScore(a));
                return numbers[0];
            }

            return nonWild[Math.floor(Math.random() * nonWild.length)];
        }

        return playableCards[0];
    }

    /**
     * Hard AI: Adaptive strategy with card counting and opponent targeting
     */
    selectHardMove(playableCards, hand, gameState, currentColor) {
        const handSize = hand.length;
        const opponents = this.getOpponentInfo(gameState);

        // PHASE 1: Endgame (3 cards or less)
        if (handSize <= 3) {
            return this.selectEndgameMove(playableCards, hand, opponents);
        }

        // PHASE 2: Check if any opponent is close to winning
        const dangerousOpponent = opponents.find(o => o.cardCount <= 2);
        if (dangerousOpponent) {
            return this.selectDefensiveMove(playableCards, hand, dangerousOpponent);
        }

        // PHASE 3: Normal play - maximize hand reduction
        return this.selectNormalMove(playableCards, hand, currentColor);
    }

    /**
     * Endgame strategy: Focus on getting rid of cards
     */
    selectEndgameMove(playableCards, hand, opponents) {
        // Non-wild cards first
        const nonWild = playableCards.filter(c => c.type !== 'wild');

        if (hand.length === 1) {
            return playableCards[0]; // Winner!
        }

        if (hand.length === 2) {
            // If 2 cards left, prefer playing non-wild to end with wild
            if (nonWild.length > 0) {
                // Prefer special cards to disrupt the next player
                const special = nonWild.filter(c =>
                    c.value === 'skip' || c.value === 'draw2'
                );
                if (special.length > 0) return special[0];
                return nonWild[0];
            }
            // Must use wild
            return playableCards[0];
        }

        // 3 cards: prioritize dumping high-point cards
        const sortedByScore = [...playableCards].sort(
            (a, b) => getCardScore(b) - getCardScore(a)
        );

        // But save wilds for last
        const nonWildSorted = sortedByScore.filter(c => c.type !== 'wild');
        if (nonWildSorted.length > 0) return nonWildSorted[0];

        return sortedByScore[0];
    }

    /**
     * Defensive strategy: Target player close to winning
     */
    selectDefensiveMove(playableCards, hand, dangerousOpponent) {
        // Prioritize: Draw4 > Draw2 > Skip > Reverse > Others
        const wildDraw4 = playableCards.find(c => c.value === 'wild_draw4');
        if (wildDraw4) return wildDraw4;

        const draw2 = playableCards.find(c => c.value === 'draw2');
        if (draw2) return draw2;

        const skip = playableCards.find(c => c.value === 'skip');
        if (skip) return skip;

        // Reverse can help if the dangerous player is next
        const reverse = playableCards.find(c => c.value === 'reverse');
        if (reverse) return reverse;

        // Fall back to normal strategy
        const nonWild = playableCards.filter(c => c.type !== 'wild');
        if (nonWild.length > 0) {
            return nonWild[Math.floor(Math.random() * nonWild.length)];
        }

        return playableCards[0];
    }

    /**
     * Normal play strategy
     */
    selectNormalMove(playableCards, hand, currentColor) {
        const nonWild = playableCards.filter(c => c.type !== 'wild');

        if (nonWild.length === 0) {
            // Must use wild - save Draw4 for defense
            const wildNoDraw = playableCards.filter(c => c.value !== 'wild_draw4');
            if (wildNoDraw.length > 0) return wildNoDraw[0];
            return playableCards[0];
        }

        // Count cards by color in hand to decide what to play
        const colorCounts = this.countCardsByColor(hand);

        // Prefer playing cards that keep us in our strongest color
        const strongestColor = this.getStrongestColor(colorCounts);

        // Try to play cards that match strongest color
        const strongColorCards = nonWild.filter(c => c.color === strongestColor);
        if (strongColorCards.length > 0 && colorCounts[strongestColor] >= 2) {
            // Play highest value in strong color to dump points
            strongColorCards.sort((a, b) => getCardScore(b) - getCardScore(a));
            return strongColorCards[0];
        }

        // Otherwise, play to switch to our strongest color
        const colorChangers = nonWild.filter(c => c.color !== currentColor);
        if (colorChangers.length > 0) {
            const toStrongColor = colorChangers.filter(c => c.color === strongestColor);
            if (toStrongColor.length > 0) return toStrongColor[0];
        }

        // Default: play highest value non-wild card
        nonWild.sort((a, b) => getCardScore(b) - getCardScore(a));
        return nonWild[0];
    }

    /**
     * Choose optimal color when playing wild cards
     */
    chooseOptimalColor(hand, gameState) {
        const colorCounts = this.countCardsByColor(hand);
        const strongestColor = this.getStrongestColor(colorCounts);

        // If we have cards in our strongest color, pick that
        if (colorCounts[strongestColor] > 0) {
            return strongestColor;
        }

        // Otherwise pick a random color
        return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
    }

    /**
     * Count cards by color in hand
     */
    countCardsByColor(hand) {
        const counts = { red: 0, green: 0, blue: 0, yellow: 0 };
        hand.forEach(card => {
            if (card.color && counts[card.color] !== undefined) {
                counts[card.color]++;
            }
        });
        return counts;
    }

    /**
     * Get the color with the most cards
     */
    getStrongestColor(colorCounts) {
        return Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])[0][0];
    }

    /**
     * Extract opponent info from game state
     */
    getOpponentInfo(gameState) {
        if (!gameState?.players) return [];

        return gameState.players
            .filter(p => p.email !== this.email)
            .map(p => ({
                email: p.email,
                name: p.name,
                cardCount: p.card_count || p.cards?.length || 0,
                isAI: p.email?.startsWith('ai-') || p.isAI
            }));
    }

    /**
     * Simulate thinking time for realism
     */
    async simulateThinking() {
        const baseDelay = {
            easy: 800,
            medium: 1200,
            hard: 1500
        }[this.difficulty] || 1000;

        const delay = baseDelay + Math.random() * 1000;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Track a card that was played (for card counting)
     */
    trackPlayedCard(card) {
        if (card && !this.playedCards.find(c => c.id === card.id)) {
            this.playedCards.push(card);
        }
    }

    /**
     * Reset tracking for new game
     */
    resetGame() {
        this.playedCards = [];
        this.colorPreferences = {};
    }
}

export default AIPlayer;
