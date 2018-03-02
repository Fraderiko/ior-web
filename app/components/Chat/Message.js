import React from 'react';
import config from '../../../config'
import Lightbox from 'react-images'
import { Player } from 'video-react'
import ReactDOM from 'react-dom';
import './App.css';
import VideoLightBox from '../VideoLightBox'
import BodyEnd from '../BodyEnd'
import Moment from 'moment'
import api from '../api/api'

class Message extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            lightboxIsOpen: false,
            videoLightboxIsOpen: false
        }

        api.getUser(this.props.message.username).then((user) => {
            this.setState({username: user.name})
        })
    }

    onClose() {
        this.setState({
            lightboxIsOpen: false
        })
    }

    onImageClick() {
        this.setState({
            lightboxIsOpen: true
        })
    }

    onVideoClick() {
        this.setState({
            videoLightboxIsOpen: true
        })
    }

    onVideoClose() {
        var that = this
        return function () {
            that.setState({
                videoLightboxIsOpen: false
            })
        }
    }

    render() {
        switch (this.props.message.type) {
            case 'TEXT':
                return (
                <li className={`chat ${this.props.user === this.props.message.username ? "right" : "left"}`}>
                    <b>{this.state.username}</b>
                    <br/>
                    {this.props.user !== this.props.message.username}
                    {this.props.message.value}
                    <br/>
                    <i>{Moment.unix(this.props.message.date / 1000).locale('ru').format('HH:mm DD MMMM')}</i>
                </li>
                )
            case 'IMAGE':
                return (
                    <li className={`chat ${this.props.user === this.props.message.username ? "right" : "left"}`}>
                        <b>{this.state.username}</b>
                        <br/>
                        <img onClick={this.onImageClick.bind(this)} className="cover" src={config.host + this.props.message.value} />
                        <Lightbox isOpen={this.state.lightboxIsOpen} onClose={this.onClose.bind(this)} currentImage={0} images={[{ src: this.props.message.value }]} />
                    </li>
                )
            case 'VIDEO':
                return (
                    <li className={`chat ${this.props.user === this.props.message.username ? "right" : "left"}`}>
                    <b>{this.state.username}</b>
                        <br/>
                        <img onClick={this.onVideoClick.bind(this)} className="cover" src={"./static/play_video.jpg"} />
                        <BodyEnd><VideoLightBox isOpen={this.state.videoLightboxIsOpen} onClose={this.onVideoClose.bind(this)} url={this.props.message.value} /></BodyEnd>
                    </li>
                )
        }
    }

}

export default Message;