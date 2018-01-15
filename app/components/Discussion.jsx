var React = require('react');
var createReactClass = require('create-react-class');
var FileInput = require('@ranyefet/react-file-input');
var Message = require('./Chat/Message').default;
var api = require('./api/api');
var Dropzone = require('react-dropzone').default
var { Player } = require('video-react');
var Lightbox = require('react-images').default;
var BodyEnd = require('./BodyEnd').default;
var VideoLightBox = require('./VideoLightBox').default;
var Moment = require('moment');

var Alert = require('react-s-alert').default;

require('./Chat/App.css')

require('react-s-alert/dist/s-alert-default.css');
require('react-s-alert/dist/s-alert-css-effects/slide.css');

var Discussion = createReactClass({
    getInitialState: function () {
        return {
            discussion: [],
            video_media: [],
            image_media: [],
        }
    },
    submitHandler: function (e) {
        e.preventDefault();

        var that = this

        if (this.refs.msg.value == "") {
            Alert.error('Ошибка! Сообщение не может быть пустым', {
                position: 'top',
                effect: 'slide',
                timeout: 10000
              });
              return
        }

        var discussion = {
            date: new Date().getTime(),
            message: this.refs.msg.value,
            author: this.props.author,
            image_media: this.state.image_media.map(function (item) { return item.url }),
            video_media: this.state.video_media.map(function (item) { return item.url })
        }

        var object = {
            _id: this.props.order._id,
            discussion: discussion
        }

        api.sendDiscussion(object).then(function() {
            Alert.success('Сообщение отпавлено', {
                position: 'top',
                effect: 'slide',
                timeout: 3000
              });
            that.props.discussionSent()
            that.refs.msg.value = ""
            that.setState({
                video_media: [],
                image_media: []
            })
        }, function () {

        })
    },

    prepareVideoField: function () {
        var that = this

        function onDrop(accepted, rejected) {

            var video_media = that.state.video_media
            var form = new FormData()

            accepted.forEach(function (item) {
                form.append('file', item)
            })

            that.setState({
                isLoading: true
            })


            api.upload(form).then(function (response) {
                response.forEach(function (item) {
                    var file = {
                        url: item.url,
                        _id: item._id
                    }
                    video_media.push(file)
                })

                that.setState({
                    video_media: video_media,
                    isLoading: false
                })
            }, function () {

            })
        }

        function deleteHandler(index) {
            return function () {
                var video_media = that.state.video_media
                var file = that.state.video_media[index]
                api.deleteUpload(file).then(function () {
                    video_media.splice(index, 1)
                    that.setState({
                        video_media: video_media
                    })
                }, function () {

                })
            }
        }

        function preview() {
            if (that.state.video_media != undefined) {
                var array = []
                for (var i = 0; i < that.state.video_media.length; i++) {
                    var file = that.state.video_media[i]
                    array.push(<div key={i} className="video-preview"><br /><Player playsInline={true} fluid={false} src={file.url} width={410} height={280} /><button onClick={deleteHandler(i)} className="btn btn-sm btn-danger">Удалить</button></div>)
                }
                return array
            }
        }
        return (
            <div key={'video-field'} className="form-group">
                <label>{name}</label>
                <Dropzone accept={"video/mp4"} className="filezone" onDrop={onDrop}>
                    <h7>Перенесите сюда видео, которые необходимо загрузить</h7>
                </Dropzone>
                <div className="image-container">
                    {this.loader()}
                    {preview()}
                </div>
            </div>
        )
    },

    prereImageField: function () {
        var that = this

        function onDrop(accepted, rejected) {
            var image_media = that.state.image_media

            var form = new FormData()

            accepted.forEach(function (item) {
                form.append('file', item)
            })

            api.upload(form).then(function (response) {

                response.forEach( function (item) {
                    image_media.push(item)
                })

                that.setState({
                    image_media: image_media,
                    isLoading: false
                })
            }, function () {

            })
        }

        function deleteHandler(index) {
            return function () {
                var image_media = that.state.image_media
                var file = that.state.image_media[index]
                api.deleteUpload(file).then(function () {
                    image_media.splice(index, 1)
                    that.setState({
                        image_media: image_media
                    })
                }, function () {

                })
            }
        }

        function preview() {
            if (that.state.image_media != undefined) {
                var array = []
                for (var i = 0; i < that.state.image_media.length; i++) {
                    var file = that.state.image_media[i]
                    array.push(<div key={i}><img className="img-preview" src={file.url} /><br /><button onClick={deleteHandler(i)} className="btn btn-sm btn-danger">Удалить</button></div>)
                }
                return array
            }
        }
        return (
            <div key={'image-field'} className="form-group">
                <label>{name}</label>
                <Dropzone className="filezone" onDrop={onDrop}>
                    <h7>Перенесите сюда фотографии, которые необходимо загрузить</h7>
                </Dropzone>
                <div className="image-container">
                    {this.loader()}
                    {preview()}
                </div>
            </div>
        )
    },
    loader: function () {
        if (this.state.isLoading) {
            return (
                <div key={'loader'} className="sk-circle">
                    <div className="sk-circle1 sk-child"></div>
                    <div className="sk-circle2 sk-child"></div>
                    <div className="sk-circle3 sk-child"></div>
                    <div className="sk-circle4 sk-child"></div>
                    <div className="sk-circle5 sk-child"></div>
                    <div className="sk-circle6 sk-child"></div>
                    <div className="sk-circle7 sk-child"></div>
                    <div className="sk-circle8 sk-child"></div>
                    <div className="sk-circle9 sk-child"></div>
                    <div className="sk-circle10 sk-child"></div>
                    <div className="sk-circle11 sk-child"></div>
                    <div className="sk-circle12 sk-child"></div>
                </div>
            )
        }
    },

    prepareMessages: function() {
        var that = this
        return this.props.order.discussion.map( function (discussion) { return <DiscussionMessage key={discussion._id} author={that.props.author} discussion={discussion}/> })
    },

    render: function () {
        return (
            <div>
                <h2>Обратная связь</h2>
                <div>
                    {this.prepareMessages()}
                </div>
                <form className="input" onSubmit={this.submitHandler}>
                    <textarea className="form-control" type="text" ref="msg" />
                    <br />
                    {this.prereImageField()}
                    {this.prepareVideoField()}
                    <input type="submit" value="Отправить" />
                </form>
                <Alert stack={{ limit: 3 }} />
            </div>
        )
    }
})

