import React from 'react';
import './SnakeBoard.css';
import Square from './Square';

class SnakeBoard extends React.Component<{}, { score: number, length: number }> {
  private rows: number;
  private columns: number;
  private boardSquares: Array<Array<React.RefObject<Square>>>;
  private boardProps: Array<Array<{ classNames: string[] }>>;

  constructor(props: { rows: number, columns: number, speed: number }) {
    super(props);
    this.rows = props.rows;
    this.columns = props.columns;
    this.state = { score: 0, length: 1 };
    this.initializeBoard();
  }

  initializeBoard() {
    this.boardSquares = new Array<Array<React.RefObject<Square>>>(this.rows);
    this.boardProps = new Array<Array<{ classNames: [string] }>>(this.rows);
    for (let i = 0; i < this.rows; i++) {
      this.boardSquares[i] = new Array<React.RefObject<Square>>(this.columns);
      this.boardProps[i] = new Array<{ classNames: [string] }>(this.columns);
      for (let j = 0; j < this.columns; j++) {
        this.boardProps[i][j] = { classNames: ['light-cell'] };
        this.boardSquares[i][j] = React.createRef<Square>();
      }
    }
  }


  setPosition(rowIndex: number, columnIndex: number, classNames: string[]) {
    this.boardSquares[rowIndex][columnIndex].current.changeColor(classNames);
  }


  displayBoard() {
    return this.boardProps.flatMap((row, i) =>
      row.map((props, j) =>
        <Square ref={this.boardSquares[i][j]} {...props} />
      ))
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
