import React from 'react';
import './App.css';
import Home from './components/Home/Home';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Info from './components/Info/Info';

function App() {

  return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route
            path="/info"
            component={Info} />
          <Route
            path="/"
            component={Home} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}


export default App;
