import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Participant from './pages/participant';
import Admin from './pages/admin';
import {BrowserRouter, Switch, Route} from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
      <Switch>
          <Route path="/" exact component={Participant} />
          <Route path="/administrador" component={Admin} />
      </Switch>   
  </BrowserRouter>,
  document.getElementById('root')
);