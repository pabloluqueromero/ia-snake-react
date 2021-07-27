import React from 'react'
import Algorithm from '../../game/game-utils/Algorithm';
import './ScoreBoard.css'

class ScoreBoard extends React.Component<{},
    {
        firstScore: { id: number, algorithm: string, score: number, stepCount, avgSteps: number }
        scoreList: { id: number, algorithm: string, score: number, stepCount, avgSteps: number }[]
    }> {

    private id: number = 0;
    constructor(props: { algorithm: Algorithm }) {
        super(props);
        this.state = this.getInitialState(props.algorithm);

    }

    getInitialState(algorithm: Algorithm) {
        return {
            firstScore:
            {
                id: 0,
                algorithm: algorithm.toString(),
                score: 0,
                stepCount: 0,
                avgSteps: -1
            },
            scoreList: []
        }

    }
    getNewState(increase: number = 0) {
        return {
            firstScore:
            {
                id: this.state.firstScore.id + increase,
                algorithm: this.state.firstScore.algorithm.toString(),
                score: 0,
                stepCount: 0,
                avgSteps: -1
            },
            scoreList: this.state.scoreList
        }
    }
    setAlgorithm(algorithm: Algorithm) {
        let newState = null;
        switch (algorithm) {
            case Algorithm.HUMAN:
                newState = this.getNewState();
                newState.algorithm = "Human";
                this.setState(newState);
                break;
            default:
                newState = this.getNewState();
                newState.algorithm = "A*";
                this.setState(newState);
                break;
        }
    }

    increaseScore() {
        this.setState(prevState => {
            console.log("increasing: " + prevState.firstScore.score)
            return {
                firstScore: {
                    id: prevState.firstScore.id,
                    algorithm: prevState.firstScore.algorithm.toString(),
                    score: prevState.firstScore.score + 1,
                    stepCount: prevState.firstScore.stepCount,
                    avgSteps: Math.round(((prevState.firstScore.stepCount / (prevState.firstScore.score+1)) + Number.EPSILON) * 100) / 100
                },
                scoreList: prevState.scoreList
            };
        })
    }

    increaseSteps() {
        this.setState(prevState => {
            return {
                firstScore: {
                    id: prevState.firstScore.id,
                    algorithm: prevState.firstScore.algorithm.toString(),
                    score: prevState.firstScore.score ,
                    stepCount: prevState.firstScore.stepCount+ 1,
                    avgSteps: prevState.firstScore.avgSteps
                },
                scoreList: prevState.scoreList
            };
        })
    }

    saveGame() {
        this.setState(prevState => {
            return {
                firstScore: this.getNewState(1).firstScore,
                scoreList: [prevState.firstScore].concat(prevState.scoreList)
            };
        });

    }

    render() {
        return (
            <div className="score-board-summary-table-container">
                <table className="score-board-summary-table">
                    <thead>
                        <tr>
                            <td>GAME ID</td>
                            <td>ALGORITHM</td>
                            <td>SCORE</td>
                            <td>STEPS</td>
                            <td>AVG STEPS</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{`#${this.state.firstScore.id}`}</td>
                            <td>{this.state.firstScore.algorithm}</td>
                            <td>{this.state.firstScore.score}</td>
                            <td>{this.state.firstScore.stepCount}</td>
                            <td>{this.state.firstScore.avgSteps}</td>
                        </tr>
                        {this.state.scoreList.map(row => {
                            return (<tr>
                                <td>{`#${row.id}`}</td>
                                <td>{row.algorithm}</td>
                                <td>{row.score}</td>
                                <td>{row.stepCount}</td>
                                <td>{row.avgSteps}</td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )

    }

}
export default ScoreBoard;

