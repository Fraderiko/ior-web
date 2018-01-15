import React, { Component } from 'react';
import './App.css';

import Chatroom from './Chatroom.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Chatroom order={this.props.order} username={this.props.username} socket={this.props.socket} messages={this.props.messages} />
      </div>
    );
  }
}

export default App;
