/**
 * Lightweight Forward-Pass Neural Network Inference Engine
 * Compatible with TensorFlow / Keras exported weights
 */

export interface ModelWeights {
    version: string;
    framework: string;
    architecture: number[];
    weights: {
        w1: number[][]; // 12 x 64
        b1: number[];   // 64
        w2: number[][]; // 64 x 64
        b2: number[];   // 64
        w3: number[][]; // 64 x 3
        b3: number[];   // 3
    };
    stats?: Record<string, any>;
}

export class DQNInference {
    private weights: ModelWeights['weights'] | null = null;
    private isLoaded: boolean = false;

    constructor(initialWeights?: ModelWeights) {
        if (initialWeights && initialWeights.weights) {
            this.loadWeights(initialWeights);
        }
    }

    public loadWeights(modelData: ModelWeights): void {
        this.weights = modelData.weights;
        this.isLoaded = true;
    }

    public isReady(): boolean {
        return this.isLoaded && this.weights !== null;
    }

    /**
     * Compute Q-values for a 12-dimensional state vector
     * Returns [Q_straight, Q_turn_right, Q_turn_left]
     */
    public predict(state: number[]): number[] {
        if (!this.weights) {
            // Fallback heuristic if weights are not yet loaded
            return [0.5, 0.2, 0.2];
        }

        const { w1, b1, w2, b2, w3, b3 } = this.weights;

        // Layer 1: Input (12) -> Hidden (64) + ReLU
        const h1 = new Array(b1.length);
        for (let j = 0; j < b1.length; j++) {
            let sum = b1[j];
            for (let i = 0; i < state.length; i++) {
                sum += state[i] * w1[i][j];
            }
            h1[j] = Math.max(0, sum);
        }

        // Layer 2: Hidden (64) -> Hidden (64) + ReLU
        const h2 = new Array(b2.length);
        for (let j = 0; j < b2.length; j++) {
            let sum = b2[j];
            for (let i = 0; i < h1.length; i++) {
                sum += h1[i] * w2[i][j];
            }
            h2[j] = Math.max(0, sum);
        }

        // Layer 3: Hidden (64) -> Output (3) Linear
        const qValues = new Array(b3.length);
        for (let j = 0; j < b3.length; j++) {
            let sum = b3[j];
            for (let i = 0; i < h2.length; i++) {
                sum += h2[i] * w3[i][j];
            }
            qValues[j] = sum;
        }

        return qValues;
    }

    /**
     * Select best action with danger safety mask
     * Actions: 0 = Straight, 1 = Turn Right, 2 = Turn Left
     * State features 0, 1, 2 correspond to danger_straight, danger_right, danger_left
     */
    public selectAction(state: number[], explorationRate: number = 0.0): { action: number; qValues: number[]; isExploring: boolean } {
        const qValues = this.predict(state);
        const dangers = [state[0] > 0.5, state[1] > 0.5, state[2] > 0.5];

        let chosenAction = 0;
        let isExploring = false;

        if (Math.random() < explorationRate) {
            isExploring = true;
            const safeActions = [0, 1, 2].filter(a => !dangers[a]);
            if (safeActions.length > 0) {
                chosenAction = safeActions[Math.floor(Math.random() * safeActions.length)];
            } else {
                chosenAction = Math.floor(Math.random() * 3);
            }
        } else {
            // Pick highest Q-value, masking out immediate suicide moves if safer alternatives exist
            let bestQ = -Infinity;
            let bestAction = 0;

            const safeActions = [0, 1, 2].filter(a => !dangers[a]);
            const candidateActions = safeActions.length > 0 ? safeActions : [0, 1, 2];

            for (const a of candidateActions) {
                if (qValues[a] > bestQ) {
                    bestQ = qValues[a];
                    bestAction = a;
                }
            }
            chosenAction = bestAction;
        }

        return { action: chosenAction, qValues, isExploring };
    }
}
