import React, { useState } from 'react';
import { DQNTelemetry } from '../../game/players/DQNPlayer';
import './DQNHUD.css';

interface DQNHUDProps {
    telemetry: DQNTelemetry | null;
    onEpsilonChange?: (epsilon: number) => void;
}

const ACTION_LABELS = ['Straight', 'Turn Right', 'Turn Left'];

export const DQNHUD: React.FC<DQNHUDProps> = ({ telemetry, onEpsilonChange }) => {
    const [epsilon, setEpsilon] = useState(0.0);

    const handleEpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setEpsilon(val);
        if (onEpsilonChange) {
            onEpsilonChange(val);
        }
    };

    if (!telemetry) {
        return (
            <div className="dqn-card">
                <div className="dqn-header">
                    <span className="control-label">
                        <i className="fas fa-network-wired"></i> DQN Model Telemetry
                    </span>
                    <span className="speed-badge">Ready</span>
                </div>
                <div className="dqn-placeholder">
                    Start game to visualize live inference
                </div>
            </div>
        );
    }

    const { qValues, chosenAction, dangers, distanceToFood } = telemetry;

    const maxQ = Math.max(...qValues, 0.1);
    const minQ = Math.min(...qValues, 0.0);
    const range = Math.max(maxQ - minQ, 0.001);

    return (
        <div className="dqn-card">
            <div className="dqn-header">
                <span className="control-label">
                    <i className="fas fa-network-wired"></i> DQN Model Telemetry
                </span>
                <span className="speed-badge">
                    {telemetry.isExploring ? 'Exploring' : 'Live Inference'}
                </span>
            </div>

            {/* Q-Values Breakdown */}
            <div className="control-group">
                <div className="control-header">
                    <span className="control-sublabel">Action Q-Values</span>
                    <span className="control-sublabel">Apple Dist: {distanceToFood}</span>
                </div>
                <div className="dqn-qbars-list">
                    {qValues.map((q, idx) => {
                        const isChosen = idx === chosenAction;
                        const normalizedWidth = Math.max(8, Math.min(100, ((q - minQ) / range) * 100));

                        return (
                            <div key={idx} className={`dqn-qbar-row ${isChosen ? 'chosen' : ''}`}>
                                <span className="dqn-action-name">{ACTION_LABELS[idx]}</span>
                                <div className="dqn-bar-track">
                                    <div
                                        className="dqn-bar-fill"
                                        style={{ width: `${normalizedWidth}%` }}
                                    />
                                </div>
                                <span className="dqn-q-number">{q.toFixed(2)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sensor Radar */}
            <div className="control-group">
                <span className="control-sublabel">Obstacle Sensors</span>
                <div className="dqn-sensor-row">
                    <div className={`dqn-sensor-chip ${dangers[2] ? 'danger' : 'clear'}`}>
                        <span>Left</span>
                        <strong>{dangers[2] ? 'Blocked' : 'Clear'}</strong>
                    </div>
                    <div className={`dqn-sensor-chip ${dangers[0] ? 'danger' : 'clear'}`}>
                        <span>Ahead</span>
                        <strong>{dangers[0] ? 'Blocked' : 'Clear'}</strong>
                    </div>
                    <div className={`dqn-sensor-chip ${dangers[1] ? 'danger' : 'clear'}`}>
                        <span>Right</span>
                        <strong>{dangers[1] ? 'Blocked' : 'Clear'}</strong>
                    </div>
                </div>
            </div>

            {/* Exploration Rate */}
            <div className="control-group">
                <div className="control-header">
                    <span className="control-sublabel">Exploration Rate (ε)</span>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>
                        {epsilon.toFixed(2)}
                    </span>
                </div>
                <div className="slider-wrapper">
                    <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={epsilon}
                        className="custom-range"
                        onChange={handleEpsChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default DQNHUD;
