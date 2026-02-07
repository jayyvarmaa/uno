import { describe, it, expect } from 'vitest';
import { canPlayCard } from '../cardUtils';

describe('canPlayCard', () => {
    // Helper to create a card object
    const createCard = (type, color, value) => ({ type, color, value });

    describe('First Move', () => {
        it('should allow any card if topCard is null', () => {
            const card = createCard('number', 'red', '5');
            expect(canPlayCard(card, null, 'red')).toBe(true);
        });

        it('should allow any card if topCard is undefined', () => {
            const card = createCard('number', 'blue', '7');
            expect(canPlayCard(card, undefined, 'blue')).toBe(true);
        });
    });

    describe('Wild Cards', () => {
        it('should always allow playing a Wild card', () => {
            const wildCard = createCard('wild', 'wild', 'wild');
            const topCard = createCard('number', 'blue', '7');
            expect(canPlayCard(wildCard, topCard, 'blue')).toBe(true);
        });

        it('should always allow playing a Wild Draw 4 card', () => {
            const wildDraw4 = createCard('wild', 'wild', 'wild_draw4');
            const topCard = createCard('number', 'green', '2');
            expect(canPlayCard(wildDraw4, topCard, 'green')).toBe(true);
        });
    });

    describe('Matching Color', () => {
        it('should allow playing a card matching the current color', () => {
            const card = createCard('number', 'red', '5');
            // Scenario: Previous player played Red 8.
            const topCard = createCard('number', 'red', '8');
            expect(canPlayCard(card, topCard, 'red')).toBe(true);
        });

        it('should allow playing a card matching the currentColor when topCard is Wild', () => {
            // Scenario: Previous player played Wild and chose Red.
            const card = createCard('number', 'red', '5');
            const topCard = createCard('wild', 'wild', 'wild');
            expect(canPlayCard(card, topCard, 'red')).toBe(true);
        });

        it('should allow playing a card matching topCard color even if currentColor differs (edge case)', () => {
            // This tests the specific line: if (card.color === topCard.color) return true;
            // In a real game, currentColor usually tracks topCard.color, but this ensures the logic holds.
            const card = createCard('number', 'blue', '5');
            const topCard = createCard('number', 'blue', '9');
            expect(canPlayCard(card, topCard, 'green')).toBe(true); // Matches topCard color directly
        });
    });

    describe('Matching Value', () => {
        it('should allow playing a number card with matching value', () => {
            const card = createCard('number', 'red', '5');
            const topCard = createCard('number', 'blue', '5');
            expect(canPlayCard(card, topCard, 'blue')).toBe(true);
        });

        it('should allow playing a special card with matching value (e.g. Skip on Skip)', () => {
            const card = createCard('special', 'green', 'skip');
            const topCard = createCard('special', 'yellow', 'skip');
            expect(canPlayCard(card, topCard, 'yellow')).toBe(true);
        });

        it('should allow playing a Reverse on a Reverse', () => {
            const card = createCard('special', 'blue', 'reverse');
            const topCard = createCard('special', 'red', 'reverse');
            expect(canPlayCard(card, topCard, 'red')).toBe(true);
        });
    });

    describe('Illegal Moves', () => {
        it('should not allow playing a card with different color and value', () => {
            const card = createCard('number', 'red', '5');
            const topCard = createCard('number', 'blue', '8');
            expect(canPlayCard(card, topCard, 'blue')).toBe(false);
        });

        it('should not allow playing a special card with different color and value', () => {
            const card = createCard('special', 'red', 'skip');
            const topCard = createCard('number', 'blue', '8');
            expect(canPlayCard(card, topCard, 'blue')).toBe(false);
        });

         it('should not allow playing a number card on a special card with different color', () => {
            const card = createCard('number', 'red', '5');
            const topCard = createCard('special', 'blue', 'skip');
            expect(canPlayCard(card, topCard, 'blue')).toBe(false);
        });
    });
});
