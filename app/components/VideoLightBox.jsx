import React from 'react';
import { Player } from 'video-react'
import ReactDOM from 'react-dom';

class VideoLightBox extends React.Component {
    
        render() {
            if (this.props.isOpen == true) {
                return (
                    <div className="lightbox">
                        <button onClick={this.props.onClose()} className="close_1fc7pjq">Закрыть</button>
                        <div className="lightbox-content"><Player playsInline={true} fluid={false} src={this.props.url} width={410} height={280} /></div>
                    </div >
                )
            } else {
                return null
            }
        }
    }

export default VideoLightBox