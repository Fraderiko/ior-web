import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import FileInput from '@ranyefet/react-file-input';
import api from '../api/api.jsx'
import Message from './Message.js';

class Chatroom extends React.Component {
    constructor(props) {
        super(props);

        var socket = this.props.socket

        var that = this

        this.state = {
            messages: this.props.messages || []
        }

        socket.on('event', function (message) {
            that.setState({
                messages: that.state.messages.concat([message])
            });
        })

        this.submitMessage = this.submitMessage.bind(this);

    }

    componentDidMount() {
        this.scrollToBot();
    }

    componentDidUpdate() {
        this.scrollToBot();
    }

    componentWillReceiveProps(){
        this.scrollToBot()
    }

    scrollToBot() {
        ReactDOM.findDOMNode(this.refs.chats).scrollTop = ReactDOM.findDOMNode(this.refs.chats).scrollHeight;
    }

    submitMessage(e) {
        e.preventDefault();

        if (ReactDOM.findDOMNode(this.refs.msg).value == "") {
            return
        }

        var message = { order: this.props.order, date: new Date().getTime(), username: this.props.username, type: "TEXT", value: ReactDOM.findDOMNode(this.refs.msg).value }
        this.props.socket.emit('message', message)

        ReactDOM.findDOMNode(this.refs.msg).value = "";

    }

    handleFileChanged(e) {
        console.log('Selected file:', e.target.files[0]);

        var form = new FormData()
        form.append('file', e.target.files[0])

        var that = this

        api.upload(form).then(function (response) {
            var message = { order: that.props.order, date: new Date().getTime(), username: that.props.username, type: "IMAGE", value: response[0].url }
            that.props.socket.emit('message', message)
        }, function () {

        })
    }

    handleVideoFileChanged(e) {
        console.log('Selected file:', e.target.files[0]);

        var form = new FormData()
        form.append('file', e.target.files[0])

        var that = this

        api.upload(form).then(function (response) {
            var message = { order: that.props.order, date: new Date().getTime(), username: that.props.username, type: "VIDEO", value: response[0].url }
            that.props.socket.emit('message', message)
        }, function () {

        })
    }

    makeKey() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        
        return text;
    }

    render() {
        const username = this.props.username
        const { messages } = this.props;

        return (
            <div className="chatroom">
                <h3>Чат по заказу</h3>
                <ul className="chats" ref="chats">
                    {   
                        messages.map((message, index) => <Message key={this.makeKey()} message={message} user={username} />)
                    }
                </ul>
                <form className="input" onSubmit={(e) => this.submitMessage(e)}>
                    <input type="text" ref="msg" />
                    <input type="submit" value="Отправить" />
                    <FileInput accept={"image/*"} onChange={this.handleFileChanged.bind(this)}>
                        <img width="30" height="30" src="./static/photo.png" />
                    </FileInput>
                    <FileInput accept={"video/mp4"} onChange={this.handleVideoFileChanged.bind(this)}>
                        <img width="30" height="30" src="./static/video.png" />
                    </FileInput>
                </form>
            </div>
        );
    }
}

export default Chatroom;