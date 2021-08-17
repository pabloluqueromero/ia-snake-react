import React from 'react';
import './Settings.css';
import Algorithm from '../../game/game-utils/Algorithm';
function Settings(props: { setAlgorithm: (algorithm:Algorithm) => void,
                           setSpeed: (speed:number) => void,
                           changeVisualize: () => void}) {
  return (
    <div style={{
      flex: '1',
      width: '100%',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-evenly',
      backgroundColor: 'rgba(255,255,255,0.50)',
      position:'relative'
    }}>

      <div className="select-algorithm ">
        <h3>Select Speed</h3>
        <input type="range" min="1" max="1000" defaultValue="500" onChange={(e)=>props.setSpeed(1000-e.currentTarget.valueAsNumber)}></input>
      </div>
      <div className="select-algorithm ">
        <h3>Visualize</h3>
        <input type="checkbox" defaultChecked onChange={(e)=> {props.changeVisualize()}}></input>
      </div>
      <div className="select-algorithm">
        <h3>Algorithm</h3>
        <label className="setting-algorithm-radio-container" >Human
          <input type="radio" name="radio" defaultChecked onChange={(e) => { if ('on' === e.currentTarget.value) { props.setAlgorithm(Algorithm.HUMAN) } }} />
          <span className="checkmark"></span>
        </label>
        <label className="setting-algorithm-radio-container">A*
          <input type="radio" name="radio" onChange={(e) => { if ('on' === e.currentTarget.value) { props.setAlgorithm(Algorithm.ASTAR) } }} />
          <span className="checkmark"></span>
        </label>
        {/* <label className="setting-algorithm-radio-container">Hamiltonian
          <input type="radio" name="radio" disabled={true} onChange={(e) => { if ('on' === e.currentTarget.value) { props.setAlgorithm(Algorithm.HAMILTONIANCYCLE) } }} />
          <span className="checkmark"></span>
        </label>
        <label className="setting-algorithm-radio-container">Smart Hamiltonian
          <input type="radio" name="radio" disabled={true} onChange={(e) => { if ('on' === e.currentTarget.value) { props.setAlgorithm(Algorithm.ASTAR) } }} />
          <span className="checkmark"></span>
        </label>
        <label className="setting-algorithm-radio-container" >Neural Net
          <input type="radio" name="radio" disabled={true} onChange={(e) => { if ('on' === e.currentTarget.value) { props.setAlgorithm(Algorithm.ASTAR) } }} />
          <span className="checkmark"></span>
        </label> */}

      </div>

      <div className="instructions">
        Press ENTER to start playing
      </div>
    </div>
  )
}

export default Settings

