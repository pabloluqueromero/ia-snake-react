import React from 'react';
import SnakeBoard from '../../components/SnakeBoard/SnakeBoard';
import Algorithm from '../game-utils/Algorithm';
import Position from '../game-utils/Position';
import AStarPlayer from '../players/AStarPlayer';
import HumanPlayer from '../players/HumanPlayer';
import Player from '../players/Player';
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
    private keepMoving: number;
    private speedControl: number;

    //Game stats
    private speed: number;
    private score: number;
    private steps: number;
    private gameCount: number = 0;
    private player: Player;
    private setIsGameOver: (isGameOver: boolean) => void;

    constructor(rows: number, columns: number, speed: number, board: React.RefObject<SnakeBoard>, player: Player, setIsGameOver: (isGameOver: boolean) => void) {
        this.rows = rows;
        this.columns = columns;
        this.board = board
        this.speed = speed / 10;
        this.player = player;
        this.setIsGameOver = setIsGameOver;
        this.initializeGame()
    }

    initializeGame() {
        if (this.gameCount > 1) {
            this.clearInterval();
        }
        this.player.init()
        this.player.setGame(this);
        //snake
        let initialPosition = this.getRandomInitialPosition();
        this.snake = new Snake(this.rows, this.columns, [initialPosition]);
        this.applePosition = this.getRandomApplePosition();
        this.score = 0;
        this.lastMovement = null;
        this.isMoving = false;
        this.gameCount += 1
        this.setInitialColors();

    }
    resetInterval() {
        this.speedControl = window.setTimeout(() => {
            this.keepMoving = window.requestAnimationFrame(() => {
                if (this.isMoving) {
                    this.move();
                }
            });
        }, this.speed);
    }
    private clearInterval() {
        clearTimeout(this.speedControl)
        window.cancelAnimationFrame(this.keepMoving);
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    getPlayer(): Player{
        return this.player;
    }
    setPlayer(algorithm: Algorithm) {
        this.pause();
        switch (algorithm) {
            case Algorithm.HUMAN:
                this.player = new HumanPlayer();
                break;
            default:
                this.player = new AStarPlayer();
                break;
        }
        this.initializeGame();
    }
    getRandomApplePosition(): Position {
        let row = Math.floor(Math.random() * (this.rows - 1));
        let column = Math.floor(Math.random() * (this.columns - 1));
        let position = new Position(row, column);
        while (this.snake.isBody(position) || this.snake.isHead(position)) {
            row = Math.floor(Math.random() * (this.rows));
            column = Math.floor(Math.random() * (this.columns));
            position.setRow(row);
            position.setColumn(column);
        }
        return position;
    }

    move(): void {
        this.player.getNextMove()
            .then(nextMovement => {
                this.isMoving = true;
                let result = this.snake.move(nextMovement, this.applePosition);
                this.setLastMovement(nextMovement);

                if (result.appleEaten) {
                    //console.debug("[SnakeGame] Eating apple")
                    this.score += 1;
                    this.board.current.setScore(this.score);
                    this.applePosition = this.getRandomApplePosition();
                    result.affectedPositions.push(this.applePosition);
                }
                this.board.current.setLength(this.getSnakeLength());

                //console.debug(`[SnakeGame] updating ${result.affectedPositions.length} positions`)
                result.affectedPositions.forEach(affectedPosition => this.setSinglePosition(affectedPosition));
                this.resetInterval();
            }).catch(error => {
                console.log(error);
                this.clearInterval();
                this.setIsGameOver(true);
            });
    }

    getRandomInitialPosition(): Position {
        return new Position(
            Math.floor(Math.random() * (this.rows - this.rows / 2)) + Math.floor(this.rows / 4),
            Math.floor(Math.random() * (this.columns - this.columns / 2)) + Math.floor(this.columns / 4)
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
        this.clearInterval()
        this.isMoving = false;
    }

    resume() {
        if (!this.isMoving) {
            this.resetInterval();
            this.isMoving = true;
        }
    }

    getScore() {
        return this.score;
    }

    getSteps() {
        return this.steps;
    }
    getDimensions(): [number, number] {
        return [this.rows, this.columns];
    }

    setBoard(board: React.RefObject<SnakeBoard>) {
        this.board = board;
    }


    getSnake(): Snake {
        return this.snake
    }

    setSinglePosition(position: Position, classNames: string[] = []) {
        if (this.getApplePosition().equals(position)) {
            classNames.push('apple')
        } else {

            if (this.snake.isBody(position)) {
                classNames.push('body')
            }
            if (this.snake.isHead(position)) {
                classNames.push('head')
            }
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
                this.setSinglePosition(new Position(i, j));
            }

        }
    }

    getHeadSnakePosition(): Position {
        return this.snake.getHeadPosition()
    }
}


export default SnakeGame;