import React, { useCallback, useEffect, useRef, useState } from 'react';
import SnakeGame from '../../game/controls/SnakeGame';
import Algorithm from '../../game/game-utils/Algorithm';
import HumanPlayer from '../../game/players/HumanPlayer';
import GameOver from '../GameOver/GameOver';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import Settings from '../Settings/Settings';
import SnakeBoard from '../SnakeBoard/SnakeBoard';
import './SnakeGameUI.css';

const BOARD_SIZE = 21;
const DEFAULT_SPEED = 500;

function SnakeGameUI() {
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentAlgorithm, setCurrentAlgorithm] = useState<Algorithm>(Algorithm.HUMAN);
    const [gameOverStats, setGameOverStats] = useState({
        algorithm: 'Human',
        score: 0,
        avgSteps: -1,
    });

    const boardRef = useRef<SnakeBoard>(null);
    const scoreBoardRef = useRef<ScoreBoard>(null);
    const snakeGameRef = useRef<SnakeGame | null>(null);

    const handleGameOver = useCallback((gameOver: boolean) => {
        if (gameOver && scoreBoardRef.current) {
            const stats = scoreBoardRef.current.getCurrentStats();
            setGameOverStats({
                algorithm: stats.algorithm,
                score: stats.score,
                avgSteps: stats.avgSteps,
            });
        }
        setIsGameOver(gameOver);
    }, []);

    const setAlgorithm = useCallback((algorithm: Algorithm) => {
        setCurrentAlgorithm(algorithm);
        if (scoreBoardRef.current) {
            scoreBoardRef.current.setAlgorithm(algorithm);
        }
        if (snakeGameRef.current) {
            snakeGameRef.current.setPlayer(algorithm);
        }
    }, []);

    const changeVisualize = useCallback(() => {
        if (snakeGameRef.current) {
            snakeGameRef.current.getPlayer().changeVisualize();
        }
    }, []);

    const setSpeed = useCallback((speed: number) => {
        if (snakeGameRef.current) {
            snakeGameRef.current.setSpeed(speed / 10);
        }
    }, []);

    const restartGameCallback = useCallback(() => {
        setIsGameOver(false);
        if (snakeGameRef.current) {
            snakeGameRef.current.initializeGame();
        }
    }, []);

    const clearScoreBoard = useCallback(() => {
        if (scoreBoardRef.current) {
            scoreBoardRef.current.clearScoreBoard();
        }
    }, []);

    // Initialize Game engine and clean up on unmount
    useEffect(() => {
        const game = new SnakeGame(
            BOARD_SIZE,
            BOARD_SIZE,
            DEFAULT_SPEED,
            boardRef,
            scoreBoardRef,
            new HumanPlayer(),
            handleGameOver
        );
        snakeGameRef.current = game;

        return () => {
            game.destroy();
            snakeGameRef.current = null;
        };
    }, [handleGameOver]);

    // Handle Enter key for game resume
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && snakeGameRef.current) {
                snakeGameRef.current.resume();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    const propsBoard = { rows: BOARD_SIZE, columns: BOARD_SIZE, speed: DEFAULT_SPEED };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#578A34'
        }}>
            <div className='container'>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'rgba(255,255,255,0.30)'
                }}>
                    <div style={{
                        display: 'flex',
                        top: '1em',
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.60)',
                        justifyContent: 'center',
                        alignContent: 'center'
                    }}>
                        <h1 style={{
                            fontFamily: 'Black Ops One, cursive',
                            flex: 8, textAlign: 'center'
                        }}>Snake Game AI</h1>
                    </div>
                    <ScoreBoard ref={scoreBoardRef} algorithm={currentAlgorithm} />
                    <Settings setAlgorithm={setAlgorithm} setSpeed={setSpeed} changeVisualize={changeVisualize} />
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%'
                }}>
                    <SnakeBoard ref={boardRef} {...propsBoard} />
                </div>
            </div>
            <GameOver
                show={isGameOver}
                restartGameCallback={restartGameCallback}
                clearScoreBoard={clearScoreBoard}
                algorithm={gameOverStats.algorithm}
                score={gameOverStats.score}
                avgSteps={gameOverStats.avgSteps}
            />
        </div>
    );
}

export default SnakeGameUI;
