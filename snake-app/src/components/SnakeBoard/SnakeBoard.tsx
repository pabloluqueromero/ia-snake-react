import React from 'react';
import Direction from '../../game/DIrection';
import Snake from '../../game/Snake';
import SnakeGame from '../../game/SnakeGame';
import './SnakeBoard.css';

class SnakeBoard extends React.Component<{}, { board: number[][], score: number, length: number }> {
  private game: SnakeGame;
  private rows: number;
  private columns: number;
  private board: Array<Array<number>>;
  private tag: string[] = ['cell', 'body', 'head', 'tail'];
  private keepMoving;
  private lastMovement;
  private speed: number;
  private applePosition: { row: number, column: number };
  private score: number;
  private gameCount: number = 0;
  // ActualSnake;

  private snake: Snake;
  isMoving: boolean;

  constructor(props: { rows: number, columns: number, speed: number }) {
    super(props);
    this.rows = props.rows;
    this.columns = props.columns;
    this.board = new Array<Array<number>>(this.rows);
    this.initializeBoard();
    this.speed = props.speed;
    this.initializeGame()
    this.state = { board: this.board, score: this.score, length: this.snake.getSize() };
    this.keepMoving = setInterval(() => this.move(), this.speed);
  }
  initializeGame() {
    //snake
    let initialPosition = this.getRandomInitialPosition();
    this.snake = new Snake(this.rows, this.columns, [initialPosition]);
    this.applePosition = this.getRandomApplePosition();
    this.score = 0;
    this.lastMovement = Direction.RIGHT;
    this.isMoving = true;
    this.gameCount += 1
    clearInterval(this.keepMoving);
    if (this.gameCount > 1) {
      this.keepMoving = setInterval(() => this.move(), this.speed);
    }

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
    let appleEaten = false;
    try {
      appleEaten = this.snake.move(this.lastMovement, this.applePosition);
      if (appleEaten) {
        this.score += 1;
        this.applePosition = this.getRandomApplePosition();
        this.setState({ board: this.board, score: this.score, length: this.snake.getSize() });
      }
    } catch (e) {
      console.log('aqui');
      clearInterval(this.keepMoving);
      this.initializeGame();
    }
    this.board[0][0] += 1;
    this.setState({ board: this.board, score: this.score, length: this.snake.getSize() })
  }

  getRandomInitialPosition(): { row: number, column: number } {
    return {
      row: Math.floor(Math.random() * (this.rows - 1)),
      column: Math.floor(Math.random() * (this.columns - 1))
    }
  }
  initializeBoard() {
    for (let i = 0; i < this.rows; i++) {
      this.board[i] = [...Array<number>(this.columns)].map(_ => 0);
    }
  }

  getBoard() {
    return this.board;
  }

  getTag(id: number) {
    return this.tag[id]
  }

  getClassName(rowIndex: number, columnIndex: number) {
    let prefix = '';
    if (this.applePosition.row == rowIndex && this.applePosition.column == columnIndex) {
      prefix = 'apple ';
    }
    if (this.snake.isBody(rowIndex, columnIndex)) {
      prefix = 'body ';
    }

    if (this.snake.isHead(rowIndex, columnIndex)) {
      prefix = 'head ';
    }
    if (rowIndex & 1) {
      return prefix + (columnIndex & 1 ? 'dark-cell' : 'light-cell');
    }

    return prefix + (columnIndex & 1 ? 'light-cell' : 'dark-cell');
  }

  componentDidMount() {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case 'ArrowDown':
          if ((this.lastMovement != Direction.UP && this.isMoving) || this.snake.getSize() == 1) {
            this.lastMovement = Direction.DOWN;
          }
          return;
        case 'ArrowUp':
          if ((this.lastMovement != Direction.DOWN && this.isMoving) || this.snake.getSize() == 1) {
            this.lastMovement = Direction.UP;
          }
          return;
        case 'ArrowRight':

          if ((this.lastMovement != Direction.LEFT && this.isMoving) || this.snake.getSize() == 1) {
            this.lastMovement = Direction.RIGHT;
          }
          return;
        case 'ArrowLeft':

          if ((this.lastMovement != Direction.RIGHT && this.isMoving) || this.snake.getSize() == 1) {
            this.lastMovement = Direction.LEFT;
          }
          return;
        case 'p':
          if (this.isMoving) {
            this.isMoving = false;
            clearInterval(this.keepMoving);
            return;
          }
          this.isMoving = true;
          this.keepMoving = setInterval(() => this.move(), this.speed);
          return;
      }
    }, false);
  }
  displayBoard() {
    return this.getBoard().flatMap((row, rowIndex) =>
      row.map((_, columnIndex) =>
        <div className={[this.getClassName(rowIndex, columnIndex), "cell"].join(" ")}
        />))
  }
  render() {
    return (
      <div className='container'>
        <div className="score">
          <div className="score-board-element">
            <h1>SCORE</h1>
            <h2>{this.state.score}</h2>
          </div>
          <div className="score-board-element">
            <h1>LENGHT</h1>
            <h2>{this.state.length}</h2>
          </div>
        </div>
        <div className='grid'
          style={{
            gridTemplate: `repeat(${this.rows}, 1fr) /repeat(${this.columns},1fr)`
          }}>
          {this.displayBoard()}
        </div>
      </div>
    );
  }
}

export default SnakeBoard;
