import { ModelWeights } from "./DQNInference";
import trainedWeightsJson from "./dqn_weights.json";

export function generateDefaultWeights(): ModelWeights {
    if (trainedWeightsJson && (trainedWeightsJson as any).weights) {
        return trainedWeightsJson as unknown as ModelWeights;
    }

    const stateDim = 12;
    const h1Dim = 64;
    const h2Dim = 64;
    const actionDim = 3;

    return {
        version: "3.0",
        framework: "tensorflow-keras",
        architecture: [stateDim, h1Dim, h2Dim, actionDim],
        weights: {
            w1: Array.from({ length: stateDim }, () => new Array(h1Dim).fill(0)),
            b1: new Array(h1Dim).fill(0),
            w2: Array.from({ length: h1Dim }, () => new Array(h2Dim).fill(0)),
            b2: new Array(h2Dim).fill(0),
            w3: Array.from({ length: h2Dim }, () => new Array(actionDim).fill(0)),
            b3: new Array(actionDim).fill(0)
        }
    };
}
