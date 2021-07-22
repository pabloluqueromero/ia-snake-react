import React from 'react';
import './NavBar.css'

class NavBar extends React.Component {

  render() {
    return (<div className="nav">
      <div className="nav-container">
        <button className="nav-container-element" >Home</button>
        <button className="nav-container-element">Algorithm</button>
        <button className="nav-container-element">Speed</button>
        <button className="nav-container-element">Reset</button>
        <button className="nav-container-element">Visualize</button>
        <button className="nav-container-element">Info</button>
      </div>
    </div>);
  }
}

export default NavBar;
