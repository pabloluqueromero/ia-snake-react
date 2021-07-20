import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './components/Home/Home';
import GameOver from './components/GameOver/GameOver';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route
            path="/home"
            component={Home} />
          <Route
            path="/gameOver"
            render={GameOver} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}


export default App;
