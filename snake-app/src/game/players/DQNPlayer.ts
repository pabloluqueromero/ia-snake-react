import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import { GameUtils } from "../game-utils/GameUtils";
import Position from "../game-utils/Position";
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

        // Determine current effective direction
        const lastMove = this.game.getLastMovement();
        if (lastMove !== null && lastMove !== undefined) {
            this.currentHeading = lastMove;
        }

        // Extract 12-D state vector
        const state = this.extractState();

        // Forward inference
        const { action, qValues, isExploring } = this.inference.selectAction(state, this.epsilon);

        // Convert relative action (0: Straight, 1: Turn Right, 2: Turn Left) to absolute Direction
        const nextDirection = this.convertActionToDirection(this.currentHeading, action);

        // Telemetry payload for live HUD
        if (this.telemetryListener) {
            const telemetry: DQNTelemetry = {
                qValues: [qValues[0] || 0, qValues[1] || 0, qValues[2] || 0],
                chosenAction: action,
                dangers: [state[0] > 0.5, state[1] > 0.5, state[2] > 0.5],
                currentDirection: nextDirection,
                foodRelative: {
                    up: state[7] > 0.5,
                    right: state[8] > 0.5,
                    down: state[9] > 0.5,
                    left: state[10] > 0.5
                },
                distanceToFood: Math.round(state[11] * (this.game.getDimensions()[0] + this.game.getDimensions()[1])),
                isExploring
            };
            this.telemetryListener(telemetry);
        }

        // Optional visualization: highlight next predicted head position
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
     * Extracts 12 normalized spatial features:
     * [danger_straight, danger_right, danger_left,
     *  dir_up, dir_right, dir_down, dir_left,
     *  food_up, food_right, food_down, food_left,
     *  dist_norm]
     */
    private extractState(): number[] {
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

        const dangerStraight = !GameUtils.isValidPosition(ptStraight, dimensions, snake) ? 1.0 : 0.0;
        const dangerRight = !GameUtils.isValidPosition(ptRight, dimensions, snake) ? 1.0 : 0.0;
        const dangerLeft = !GameUtils.isValidPosition(ptLeft, dimensions, snake) ? 1.0 : 0.0;

        const dirUp = this.currentHeading === Direction.UP ? 1.0 : 0.0;
        const dirRightOneHot = this.currentHeading === Direction.RIGHT ? 1.0 : 0.0;
        const dirDown = this.currentHeading === Direction.DOWN ? 1.0 : 0.0;
        const dirLeftOneHot = this.currentHeading === Direction.LEFT ? 1.0 : 0.0;

        const foodUp = apple.getRow() < head.getRow() ? 1.0 : 0.0;
        const foodRight = apple.getColumn() > head.getColumn() ? 1.0 : 0.0;
        const foodDown = apple.getRow() > head.getRow() ? 1.0 : 0.0;
        const foodLeft = apple.getColumn() < head.getColumn() ? 1.0 : 0.0;

        const manhattanDist = (Math.abs(apple.getRow() - head.getRow()) + Math.abs(apple.getColumn() - head.getColumn())) / (dimensions[0] + dimensions[1]);

        return [
            dangerStraight, dangerRight, dangerLeft,
            dirUp, dirRightOneHot, dirDown, dirLeftOneHot,
            foodUp, foodRight, foodDown, foodLeft,
            manhattanDist
        ];
    }

    private convertActionToDirection(currentDirection: Direction, action: number): Direction {
        const idx = DQNPlayer.CLOCKWISE.indexOf(currentDirection);
        const currentIdx = idx !== -1 ? idx : 0;

        if (action === 1) {
            // Turn Right
            return DQNPlayer.CLOCKWISE[(currentIdx + 1) % 4];
        } else if (action === 2) {
            // Turn Left
            return DQNPlayer.CLOCKWISE[(currentIdx - 1 + 4) % 4];
        }
        // Go Straight
        return DQNPlayer.CLOCKWISE[currentIdx];
    }
}

export default DQNPlayer;
