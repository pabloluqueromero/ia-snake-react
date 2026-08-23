import React from 'react';
import './GameOver.css';
import GameOverInfo from './GameOverInfo';
import GameOverInfos from './GameOverInfos';

interface GameOverProps {
    show: boolean;
    restartGameCallback: () => void;
    clearScoreBoard: () => void;
    algorithm?: string;
    score?: number;
    avgSteps?: number;
}

function GameOver(props: GameOverProps) {
    if (!props.show) {
        return null;
    }
    const algorithm = props.algorithm || 'Human';
    const score = props.score !== undefined ? `${props.score}` : '0';
    const avgSteps = props.avgSteps !== undefined && props.avgSteps >= 0 ? `${props.avgSteps}` : '-';

    return (
        <div className="game-over-modal">
            <div className="game-over-container">
                <div className="game-over-title">
                    <p>GAME OVER</p>
                </div>
                <GameOverInfos>
                    <GameOverInfo title={'Algorithm'} content={algorithm} />
                    <GameOverInfo title={'Score'} content={score} />
                    <GameOverInfo title={'Avg Steps'} content={avgSteps} />
                </GameOverInfos>
                <div style={{
                    height: '1px',
                    width: '80%',
                    marginTop: '2vh',
                    backgroundColor: 'rgb(51, 51, 51)'
                }}></div>
                <div className="game-over-options">
                    <button className="reset table game-over-button" title="Reset Scoreboard" onClick={() => { props.clearScoreBoard(); }}><i className="fas fa-undo-alt"></i></button>
                    <button className="resume game-over-button" title="Play Again" onClick={() => { props.restartGameCallback(); }}><i className="fas fa-2x fa-play-circle"></i></button>
                    <button className="reset home game-over-button" title="Restart" onClick={() => { props.restartGameCallback(); }}><i className="fas fa-home"></i></button>
                </div>
            </div>
        </div>
    );
}

export default GameOver;

