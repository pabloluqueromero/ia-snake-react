import { GameUtils } from "../game-utils/GameUtils";
import Position from "../game-utils/Position";
import Direction from "./Direction";
import SnakeLinkedList from "./SnakeLinkedList";

class Snake {
    private bodySet = new Set<number>();
    private snake: SnakeLinkedList | null;
    private rows: number;
    private columns: number;

    constructor(rows: number, columns: number, positions: Array<Position>) {
        this.rows = rows
        this.columns = columns
        positions.forEach(position => this.bodySet.add(position.getRow() * this.columns + position.getColumn()))
        this.snake = new SnakeLinkedList(positions);
    }

    isBody(position: Position) {
        return this.bodySet.has(position.getRow() * this.columns + position.getColumn())
    }

    //returns if apple was eaten
    move(movement: Direction, applePosition: Position): { appleEaten: boolean, affectedPositions: Position[] } {
        let previousHeadPosition = this.snake.getPosition();
        let nextHeadPosition = GameUtils.applyDirection(previousHeadPosition, movement);
        let isApple = nextHeadPosition.equals(applePosition);
        let previousTail = this.snake.getTail().getPosition();
        let tailPositionID = previousTail.getRow() * this.columns + previousTail.getColumn();

        if (!isApple) {
            this.bodySet.delete(tailPositionID); // temporarily remove tail to avoid false collision
        }

        if (!GameUtils.isValidPosition(nextHeadPosition, [this.rows, this.columns], this)) {
            if (!isApple) {
                this.bodySet.add(tailPositionID); // rollback bodySet on collision
            }
            throw new Error("Collision");
        }

        this.bodySet.add(nextHeadPosition.getRow() * this.columns + nextHeadPosition.getColumn());
        this.snake.move(nextHeadPosition, isApple);
        
        let affectedPositions: Position[] = [];
        if (this.getSize() > 1) {
            affectedPositions.push(previousHeadPosition);
        }
        affectedPositions.push(nextHeadPosition);
        if (!isApple) {
            affectedPositions.push(previousTail);
        }

        return {
            appleEaten: isApple,
            affectedPositions: affectedPositions
        };
    }

    getSize() {
        return this.bodySet.size;
    }


    isHead(position: Position) {
        return this.snake.getPosition().equals(position)
    }


    getHeadPosition(): Position {
        return this.snake.getPosition();
    }
}



export default Snake;