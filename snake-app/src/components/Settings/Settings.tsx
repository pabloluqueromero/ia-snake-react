import React, { useState } from 'react';
import './Settings.css';
import Algorithm from '../../game/game-utils/Algorithm';

interface SettingsProps {
  currentAlgorithm?: Algorithm;
  setAlgorithm: (algorithm: Algorithm) => void;
  setSpeed: (speed: number) => void;
  changeVisualize: () => void;
}

function Settings(props: SettingsProps) {
  const activeAlg = props.currentAlgorithm !== undefined ? props.currentAlgorithm : Algorithm.HUMAN;
  const [speedVal, setSpeedVal] = useState<number>(500);
  const [visualize, setVisualize] = useState<boolean>(true);

  const handleAlgChange = (alg: Algorithm) => {
    props.setAlgorithm(alg);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.valueAsNumber;
    setSpeedVal(val);
    props.setSpeed(1000 - val);
  };

  const handleVisualizeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualize(e.target.checked);
    props.changeVisualize();
  };

  const getSpeedLabel = (val: number) => {
    if (val >= 800) return '⚡ Turbo';
    if (val >= 600) return '🚀 Fast';
    if (val >= 400) return '🎯 Normal';
    return '🐢 Slow';
  };

  return (
    <div className="settings-deck">
      {/* Algorithm Selection Segmented Control */}
      <div className="control-group">
        <label className="control-label">Algorithm</label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segment-btn ${activeAlg === Algorithm.HUMAN ? 'active' : ''}`}
            onClick={() => handleAlgChange(Algorithm.HUMAN)}
          >
            <i className="fas fa-gamepad"></i>
            <span>Human</span>
          </button>
          <button
            type="button"
            className={`segment-btn ${activeAlg === Algorithm.ASTAR ? 'active' : ''}`}
            onClick={() => handleAlgChange(Algorithm.ASTAR)}
          >
            <i className="fas fa-brain"></i>
            <span>A* AI</span>
          </button>
          <button
            type="button"
            className={`segment-btn ${activeAlg === Algorithm.DQN ? 'active' : ''}`}
            onClick={() => handleAlgChange(Algorithm.DQN)}
          >
            <i className="fas fa-network-wired"></i>
            <span>DQN AI</span>
          </button>
        </div>
      </div>

      {/* Speed Slider */}
      <div className="control-group">
        <div className="control-header">
          <label className="control-label">Game Speed</label>
          <span className="speed-badge">{getSpeedLabel(speedVal)}</span>
        </div>
        <div className="slider-wrapper">
          <input
            type="range"
            min="100"
            max="950"
            value={speedVal}
            className="custom-range"
            onChange={handleSpeedChange}
          />
        </div>
      </div>

      {/* Visualization Toggle */}
      <div className="control-group toggle-group">
        <div className="toggle-info">
          <span className="control-label">Search Visualization</span>
          <span className="control-sublabel">Render path and search heuristics</span>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={visualize}
            onChange={handleVisualizeToggle}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );
}

export default Settings;
