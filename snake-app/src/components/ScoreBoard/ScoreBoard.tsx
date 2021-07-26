import React from 'react'
import Algorithm from '../../game/game-utils/Algorithm';
import './ScoreBoard.css'

class ScoreBoard extends React.Component {

    private firstScore: { id: number, algorithm: string, score: number, stepsnumber, avgSteps: number };
    private scores: { id: number, algorithm: string, score: number, stepsnumber, avgSteps: number }[] = []

    setAlgorithm(algorithm: Algorithm) {
        switch (algorithm) {
            case Algorithm.HUMAN:
                this.firstScore.algorithm = "Human"
                break;
            default:
                this.firstScore.algorithm = "A*"
                break;
        }
    }

    increaseScore(score: number) {
        this.firstScore.score+=1
    }

    increaseSteps(score: number) {
        this.firstScore.score+=1
    }

    saveGame() {
        this.scores.splice(0, 0, this.firstScore);
        this.resetCurrentScore();
    }
    resetGames() {
        this.scores = []
        this.resetCurrentScore();
    }
    resetCurrentScore() {
        this.firstScore = {
            id: this.scores.length + 1,
            algorithm: "Human",
            score: 0,
            stepsnumber: 0,
            avgSteps: -1
        }
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
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr><tr>
                            <td>#3</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr>
                        <tr>
                            <td>#2</td>
                            <td>A*</td>
                            <td>20</td>
                            <td>20</td>
                            <td>30.5</td>
                        </tr>
                        <tr>
                            <td>#1</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr>
                        <tr>
                            <td>#1</td>
                            <td>Hamiltionian</td>
                            <td>80</td>
                            <td>230</td>
                            <td>30.5</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )

    }

}
export default ScoreBoard;

