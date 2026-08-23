import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import Player from "./Player";
import { HeapQueue } from "../game-utils/HeapQueue";
import Position from "../game-utils/Position";
import { GameUtils } from "../game-utils/GameUtils";

class AStarPlayer implements Player {
    private moves: Direction[] = [];
    private game: SnakeGame;
    private visualize: boolean = true;
    private visualizationSpeed: number = 5;

    init() {
        console.info("[Player] A* player");
    }

    setGame(game: SnakeGame): void {
        this.game = game;
    }

    changeVisualize(): void {
        this.visualize = !this.visualize;
        if (!this.visualize && this.game && this.game.getBoard() && this.game.getBoard().current) {
            this.game.getBoard().current.clearVisualization();
        }
    }

    destroy(): void {
        this.moves = [];
        if (this.game && this.game.getBoard() && this.game.getBoard().current) {
            this.game.getBoard().current.clearVisualization();
        }
    }

    async getNextMove(): Promise<Direction> {
        // If cached path is empty, compute a new path
        if (this.moves.length === 0) {
            if (this.visualize && this.game.getBoard() && this.game.getBoard().current) {
                this.game.getBoard().current.clearVisualization();
            }
            const moves = await this.computeNextPath();
            this.moves = moves;
            if (this.moves.length === 0) {
                return this.getMoveToSurvive();
            }
        }

        // Validate the next planned move against current snake position
        const nextMove = this.moves.pop();
        if (nextMove !== undefined) {
            const nextPos = GameUtils.applyDirection(this.game.getHeadSnakePosition(), nextMove);
            if (GameUtils.isValidPosition(nextPos, this.game.getDimensions(), this.game.getSnake())) {
                return nextMove;
            }
        }

        // Path was obstructed by body movement: recompute or survive
        this.moves = [];
        const freshMoves = await this.computeNextPath();
        this.moves = freshMoves;
        if (this.moves.length > 0) {
            return this.moves.pop();
        }
        return this.getMoveToSurvive();
    }

    /**
     * When no direct path to apple exists, choose the move with the largest reachable open space (flood fill).
     */
    getMoveToSurvive(): Direction {
        const head = this.game.getHeadSnakePosition();
        const validDirections = GameUtils.allDirections
            .filter(direction => {
                const nextPosition = GameUtils.applyDirection(head, direction);
                return GameUtils.isValidPosition(nextPosition, this.game.getDimensions(), this.game.getSnake());
            });

        if (validDirections.length === 0) {
            return Direction.DOWN;
        }

        // Pick direction with largest reachable space using BFS flood fill
        let bestDir = validDirections[0];
        let maxSpace = -1;

        for (const dir of validDirections) {
            const nextPos = GameUtils.applyDirection(head, dir);
            const space = this.countReachableSpace(nextPos);
            if (space > maxSpace) {
                maxSpace = space;
                bestDir = dir;
            }
        }

        return bestDir;
    }

    private countReachableSpace(startPos: Position): number {
        const dimensions = this.game.getDimensions();
        const snake = this.game.getSnake();
        const visited = new Set<number>();
        const queue: Position[] = [startPos];
        visited.add(this.getPositionID(startPos));

        let count = 0;
        const maxLimit = 100; // Cap search to keep it fast

        while (queue.length > 0 && count < maxLimit) {
            const current = queue.shift();
            count++;

            for (const dir of GameUtils.allDirections) {
                const neighbour = GameUtils.applyDirection(current, dir);
                const id = this.getPositionID(neighbour);
                if (!visited.has(id) && GameUtils.isValidPosition(neighbour, dimensions, snake)) {
                    visited.add(id);
                    queue.push(neighbour);
                }
            }
        }

        return count;
    }

