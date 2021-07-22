import React, { useEffect, useState } from 'react'
import SnakeGame from '../../game/controls/SnakeGame';
import Algorithm from '../../game/game-utils/Algorithm';
import AStarPlayer from '../../game/players/AStarPlayer';
import HumanPlayer from '../../game/players/HumanPlayer';
import Player from '../../game/players/Player';
import GameOver from '../GameOver/GameOver';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import Settings from '../Settings/Settings';
import SnakeBoard from '../SnakeBoard/SnakeBoard';
import './SnakeGameUI.css';
let size = 21;
let speed = 100;
let propsBoard = { rows: size, columns: size, speed: speed };
let board = React.createRef<SnakeBoard>();
let players: Player[] = [new HumanPlayer(), new AStarPlayer()]
let snakeGame: SnakeGame = null;


function setAlgorithm(algorithm: Algorithm) {
    
}

function SnakeGameUI() {
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(()=>{
        window.addEventListener('keydown', (e)=>{
            if(e.key==='Enter'){
            snakeGame.resume();
            }
        })
    })
    //Callbacks
    let restartGameCallback: () => void = () => { setIsGameOver(false); snakeGame.initializeGame(); };

    useEffect(() => {
        if (snakeGame == null) {
            snakeGame = new SnakeGame(size, size, speed, board, players[1], setIsGameOver);
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
                        width:'100%',
                        backgroundColor: 'rgba(255,255,255,0.60)',
                        justifyContent:'center',
                        alignContent:'center'
                }}>
                    <a className="no-style-anchor" href="/home"><i className="fas fa-2x fa-arrow-left"></i></a>
                    <h1 style={{fontFamily:'Black Ops One, cursive',
                flex:8,textAlign:'center'}}>Snake Game AI</h1>
                </div>
                    <ScoreBoard />
                    <Settings setAlgorithm = {(algorithm:Algorithm)=>{ setAlgorithm(Algorithm.HUMAN);}}/>
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
            <GameOver show={isGameOver} restartGameCallback={restartGameCallback} />
        </div>


    );

}


export default SnakeGameUI;
