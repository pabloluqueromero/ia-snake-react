import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import { GameUtils } from "../game-utils/GameUtils";
import { DQNInference, ModelWeights } from "../ai/DQNInference";
import Player from "./Player";

export interface DQNTelemetry {
    qValues: [number, number, number];
    chosenAction: number; // 0: Straight, 1: Right, 2: Left
    dangers: [boolean, boolean, boolean]; // Straight, Right, Left
    currentDirection: Direction;
    foodRelative: { up: boolean; right: boolean; down: boolean; left: boolean };
    distanceToFood: number;
    isExploring: boolean;
}

export type TelemetryListener = (data: DQNTelemetry) => void;

class DQNPlayer implements Player {
    private static readonly CLOCKWISE: Direction[] = [
        Direction.UP,
        Direction.RIGHT,
        Direction.DOWN,
        Direction.LEFT
    ];

    private static readonly DIR_VECTORS: Record<Direction, [number, number]> = {
        [Direction.UP]: [-1, 0],
        [Direction.RIGHT]: [0, 1],
        [Direction.DOWN]: [1, 0],
        [Direction.LEFT]: [0, -1]
    };

    private game: SnakeGame | null = null;
    private inference: DQNInference;
    private visualize: boolean = true;
    private telemetryListener: TelemetryListener | null = null;
    private currentHeading: Direction = Direction.UP;
    private epsilon: number = 0.0;

    constructor(weights?: ModelWeights) {
        this.inference = new DQNInference(weights);
    }

    public setTelemetryListener(listener: TelemetryListener | null): void {
        this.telemetryListener = listener;
    }

    public setExplorationRate(eps: number): void {
        this.epsilon = Math.max(0, Math.min(1, eps));
    }

    public init(): void {
        console.info("[Player] DQN Reinforcement Learning Player initialized");
        this.currentHeading = Direction.UP;
    }

    public setGame(game: SnakeGame): void {
        this.game = game;
    }

    public changeVisualize(): void {
        this.visualize = !this.visualize;
        if (!this.visualize && this.game && this.game.getBoard() && this.game.getBoard().current) {
            this.game.getBoard().current.clearVisualization();
        }
    }

    public destroy(): void {
        this.telemetryListener = null;
        if (this.game && this.game.getBoard() && this.game.getBoard().current) {
            this.game.getBoard().current.clearVisualization();
        }
    }

    public async getNextMove(): Promise<Direction> {
        if (!this.game) {
            return Direction.UP;
        }

        const lastMove = this.game.getLastMovement();
        if (lastMove !== null && lastMove !== undefined) {
            this.currentHeading = lastMove;
        }

        const state = this.extractRelativeState();
        const { action, qValues, isExploring } = this.inference.selectAction(state, this.epsilon);
        const nextDirection = this.convertActionToDirection(this.currentHeading, action);

        if (this.telemetryListener) {
            const telemetry: DQNTelemetry = {
                qValues: [qValues[0] || 0, qValues[1] || 0, qValues[2] || 0],
                chosenAction: action,
                dangers: [state[0] > 0.5, state[1] > 0.5, state[2] > 0.5],
                currentDirection: nextDirection,
                foodRelative: {
                    up: state[6] > 0.5,
                    right: state[7] > 0.5,
                    down: state[9] > 0.5,
                    left: state[8] > 0.5
                },
                distanceToFood: Math.round(state[10] * (this.game.getDimensions()[0] + this.game.getDimensions()[1])),
                isExploring
            };
            this.telemetryListener(telemetry);
        }

        if (this.visualize && this.game.getBoard() && this.game.getBoard().current) {
            const nextHead = GameUtils.applyDirection(this.game.getHeadSnakePosition(), nextDirection);
            if (GameUtils.isValidPosition(nextHead, this.game.getDimensions(), this.game.getSnake())) {
                if (!nextHead.equals(this.game.getApplePosition())) {
                    this.game.setSinglePosition(nextHead, ["path"]);
                }
            }
        }

        this.currentHeading = nextDirection;
        return nextDirection;
    }

