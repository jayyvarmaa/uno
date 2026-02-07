import { describe, it, expect, vi } from 'vitest';
import { shuffleDeck } from './cardUtils';

describe('cardUtils: shuffleDeck', () => {
  it('should return a new array (immutability)', () => {
    const deck = [1, 2, 3];
    const shuffled = shuffleDeck(deck);
    expect(shuffled).not.toBe(deck); // Ensure reference equality check fails
    expect(shuffled).toEqual(expect.arrayContaining(deck)); // Ensure contents match
  });

  it('should maintain the same length', () => {
    const deck = [1, 2, 3, 4, 5];
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(deck.length);
  });

  it('should contain the same elements', () => {
    const deck = ['a', 'b', 'c', 'd'];
    const shuffled = shuffleDeck(deck);
    expect(shuffled.sort()).toEqual(deck.sort());
  });

  it('should handle empty arrays', () => {
    const deck = [];
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toEqual([]);
  });

  it('should handle single-element arrays', () => {
    const deck = [42];
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toEqual([42]);
  });

  it('should utilize randomness (mocked)', () => {
    // Mock Math.random to return a predictable sequence
    // For Fisher-Yates:
    // array = [1, 2, 3]
    // i=2: rand(3) -> floor(0.9 * 3) = 2. Swap(2, 2). array=[1, 2, 3]
    // i=1: rand(2) -> floor(0.1 * 2) = 0. Swap(1, 0). array=[2, 1, 3]

    const randomSpy = vi.spyOn(Math, 'random');

    // First call for i=2, return > 0.66 to pick index 2
    randomSpy.mockReturnValueOnce(0.9);
    // Second call for i=1, return < 0.5 to pick index 0
    randomSpy.mockReturnValueOnce(0.1);

    const deck = [1, 2, 3];
    const shuffled = shuffleDeck(deck);

    expect(shuffled).toEqual([2, 1, 3]);

    expect(randomSpy).toHaveBeenCalledTimes(2);
    randomSpy.mockRestore();
  });
});
