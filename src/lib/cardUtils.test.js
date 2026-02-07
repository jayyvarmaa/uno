import { describe, expect, test } from "bun:test";
import { getSpecialCardEffect } from "./cardUtils.js";

describe("cardUtils", () => {
    describe("getSpecialCardEffect", () => {
        // Happy Paths - Special Cards
        test("should return correct effect for 'skip' card", () => {
            const card = { type: "special", value: "skip" };
            expect(getSpecialCardEffect(card)).toEqual({ skipTurns: 1, drawCards: 0 });
        });

        test("should return correct effect for 'reverse' card", () => {
            const card = { type: "special", value: "reverse" };
            expect(getSpecialCardEffect(card)).toEqual({
                skipTurns: 0,
                drawCards: 0,
                reverseDirection: true
            });
        });

        test("should return correct effect for 'draw2' card", () => {
            const card = { type: "special", value: "draw2" };
            expect(getSpecialCardEffect(card)).toEqual({ skipTurns: 1, drawCards: 2 });
        });

        // Happy Paths - Wild Cards
        test("should return correct effect for 'wild_draw4' card", () => {
            const card = { type: "wild", value: "wild_draw4" };
            expect(getSpecialCardEffect(card)).toEqual({ skipTurns: 1, drawCards: 4 });
        });

        test("should return no effect for standard 'wild' card", () => {
            const card = { type: "wild", value: "wild" };
            expect(getSpecialCardEffect(card)).toEqual({ skipTurns: 0, drawCards: 0 });
        });

        // Negative/Edge Cases
        test("should return no effect for number cards", () => {
            const card = { type: "number", value: "5" };
            expect(getSpecialCardEffect(card)).toEqual({ skipTurns: 0, drawCards: 0 });
        });

        test("should return no effect for unknown special card values", () => {
            const card = { type: "special", value: "unknown_value" };
            expect(getSpecialCardEffect(card)).toEqual({ skipTurns: 0, drawCards: 0 });
        });

        test("should return no effect for cards with missing type", () => {
            const card = { value: "skip" }; // Missing type
            expect(getSpecialCardEffect(card)).toEqual({ skipTurns: 0, drawCards: 0 });
        });

        test("should return no effect for cards with missing value", () => {
             const card = { type: "special" }; // Missing value
             expect(getSpecialCardEffect(card)).toEqual({ skipTurns: 0, drawCards: 0 });
        });
    });
});
