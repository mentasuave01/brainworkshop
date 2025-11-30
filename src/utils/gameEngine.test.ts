import { describe, it, expect } from 'bun:test';
import { calculateSessionScore } from './gameEngine';
import type { Session, Trial } from '../types';

describe('Game Scoring', () => {
    const createMockSession = (
        gameMode: string,
        jaeggiMode: boolean,
        trials: Partial<Trial>[]
    ): Session => {
        return {
            id: 'test-session',
            profileId: 'test-profile',
            gameMode: gameMode as any,
            nBackLevel: 2,
            trials: trials as Trial[],
            startTime: Date.now(),
            totalScore: 0,
            isManualMode: false,
            config: {
                jaeggiMode,
                timePerTrial: 3000,
                trialsPerSession: trials.length,
                variableNBack: false,
                soundSets: ['letters'],
                arithmeticOperations: {
                    addition: true,
                    subtraction: true,
                    multiplication: true,
                    division: true,
                },
                arithmeticMaxNumber: 10,
                interferenceLevel: 0,
                increaseThreshold: 80,
                maintainThreshold: 50,
                decreaseStrikes: 3,
            } as any,
        };
    };

    it('calculates Standard mode score correctly (TP / (TP + FP + FN))', () => {
        const trials: Partial<Trial>[] = [
            // Trial 0: n-back level (2) - ignore
            { index: 0, position: 1, sound: 'A', nBackLevel: 2, positionShouldMatch: false, positionMatch: null },
            // Trial 1: n-back level (2) - ignore
            { index: 1, position: 2, sound: 'B', nBackLevel: 2, positionShouldMatch: false, positionMatch: null },

            // Trial 2: TP (Match & Input) - Correct
            {
                index: 2,
                position: 1, // Matches Trial 0
                sound: 'C',
                nBackLevel: 2,
                positionShouldMatch: true,
                positionMatch: true, // User input
            },
            // Trial 3: FP (No Match & Input) - Wrong
            {
                index: 3,
                position: 3, // No match
                sound: 'D',
                nBackLevel: 2,
                positionShouldMatch: false,
                positionMatch: true, // User input
            },
            // Trial 4: FN (Match & No Input) - Wrong
            {
                index: 4,
                position: 1, // Matches Trial 2
                sound: 'E',
                nBackLevel: 2,
                positionShouldMatch: true,
                positionMatch: null, // User no input
            },
            // Trial 5: TN (No Match & No Input) - Ignored in Standard
            {
                index: 5,
                position: 4, // No match
                sound: 'F',
                nBackLevel: 2,
                positionShouldMatch: false,
                positionMatch: null, // User no input
            },
        ];

        const session = createMockSession('dual-nback', false, trials);
        const scores = calculateSessionScore(session);

        // Position Score Calculation:
        // TP = 1 (Trial 2)
        // FP = 1 (Trial 3)
        // FN = 1 (Trial 4)
        // TN = 1 (Trial 5) - Ignored
        // Total considered = TP + FP + FN = 3
        // Score = 1 / 3 = 33.33%

        expect(scores.positionScore).toBeCloseTo(33.33, 1);
    });

    it('calculates Jaeggi mode score correctly ((TP + TN) / Total)', () => {
        const trials: Partial<Trial>[] = [
            // Trial 0: n-back level (2) - ignore
            { index: 0, position: 1, sound: 'A', nBackLevel: 2, positionShouldMatch: false, positionMatch: null },
            // Trial 1: n-back level (2) - ignore
            { index: 1, position: 2, sound: 'B', nBackLevel: 2, positionShouldMatch: false, positionMatch: null },

            // Trial 2: TP (Match & Input) - Correct
            {
                index: 2,
                position: 1, // Matches Trial 0
                sound: 'C',
                nBackLevel: 2,
                positionShouldMatch: true,
                positionMatch: true,
            },
            // Trial 3: FP (No Match & Input) - Wrong
            {
                index: 3,
                position: 3, // No match
                sound: 'D',
                nBackLevel: 2,
                positionShouldMatch: false,
                positionMatch: true,
            },
            // Trial 4: FN (Match & No Input) - Wrong
            {
                index: 4,
                position: 1, // Matches Trial 2
                sound: 'E',
                nBackLevel: 2,
                positionShouldMatch: true,
                positionMatch: null,
            },
            // Trial 5: TN (No Match & No Input) - Correct in Jaeggi
            {
                index: 5,
                position: 4, // No match
                sound: 'F',
                nBackLevel: 2,
                positionShouldMatch: false,
                positionMatch: null,
            },
        ];

        const session = createMockSession('dual-nback', true, trials);
        const scores = calculateSessionScore(session);

        // Position Score Calculation:
        // TP = 1 (Trial 2)
        // FP = 1 (Trial 3)
        // FN = 1 (Trial 4)
        // TN = 1 (Trial 5)
        // Total = 4
        // Correct = TP + TN = 2
        // Score = 2 / 4 = 50%

        expect(scores.positionScore).toBe(50);
    });
});
