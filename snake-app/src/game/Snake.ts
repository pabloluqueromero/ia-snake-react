import Direction from "./DIrection";
import SnakeLinkedList from "./SnakeLinkedList";

class Snake {
    private bodySet = new Set<number>();
    private snake: SnakeLinkedList | null;
    private rows: number;
    private columns: number;

    constructor(rows: number,
        columns: number,
        positions: Array<{ row: number, column: number }>) {
        this.rows = rows
        this.columns = columns
        positions.forEach(position => this.bodySet.add(position.row * this.columns + position.column))
        this.snake = new SnakeLinkedList(positions);
    }

    isBody(row: number, column: number) {
        return this.bodySet.has(row * this.columns + column)
    }

    //returns if apple was eaten
    move(movement: Direction, applePosition: { row: number, column: number }) {
        let nextHeadPosition = this.getNextPosition(movement)
        let positionObject = { row: nextHeadPosition[0], column: nextHeadPosition[1] };
        let isApple = applePosition.row === nextHeadPosition[0] && applePosition.column === nextHeadPosition[1]

        if (!isApple) {
            let tailPosition = this.snake.getTail().getPosition().row * this.columns + this.snake.getTail().getPosition().column
            this.bodySet.delete(tailPosition); //delete to avoid unexistant colision
            this.detectCollision(nextHeadPosition);
        }
        this.bodySet.add(positionObject.row * this.columns + positionObject.column);
        this.snake.move(positionObject, isApple);
        return isApple;
    }


    //Auxiliary methods
    detectCollision(position: [number, number]) {
        let row = position[0];
        let column = position[1];

        if (row < 0) {
            throw new Error(`Snake collision up`);
        }
        if (row >= this.rows) {
            throw new Error(`Snake collision down`);
        }
        if (column < 0) {
            throw new Error(`Snake collision left`);
        }
        if (column >= this.columns) {
            throw new Error(`Snake collision right`);
        }
        if (this.isBody(row, column)) {
            throw new Error(`Snake collision body`);
        }
    }
    getNextPosition(movement: Direction): [number, number] {
        switch (movement) {
            case Direction.UP:
                return [this.snake.getRow() - 1, this.snake.getColumn()];
            case Direction.LEFT:
                return [this.snake.getRow(), this.snake.getColumn() - 1];
            case Direction.RIGHT:
                return [this.snake.getRow(), this.snake.getColumn() + 1];
            default:
                return [this.snake.getRow() + 1, this.snake.getColumn()];
        }

    }

    getSize(){
        return this.bodySet.size;
    }


    isHead(rowIndex: number, columnIndex: number) {
        return this.snake.getPosition().row == rowIndex &&
        this.snake.getPosition().column == columnIndex 
    }
}



export default Snake;