module.exports = Discussion

var DiscussionMessage = createReactClass({

    getInitialState: function () {
        return {
            lightboxIsOpen: false,
            videoLightboxIsOpen: false
        }
    },

    onClose: function () {
        var that = this
        return function () {
            that.setState({
                lightboxIsOpen: false
            })
            document.body.style = "";
        }
    },

    onImageClick: function (image) {
        var that = this
        return function() {
            that.setState({
                lightboxIsOpen: true,
                lightboxImage: image
            })
        }
    },

    onVideoClick: function(video) {
        var that = this
        return function() {
            that.setState({
                videoLightboxIsOpen: true,
                lightboxVideo: video
            })
        } 
    },

    onVideoClose: function() {
        var that = this
        return function() {
            that.setState({
                videoLightboxIsOpen: false
            })
        } 
    },

    onClickPrev: function() {

    },

    onClickNext: function() {

    },

    makeKey: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        
        return text;
    },

    render: function() {
        var that = this
        var array = []
        array.push(<li key={this.makeKey()} className={`noDot ${this.props.author != this.props.discussion.author ? "" : "right"}`}> <span className="discussionMessage">{this.props.discussion.message}</span></li>)
        
        if (this.props.discussion.image_media.length > 0) {
            array.push(this.props.discussion.image_media.map(function(image, index) {
                 return (
                 <li key={that.makeKey()} className={`noDot ${that.props.author != that.props.discussion.author ? "" : "right"}`}>
                    <img onClick={that.onImageClick(image)} className="discussionMessage cover" src={image} />
                 </li> 
                 )}
            ))
            array.push(<Lightbox key={that.makeKey()} isOpen={that.state.lightboxIsOpen} onClose={that.onClose()} currentImage={that.state.currentLightBoxImage} onClickPrev={that.onClickPrev()} onClickNext={that.onClickNext()} images={[{ src: that.state.lightboxImage }]} />)
        }

        if (this.props.discussion.video_media.length > 0) {


            this.props.discussion.video_media.forEach(function (video, index) {
                array.push(
                    <li key={that.makeKey()} className={`noDot ${that.props.author != that.props.discussion.author ? "" : "right"}`}>
                        <img onClick={that.onVideoClick(video)} className="discussionMessage cover" src={"./static/play_video.jpg"} />
                     </li> 
                )
            })

            array.push(<BodyEnd key={this.makeKey()}><VideoLightBox key={this.makeKey()} isOpen={that.state.videoLightboxIsOpen} onClose={that.onVideoClose} url={this.state.lightboxVideo} /></BodyEnd>)
        }

        return (
            <div className="discussionMessageContainer">
                <div className="discussionMessageDate">{Moment.unix(this.props.discussion.date).locale('ru').format('HH:mm DD MMMM')}</div>
                <ul className="noDot">
                    {array}
                </ul>
            </div>
        )
    }
})