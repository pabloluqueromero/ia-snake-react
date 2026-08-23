import React from 'react'
import Algorithm from '../../game/game-utils/Algorithm';
import './ScoreBoard.css'

export interface ScoreItem {
    id: number;
    algorithm: string;
    score: number;
    stepCount: number;
    avgSteps: number;
}

interface ScoreBoardProps {
    algorithm?: Algorithm;
}

interface ScoreBoardState {
    firstScore: ScoreItem;
    scoreList: ScoreItem[];
}

class ScoreBoard extends React.Component<ScoreBoardProps, ScoreBoardState> {
    constructor(props: ScoreBoardProps) {
        super(props);
        this.state = this.getInitialState(props.algorithm || Algorithm.HUMAN);
    }

    getInitialState(algorithm: Algorithm): ScoreBoardState {
        let algName = "Human";
        if (algorithm === Algorithm.ASTAR) algName = "A*";
        if (algorithm === Algorithm.HAMILTONIANCYCLE) algName = "Hamiltonian";

        return {
            firstScore: {
                id: 0,
                algorithm: algName,
                score: 0,
                stepCount: 0,
                avgSteps: -1
            },
            scoreList: []
        };
    }

    clearScoreBoard() {
        this.setState(prevState => {
            return {
                firstScore: {
                    id: 0,
                    algorithm: prevState.firstScore.algorithm,
                    score: 0,
                    stepCount: 0,
                    avgSteps: -1
                },
                scoreList: []
            };
        });
    }

    getNewState(increase: number = 0): ScoreBoardState {
        return {
            firstScore: {
                id: this.state.firstScore.id + increase,
                algorithm: this.state.firstScore.algorithm,
                score: 0,
                stepCount: 0,
                avgSteps: -1
            },
            scoreList: this.state.scoreList
        };
    }

    getCurrentStats(): ScoreItem {
        return this.state.firstScore;
    }

    setAlgorithm(algorithm: Algorithm) {
        let algName = "Human";
        switch (algorithm) {
            case Algorithm.HUMAN:
                algName = "Human";
                break;
            case Algorithm.HAMILTONIANCYCLE:
                algName = "Hamiltonian";
                break;
            default:
                algName = "A*";
                break;
        }
        this.setState(prevState => ({
            firstScore: {
                ...prevState.firstScore,
                algorithm: algName,
                score: 0,
                stepCount: 0,
                avgSteps: -1
            }
        }));
    }

    increaseScore() {
        this.setState(prevState => {
            const nextScore = prevState.firstScore.score + 1;
            const avg = Math.round(((prevState.firstScore.stepCount / nextScore) + Number.EPSILON) * 100) / 100;
            return {
                firstScore: {
                    ...prevState.firstScore,
                    score: nextScore,
                    avgSteps: avg
                },
                scoreList: prevState.scoreList
            };
        });
    }

    increaseSteps() {
        this.setState(prevState => {
            const nextSteps = prevState.firstScore.stepCount + 1;
            const denom = prevState.firstScore.score > 0 ? prevState.firstScore.score : 1;
            const avg = Math.round(((nextSteps / denom) + Number.EPSILON) * 100) / 100;
            return {
                firstScore: {
                    ...prevState.firstScore,
                    stepCount: nextSteps,
                    avgSteps: avg
                },
                scoreList: prevState.scoreList
            };
        });
    }

    saveGame() {
        this.setState(prevState => {
            return {
                firstScore: this.getNewState(1).firstScore,
                scoreList: [prevState.firstScore, ...prevState.scoreList]
            };
        });
    }

    render() {
        return (
            <div className="score-board-summary-table-container">
                <table className="score-board-summary-table">
                    <thead>
                        <tr>
                            <th>GAME ID</th>
                            <th>ALGORITHM</th>
                            <th>SCORE</th>
                            <th>STEPS</th>
                            <th>AVG STEPS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{`#${this.state.firstScore.id}`}</td>
                            <td>{this.state.firstScore.algorithm}</td>
                            <td>{this.state.firstScore.score}</td>
                            <td>{this.state.firstScore.stepCount}</td>
                            <td>{this.state.firstScore.avgSteps >= 0 ? this.state.firstScore.avgSteps : '-'}</td>
                        </tr>
                        {this.state.scoreList.map((row) => (
                            <tr key={row.id}>
                                <td>{`#${row.id}`}</td>
                                <td>{row.algorithm}</td>
                                <td>{row.score}</td>
                                <td>{row.stepCount}</td>
                                <td>{row.avgSteps >= 0 ? row.avgSteps : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ScoreBoard;

