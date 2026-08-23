import React from 'react';
import ScoreBoard from '../../components/ScoreBoard/ScoreBoard';
import SnakeBoard from '../../components/SnakeBoard/SnakeBoard';
import Algorithm from '../game-utils/Algorithm';
import Position from '../game-utils/Position';
import AStarPlayer from '../players/AStarPlayer';
import HamiltonianPlayer from '../players/HamiltonianPlayer';
import HumanPlayer from '../players/HumanPlayer';
import Player from '../players/Player';
import Direction from './Direction';
import Snake from './Snake';

class SnakeGame {
    private board: React.RefObject<SnakeBoard>;
    private scoreBoard: React.RefObject<ScoreBoard>;
    private applePosition: Position;
    private rows: number;
    private columns: number;
    private snake: Snake;
    private lastMovement: Direction;
    private isMoving: boolean = false;
    private isGameOver: boolean = false;

    // Game execution
    private keepMoving: number;
    private speedControl: number;

    // Game stats
    private speed: number;
    private score: number;
    private steps: number;
    private gameCount: number = 0;
    private currentAlgorithm: Algorithm = Algorithm.HUMAN;
    private player: Player;
    private setIsGameOver: (isGameOver: boolean, stats?: { algorithm: string, score: number, steps: number, avgSteps: number }) => void;

    constructor(
        rows: number,
        columns: number,
        speed: number,
        board: React.RefObject<SnakeBoard>,
        scoreBoard: React.RefObject<ScoreBoard>,
        player: Player,
        setIsGameOver: (isGameOver: boolean, stats?: { algorithm: string, score: number, steps: number, avgSteps: number }) => void
    ) {
        this.rows = rows;
        this.columns = columns;
        this.board = board;
        this.scoreBoard = scoreBoard;
        this.speed = speed / 10;
        this.player = player;
        this.setIsGameOver = setIsGameOver;
        this.initializeGame();
    }

    getAlgorithmName(): string {
        if (this.currentAlgorithm === Algorithm.ASTAR) return "A*";
        if (this.currentAlgorithm === Algorithm.HAMILTONIANCYCLE) return "Hamiltonian";
        return "Human";
    }

    initializeGame() {
        this.clearInterval();
        this.isGameOver = false;
        this.player.destroy?.();
        this.player.init();
        this.player.setGame(this);

        let initialPosition = this.getRandomInitialPosition();
        this.snake = new Snake(this.rows, this.columns, [initialPosition]);
        this.applePosition = this.getRandomApplePosition();
        this.score = 0;
        this.steps = 0;
        this.lastMovement = null;
        this.isMoving = false;
        this.gameCount += 1;
        this.setInitialColors();

        if (this.scoreBoard.current) {
            this.scoreBoard.current.resetActiveGame(this.getAlgorithmName());
        }
    }

    destroy() {
        this.clearInterval();
        this.isMoving = false;
        this.isGameOver = true;
        this.player.destroy?.();
    }

    resetInterval() {
        this.speedControl = window.setTimeout(() => {
            this.keepMoving = window.requestAnimationFrame(() => {
                if (this.isMoving && !this.isGameOver) {
                    this.move();
                }
            });
        }, this.speed);
    }

    private clearInterval() {
        if (this.speedControl) {
            clearTimeout(this.speedControl);
        }
        if (this.keepMoving) {
            window.cancelAnimationFrame(this.keepMoving);
        }
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    getPlayer(): Player {
        return this.player;
    }

    setPlayer(algorithm: Algorithm) {
        this.currentAlgorithm = algorithm;
        const wasMoving = this.isMoving && !this.isGameOver;
        this.pause();
        this.player.destroy?.();
        switch (algorithm) {
            case Algorithm.HUMAN:
                this.player = new HumanPlayer();
                break;
            case Algorithm.HAMILTONIANCYCLE:
                this.player = new HamiltonianPlayer();
                break;
            default:
                this.player = new AStarPlayer();
                break;
        }
        this.player.init();
        this.player.setGame(this);
        if (this.scoreBoard.current) {
            this.scoreBoard.current.setAlgorithm(algorithm);
        }
        if (wasMoving) {
            this.resume();
        }
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
        if (this.isGameOver) return;

        this.player.getNextMove()
            .then(nextMovement => {
                if (this.isGameOver) return;
                this.isMoving = true;
                let result = this.snake.move(nextMovement, this.applePosition);
                this.setLastMovement(nextMovement);
                this.steps += 1;
                if (this.scoreBoard.current) {
                    this.scoreBoard.current.increaseSteps();
                }

                if (result.appleEaten) {
                    if (this.scoreBoard.current) {
                        this.scoreBoard.current.increaseScore();
                    }
                    this.score += 1;
                    this.applePosition = this.getRandomApplePosition();
                    result.affectedPositions.push(this.applePosition);
                }

                result.affectedPositions.forEach(affectedPosition => this.setSinglePosition(affectedPosition));
                this.resetInterval();
            }).catch(error => {
                console.log(error);
                this.clearInterval();
                this.isMoving = false;
                this.isGameOver = true;

                const algName = this.getAlgorithmName();
                const finalScore = this.score;
                const finalSteps = this.steps;
                const avgSteps = finalScore > 0 ? Math.round((finalSteps / finalScore) * 10) / 10 : -1;

                if (this.scoreBoard.current) {
                    this.scoreBoard.current.recordCompletedGame(algName, finalScore, finalSteps, avgSteps);
                }
                this.setIsGameOver(true, {
                    algorithm: algName,
                    score: finalScore,
                    steps: finalSteps,
                    avgSteps: avgSteps
                });
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

    getApplePosition(): Position {
        return this.applePosition;
    }

    pause() {
        this.clearInterval();
        this.isMoving = false;
    }

    resume() {
        if (this.isGameOver) {
            return;
        }
        if (!this.isMoving) {
            this.resetInterval();
            this.isMoving = true;
        }
    }

    isGameOverActive(): boolean {
        return this.isGameOver;
    }

    isSnakeMoving(): boolean {
        return this.isMoving;
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
        return this.snake;
    }

    setSinglePosition(position: Position, classNames: string[] = []) {
        if (this.getApplePosition().equals(position)) {
            classNames.push('apple');
        } else {
            if (this.snake.isBody(position)) {
                classNames.push('body');
            }
            if (this.snake.isHead(position)) {
                classNames.push('head');
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
        return this.snake.getHeadPosition();
    }
}

export default SnakeGame;