    /**
     * Extracts 12 relative spatial features matching trained neural policy:
     * 0: danger_straight
     * 1: danger_right
     * 2: danger_left
     * 3: danger2_straight
     * 4: danger2_right
     * 5: danger2_left
     * 6: food_is_straight
     * 7: food_is_right
     * 8: food_is_left
     * 9: food_is_back
     * 10: normalized Manhattan distance
     * 11: open neighbor ratio ahead
     */
    private extractRelativeState(): number[] {
        if (!this.game) {
            return new Array(12).fill(0);
        }

        const head = this.game.getHeadSnakePosition();
        const apple = this.game.getApplePosition();
        const dimensions = this.game.getDimensions();
        const snake = this.game.getSnake();

        const idx = DQNPlayer.CLOCKWISE.indexOf(this.currentHeading);
        const dirStraight = DQNPlayer.CLOCKWISE[idx !== -1 ? idx : 0];
        const dirRight = DQNPlayer.CLOCKWISE[(idx + 1) % 4];
        const dirLeft = DQNPlayer.CLOCKWISE[(idx - 1 + 4) % 4];

        const ptStraight = GameUtils.applyDirection(head, dirStraight);
        const ptRight = GameUtils.applyDirection(head, dirRight);
        const ptLeft = GameUtils.applyDirection(head, dirLeft);

        const ptStraight2 = GameUtils.applyDirection(ptStraight, dirStraight);
        const ptRight2 = GameUtils.applyDirection(ptRight, dirRight);
        const ptLeft2 = GameUtils.applyDirection(ptLeft, dirLeft);

        const dangerStraight = !GameUtils.isValidPosition(ptStraight, dimensions, snake) ? 1.0 : 0.0;
        const dangerRight = !GameUtils.isValidPosition(ptRight, dimensions, snake) ? 1.0 : 0.0;
        const dangerLeft = !GameUtils.isValidPosition(ptLeft, dimensions, snake) ? 1.0 : 0.0;

        const dangerStraight2 = dangerStraight === 1.0 || !GameUtils.isValidPosition(ptStraight2, dimensions, snake) ? 1.0 : 0.0;
        const dangerRight2 = dangerRight === 1.0 || !GameUtils.isValidPosition(ptRight2, dimensions, snake) ? 1.0 : 0.0;
        const dangerLeft2 = dangerLeft === 1.0 || !GameUtils.isValidPosition(ptLeft2, dimensions, snake) ? 1.0 : 0.0;

        // Relative food heading
        const vFoodR = apple.getRow() - head.getRow();
        const vFoodC = apple.getColumn() - head.getColumn();

        const [fwdR, fwdC] = DQNPlayer.DIR_VECTORS[dirStraight];
        const [rgtR, rgtC] = DQNPlayer.DIR_VECTORS[dirRight];

        const fwdDot = vFoodR * fwdR + vFoodC * fwdC;
        const rgtDot = vFoodR * rgtR + vFoodC * rgtC;

        const foodFwd = fwdDot > 0 ? 1.0 : 0.0;
        const foodRgt = rgtDot > 0 ? 1.0 : 0.0;
        const foodLft = rgtDot < 0 ? 1.0 : 0.0;
        const foodBck = fwdDot < 0 ? 1.0 : 0.0;

        const manhattanDist = (Math.abs(vFoodR) + Math.abs(vFoodC)) / (dimensions[0] + dimensions[1]);

        let freeNeighbors = 0;
        if (dangerStraight === 0.0) {
            for (const d of DQNPlayer.CLOCKWISE) {
                const p = GameUtils.applyDirection(ptStraight, d);
                if (GameUtils.isValidPosition(p, dimensions, snake)) {
                    freeNeighbors += 1;
                }
            }
        }
        const freeRatio = freeNeighbors / 4.0;

        return [
            dangerStraight, dangerRight, dangerLeft,
            dangerStraight2, dangerRight2, dangerLeft2,
            foodFwd, foodRgt, foodLft, foodBck,
            manhattanDist,
            freeRatio
        ];
    }

    private convertActionToDirection(currentDirection: Direction, action: number): Direction {
        const idx = DQNPlayer.CLOCKWISE.indexOf(currentDirection);
        const currentIdx = idx !== -1 ? idx : 0;

        if (action === 1) {
            return DQNPlayer.CLOCKWISE[(currentIdx + 1) % 4];
        } else if (action === 2) {
            return DQNPlayer.CLOCKWISE[(currentIdx - 1 + 4) % 4];
        }
        return DQNPlayer.CLOCKWISE[currentIdx];
    }
}

export default DQNPlayer;
