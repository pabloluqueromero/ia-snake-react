import { Position } from "../game-utils/Position";
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
        let nextHeadPosition = this.getNextPosition(movement)
        let isApple = nextHeadPosition.equals(applePosition);
        let previousTail = this.snake.getTail().getPosition()
        if (!isApple) {
            let tailPositionID = this.snake.getTail().getPosition().getRow() * this.columns + this.snake.getTail().getPosition().getColumn();
            this.bodySet.delete(tailPositionID); //delete to avoid unexistant colision
            this.detectCollision(nextHeadPosition);
        }
        this.bodySet.add(nextHeadPosition.getRow() * this.columns + nextHeadPosition.getColumn());
        this.snake.move(nextHeadPosition, isApple);
        return {
            appleEaten: isApple,
            affectedPositions: [nextHeadPosition, isApple ? applePosition : previousTail]
        };

    }


    //Auxiliary methods
    detectCollision(position: Position) {
        if (position.getRow() < 0) {
            throw new Error(`Snake collision up`);
        }
        if (position.getRow() >= this.rows) {
            throw new Error(`Snake collision down`);
        }
        if (position.getColumn() < 0) {
            throw new Error(`Snake collision left`);
        }
        if (position.getColumn() >= this.columns) {
            throw new Error(`Snake collision right`);
        }
        if (this.isBody(position)) {
            throw new Error(`Snake collision body`);
        }
    }
    getNextPosition(movement: Direction): Position {
        switch (movement) {
            case Direction.UP:
                return new Position(this.snake.getPosition().getRow() - 1, this.snake.getPosition().getColumn());
            case Direction.LEFT:
                return new Position(this.snake.getPosition().getRow(), this.snake.getPosition().getColumn() - 1);
            case Direction.RIGHT:
                return new Position(this.snake.getPosition().getRow(), this.snake.getPosition().getColumn() + 1);
            default:
                return new Position(this.snake.getPosition().getRow() + 1, this.snake.getPosition().getColumn());
        }

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