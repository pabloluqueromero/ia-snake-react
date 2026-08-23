import { DQNInference } from './DQNInference';
import { generateDefaultWeights } from './defaultWeights';
import DQNPlayer from '../players/DQNPlayer';
import Direction from '../controls/Direction';

describe('DQN Neural Network & Inference', () => {
    test('loads pre-trained weights and generates valid Q-values', () => {
        const weights = generateDefaultWeights();
        const inference = new DQNInference(weights);

        expect(inference.isReady()).toBe(true);

        const state = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0.5, 1.0];
        const qValues = inference.predict(state);

        expect(qValues.length).toBe(3);
        qValues.forEach(q => {
            expect(typeof q).toBe('number');
            expect(isNaN(q)).toBe(false);
        });
    });

    test('selectAction safely avoids immediate danger when alternatives exist', () => {
        const weights = generateDefaultWeights();
        const inference = new DQNInference(weights);

        // State with danger straight (1.0), danger right (0.0), danger left (1.0)
        const stateWithDanger = [1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1, 1, 0, 0, 0.2, 0.5];
        const result = inference.selectAction(stateWithDanger, 0.0);

        expect(result.action).toBe(1);
    });

    test('DQNPlayer initializes and converts actions properly', async () => {
        const player = new DQNPlayer(generateDefaultWeights());
        player.init();

        let telemetryReceived = false;
        player.setTelemetryListener((telemetry) => {
            telemetryReceived = true;
            expect(telemetry.qValues.length).toBe(3);
            expect([0, 1, 2]).toContain(telemetry.chosenAction);
        });

        const move = await player.getNextMove();
        expect([Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT]).toContain(move);
    });
});
