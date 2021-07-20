
import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import Player from "./Player";
import { HeapQueue } from "../game-utils/HeapQueue";
import Position from "../game-utils/Position";
import { GameUtils } from "../game-utils/GameUtils";


class AStarPlayer implements Player {
    private moves: Direction[] = [];
    private game: SnakeGame;
    init() {
        //throw new Error("eded")
    }
    setGame(game: SnakeGame): void {
        this.game = game;
    }

    getNextMove(): Direction {
        this.moves = this.computeNextPath();
        return this.moves.pop();
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

    computeNextPath(): Direction[] {
        let moves: Direction[] = []
        let currentNode = AStarNode.createAStarNode(this.game.getHeadSnakePosition(),0,0,null);
        let currentNodeID = null;
        let targetNode = this.game.getApplePosition();

        let exploredNodes = new Set<number>();
        let priorityQueue = new HeapQueue<AStarNode>();
        priorityQueue.setStrategy('max');
        priorityQueue.insert(currentNode, currentNode.getPriority());
        let tempNode : AStarNode;
        let neighbours: Position[];
        let neighbour: Position;

        while (!priorityQueue.isEmpty()) {
            currentNode = priorityQueue.pop();
            //console.log(currentNode.getPosition().getRow()+ ' '+ currentNode.getPosition().getColumn())
            if (currentNode.getPosition().equals(targetNode)) {
                moves = this.reconstructPath(currentNode);
                break;
            }
            currentNodeID = this.getPositionID(currentNode.getPosition());
            if (!exploredNodes.has(currentNodeID)) {
                exploredNodes.add(currentNodeID);
                neighbours = this.getNeighbours(currentNode.getPosition());
                for(let i=0; i< neighbours.length; i++){
                    neighbour = neighbours[i];
                    tempNode = AStarNode.createAStarNode(neighbour, 
                                                        this.getDistance(neighbour,targetNode), 
                                                        currentNode.getCost()+1,currentNode);
                    priorityQueue.insert(tempNode, tempNode.getPriority());
                }

            }
        }
        return moves;
    }
    getDistance(neighbour: Position, targetNode: Position) : number {
        return Math.abs(neighbour.getRow()-targetNode.getRow ()) +
               Math.abs(neighbour.getColumn()-targetNode.getColumn());
    }

    getPositionID(position: Position): number {
        return this.game.getDimensions()[1] * position.getRow() + position.getColumn();
    }

    getNeighbours(currentNode: Position): Position[] {
        return GameUtils.allDirections
            .map(direction => GameUtils.applyDirection(currentNode, direction))
            .filter(position => GameUtils.isValidPosition(position, this.game.getDimensions(), this.game.getSnake()));
    }

    reconstructPath(currentNode: AStarNode): Direction[] {
        if(currentNode==null){
            return;
        }
        let directions :Direction[] = [];
        while(currentNode.getParentNode()!==null){
            directions.push(GameUtils.getDirection(currentNode.getParentNode().getPosition(), 
                                                   currentNode.getPosition()))
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


