import React from 'react';
import Algorithm from '../../game/game-utils/Algorithm';
import './ScoreBoard.css';

export interface ScoreItem {
    id: number;
    algorithm: string;
    score: number;
    stepCount: number;
    avgSteps: number;
    date?: string;
}

interface ScoreBoardProps {
    algorithm?: Algorithm;
}

interface ScoreBoardState {
    firstScore: ScoreItem;
    scoreList: ScoreItem[];
}

const STORAGE_KEY = 'ia_snake_scoreboard_v1';

class ScoreBoard extends React.Component<ScoreBoardProps, ScoreBoardState> {
    constructor(props: ScoreBoardProps) {
        super(props);
        this.state = {
            firstScore: this.getInitialActiveScore(props.algorithm || Algorithm.HUMAN),
            scoreList: this.loadSavedScores()
        };
    }

    private loadSavedScores(): ScoreItem[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Could not load saved scoreboard history:', e);
        }
        return [];
    }

    private persistScores(list: ScoreItem[]) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
        } catch (e) {
            console.warn('Could not save scoreboard history:', e);
        }
    }

    getAlgorithmName(algorithm?: Algorithm): string {
        if (algorithm === Algorithm.ASTAR) return "A*";
        if (algorithm === Algorithm.HAMILTONIANCYCLE) return "Hamiltonian";
        if (algorithm === Algorithm.DQN) return "DQN AI";
        return "Human";
    }

    getInitialActiveScore(algorithm: Algorithm): ScoreItem {
        const nextId = (this.loadSavedScores()[0]?.id || 0) + 1;
        return {
            id: nextId,
            algorithm: this.getAlgorithmName(algorithm),
            score: 0,
            stepCount: 0,
            avgSteps: -1
        };
    }

    clearScoreBoard() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Could not clear scoreboard storage:', e);
        }
        this.setState(prevState => ({
            firstScore: {
                id: 1,
                algorithm: prevState.firstScore.algorithm,
                score: 0,
                stepCount: 0,
                avgSteps: -1
            },
            scoreList: []
        }));
    }

    resetActiveGame(algorithmName: string) {
        const nextId = (this.state.scoreList[0]?.id || 0) + 1;
        this.setState({
            firstScore: {
                id: nextId,
                algorithm: algorithmName,
                score: 0,
                stepCount: 0,
                avgSteps: -1
            }
        });
    }

    recordCompletedGame(algorithm: string, score: number, stepCount: number, avgSteps: number) {
        const finishedItem: ScoreItem = {
            id: this.state.firstScore.id,
            algorithm: algorithm || this.state.firstScore.algorithm,
            score: score,
            stepCount: stepCount,
            avgSteps: avgSteps,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedList = [finishedItem, ...this.state.scoreList];
        this.persistScores(updatedList);

        this.setState({
            scoreList: updatedList,
            firstScore: {
                id: finishedItem.id + 1,
                algorithm: finishedItem.algorithm,
                score: 0,
                stepCount: 0,
                avgSteps: -1
            }
        });
    }

    getCurrentStats(): ScoreItem {
        return this.state.firstScore;
    }

    setAlgorithm(algorithm: Algorithm) {
        const algName = this.getAlgorithmName(algorithm);
        this.setState(prevState => ({
            firstScore: {
                ...prevState.firstScore,
                algorithm: algName
            }
        }));
    }

    increaseScore() {
        this.setState(prevState => {
            const nextScore = prevState.firstScore.score + 1;
            const avg = Math.round(((prevState.firstScore.stepCount / nextScore) + Number.EPSILON) * 10) / 10;
            return {
                firstScore: {
                    ...prevState.firstScore,
                    score: nextScore,
                    avgSteps: avg
                }
            };
        });
    }

    increaseSteps() {
        this.setState(prevState => {
            const nextSteps = prevState.firstScore.stepCount + 1;
            const denom = prevState.firstScore.score > 0 ? prevState.firstScore.score : 1;
            const avg = Math.round(((nextSteps / denom) + Number.EPSILON) * 10) / 10;
            return {
                firstScore: {
                    ...prevState.firstScore,
                    stepCount: nextSteps,
                    avgSteps: avg
                }
            };
        });
    }

    getBadgeClass(alg: string) {
        if (alg === 'A*' || alg.includes('A*')) return 'badge-astar';
        if (alg.includes('DQN')) return 'badge-dqn';
        if (alg.includes('Hamiltonian')) return 'badge-hamiltonian';
        return 'badge-human';
    }

    render() {
        const { firstScore, scoreList } = this.state;
        const totalGames = scoreList.length;
        const allScores = [...scoreList.map(s => s.score), firstScore.score];
        const highScore = Math.max(...allScores, 0);

        return (
            <div className="scoreboard-card">
                {/* Stats Overview */}
                <div className="scoreboard-stat-row">
                    <div className="stat-pill">
                        <span className="stat-pill-title">Live Score</span>
                        <span className="stat-pill-value highlight">{firstScore.score}</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-pill-title">All-Time High</span>
                        <span className="stat-pill-value">{highScore}</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-pill-title">Games Saved</span>
                        <span className="stat-pill-value">{totalGames}</span>
                    </div>
                </div>

                {/* Scoreboard Table Header with Clear Button */}
                <div className="scoreboard-header-bar">
                    <span className="scoreboard-title">History & Memory</span>
                    {scoreList.length > 0 && (
                        <button
                            type="button"
                            className="clear-history-btn"
                            onClick={() => this.clearScoreBoard()}
                            title="Clear saved game history"
                        >
                            <i className="fas fa-trash-alt"></i> Clear
                        </button>
                    )}
                </div>

                {/* Scoreboard Table */}
                <div className="score-table-scroll">
                    <table className="score-board-summary-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>AGENT</th>
                                <th>SCORE</th>
                                <th>STEPS</th>
                                <th>EFFICIENCY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Current Active Live Row */}
                            <tr className="current-game-row">
                                <td className="font-mono">#{firstScore.id} <span className="live-dot" title="Live Game"></span></td>
                                <td>
                                    <span className={`alg-badge ${this.getBadgeClass(firstScore.algorithm)}`}>
                                        {firstScore.algorithm}
                                    </span>
                                </td>
                                <td className="score-value font-mono">{firstScore.score}</td>
                                <td className="font-mono">{firstScore.stepCount}</td>
                                <td className="font-mono text-muted">{firstScore.avgSteps >= 0 ? `${firstScore.avgSteps} st/pt` : '-'}</td>
                            </tr>

                            {/* Saved Previous Games */}
                            {scoreList.map((row) => (
                                <tr key={row.id}>
                                    <td className="font-mono">#{row.id}</td>
                                    <td>
                                        <span className={`alg-badge ${this.getBadgeClass(row.algorithm)}`}>
                                            {row.algorithm}
                                        </span>
                                    </td>
                                    <td className="score-value font-mono">{row.score}</td>
                                    <td className="font-mono">{row.stepCount}</td>
                                    <td className="font-mono text-muted">{row.avgSteps >= 0 ? `${row.avgSteps} st/pt` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default ScoreBoard;
