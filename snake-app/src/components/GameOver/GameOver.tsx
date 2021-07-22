import React from 'react';
import './GameOver.css';
import GameOverInfo from './GameOverInfo';
import GameOverInfos from './GameOverInfos';

function GameOver(props: { show: boolean, restartGameCallback: () => void }) {
    if (!props.show) {
        return null;
    }
    return (
        <div className="game-over-modal">
            <div className="game-over-container">
                <div className="game-over-title">
                    <p>GAME OVER</p>
                </div>
                <GameOverInfos>
                    <GameOverInfo title={'Algorithm'} content={'Human'} />
                    <GameOverInfo title={'Score'} content={'20'} />
                    <GameOverInfo title={'Avg Steps'} content={'20'} />
                </GameOverInfos>
                <div style={{
                    height: '1px',
                    width: '80%',
                    marginTop: '2vh',
                    backgroundColor: 'rgb(51, 51, 51)'
                }}></div>
                <div className="game-over-options">
                    <button className="reset table game-over-button"><i className="fas fa-undo-alt"></i></button>
                    <button className="resume game-over-button" onClick={() => { props.restartGameCallback(); }}><i className="fas fa-2x fa-play-circle"></i></button>
                    <button className="reset home game-over-button "><i className="fas fa-home"></i></button>
                </div>
            </div>
        </div>
    )
}

{/* <button className="reset game-over-button "><i className="fas fa-sliders-h"></i></button>
<button className="reset game-over-button"><i className="fas fa-undo-alt"></i></button> */}

export default GameOver

