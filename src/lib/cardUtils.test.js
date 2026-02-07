import { describe, it, expect } from 'vitest';
import { calculateHandScore } from './cardUtils.js';

describe('calculateHandScore', () => {
    it('returns 0 for an empty hand', () => {
        expect(calculateHandScore([])).toBe(0);
    });

    it('calculates score for a single number card', () => {
        // Number card: value 5, score should be 5
        const hand = [{ type: 'number', value: '5' }];
        expect(calculateHandScore(hand)).toBe(5);
    });

    it('calculates score for a single special card', () => {
        // Special card: Skip, score should be 20
        const hand = [{ type: 'special', value: 'skip' }];
        expect(calculateHandScore(hand)).toBe(20);
    });

    it('calculates score for a single wild card', () => {
        // Wild card: Wild, score should be 50
        const hand = [{ type: 'wild', value: 'wild' }];
        expect(calculateHandScore(hand)).toBe(50);
    });

    it('calculates total score for a mixed hand', () => {
        const hand = [
            { type: 'number', value: '7' },       // 7
            { type: 'special', value: 'reverse' }, // 20
            { type: 'wild', value: 'wild_draw4' }, // 50
            { type: 'number', value: '0' }        // 0
        ];
        // Total: 7 + 20 + 50 + 0 = 77
        expect(calculateHandScore(hand)).toBe(77);
    });

    it('handles numeric string values correctly', () => {
        const hand = [
            { type: 'number', value: '9' },
            { type: 'number', value: '1' }
        ];
        // Total: 9 + 1 = 10
        expect(calculateHandScore(hand)).toBe(10);
    });

    it('returns 0 if card type is unknown', () => {
        const hand = [{ type: 'unknown', value: 'something' }];
        expect(calculateHandScore(hand)).toBe(0);
    });
});
