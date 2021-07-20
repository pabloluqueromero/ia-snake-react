import Direction from "../controls/Direction";
import Snake from "../controls/Snake";
import Position from "./Position";

export class GameUtils{
    static allDirections = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    
    static getDirection(position1: Position, position2: Position): Direction {
        return GameUtils.allDirections
                     .filter(direction => this.applyDirection(position1,direction).equals(position2))
                     .pop();
    }
    static isValidPosition(position: Position, dimensions: [number,number], snake: Snake): boolean {
        return !(position.getRow() < 0 ||
         position.getRow() >= dimensions[0] ||
         position.getColumn() < 0 ||
         position.getColumn() >= dimensions[1] ||
         snake.isBody(position) ||
         snake.isHead(position));
    }
    static applyDirection(currentNode: Position, direction: Direction, ): Position {
        switch (direction) {
            case Direction.UP:
                return new Position(currentNode.getRow() - 1, currentNode.getColumn());
            case Direction.LEFT:
                return new Position(currentNode.getRow(), currentNode.getColumn() - 1);
            case Direction.RIGHT:
                return new Position(currentNode.getRow(), currentNode.getColumn() + 1);
            default:
                return new Position(currentNode.getRow() + 1, currentNode.getColumn());
        }
    }

}

