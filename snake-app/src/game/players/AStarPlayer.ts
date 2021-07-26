
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

    async getNextMove(): Promise<Direction> {
        if (this.moves.length == 0) {
            if (this.visualize) {
                this.game.getBoard().current.clearVisualization();
            }
            return this.computeNextPath().then(moves => {
                this.moves = moves;
                if (this.moves.length == 0){
                    return this.getMoveToSurvive();
                }
                return this.moves.pop();
            });
        }
        return new Promise((resolve, reject) => resolve(this.moves.pop()));
    }
    getMoveToSurvive(): Direction {
        let validDirections = GameUtils.allDirections.
                filter(direction => {
                    let nextPosition = GameUtils.applyDirection(this.game.getHeadSnakePosition(),direction)
                    return GameUtils.isValidPosition(nextPosition, this.game.getDimensions(), this.game.getSnake());
                })
        if(validDirections){
            return validDirections.pop();
        }else{
            return Direction.DOWN;
        }
    
    }
    getDirection(currPosition: Position, nextPosition: Position): Direction {
        if (currPosition.getRow() < nextPosition.getRow()) {
            return Direction.DOWN;
        } else if (currPosition.getColumn() < nextPosition.getColumn()) {
            return Direction.RIGHT;
        } else if (currPosition.getColumn() > nextPosition.getColumn()) {
            return Direction.LEFT;
        } else {
            return Direction.UP;
        }
    }

    computeNextPath(): Promise<Direction[]> {
        let moves: Direction[] = []
        let currentNode = AStarNode.createAStarNode(this.game.getHeadSnakePosition(), 0, 0, null);
        let currentNodeID = null;
        let targetNode = this.game.getApplePosition();

        let exploredNodes = new Set<number>();
        let priorityQueue = new HeapQueue<AStarNode>();
        priorityQueue.setStrategy('max');
        priorityQueue.insert(currentNode, currentNode.getPriority());
        let tempNode: AStarNode;
        let neighbours: Position[];
        let neighbour: Position;

        return new Promise(async (resolve, rejet) => {
            while (!priorityQueue.isEmpty()) {
                currentNode = priorityQueue.pop();
                if (currentNode.getPosition().equals(targetNode)) {
                    let result = this.reconstructPath(currentNode);
                    moves = result.map(e => e.direction);
                    if (this.visualize) {
                        for (let e of result) {
                            //Visualize changed
                            if (!this.visualize) {
                                this.game.getBoard().current.clearVisualization();
                                break;
                            }
                            await new Promise<void>((resolve) => setTimeout(() => {
                                if (!this.game.getApplePosition().equals(e.nextPosition) && this.visualize) {
                                    resolve(this.game.setSinglePosition(e.nextPosition, ["path"]))
                                }else{
                                    resolve();
                                }
                            }, this.visualizationSpeed*10));
                        }
                    }
                    break;
                }
                currentNodeID = this.getPositionID(currentNode.getPosition());
                if (exploredNodes.has(currentNodeID)) {
                    continue;
                }
                exploredNodes.add(currentNodeID);
                if (this.visualize) {
                    await new Promise((resolve) => setTimeout(() => {
                        if (this.visualize) {
                            resolve(this.game.setSinglePosition(currentNode.getPosition(), ["explored"]))
                        }else{
                            this.game.getBoard().current.clearVisualization();
                        }
                    }, this.visualizationSpeed*0.1));

                }
                neighbours = this.getNeighbours(currentNode.getPosition())
                    .filter(neighbour => !exploredNodes.has(this.getPositionID(neighbour)));
                for (let i = 0; i < neighbours.length; i++) {
                    neighbour = neighbours[i];

                    tempNode = AStarNode.createAStarNode(neighbour,
                        this.getDistance(neighbour, targetNode),
                        currentNode.getCost() + 1, currentNode);
                    priorityQueue.insert(tempNode, tempNode.getPriority());
                    if (this.visualize) {
                        await new Promise((resolve) => setTimeout(() =>
                            resolve(this.game.setSinglePosition(tempNode.getPosition(), ["expanded"])), this.visualizationSpeed*0.1));
                    }
                }


            }
            return resolve(moves);
        });
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
        if (currentNode == null) {
            return [];
        }
        let directions: { direction: Direction, nextPosition: Position }[] = [];
        while (currentNode.getParentNode() !== null) {
            directions.push({
                direction: GameUtils.getDirection(currentNode.getParentNode().getPosition(),
                    currentNode.getPosition()),
                nextPosition: currentNode.getParentNode().getPosition()
            })

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


