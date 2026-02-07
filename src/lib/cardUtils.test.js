import { describe, it, expect } from 'vitest';
import { getCardScore } from './cardUtils';

describe('cardUtils', () => {
    describe('getCardScore', () => {
        it('should return the face value for number cards', () => {
            const card0 = { type: 'number', value: '0' };
            const card5 = { type: 'number', value: '5' };
            const card9 = { type: 'number', value: '9' };

            expect(getCardScore(card0)).toBe(0);
            expect(getCardScore(card5)).toBe(5);
            expect(getCardScore(card9)).toBe(9);
        });

        it('should return 20 for special cards', () => {
            const skip = { type: 'special', value: 'skip' };
            const reverse = { type: 'special', value: 'reverse' };
            const draw2 = { type: 'special', value: 'draw2' };

            expect(getCardScore(skip)).toBe(20);
            expect(getCardScore(reverse)).toBe(20);
            expect(getCardScore(draw2)).toBe(20);
        });

        it('should return 50 for wild cards', () => {
            const wild = { type: 'wild', value: 'wild' };
            const wildDraw4 = { type: 'wild', value: 'wild_draw4' };

            expect(getCardScore(wild)).toBe(50);
            expect(getCardScore(wildDraw4)).toBe(50);
        });

        it('should return 0 for unknown card types', () => {
            const unknown = { type: 'unknown', value: 'something' };
            expect(getCardScore(unknown)).toBe(0);
        });

        it('should handle numeric values as strings correctly', () => {
            // Confirming parseInt behavior
            expect(getCardScore({ type: 'number', value: '1' })).toBe(1);
            expect(getCardScore({ type: 'number', value: '01' })).toBe(1);
        });
    });
});
