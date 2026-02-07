import { describe, it, expect } from 'vitest';
import { getThrowableCards } from './cardUtils';

describe('getThrowableCards', () => {
    // Helper to create simple mock cards
    const createCard = (type, color, value) => ({ type, color, value });

    const red5 = createCard('number', 'red', '5');
    const red7 = createCard('number', 'red', '7');
    const blue5 = createCard('number', 'blue', '5');
    const blue9 = createCard('number', 'blue', '9');
    const greenSkip = createCard('special', 'green', 'skip');
    const redSkip = createCard('special', 'red', 'skip');
    const wildCard = createCard('wild', 'wild', 'wild');
    const wildDraw4 = createCard('wild', 'wild', 'wild_draw4');

    it('should return matching color cards', () => {
        const hand = [red7, blue9, greenSkip];
        const topCard = red5;
        const currentColor = 'red';

        const result = getThrowableCards(hand, topCard, currentColor);

        expect(result).toHaveLength(1);
        expect(result).toContain(red7);
    });

    it('should return matching value cards', () => {
        const hand = [blue9, blue5];
        const topCard = red5;
        const currentColor = 'red';

        const result = getThrowableCards(hand, topCard, currentColor);
        expect(result).toHaveLength(1);
        expect(result).toContain(blue5);
    });

    it('should correctly handle matching color OR matching value', () => {
        const hand = [red7, blue5, greenSkip];
        const topCard = red5; // Color: red, Value: 5
        const currentColor = 'red';

        const result = getThrowableCards(hand, topCard, currentColor);

        // red7 matches color 'red'
        // blue5 matches value '5'
        // greenSkip matches neither
        expect(result).toHaveLength(2);
        expect(result).toEqual(expect.arrayContaining([red7, blue5]));
    });

    it('should always include wild cards', () => {
        const hand = [wildCard, wildDraw4, blue9];
        const topCard = red5;
        const currentColor = 'red';

        const result = getThrowableCards(hand, topCard, currentColor);

        expect(result).toHaveLength(2);
        expect(result).toContain(wildCard);
        expect(result).toContain(wildDraw4);
    });

    it('should respect currentColor over topCard color (wild card played previously)', () => {
        // Situation: A Wild card was played, and the player chose "blue".
        // The top card is technically a Wild card (color 'wild'), but currentColor is 'blue'.
        const hand = [red7, blue9, greenSkip];
        const topCard = wildCard; // type: wild, color: wild
        const currentColor = 'blue';

        const result = getThrowableCards(hand, topCard, currentColor);

        // Should match 'blue' cards
        expect(result).toHaveLength(1);
        expect(result).toContain(blue9);
    });

    it('should match special cards by value (symbol)', () => {
        const hand = [greenSkip, redSkip, blue9];
        const topCard = createCard('special', 'yellow', 'skip'); // Yellow Skip
        const currentColor = 'yellow';

        const result = getThrowableCards(hand, topCard, currentColor);

        // greenSkip matches value 'skip'
        // redSkip matches value 'skip'
        // blue9 matches neither
        expect(result).toHaveLength(2);
        expect(result).toContain(greenSkip);
        expect(result).toContain(redSkip);
    });

    it('should return empty array if no cards match', () => {
        const hand = [blue9, greenSkip];
        const topCard = red5;
        const currentColor = 'red';

        const result = getThrowableCards(hand, topCard, currentColor);

        expect(result).toEqual([]);
    });

    it('should return empty array if hand is empty', () => {
        const hand = [];
        const topCard = red5;
        const currentColor = 'red';

        const result = getThrowableCards(hand, topCard, currentColor);

        expect(result).toEqual([]);
    });

    it('should handle missing topCard gracefully', () => {
        // If topCard is null (e.g., start of game or error), implementation returns hand or []
        // Code: if (!topCard || !hand) return hand || [];
        // This implies if topCard is missing, ANY card in hand is theoretically "throwable" or it just returns the hand.
        // Let's verify the current implementation behavior.
        const hand = [red5];
        const result = getThrowableCards(hand, null, 'red');
        expect(result).toEqual(hand);
    });

    it('should handle null/undefined hand gracefully', () => {
        const result = getThrowableCards(null, red5, 'red');
        expect(result).toEqual([]);

        const result2 = getThrowableCards(undefined, red5, 'red');
        expect(result2).toEqual([]);
    });
});
