// AI Player Logic for UNO Game
export class AIPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
    }

    // Main decision function
    async makeMove(hand, topCard, currentColor, gameState) {
        const playableCards = this.getPlayableCards(hand, topCard, currentColor);

        if (playableCards.length === 0) {
            return { action: 'draw' };
        }

        // Decide which card to play based on difficulty
        let selectedCard;
        let selectedIndex;

        switch (this.difficulty) {
            case 'easy':
                selectedCard = this.selectEasyMove(playableCards, hand);
                break;
            case 'hard':
                selectedCard = this.selectHardMove(playableCards, hand, gameState);
                break;
            default:
                selectedCard = this.selectMediumMove(playableCards, hand);
        }

        selectedIndex = hand.findIndex(c => c.id === selectedCard.id);

        // Choose color for wild cards
        let chosenColor = null;
        if (selectedCard.type === 'wild' || selectedCard.type === 'wild_draw4') {
            chosenColor = this.chooseColor(hand, gameState);
        }

        return {
            action: 'play',
            card: selectedCard,
            cardIndex: selectedIndex,
            chosenColor
        };
    }

    getPlayableCards(hand, topCard, currentColor) {
        return hand.filter(card => {
            if (card.type === 'wild' || card.type === 'wild_draw4') return true;
            if (card.color === currentColor) return true;
            if (topCard && card.value === topCard.value && card.type === 'number') return true;
            if (topCard && card.type === topCard.type && card.type !== 'number') return true;
            return false;
        });
    }

    // Easy AI: Random selection
    selectEasyMove(playableCards) {
        return playableCards[Math.floor(Math.random() * playableCards.length)];
    }

    // Medium AI: Prefer special cards, save wilds
    selectMediumMove(playableCards, hand) {
        // Avoid wild cards unless necessary
        const nonWild = playableCards.filter(c => c.type !== 'wild' && c.type !== 'wild_draw4');
        if (nonWild.length > 0) {
            // Prefer special cards
            const special = nonWild.filter(c => ['skip', 'reverse', 'draw2'].includes(c.type));
            if (special.length > 0 && hand.length > 3) {
                return special[Math.floor(Math.random() * special.length)];
            }
            return nonWild[Math.floor(Math.random() * nonWild.length)];
        }
        return playableCards[0];
    }

    // Hard AI: Strategic play
    selectHardMove(playableCards, hand, gameState) {
        const handSize = hand.length;

        // If last card, play it
        if (handSize === 1) {
            return playableCards[0];
        }

        // If 2 cards left, try to play non-wild first
        if (handSize === 2) {
            const nonWild = playableCards.filter(c => c.type !== 'wild' && c.type !== 'wild_draw4');
            if (nonWild.length > 0) return nonWild[0];
        }

        // Save wild cards for later unless hand is small
        const nonWild = playableCards.filter(c => c.type !== 'wild' && c.type !== 'wild_draw4');

        if (nonWild.length > 0 && handSize > 4) {
            // Prioritize attack cards when opponent has few cards
            const hasOpponentLowCards = gameState?.players?.some(p =>
                p.card_count <= 2 && p.email?.startsWith('ai-')
            );

            if (hasOpponentLowCards) {
                const attackCards = nonWild.filter(c => ['draw2', 'wild_draw4', 'skip'].includes(c.type));
                if (attackCards.length > 0) {
                    return attackCards[0];
                }
            }

            // Play special cards in mid-game
            const special = nonWild.filter(c => ['skip', 'reverse', 'draw2'].includes(c.type));
            if (special.length > 0 && handSize > 5) {
                return special[Math.floor(Math.random() * special.length)];
            }

            return nonWild[Math.floor(Math.random() * nonWild.length)];
        }

        // Use wild cards when necessary
        return playableCards[0];
    }

    chooseColor(hand, gameState) {
        // Count cards by color in hand
        const colorCounts = { red: 0, blue: 0, green: 0, yellow: 0 };

        hand.forEach(card => {
            if (card.color !== 'wild' && colorCounts[card.color] !== undefined) {
                colorCounts[card.color]++;
            }
        });

        // Choose color with most cards
        const colors = Object.keys(colorCounts);
        colors.sort((a, b) => colorCounts[b] - colorCounts[a]);

        return colors[0];
    }

    // Simulate thinking time for realism
    async simulateThinking() {
        const delay = 1000 + Math.random() * 2000; // 1-3 seconds
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

export default AIPlayer;
