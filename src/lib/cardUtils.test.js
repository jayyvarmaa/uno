import { describe, it, expect } from 'vitest';
import { generateDeck, CARD_COLORS, SPECIAL_VALUES } from './cardUtils';

describe('generateDeck', () => {
    it('should generate a deck of 108 cards', () => {
        const deck = generateDeck();
        expect(deck).toHaveLength(108);
    });

    it('should contain the correct number of cards per color', () => {
        const deck = generateDeck();
        const colorCounts = {};

        // Initialize counts
        CARD_COLORS.forEach(color => colorCounts[color] = 0);
        colorCounts['wild'] = 0;

        deck.forEach(card => {
            if (card.type === 'wild') {
                colorCounts['wild']++;
            } else {
                colorCounts[card.color]++;
            }
        });

        // 19 number cards + 6 special cards = 25 cards per color
        CARD_COLORS.forEach(color => {
            expect(colorCounts[color]).toBe(25);
        });

        // 4 wild + 4 wild draw 4 = 8 wild cards
        expect(colorCounts['wild']).toBe(8);
    });

    it('should contain the correct number of each card type', () => {
        const deck = generateDeck();

        const numberCards = deck.filter(c => c.type === 'number');
        const specialCards = deck.filter(c => c.type === 'special');
        const wildCards = deck.filter(c => c.type === 'wild');

        // 19 * 4 = 76 number cards
        expect(numberCards).toHaveLength(76);

        // 6 * 4 = 24 special cards
        expect(specialCards).toHaveLength(24);

        // 8 wild cards
        expect(wildCards).toHaveLength(8);
    });

    it('should contain specific counts for each value', () => {
        const deck = generateDeck();

        // Helper to count cards by value and color
        const countCard = (type, value, color) => {
            return deck.filter(c =>
                c.type === type &&
                c.value === value &&
                (color ? c.color === color : true)
            ).length;
        };

        CARD_COLORS.forEach(color => {
            // Check 0s: 1 per color
            expect(countCard('number', '0', color)).toBe(1);

            // Check 1-9: 2 per color
            for (let i = 1; i <= 9; i++) {
                expect(countCard('number', i.toString(), color)).toBe(2);
            }

            // Check Special cards: 2 per color
            SPECIAL_VALUES.forEach(val => {
                expect(countCard('special', val, color)).toBe(2);
            });
        });

        // Check Wilds
        expect(countCard('wild', 'wild')).toBe(4);
        expect(countCard('wild', 'wild_draw4')).toBe(4);
    });

    it('should generate unique IDs for all cards', () => {
        const deck = generateDeck();
        const ids = new Set(deck.map(card => card.id));
        expect(ids.size).toBe(108);
    });

    it('should be shuffled', () => {
        // Generate two decks and ensure they are not in the same order
        // Note: There is a microscopic chance this test fails if shuffle results in same order
        // but for 108 cards it's statistically impossible.
        const deck1 = generateDeck();
        const deck2 = generateDeck();

        // Check if decks are identical in order
        const isIdentical = deck1.every((card, index) => card.id === deck2[index].id);
        expect(isIdentical).toBe(false);
    });
});
