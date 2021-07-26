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
        let previousHeadPosition = this.snake.getPosition()
        let nextHeadPosition = GameUtils.applyDirection(previousHeadPosition, movement);
        let isApple = nextHeadPosition.equals(applePosition);
        let previousTail = this.snake.getTail().getPosition()
        if (!isApple) {
            let tailPositionID = this.snake.getTail().getPosition().getRow() * this.columns + this.snake.getTail().getPosition().getColumn();
            this.bodySet.delete(tailPositionID); //delete to avoid unexistant colision
            if(!GameUtils.isValidPosition(nextHeadPosition, [this.rows, this.columns], this)){
                throw new Error("Collision")
            };
        }
        this.bodySet.add(nextHeadPosition.getRow() * this.columns + nextHeadPosition.getColumn());
        
        this.snake.move(nextHeadPosition, isApple);
        
        let affectedPositons: Position[] = []
        // Add previous head to remove color from body if it exists
        if (this.getSize()>1){
            affectedPositons.push(previousHeadPosition);
        }
        // Add the next head
        affectedPositons.push(nextHeadPosition);

        // If we have not eaten an apple then we add the tail (to remove it)
        if (!isApple){
            affectedPositons.push(previousTail)
        }
        return {
            appleEaten: isApple,
            affectedPositions: affectedPositons
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