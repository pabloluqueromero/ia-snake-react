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
            <div className="dqn-hud-container">
                <div className="dqn-hud-header">
                    <span className="dqn-hud-title">🤖 Neural Net (DQN)</span>
                    <span className="dqn-badge">Standby</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center', margin: '4px 0' }}>
                    Press ENTER or Start to begin DQN inference
                </p>
            </div>
        );
    }

    const { qValues, chosenAction, dangers, foodRelative, distanceToFood, isExploring } = telemetry;

    // Normalize Q-values for visual progress bars
    const maxQ = Math.max(...qValues, 0.1);
    const minQ = Math.min(...qValues, 0.0);
    const range = Math.max(maxQ - minQ, 0.001);

    return (
        <div className="dqn-hud-container">
            <div className="dqn-hud-header">
                <span className="dqn-hud-title">🤖 Neural Net (DQN)</span>
                <span className={`dqn-badge ${isExploring ? 'exploring' : ''}`}>
                    {isExploring ? 'Exploration' : 'TensorFlow Inference'}
                </span>
            </div>

            {/* Q-Values Section */}
            <div className="dqn-qvalues-section">
                <div className="dqn-section-title">Action Q-Values (Predicted Return)</div>
                {qValues.map((q, idx) => {
                    const isChosen = idx === chosenAction;
                    const normalizedWidth = Math.max(5, Math.min(100, ((q - minQ) / range) * 100));

                    return (
                        <div key={idx} className="dqn-qbar-row">
                            <span className="dqn-qbar-label">{ACTION_LABELS[idx]}</span>
                            <div className="dqn-qbar-track">
                                <div
                                    className={`dqn-qbar-fill ${isChosen ? 'active' : ''}`}
                                    style={{ width: `${normalizedWidth}%` }}
                                />
                            </div>
                            <span className={`dqn-qbar-val ${isChosen ? 'active' : ''}`}>
                                {q.toFixed(2)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Sensor & Environmental Features */}
            <div className="dqn-sensors-grid">
                <div className="dqn-sensor-block">
                    <div className="dqn-section-title">Danger Radar</div>
                    <div className="dqn-radar-row">
                        <span className={`dqn-sensor-pill ${!dangers[2] ? 'clear' : ''}`}>
                            L: {!dangers[2] ? 'Clear' : 'Danger'}
                        </span>
                        <span className={`dqn-sensor-pill ${!dangers[0] ? 'clear' : ''}`}>
                            S: {!dangers[0] ? 'Clear' : 'Danger'}
                        </span>
                        <span className={`dqn-sensor-pill ${!dangers[1] ? 'clear' : ''}`}>
                            R: {!dangers[1] ? 'Clear' : 'Danger'}
                        </span>
                    </div>
                </div>

                <div className="dqn-sensor-block">
                    <div className="dqn-section-title">Apple Sensor (Dist: {distanceToFood})</div>
                    <div className="dqn-radar-row">
                        {foodRelative.up && <span className="dqn-sensor-pill clear">↑ North</span>}
                        {foodRelative.down && <span className="dqn-sensor-pill clear">↓ South</span>}
                        {foodRelative.left && <span className="dqn-sensor-pill clear">← West</span>}
                        {foodRelative.right && <span className="dqn-sensor-pill clear">→ East</span>}
                    </div>
                </div>
            </div>

            {/* Live Epsilon / Exploration Tuning */}
            <div>
                <div className="dqn-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Exploration Rate (ε):</span>
                    <span style={{ color: '#38bdf8' }}>{epsilon.toFixed(2)}</span>
                </div>
                <div className="dqn-epsilon-slider">
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Greedy (0.0)</span>
                    <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={epsilon}
                        onChange={handleEpsChange}
                    />
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Explore (1.0)</span>
                </div>
            </div>
        </div>
    );
};

export default DQNHUD;
