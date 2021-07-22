import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import './Settings.css'
function Settings(props) {
  console.log("rendering setting")
  return (
    <div style={{
      flex: '1',
      width: '100%',
      padding:'10px 20px',
      display:'flex',
      justifyContent:'space-evenly',
      backgroundColor: 'rgba(255,255,255,0.50)'
    }}>

      <div className="select-algorithm ">
        <h3>Select Speed</h3>
        <input type="range" min="1" max="1000" defaultValue="500" id="id1"></input>
      </div>
      <div className="select-algorithm">
        <h3>Algoritmh</h3>
        <label className="setting-algorithm-radio-container" >Human
          <input type="radio" name="radio" defaultChecked/>
          <span className="checkmark"></span>
        </label>
        <label className="setting-algorithm-radio-container">A*
          <input type="radio" name="radio" />
          <span className="checkmark"></span>
        </label>
        <label className="setting-algorithm-radio-container">Hamiltonian
          <input type="radio" name="radio" />
          <span className="checkmark"></span>
        </label>
        <label className="setting-algorithm-radio-container">Smart Hamiltonian
          <input type="radio" name="radio" />
          <span className="checkmark"></span>
        </label>
        <label className="setting-algorithm-radio-container">Neural Net
          <input type="radio" name="radio" />
          <span className="checkmark"></span>
        </label>

      </div>
    </div>
  )
}

export default Settings

