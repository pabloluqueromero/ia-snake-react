import React from 'react'
import './GameOver.css'
import GameOverInfo from './GameOverInfo'
import GameOverInfos from './GameOverInfos'
function GameOver() {
    return (
        <div className="game-over-container">
            <div className="game-over-title">Game Over</div>
            <GameOverInfos>
                <GameOverInfo title={'Algorithm'} content={'Human'}/>
                <GameOverInfo title={'Score'} content={'20'}/>
                <GameOverInfo title={'Avg Steps'} content={'20'}/>
            </GameOverInfos>
            <div className="game-over-options">
                <button className="game-over-button">Reset Statistiques</button>
                <button className="game-over-button">Play Again</button>
                <button className="game-over-button">See ScoreBoard</button>
                <button className="game-over-button">Home</button>
            </div>
        </div>
    )
}


export default GameOver

