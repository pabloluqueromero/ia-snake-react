import React from 'react';
import Position from '../../game/game-utils/Position';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import Settings from '../Settings/Settings';
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


  setPosition(position: Position, classNames: string[]) {
    this.boardProps[position.getRow()][position.getColumn()].classNames = classNames;
    this.boardSquares[position.getRow()][position.getColumn()].current.changeColor(classNames);
  }

  //remove visualization attributes except path
  clearVisualization() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let newClassNames = this.boardProps[i][j].classNames
                                .filter(className => className !== "expanded")
                                .filter(className => className !== "explored");
        if (newClassNames.length != this.boardProps[i][j].classNames.length) {
          this.setPosition(new Position(i, j), newClassNames);
        }

      }
    }
  }


  displayBoard() {
    return this.boardProps.flatMap((row, i) =>
      row.map((props, j) =>
        <Square key={[i, j].join('-')} ref={this.boardSquares[i][j]} {...props} />
      ))
  }

  setScore(newScore: number) {
    //this.setState({ score: newScore });
  }

  setLength(newLength: number) {
    //this.setState({ length: newLength });
  }

  render() {
    console.log("Rendering Board")
    return (

      <div className='grid'
        style={{
          gridTemplate: `repeat(${this.rows}, 1fr) /repeat(${this.columns},1fr)`
        }}>
        {this.displayBoard()}
      </div>
    );
  }
}

export default SnakeBoard;
