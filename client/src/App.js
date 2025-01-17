import React, { useEffect, useState } from 'react';
import './App.css';
import Display from "./Components/Display";
import Login from "./Pages/Login";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import alertSound from './Resources/notification_simple-01.wav';
import { nextWednesday } from 'date-fns';

const key = require('./api-key.json')

async function getAlerts(userId) {
  return fetch ('http://localhost:3001/api/alerts/' + userId, {
      method: 'GET',
      credentials : 'include',
      headers: {
          'Content-Type': 'application/json',
      }
  })
      .then(data => data.json())
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') === 'true');
  const [alerts, setAlerts] = useState([]);
  var audio = new Audio(alertSound);
  audio.volume = 0.1;

  const getAlertsAtLogin = async e => {
    const userAlerts = await getAlerts(localStorage.getItem('user_id'));
    setAlerts(userAlerts);
  }

  const deleteAlert = (alert) => {
    const newArray = alerts.filter(item => item !== alert)
    setAlerts(newArray);
  }


  useEffect(() => {
    document.title = "Project Miyagi"
    if (token) {

      // Connect to the socket
      const client = new W3CWebSocket('ws://localhost:3002');

      getAlertsAtLogin();
      

      // Send the user's ID over the socket so the socket knows to store the connection with the ID
      client.onopen = () => {
        var obj = {
          "type": "onfirstlogin",
          "id": localStorage.getItem('user_id')
        }
        client.send(JSON.stringify(obj))
      }

      // Whenever we get a message over the socket connection, parse it and take appropriate actions
      client.onmessage = (message) => {
        var alert = JSON.parse(message.data)
        var addAlert = true
        if (alert.type === 5) {
          var user = alert.sender
          if (user === localStorage.getItem('mentorId')) {
            localStorage.setItem('mentorId', 'null')
            localStorage.setItem('mentorStatus', 'null')
          }
          else {
            var menteeArray = JSON.parse(localStorage.getItem('mentees'))
            menteeArray.splice(menteeArray.indexOf({"mentee": user}), 1)
            localStorage.setItem('mentees', JSON.stringify(menteeArray))
          }
          addAlert = false;
        }
        else if (alert.type === 15) {
          var menteeArray = JSON.parse(localStorage.getItem('mentees'))
          menteeArray.push({"mentee": alert.sender})
          localStorage.setItem('mentees', JSON.stringify(menteeArray))
          addAlert = false;
        }
        if (addAlert) {
          setAlerts(oldArray => [...oldArray, alert]);
          audio.play()
        }
        
      }

    }
    else {
      setToken(false);
    }
  }, [token])

  return (
    <>
      {!token && <Login setToken={(tokenValue) => {setToken(tokenValue)}}/>}
      {token && <Display setToken={(tokenValue) => {setToken(tokenValue)}} getAlerts={alerts} deleteAlert={deleteAlert}/>}
    </>
  );
}

export default App;
 

