import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
    const [isMoving, setIsMoving] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [currentAlgorithm, setCurrentAlgorithm] = useState<Algorithm>(Algorithm.HUMAN);
    const [gameOverStats, setGameOverStats] = useState({
        algorithm: 'Human',
        score: 0,
        avgSteps: -1,
    });

    const boardRef = useRef<SnakeBoard>(null);
    const scoreBoardRef = useRef<ScoreBoard>(null);
    const snakeGameRef = useRef<SnakeGame | null>(null);

    // Sync theme with document attribute
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleGameOver = useCallback((gameOver: boolean, stats?: { algorithm: string, score: number, steps: number, avgSteps: number }) => {
        if (gameOver && stats) {
            setGameOverStats({
                algorithm: stats.algorithm,
                score: stats.score,
                avgSteps: stats.avgSteps,
            });
        }
        setIsGameOver(gameOver);
        setIsMoving(false);
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

    const togglePlayPause = useCallback(() => {
        if (!snakeGameRef.current || isGameOver) return;
        if (snakeGameRef.current.isSnakeMoving()) {
            snakeGameRef.current.pause();
            setIsMoving(false);
        } else {
            snakeGameRef.current.resume();
            setIsMoving(true);
        }
    }, [isGameOver]);

    const restartGameCallback = useCallback(() => {
        setIsGameOver(false);
        if (snakeGameRef.current) {
            snakeGameRef.current.initializeGame();
            snakeGameRef.current.resume();
            setIsMoving(true);
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

    // Handle Enter / Space keys for game controls
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (isGameOver) {
                    restartGameCallback();
                } else if (snakeGameRef.current && !isGameOver) {
                    snakeGameRef.current.resume();
                    setIsMoving(true);
                }
            } else if (e.code === 'Space') {
                e.preventDefault();
                if (isGameOver) {
                    restartGameCallback();
                } else {
                    togglePlayPause();
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isGameOver, restartGameCallback, togglePlayPause]);

    const propsBoard = { rows: BOARD_SIZE, columns: BOARD_SIZE, speed: DEFAULT_SPEED };

    return (
        <div className="game-app-layout">
            {/* Top Navigation Header */}
            <header className="game-nav-header">
                <div className="nav-brand">
                    <div className="brand-icon">
                        <i className="fas fa-dragon"></i>
                    </div>
                    <div className="brand-text">
                        <h1>Snake AI</h1>
                        <span className="brand-subtitle">Search & Pathfinding Visualizer</span>
                    </div>
                </div>

                <div className="nav-actions">
                    <div className={`status-pill ${isGameOver ? 'status-over' : isMoving ? 'status-active' : 'status-paused'}`}>
                        <span className="status-dot"></span>
                        <span>{isGameOver ? 'Game Over' : isMoving ? 'Running' : 'Ready / Paused'}</span>
                    </div>
                    <button
                        type="button"
                        className="nav-link-btn theme-toggle-btn"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'light' ? 'Dark' : 'Classic Light'} Theme`}
                    >
                        <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                        <span>{theme === 'light' ? 'Dark Mode' : 'Classic Theme'}</span>
                    </button>
                    <Link to="/info" className="nav-link-btn" title="About & Documentation">
                        <i className="fas fa-info-circle"></i>
                        <span>Info</span>
                    </Link>
                    <a
                        href="https://github.com/pabloluqueromero/ia-snake-react"
                        target="_blank"
                        rel="noreferrer"
                        className="nav-link-btn"
                        title="GitHub Repository"
                    >
                        <i className="fab fa-github"></i>
                    </a>
                </div>
            </header>

            {/* Main Stage Grid */}
            <main className="game-main-content">
                {/* Left Panel: Board & Game Action Controls */}
                <section className="board-section">
                    <div className="board-frame-container">
                        <SnakeBoard ref={boardRef} {...propsBoard} />
                    </div>

                    <div className="board-action-bar">
                        <button
                            type="button"
                            className={`action-btn ${isMoving ? 'btn-pause' : 'btn-play'}`}
                            onClick={togglePlayPause}
                        >
                            <i className={`fas ${isMoving ? 'fa-pause' : 'fa-play'}`}></i>
                            <span>{isMoving ? 'Pause' : 'Start / Resume'}</span>
                        </button>
                        <button
                            type="button"
                            className="action-btn btn-restart"
                            onClick={restartGameCallback}
                        >
                            <i className="fas fa-undo-alt"></i>
                            <span>Restart</span>
                        </button>
                        <span className="keyboard-tip">
                            <i className="fas fa-keyboard"></i> Space / Enter / WASD
                        </span>
                    </div>
                </section>

                {/* Right Panel: Settings Deck & Live Scoreboard */}
                <aside className="control-sidebar">
                    <Settings
                        currentAlgorithm={currentAlgorithm}
                        setAlgorithm={setAlgorithm}
                        setSpeed={setSpeed}
                        changeVisualize={changeVisualize}
                    />
                    <ScoreBoard
                        ref={scoreBoardRef}
                        algorithm={currentAlgorithm}
                    />
                </aside>
            </main>

            {/* Game Over Modal */}
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
