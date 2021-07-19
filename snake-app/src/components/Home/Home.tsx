import React, { useEffect } from 'react';
import SnakeGame from '../../game/controls/SnakeGame';
import AStarPlayer from '../../game/players/AStarPlayer';
import HumanPlayer from '../../game/players/HumanPlayer';
import NavBar from '../NavBar/NavBar';
import SnakeBoard from '../SnakeBoard/SnakeBoard';


function Home() {
  let size = 20;
  let speed = 100;
  let props = { rows: size, columns: size, speed: speed };
  let board = React.createRef<SnakeBoard>();
  //let player = new HumanPlayer();
  let player = new AStarPlayer();

  useEffect(() => {
    //console.debug("[Home] Creating New game")
    new SnakeGame(size, size, speed, board, player);
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw'
    }}>
      <NavBar></NavBar>
      <SnakeBoard ref={board} {...props} />

    </div>
  );
}

export default Home;
