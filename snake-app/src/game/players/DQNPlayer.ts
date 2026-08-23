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

        const lastMove = this.game.getLastMovement();
        if (lastMove !== null && lastMove !== undefined) {
            this.currentHeading = lastMove;
        }

        const state = this.extractState();
        const { action, qValues, isExploring } = this.inference.selectAction(state, this.epsilon);
        const nextDirection = this.convertActionToDirection(this.currentHeading, action);

        if (this.telemetryListener) {
            const telemetry: DQNTelemetry = {
                qValues: [qValues[0] || 0, qValues[1] || 0, qValues[2] || 0],
                chosenAction: action,
                dangers: [state[0] > 0.5, state[1] > 0.5, state[2] > 0.5],
                currentDirection: nextDirection,
                foodRelative: {
                    up: state[10] > 0.5,
                    right: state[11] > 0.5,
                    down: state[12] > 0.5,
                    left: state[13] > 0.5
                },
                distanceToFood: Math.round(state[14] * (this.game.getDimensions()[0] + this.game.getDimensions()[1])),
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
     * Extracts 16 normalized spatial features:
     * 0..2: Immediate danger (Straight, Right, Left)
     * 3..5: 2-step danger (Straight 2, Right 2, Left 2)
     * 6..9: Heading one-hot (UP, RIGHT, DOWN, LEFT)
     * 10..13: Food relative direction (UP, RIGHT, DOWN, LEFT)
     * 14: Distance to food normalized
     * 15: Free space ratio ahead
     */
    private extractState(): number[] {
        if (!this.game) {
            return new Array(16).fill(0);
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

        const dirUp = this.currentHeading === Direction.UP ? 1.0 : 0.0;
        const dirRightOneHot = this.currentHeading === Direction.RIGHT ? 1.0 : 0.0;
        const dirDown = this.currentHeading === Direction.DOWN ? 1.0 : 0.0;
        const dirLeftOneHot = this.currentHeading === Direction.LEFT ? 1.0 : 0.0;

        const foodUp = apple.getRow() < head.getRow() ? 1.0 : 0.0;
        const foodRight = apple.getColumn() > head.getColumn() ? 1.0 : 0.0;
        const foodDown = apple.getRow() > head.getRow() ? 1.0 : 0.0;
        const foodLeft = apple.getColumn() < head.getColumn() ? 1.0 : 0.0;

        const manhattanDist = (Math.abs(apple.getRow() - head.getRow()) + Math.abs(apple.getColumn() - head.getColumn())) / (dimensions[0] + dimensions[1]);

        // Simple lookahead free space count
        let freeSpaceCount = 0;
        if (dangerStraight === 0.0) {
            for (const d of DQNPlayer.CLOCKWISE) {
                const p = GameUtils.applyDirection(ptStraight, d);
                if (GameUtils.isValidPosition(p, dimensions, snake)) {
                    freeSpaceCount += 1;
                }
            }
        }
        const freeSpaceRatio = freeSpaceCount / 4.0;

        return [
            dangerStraight, dangerRight, dangerLeft,
            dangerStraight2, dangerRight2, dangerLeft2,
            dirUp, dirRightOneHot, dirDown, dirLeftOneHot,
            foodUp, foodRight, foodDown, foodLeft,
            manhattanDist,
            freeSpaceRatio
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
