import React, { useEffect, useState } from 'react'
import SnakeGame from '../../game/controls/SnakeGame';
import AStarPlayer from '../../game/players/AStarPlayer';
import HumanPlayer from '../../game/players/HumanPlayer';
import Player from '../../game/players/Player';
import GameOver from '../GameOver/GameOver';
import SnakeBoard from '../SnakeBoard/SnakeBoard';

let size = 21;
let speed = 100;
let propsBoard = { rows: size, columns: size, speed: speed };
let board = React.createRef<SnakeBoard>();
let players: Player[] = [new HumanPlayer(), new AStarPlayer()]
let snakeGame: SnakeGame = null;

function SnakeGameUI() {
    const [isGameOver, setIsGameOver] = useState(false);


    //Callbacks
    let restartGameCallback: () => void = () => { setIsGameOver(false);snakeGame.initializeGame(); };

    useEffect(() => {
        if (snakeGame == null) {
            snakeGame = new SnakeGame(size, size, speed, board, players[0], setIsGameOver);
        } else {
            snakeGame.setBoard(board);
        }
    }, []);

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
            <SnakeBoard ref={board} {...propsBoard} />
            <GameOver show={isGameOver} restartGameCallback={restartGameCallback}></GameOver>

        </div>
    );

}


export default SnakeGameUI;