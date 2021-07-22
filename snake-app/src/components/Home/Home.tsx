import React, { useEffect, useState } from 'react';
import SnakeGame from '../../game/controls/SnakeGame';
import AStarPlayer from '../../game/players/AStarPlayer';
import HumanPlayer from '../../game/players/HumanPlayer';
import Player from '../../game/players/Player';
import GameOver from '../GameOver/GameOver';
import NavBar from '../NavBar/NavBar';
import SnakeBoard from '../SnakeBoard/SnakeBoard';
import SnakeGameUI from '../SnakeGameUI/SnakeGameUI';

function Home() {

  return (
    <SnakeGameUI/>
  );
}

export default Home;
