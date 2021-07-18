
import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import { Player } from "./Player";
import { HeapQueue } from "../game-utils/HeapQueue";
import { Position } from "../game-utils/Position";

class AStarPlayer implements Player {
    private moves: Position[] = new Array();
    private game: SnakeGame;
    init() {

    }
    setGame(game: SnakeGame): void {
        this.game = game;
    }

    getNextMove(): Direction {
        if (this.moves.length === 0) {
            this.moves = this.computeNextPath();
        }
        return this.getDirection(this.moves.pop(), this.game.getHeadSnakePosition());
    }
    getDirection(currPosition: Position, nextPosition: Position): Direction {
        if (currPosition.getRow() < nextPosition.getRow()) {
            return Direction.DOWN;
        } else if (currPosition.getColumn() < nextPosition.getColumn()) {
            return Direction.RIGHT;
        } else if (currPosition.getColumn()> nextPosition.getColumn()) {
            return Direction.LEFT;
        } else {
            return Direction.UP;
        }
    }

    computeNextPath(): Position[] {
        let moves: Position[] = []
        let currentNode =  this.game.getHeadSnakePosition();
        let targetNode = this.game.getApplePosition();

        let exploreNodes = new Set<number>();
        let priorityQueue = new HeapQueue<Position>()
        while(currentNode!=targetNode){
        }

        return moves;
    }
}

export default AStarPlayer;
