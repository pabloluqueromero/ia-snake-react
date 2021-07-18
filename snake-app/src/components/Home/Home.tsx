import React from 'react';
import NavBar from '../NavBar/NavBar';
import SnakeBoard from '../SnakeBoard/SnakeBoard';


class Home extends React.Component {

  render() {
    let size = 20;
    let speed = 100;
    let props = {rows:size, columns:size,speed :speed};
    return (
      <div style = {{
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        height:'100vh',
        width:'100vw'
      }}>
      <NavBar></NavBar>
      <SnakeBoard {...props}></SnakeBoard>
      </div>
    );
  }
}

export default Home;
