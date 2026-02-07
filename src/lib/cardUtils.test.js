import { describe, it, expect } from 'vitest';
import { calculateGameResults } from './cardUtils';

describe('calculateGameResults', () => {
    describe('Happy Path', () => {
        it('correctly identifies the winner with fewest cards', () => {
            const players = [
                {
                    id: 'p1',
                    email: 'winner@test.com',
                    cards: []
                },
                {
                    id: 'p2',
                    email: 'loser1@test.com',
                    cards: [{ type: 'number', value: '5' }]
                },
                {
                    id: 'p3',
                    email: 'loser2@test.com',
                    cards: [{ type: 'special', value: 'skip' }]
                }
            ];

            const result = calculateGameResults(players);

            expect(result.winner.id).toBe('p1');
            expect(result.winner.handScore).toBe(0);
        });

        it('calculates total points from losing players hands', () => {
            const players = [
                {
                    id: 'p1',
                    email: 'winner@test.com',
                    cards: []
                },
                {
                    id: 'p2',
                    email: 'loser1@test.com',
                    cards: [
                        { type: 'number', value: '5' },      // 5
                        { type: 'special', value: 'skip' },  // 20
                        { type: 'wild', value: 'wild' }      // 50
                    ]
                }
            ];
            // Total expected: 5 + 20 + 50 = 75

            const result = calculateGameResults(players);

            expect(result.totalPointsWon).toBe(75);
        });
    });

    describe('Edge Cases', () => {
        it('handles players with missing cards array (treats as empty hand)', () => {
            const players = [
                { id: 'p1', email: 'winner@test.com' }, // No cards property
                { id: 'p2', email: 'loser@test.com', cards: [{ type: 'number', value: '1' }] }
            ];

            const result = calculateGameResults(players);

            expect(result.winner.id).toBe('p1');
            expect(result.totalPointsWon).toBe(1);
        });

        it('handles ties by picking the first player in the list with the lowest card count (stable sort check)', () => {
            const players1 = [
                { id: 'p1', email: 'tie1@test.com', cards: [{ type: 'number', value: '1' }] },
                { id: 'p2', email: 'tie2@test.com', cards: [{ type: 'number', value: '1' }] }
            ];

            const result1 = calculateGameResults(players1);
            expect(result1.winner.id).toBe('p1');

            // Verify stability with reversed input order
            const players2 = [
                { id: 'p2', email: 'tie2@test.com', cards: [{ type: 'number', value: '1' }] },
                { id: 'p1', email: 'tie1@test.com', cards: [{ type: 'number', value: '1' }] }
            ];

            const result2 = calculateGameResults(players2);
            expect(result2.winner.id).toBe('p2');
        });

        it('returns correct structure for game results', () => {
            const players = [
                { id: 'p1', email: 'p1@test.com', cards: [] }
            ];

            const result = calculateGameResults(players);

            expect(result).toHaveProperty('winner');
            expect(result).toHaveProperty('totalPointsWon');
            expect(result).toHaveProperty('playerScores');
            expect(result.playerScores).toHaveLength(1);
            expect(result.playerScores[0]).toHaveProperty('handScore');
        });
    });
});
