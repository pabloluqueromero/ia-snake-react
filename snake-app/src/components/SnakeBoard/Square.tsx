import React from 'react';
import './SnakeBoard'
class Square extends React.Component<{},{classNames: string[]}>{
  
  constructor(props : {classNames: string[]}){
      super(props);
      this.state = {classNames: props.classNames};
  }

  changeColor(classNames:string[]){
      this.setState({classNames: classNames})
  }
  render(){
      return <div className={this.state.classNames.join(" ")}/>
  } 
}
export default Square;
