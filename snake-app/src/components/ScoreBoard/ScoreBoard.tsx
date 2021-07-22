import React from 'react'
import './ScoreBoard.css'
function ScoreBoard(props) {
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


export default ScoreBoard;

