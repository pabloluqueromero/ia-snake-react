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

        const state = this.extractBodyAwareState();
        const qValues = this.inference.predict(state);
        const action = this.selectTrapProofAction(state, qValues);
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
                    down: false,
                    left: state[8] > 0.5
                },
                distanceToFood: Math.round(state[12] * (this.game.getDimensions()[0] + this.game.getDimensions()[1])),
                isExploring: false
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
     * Trap-Proof action selector combining Deep Q-Values with topological safety
     */
    private selectTrapProofAction(state: number[], qValues: number[]): number {
        if (!this.game) return 0;

        const head = this.game.getHeadSnakePosition();
        const dimensions = this.game.getDimensions();
        const snake = this.game.getSnake();
        const snakeLen = this.game.getSnakeLength();

        const idx = DQNPlayer.CLOCKWISE.indexOf(this.currentHeading);
        const dirs = [
            DQNPlayer.CLOCKWISE[idx !== -1 ? idx : 0],
            DQNPlayer.CLOCKWISE[(idx + 1) % 4],
            DQNPlayer.CLOCKWISE[(idx - 1 + 4) % 4]
        ];

        // Evaluate reachability and chamber sizes for each action
        const actionSafety = [0, 1, 2].map(a => {
            const danger = state[a] > 0.5;
            if (danger) return { action: a, safe: false, space: 0, q: qValues[a] };

            const nextPos = GameUtils.applyDirection(head, dirs[a]);
            const space = this.countReachableCells(nextPos, dimensions, snake, 60);
            const isTrapped = space < Math.min(snakeLen + 2, 45);

            return {
                action: a,
                safe: !isTrapped,
                space,
                q: qValues[a]
            };
        });

        // Pick highest Q action among topologically non-trapped moves
        const nonTrappedMoves = actionSafety.filter(m => m.safe);
        if (nonTrappedMoves.length > 0) {
            nonTrappedMoves.sort((a, b) => b.q - a.q);
            return nonTrappedMoves[0].action;
        }

        // If all moves are somewhat confined, pick the move with the largest surviving open space
        const validMoves = actionSafety.filter(m => m.space > 0);
        if (validMoves.length > 0) {
            validMoves.sort((a, b) => b.space - a.space || b.q - a.q);
            return validMoves[0].action;
        }

        return 0;
    }

    /**
     * BFS Flood-fill to count available chamber cells
     */
    private countReachableCells(start: Position, dimensions: [number, number], snake: any, maxCount: number = 60): number {
        if (!GameUtils.isValidPosition(start, dimensions, snake)) return 0;

        const visited = new Set<string>();
        visited.add(`${start.getRow()},${start.getColumn()}`);
        const queue: Position[] = [start];
        let count = 0;

        while (queue.length > 0 && count < maxCount) {
            const curr = queue.shift()!;
            count++;

            for (const d of DQNPlayer.CLOCKWISE) {
                const nxt = GameUtils.applyDirection(curr, d);
                const key = `${nxt.getRow()},${nxt.getColumn()}`;
                if (!visited.has(key) && GameUtils.isValidPosition(nxt, dimensions, snake)) {
                    visited.add(key);
                    queue.push(nxt);
                }
            }
        }

        return count;
    }

    private extractBodyAwareState(): number[] {
        if (!this.game) {
            return new Array(16).fill(0);
        }

        const head = this.game.getHeadSnakePosition();
        const apple = this.game.getApplePosition();
        const dimensions = this.game.getDimensions();
        const snake = this.game.getSnake();
        const snakeLen = this.game.getSnakeLength();

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

        const rayStraight = this.castRay(head, dirStraight, dimensions, snake);
        const rayRight = this.castRay(head, dirRight, dimensions, snake);
        const rayLeft = this.castRay(head, dirLeft, dimensions, snake);

        const vFoodR = apple.getRow() - head.getRow();
        const vFoodC = apple.getColumn() - head.getColumn();
        const [fwdR, fwdC] = DQNPlayer.DIR_VECTORS[dirStraight];
        const [rgtR, rgtC] = DQNPlayer.DIR_VECTORS[dirRight];

        const fwdDot = vFoodR * fwdR + vFoodC * fwdC;
        const rgtDot = vFoodR * rgtR + vFoodC * rgtC;

        const foodFwd = fwdDot > 0 ? 1.0 : 0.0;
        const foodRgt = rgtDot > 0 ? 1.0 : 0.0;
        const foodLft = rgtDot < 0 ? 1.0 : 0.0;

        const tail = head;
        const vTailR = tail.getRow() - head.getRow();
        const vTailC = tail.getColumn() - head.getColumn();
        const tailFwdDot = vTailR * fwdR + vTailC * fwdC;
        const tailRgtDot = vTailR * rgtR + vTailC * rgtC;

        const tailFwd = tailFwdDot > 0 ? 1.0 : 0.0;
        const tailRgt = tailRgtDot > 0 ? 1.0 : 0.0;
        const tailLft = tailRgtDot < 0 ? 1.0 : 0.0;

        const distFood = (Math.abs(vFoodR) + Math.abs(vFoodC)) / (dimensions[0] + dimensions[1]);
        const distTail = (Math.abs(vTailR) + Math.abs(vTailC)) / (dimensions[0] + dimensions[1]);
        const lenRatio = snakeLen / (dimensions[0] * dimensions[1]);

        const spaceAhead = this.countReachableCells(ptStraight, dimensions, snake, 50) / 50.0;

        return [
            dangerStraight, dangerRight, dangerLeft,
            rayStraight, rayRight, rayLeft,
            foodFwd, foodRgt, foodLft,
            tailFwd, tailRgt, tailLft,
            distFood, distTail, lenRatio,
            spaceAhead
        ];
    }

    private castRay(start: Position, dir: Direction, dimensions: [number, number], snake: any, maxDist: number = 15): number {
        let curr = start;
        for (let dist = 1; dist <= maxDist; dist++) {
            curr = GameUtils.applyDirection(curr, dir);
            if (!GameUtils.isValidPosition(curr, dimensions, snake)) {
                return dist / maxDist;
            }
        }
        return 1.0;
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
