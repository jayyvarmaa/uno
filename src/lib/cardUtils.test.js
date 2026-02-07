import { describe, it, expect } from 'vitest';
import { getCardSvgPath } from './cardUtils';

describe('getCardSvgPath', () => {
    it('returns back card for null or undefined input', () => {
        expect(getCardSvgPath(null)).toBe('/Cards/back.jpeg');
        expect(getCardSvgPath(undefined)).toBe('/Cards/back.jpeg');
    });

    it('returns correct path for wild cards', () => {
        const wildCard = { type: 'wild', value: 'wild', color: 'wild' };
        expect(getCardSvgPath(wildCard)).toBe('/Cards/CC.svg');

        const wildDraw4 = { type: 'wild', value: 'wild_draw4', color: 'wild' };
        expect(getCardSvgPath(wildDraw4)).toBe('/Cards/P4.svg');
    });

    it('returns correct path for standard number cards', () => {
        // Red 0 -> r0.svg
        expect(getCardSvgPath({ type: 'number', color: 'red', value: '0' })).toBe('/Cards/r0.svg');
        // Green 5 -> g5.svg
        expect(getCardSvgPath({ type: 'number', color: 'green', value: '5' })).toBe('/Cards/g5.svg');
        // Blue 9 -> b9.svg
        expect(getCardSvgPath({ type: 'number', color: 'blue', value: '9' })).toBe('/Cards/b9.svg');
        // Yellow 3 -> o3.svg (yellow maps to 'o')
        expect(getCardSvgPath({ type: 'number', color: 'yellow', value: '3' })).toBe('/Cards/o3.svg');
    });

    it('returns correct path for special cards', () => {
        // Skip
        expect(getCardSvgPath({ type: 'special', color: 'red', value: 'skip' })).toBe('/Cards/rx.svg');
        // Reverse
        expect(getCardSvgPath({ type: 'special', color: 'green', value: 'reverse' })).toBe('/Cards/gr.svg');
        // Draw2
        expect(getCardSvgPath({ type: 'special', color: 'blue', value: 'draw2' })).toBe('/Cards/bp2.svg');

        // Yellow specials
        expect(getCardSvgPath({ type: 'special', color: 'yellow', value: 'skip' })).toBe('/Cards/ox.svg');
    });

    it('handles unexpected colors gracefully', () => {
        // Should default to red prefix 'r'
        expect(getCardSvgPath({ type: 'number', color: 'purple', value: '7' })).toBe('/Cards/r7.svg');
    });

    it('handles unknown special values gracefully', () => {
        expect(getCardSvgPath({ type: 'special', color: 'red', value: 'custom' })).toBe('/Cards/rcustom.svg');
    });
});
