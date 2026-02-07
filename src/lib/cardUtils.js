/**
 * Card Utilities for UNO Game
 * Adapted from reference projects for proper UNO rules
 */

// Card colors (standard UNO)
export const CARD_COLORS = ['red', 'green', 'blue', 'yellow'];
export const NUMBER_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export const SPECIAL_VALUES = ['skip', 'reverse', 'draw2'];
export const WILD_VALUES = ['wild', 'wild_draw4'];

/**
 * Generate a standard 108-card UNO deck
 * - 19 cards per color (one 0, two of 1-9)
 * - 6 special cards per color (2x skip, reverse, draw2)
 * - 8 wild cards (4x wild, 4x wild_draw4)
 */
export function generateDeck() {
    const deck = [];
    let cardId = 0;

    // Color cards
    CARD_COLORS.forEach(color => {
        // Number cards: one 0, two of 1-9
        NUMBER_VALUES.forEach(value => {
            deck.push(createCard(cardId++, 'number', color, value));
            if (value !== '0') {
                deck.push(createCard(cardId++, 'number', color, value));
            }
        });

        // Special cards: two of each
        SPECIAL_VALUES.forEach(value => {
            deck.push(createCard(cardId++, 'special', color, value));
            deck.push(createCard(cardId++, 'special', color, value));
        });
    });

    // Wild cards: 4 of each
    for (let i = 0; i < 4; i++) {
        deck.push(createCard(cardId++, 'wild', 'wild', 'wild'));
        deck.push(createCard(cardId++, 'wild', 'wild', 'wild_draw4'));
    }

    return shuffleDeck(deck);
}

/**
 * Create a card object
 */
function createCard(id, type, color, value) {
    return {
        id: `card-${id}`,
        type,
        color,
        value,
        score: getCardScore({ type, value })
    };
}

/**
 * Get card score (used for determining winner's points)
 * - Number cards: face value
 * - Skip/Reverse/Draw2: 20 points
 * - Wild/Wild Draw 4: 50 points
 */
export function getCardScore(card) {
    if (card.type === 'number') {
        return parseInt(card.value, 10);
    }
    if (card.type === 'special') {
        return 20; // skip, reverse, draw2
    }
    if (card.type === 'wild') {
        return 50; // wild, wild_draw4
    }
    return 0;
}

/**
 * Calculate total hand score
 */
export function calculateHandScore(cards) {
    return cards.reduce((total, card) => total + getCardScore(card), 0);
}

/**
 * Shuffle deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get playable cards from hand based on top card and current color
 * A card can be played if:
 * - It matches the color of the top card (or current wild color)
 * - It matches the value of the top card
 * - It's a wild card
 */
export function getThrowableCards(hand, topCard, currentColor) {
    if (!topCard || !hand) return hand || [];

    return hand.filter(card => {
        // Wild cards can always be played
        if (card.type === 'wild') return true;

        // Match color (including wild color override)
        if (card.color === currentColor) return true;
        if (card.color === topCard.color) return true;

        // Match value (for both number and special cards)
        if (card.value === topCard.value) return true;

        return false;
    });
}

/**
 * Check if a specific card can be played
 */
export function canPlayCard(card, topCard, currentColor) {
    if (!topCard) return true;
    if (card.type === 'wild') return true;
    if (card.color === currentColor) return true;
    if (card.color === topCard.color) return true;
    if (card.value === topCard.value) return true;
    return false;
}

/**
 * Get SVG path for a card
 * Maps card properties to SVG filenames
 */
export function getCardSvgPath(card) {
    if (!card) return '/Cards/back.jpeg';

    // Wild cards
    if (card.type === 'wild') {
        if (card.value === 'wild_draw4') return '/Cards/P4.svg';
        return '/Cards/CC.svg';
    }

    // Color prefix: r, g, b, y (yellow uses 'o' in original SVGs)
    const colorPrefix = {
        red: 'r',
        green: 'g',
        blue: 'b',
        yellow: 'o' // orange files used for yellow
    }[card.color] || 'r';

    // Value suffix
    let valueSuffix = card.value;
    if (card.type === 'special') {
        switch (card.value) {
            case 'skip': valueSuffix = 'x'; break;
            case 'reverse': valueSuffix = 'r'; break;
            case 'draw2': valueSuffix = 'p2'; break;
            default: valueSuffix = card.value;
        }
    }

    return `/Cards/${colorPrefix}${valueSuffix}.svg`;
}

/**
 * Get display color for a card (CSS hex value)
 */
export function getCardDisplayColor(color) {
    const colors = {
        red: '#EF4444',
        green: '#22C55E',
        blue: '#3B82F6',
        yellow: '#FACC15',
        wild: '#1F2937'
    };
    return colors[color] || colors.wild;
}

/**
 * Process special card effects
 * Returns the number of extra turns to skip and cards to draw
 */
export function getSpecialCardEffect(card) {
    if (card.type !== 'special' && card.type !== 'wild') {
        return { skipTurns: 0, drawCards: 0 };
    }

    switch (card.value) {
        case 'skip':
            return { skipTurns: 1, drawCards: 0 };
        case 'reverse':
            return { skipTurns: 0, drawCards: 0, reverseDirection: true };
        case 'draw2':
            return { skipTurns: 1, drawCards: 2 };
        case 'wild_draw4':
            return { skipTurns: 1, drawCards: 4 };
        default:
            return { skipTurns: 0, drawCards: 0 };
    }
}

/**
 * Determine winner and calculate final scores
 */
export function calculateGameResults(players) {
    const results = players.map(player => ({
        ...player,
        handScore: calculateHandScore(player.cards || [])
    }));

    // Winner is player with fewest cards (ideally 0)
    results.sort((a, b) => (a.cards?.length || 0) - (b.cards?.length || 0));

    const winner = results[0];
    const totalPointsWon = results.reduce((sum, p) => {
        if (p.email !== winner.email) {
            return sum + p.handScore;
        }
        return sum;
    }, 0);

    return {
        winner,
        totalPointsWon,
        playerScores: results
    };
}

export default {
    generateDeck,
    shuffleDeck,
    getCardScore,
    calculateHandScore,
    getThrowableCards,
    canPlayCard,
    getCardSvgPath,
    getCardDisplayColor,
    getSpecialCardEffect,
    calculateGameResults,
    CARD_COLORS,
    NUMBER_VALUES,
    SPECIAL_VALUES,
    WILD_VALUES
};