    async computeNextPath(): Promise<Direction[]> {
        let moves: Direction[] = [];
        const head = this.game.getHeadSnakePosition();
        const targetNode = this.game.getApplePosition();

        const initialH = this.getDistance(head, targetNode);
        const currentNode = AStarNode.createAStarNode(head, 0, initialH, null);

        const exploredNodes = new Set<number>();
        const priorityQueue = new HeapQueue<AStarNode>();
        priorityQueue.setStrategy('min');
        priorityQueue.insert(currentNode, currentNode.getPriority());

        while (!priorityQueue.isEmpty()) {
            const current = priorityQueue.pop();

            if (current.getPosition().equals(targetNode)) {
                const result = this.reconstructPath(current);
                moves = result.map(e => e.direction);
                if (this.visualize) {
                    for (const e of result) {
                        if (!this.visualize) {
                            if (this.game.getBoard() && this.game.getBoard().current) {
                                this.game.getBoard().current.clearVisualization();
                            }
                            break;
                        }
                        await new Promise<void>((resolve) => setTimeout(() => {
                            if (!this.game.getApplePosition().equals(e.nextPosition) && this.visualize) {
                                this.game.setSinglePosition(e.nextPosition, ["path"]);
                            }
                            resolve();
                        }, this.visualizationSpeed * 5));
                    }
                    await new Promise<void>((resolve) => setTimeout(resolve, this.visualizationSpeed * 10));
                }
                break;
            }

            const currentNodeID = this.getPositionID(current.getPosition());
            if (exploredNodes.has(currentNodeID)) {
                continue;
            }
            exploredNodes.add(currentNodeID);

            const neighbours = this.getNeighbours(current.getPosition())
                .filter(neighbour => !exploredNodes.has(this.getPositionID(neighbour)));

            for (let i = 0; i < neighbours.length; i++) {
                const neighbour = neighbours[i];
                const gCost = current.getCost() + 1;
                const hCost = this.getDistance(neighbour, targetNode);
                const tempNode = AStarNode.createAStarNode(neighbour, gCost, hCost, current);
                priorityQueue.insert(tempNode, tempNode.getPriority());

                if (this.visualize) {
                    await new Promise<void>((resolve) => setTimeout(() => {
                        if (this.visualize) {
                            this.game.setSinglePosition(tempNode.getPosition(), ["expanded"]);
                        }
                        resolve();
                    }, this.visualizationSpeed * 0.1));
                }
            }
        }
        return moves;
    }

    getDistance(neighbour: Position, targetNode: Position): number {
        return Math.abs(neighbour.getRow() - targetNode.getRow()) +
            Math.abs(neighbour.getColumn() - targetNode.getColumn());
    }

    getPositionID(position: Position): number {
        return this.game.getDimensions()[1] * position.getRow() + position.getColumn();
    }

    getNeighbours(currentNode: Position): Position[] {
        return GameUtils.allDirections
            .map(direction => GameUtils.applyDirection(currentNode, direction))
            .filter(position => GameUtils.isValidPosition(position, this.game.getDimensions(), this.game.getSnake()));
    }

    reconstructPath(currentNode: AStarNode): { direction: Direction, nextPosition: Position }[] {
        if (currentNode === null) {
            return [];
        }
        const directions: { direction: Direction, nextPosition: Position }[] = [];
        let curr: AStarNode | null = currentNode;
        while (curr !== null && curr.getParentNode() !== null) {
            directions.push({
                direction: GameUtils.getDirection(curr.getParentNode().getPosition(), curr.getPosition()),
                nextPosition: curr.getParentNode().getPosition()
            });
            curr = curr.getParentNode();
        }
        return directions;
    }
}

export default AStarPlayer;

class AStarNode {
    static createAStarNode(position: Position, cost: number, heuristic: number, parentNode: AStarNode | null) {
        return new AStarNode(position, cost, heuristic, parentNode);
    }

    private position: Position;
    private heuristicValue: number;
    private cost: number;
    private parentNode: AStarNode | null;

    private constructor(position: Position, cost: number, heuristicValue: number, parentNode: AStarNode | null) {
        this.position = position;
        this.cost = cost;
        this.heuristicValue = heuristicValue;
        this.parentNode = parentNode;
    }

    getPosition() {
        return this.position;
    }

    /**
     * Targeted priority calculation with tie-breaker:
     * Primary key: Total estimated path length f(n) = g(n) + h(n)
     * Secondary tie-breaker: Prefer nodes closer to the target (lower h)
     */
    getPriority(): number {
        return (this.cost + this.heuristicValue) * 1000 + this.heuristicValue;
    }

    getHeuristicValue() {
        return this.heuristicValue;
    }

    getCost() {
        return this.cost;
    }

    getParentNode(): AStarNode | null {
        return this.parentNode;
    }
}
