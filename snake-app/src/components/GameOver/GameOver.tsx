import React from 'react';
import './GameOver.css';

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
    const score = props.score !== undefined ? props.score : 0;
    const avgSteps = props.avgSteps !== undefined && props.avgSteps >= 0 ? `${props.avgSteps}` : '-';

    return (
        <div className="game-over-modal-backdrop" onClick={props.restartGameCallback}>
            <div className="game-over-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="game-over-banner">
                    <span className="game-over-tag">Session Finished</span>
                    <h2>Game Over</h2>
                </div>

                <div className="game-over-stat-grid">
                    <div className="game-over-stat-card">
                        <span className="stat-card-label">Controller</span>
                        <span className="stat-card-value badge-val">{algorithm}</span>
                    </div>
                    <div className="game-over-stat-card highlight">
                        <span className="stat-card-label">Final Score</span>
                        <span className="stat-card-value font-mono">{score}</span>
                    </div>
                    <div className="game-over-stat-card">
                        <span className="stat-card-label">Efficiency</span>
                        <span className="stat-card-value font-mono">{avgSteps} <span className="sub-unit">st/pt</span></span>
                    </div>
                </div>

                <div className="game-over-action-row">
                    <button
                        type="button"
                        className="modal-btn btn-secondary"
                        title="Clear Scoreboard"
                        onClick={props.clearScoreBoard}
                    >
                        <i className="fas fa-trash-alt"></i>
                        <span>Reset Table</span>
                    </button>
                    <button
                        type="button"
                        className="modal-btn btn-primary"
                        title="Play Again (or press Enter/Space)"
                        onClick={props.restartGameCallback}
                        autoFocus
                    >
                        <i className="fas fa-redo-alt"></i>
                        <span>Play Again</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameOver;
