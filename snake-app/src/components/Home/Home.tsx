import React, { useEffect, useState } from 'react';
import SnakeGame from '../../game/controls/SnakeGame';
import AStarPlayer from '../../game/players/AStarPlayer';
import HumanPlayer from '../../game/players/HumanPlayer';
import Player from '../../game/players/Player';
import GameOver from '../GameOver/GameOver';
import NavBar from '../NavBar/NavBar';
import SnakeBoard from '../SnakeBoard/SnakeBoard';

let size = 20;
let speed = 100;
let props = { rows: size, columns: size, speed: speed };
let board = React.createRef<SnakeBoard>();
let players:Player[] = [new HumanPlayer(),new AStarPlayer()]
let snakeGame : SnakeGame = null;

function Home() {

  const [isGameOver, setIsGameOver] = useState(false);
  useEffect(() => {
    console.debug("[Home] Creating New game")
    if(snakeGame==null){
      snakeGame = new SnakeGame(size, size, speed, board, players[1], setIsGameOver);
    }else{
      snakeGame.setBoard(board);
    }
  },[]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#578A34'
    }}>
      <SnakeBoard ref={board} {...props} />
      <NavBar></NavBar>
      <GameOver show={isGameOver}></GameOver>

    </div>
  );
}

export default Home;
