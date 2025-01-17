import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Display from "./Components/Display";
import Login from "./Pages/Login"
import App from "./App"

ReactDOM.render(
  <>
  <App/>
  </>,
  document.getElementById('root')
);

export {Login, Display}