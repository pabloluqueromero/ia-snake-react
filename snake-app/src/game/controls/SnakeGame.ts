import SnakeBoard from '../../components/SnakeBoard/SnakeBoard';
import { Position } from '../game-utils/Position';
import { Player } from '../players/Player';
import Direction from './Direction';
import Snake from './Snake';

class SnakeGame {

    // Game state variables
    private board: React.RefObject<SnakeBoard>;
    private applePosition: Position;
    private rows: number;
    private columns: number;
    private snake: Snake;
    private lastMovement: Direction;
    private isMoving: boolean;

    //Game execution
    private keepMoving;

    //Game stats
    private speed: number;
    private score: number;
    private steps: number;
    private gameCount: number = 0;
    private player: Player;

    constructor(rows: number, columns: number, speed: number, board: React.RefObject<SnakeBoard>, player: Player) {
        this.rows = rows;
        this.columns = columns;
        this.board = board
        this.speed = speed;
        this.player = player;
        this.player.init()
        this.player.setGame(this);
        this.initializeGame()
    }

    initializeGame() {
        //snake
        let initialPosition = this.getRandomInitialPosition();
        this.snake = new Snake(this.rows, this.columns, [initialPosition]);
        this.applePosition = this.getRandomApplePosition();
        this.score = 0;
        this.lastMovement = null;
        this.isMoving = true;
        this.gameCount += 1
        if (this.gameCount > 1) {
            clearInterval(this.keepMoving);
        }
        this.setInitialColors();
        this.keepMoving = setInterval(() => this.move(), this.speed);

    }
    getRandomApplePosition(): Position {
        let row = Math.floor(Math.random() * (this.rows - 1));
        let column = Math.floor(Math.random() * (this.columns - 1));
        let position = new Position(row, column);
        while (this.snake.isBody(position)) {
            row = Math.floor(Math.random() * (this.rows - 1));
            column = Math.floor(Math.random() * (this.columns - 1));
        }
        return position;
    }

    move(): void {
        try {
            let nextMovement = this.player.getNextMove();
            let result = this.snake.move(nextMovement, this.applePosition);
            this.setLastMovement(nextMovement);

            if (result.appleEaten) {
                this.score += 1;
                this.board.current.setScore(this.score);
                this.applePosition = this.getRandomApplePosition();
                result.affectedPositions.push(this.applePosition);
            }
            this.board.current.setLength(this.getSnakeLength());
            result.affectedPositions.forEach(affectedPosition => this.setSinglePosition(affectedPosition));
        } catch (e) {
            clearInterval(this.keepMoving);
            this.initializeGame();
        }
    }

    getRandomInitialPosition(): Position {
        return new Position(
            Math.floor(Math.random() * (this.rows - 1)),
            Math.floor(Math.random() * (this.columns - 1))
        );
    }


    getBoard() {
        return this.board;
    }

    getSnakeLength() {
        return this.snake.getSize();
    }
    getLastMovement(): Direction {
        return this.lastMovement;
    }
    setLastMovement(movement: Direction) {
        this.lastMovement = movement;
    }
    isSnakeMoving(): boolean {
        return this.isMoving;
    }

    getApplePosition() {
        return this.applePosition;
    }
    pause() {
        clearInterval(this.keepMoving);
        this.isMoving = false;
    }

    resume() {
        if (!this.isMoving) {
            this.keepMoving = setInterval(() => this.move(), this.speed);
            this.isMoving = true;
        }
    }

    getScore() {
        return this.score;
    }

    getSteps() {
        return this.steps;
    }



    setSinglePosition(position: Position) {
        let classNames = []
        if (this.getApplePosition().equals(position)) {
            classNames.push('apple')
        }
        if (this.snake.isBody(position)) {
            classNames.push('body')
        }

        if (this.snake.isHead(position)) {
            classNames.push('head')
        }
        if (position.getRow() & 1) {
            classNames.push(position.getColumn() & 1 ? 'dark-cell' : 'light-cell');
        } else {
            classNames.push(position.getColumn() & 1 ? 'light-cell' : 'dark-cell');
        }

        this.board.current.setPosition(position, classNames);
    }
    setInitialColors() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.setSinglePosition(new Position(i,j));
            }

        }
    }

    getHeadSnakePosition(): Position {
        return this.snake.getHeadPosition()
    }
}


export default SnakeGame;