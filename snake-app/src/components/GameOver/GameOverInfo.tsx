import React from 'react'
import './GameOverInfo.css'
function GameOverInfo(props : {title: string, content: string}) {

    return (
        <div className="game-over-info-container">
        <div className="game-over-info-title">{props.title}</div>
        <div className="game-over-info-content">{props.content}</div>
        </div>
    )
}

export default GameOverInfo

