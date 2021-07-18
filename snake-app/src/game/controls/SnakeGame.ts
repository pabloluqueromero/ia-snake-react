import SnakeBoard from '../../components/SnakeBoard/SnakeBoard';
import { Player } from '../players/Player';
import Direction from './Direction';
import Snake from './Snake';

//Constants
const N_DIRECTIONS: number = 5;
class SnakeGame {

    // Game state variables
    private board: React.RefObject<SnakeBoard>;
    private applePosition: { row: number, column: number };
    private rows: number;
    private columns: number;
    private snake: Snake;
    private lastMovement;
    private isMoving: boolean = false;

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
        this.keepMoving = setInterval(() => this.move(), this.speed);
        this.initializeGame()
    }

    initializeGame() {
        //snake
        let initialPosition = this.getRandomInitialPosition();
        this.snake = new Snake(this.rows, this.columns, [initialPosition]);
        this.applePosition = this.getRandomApplePosition();
        this.score = 0;
        this.lastMovement = Math.floor(Math.random() * N_DIRECTIONS)
        this.isMoving = true;
        this.gameCount += 1
        if (this.gameCount > 1) {
            clearInterval(this.keepMoving);
            this.keepMoving = setInterval(() => this.move(), this.speed);
        }
        this.setInitialColors();

    }
    getRandomApplePosition(): { row: number; column: number; } {
        let row = Math.floor(Math.random() * (this.rows - 1));
        let column = Math.floor(Math.random() * (this.columns - 1));
        while (this.snake.isBody(row, column)) {
            row = Math.floor(Math.random() * (this.rows - 1));
            column = Math.floor(Math.random() * (this.columns - 1));
        }

        return {
            row: row,
            column: column
        }
    }

    move(): void {
        try {
            let result = this.snake.move(this.lastMovement, this.applePosition);

            if (result.appleEaten) {
                this.score += 1;
                this.applePosition = this.getRandomApplePosition();
                result.affectedPositions.push(this.applePosition);
            }
            result.affectedPositions.forEach((element) => this.setSinglePosition(element.row, element.column));
        } catch (e) {
            clearInterval(this.keepMoving);
            this.initializeGame();
        }
    }

    getRandomInitialPosition(): { row: number, column: number } {
        return {
            row: Math.floor(Math.random() * (this.rows - 1)),
            column: Math.floor(Math.random() * (this.columns - 1))
        }
    }


    getBoard() {
        return this.board;
    }

    getSnakeLength() {
        return this.snake.getSize();
    }
    getLastMovement() {
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
        if (this.isMoving) {
            clearInterval(this.keepMoving);
            this.isMoving = false;
        }
    }
    resume() {
        if (!this.isMoving) {
            this.keepMoving = setInterval(() => this.move(), this.speed);
        }
    }

    getScore() {
        return this.score;
    }

    getSteps() {
        return this.steps;
    }



    setSinglePosition(i: number, j: number) {
        let classNames = []
        if (this.getApplePosition().row === i && this.getApplePosition().column === j) {
            classNames.push('apple')
        }
        if (this.snake.isBody(i, j)) {
            classNames.push('body')
        }

        if (this.snake.isHead(i, j)) {
            classNames.push('head')
        }
        if (i & 1) {
            classNames.push(j & 1 ? 'dark-cell' : 'light-cell');
        } else {
            classNames.push(j & 1 ? 'light-cell' : 'dark-cell');
        }
        this.board.current.setPosition(i, j, classNames);
    }
    setInitialColors() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.setSinglePosition(i, j);
            }

        }
    }
}


export default SnakeGame;