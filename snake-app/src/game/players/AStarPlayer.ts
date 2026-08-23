
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
        if (!this.visualize) {
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
        if (this.moves.length === 0) {
            if (this.visualize && this.game.getBoard() && this.game.getBoard().current) {
                this.game.getBoard().current.clearVisualization();
            }
            const moves = await this.computeNextPath();
            this.moves = moves;
            if (this.moves.length === 0) {
                return this.getMoveToSurvive();
            }
            return this.moves.pop();
        }
        return this.moves.pop();
    }

    getMoveToSurvive(): Direction {
        const validDirections = GameUtils.allDirections
            .filter(direction => {
                const nextPosition = GameUtils.applyDirection(this.game.getHeadSnakePosition(), direction);
                return GameUtils.isValidPosition(nextPosition, this.game.getDimensions(), this.game.getSnake());
            });
        if (validDirections.length > 0) {
            return validDirections[0];
        } else {
            return Direction.DOWN;
        }
    }

    async computeNextPath(): Promise<Direction[]> {
        let moves: Direction[] = [];
        let currentNode = AStarNode.createAStarNode(this.game.getHeadSnakePosition(), 0, 0, null);
        const targetNode = this.game.getApplePosition();

        const exploredNodes = new Set<number>();
        const priorityQueue = new HeapQueue<AStarNode>();
        priorityQueue.setStrategy('min');
        priorityQueue.insert(currentNode, currentNode.getPriority());

        while (!priorityQueue.isEmpty()) {
            currentNode = priorityQueue.pop();
            if (currentNode.getPosition().equals(targetNode)) {
                const result = this.reconstructPath(currentNode);
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
                        }, this.visualizationSpeed * 10));
                    }
                    await new Promise<void>((resolve) => setTimeout(resolve, this.visualizationSpeed * 20));
                }
                break;
            }

            const currentNodeID = this.getPositionID(currentNode.getPosition());
            if (exploredNodes.has(currentNodeID)) {
                continue;
            }
            exploredNodes.add(currentNodeID);

            const neighbours = this.getNeighbours(currentNode.getPosition())
                .filter(neighbour => !exploredNodes.has(this.getPositionID(neighbour)));

            for (let i = 0; i < neighbours.length; i++) {
                const neighbour = neighbours[i];
                const gCost = currentNode.getCost() + 1;
                const hCost = this.getDistance(neighbour, targetNode);
                const tempNode = AStarNode.createAStarNode(neighbour, gCost, hCost, currentNode);
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
        let directions: { direction: Direction, nextPosition: Position }[] = [];
        while (currentNode.getParentNode() !== null) {
            directions.push({
                direction: GameUtils.getDirection(currentNode.getParentNode().getPosition(),
                    currentNode.getPosition()),
                nextPosition: currentNode.getParentNode().getPosition()
            });
            currentNode = currentNode.getParentNode();
        }
        return directions;
    }
}
export default AStarPlayer;

class AStarNode {
    static createAStarNode(position: Position, cost: number, heuristic: number, parentNode: AStarNode) {
        return new AStarNode(position, cost, heuristic, parentNode);
    }

    private position: Position;
    private heuristicValue: number;
    private cost: number;
    private parentNode: AStarNode;

    private constructor(position: Position, cost: number, heuristicValue: number, parentNode: AStarNode) {
        this.position = position;
        this.cost = cost;
        this.heuristicValue = heuristicValue;
        this.parentNode = parentNode;
    }

    getPosition() {
        return this.position;
    }

    getPriority() {
        return this.heuristicValue + this.cost;
    }

    getHeuristicValue() {
        return this.heuristicValue;
    }

    getCost() {
        return this.cost;
    }

    getParentNode() {
        return this.parentNode;
    }
}


