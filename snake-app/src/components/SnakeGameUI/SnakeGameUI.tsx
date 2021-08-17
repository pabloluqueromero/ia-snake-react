import React, { useEffect, useState } from 'react'
import SnakeGame from '../../game/controls/SnakeGame';
import Algorithm from '../../game/game-utils/Algorithm';
import HumanPlayer from '../../game/players/HumanPlayer';
import GameOver from '../GameOver/GameOver';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import Settings from '../Settings/Settings';
import SnakeBoard from '../SnakeBoard/SnakeBoard';
import './SnakeGameUI.css';
let size = 21;
let speed = 500;
let propsBoard = { rows: size, columns: size, speed: speed };
let board = React.createRef<SnakeBoard>();
let scoreBoard = React.createRef<ScoreBoard>();
let snakeGame: SnakeGame = null;


function setAlgorithm(algorithm: Algorithm) {
    console.debug(`Changin Player ${algorithm}`);
    snakeGame.setPlayer(algorithm);
}

function changeVisualize() {
    console.debug(`Changing visualize`);
    snakeGame.getPlayer().changeVisualize();
}

function setSpeed(speed: Algorithm) {
    console.debug(`Changing speed ${speed}`);
    snakeGame.setSpeed(speed);
}
function SnakeGameUI() {
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                snakeGame.resume();
            }
        })
    })
    //Callbacks
    let restartGameCallback: () => void = () => { setIsGameOver(false); snakeGame.initializeGame(); };
    let clearScoreBoard: () => void = () => { scoreBoard.current.clearScoreBoard() };

    useEffect(() => {
        if (snakeGame === null) {
            snakeGame = new SnakeGame(size, size, speed, board, scoreBoard, new HumanPlayer(), setIsGameOver);
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
            <div className='container'>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'rgba(255,255,255,0.30)'

                }}>
                    <div style={{
                        display: 'flex',
                        top: '1em',
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.60)',
                        justifyContent: 'center',
                        alignContent: 'center'
                    }}>
                        <a className="no-style-anchor" href="/home"><i className="fas fa-2x fa-arrow-left"></i></a>
                        <h1 style={{
                            fontFamily: 'Black Ops One, cursive',
                            flex: 8, textAlign: 'center'
                        }}>Snake Game AI</h1>
                    </div>
                    <ScoreBoard ref={scoreBoard} {...{algorithm:Algorithm.HUMAN}}/>
                    <Settings setAlgorithm={setAlgorithm} setSpeed={setSpeed} changeVisualize={changeVisualize}/>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%'
                }}>

                    <SnakeBoard ref={board} {...propsBoard} />
                </div>
            </div>
            <GameOver show={isGameOver} restartGameCallback={restartGameCallback} clearScoreBoard={clearScoreBoard} />
        </div>


    );

}


export default SnakeGameUI;
