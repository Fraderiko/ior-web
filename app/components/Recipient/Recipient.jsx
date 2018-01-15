var React = require('react');
var createReactClass = require('create-react-class');
var api = require('../api/api.jsx');
var ClientOrder = require('../client/ClientOrder');
var Cookies = require('universal-cookie');
var { withRouter } = require('react-router-dom');
var Alert = require('react-s-alert').default;
var Lightbox = require('react-images').default;
var Discussion = require('../Discussion.jsx');
var { Player } = require('video-react');

var Recipient = createReactClass({
  componentDidMount: function () {
    this.fetchOrder()
  },
  getInitialState: function () {
    return {
    }
  },

  fetchOrder: function () {
    var cookies = new Cookies()
    var _id = cookies.get("_id")
    var that = this
    api.getUser(_id).then(function (user) {
      api.getOrder(user.mail).then(function (order) {
        that.setState({
          order: order
        })
      }, function () {

      })
    }, function () {

    })
  },
  prepareContent: function () {
    if (this.state.order != undefined) {
      var array = []
      var that = this

      var statuses = this.state.order.statuses.map(function (status) { return status.fields })

      statuses.forEach(function (status) {
        status.forEach(function (field) {
          if (field.recepientvisible == true) {
            if (field.type == 'text' || field.type == 'digit' || field.type == 'date' || field.type == 'time') {
              array.push(<ClientOrder key={field._id} name={field.name} value={field.value} />)
            } else if (field.type == 'image') {
              array.push(that.prepareClientImageField(field._id, field.name, field.media))
            } else if (field.type == 'video') {
              array.push(that.prepareClientVideoField(field._id, field.name, field.media))
            } else if (filed.type == 'file') {
              array.push(that.prepareClientFileField(field._id, field.name, field.media))
            }
          }
        })
      })
      return array
    }
  },
  prepareClientFileField: function (_id, name, media) {
    var that = this
    return (
      <div key={_id} className="form-group">
        <label>{name}</label>
        <div className="inline-images">
        {media.map(function (item, index) { return <div key={that.makeKey()}><br /><a href={item}>{item.replace(/^.*[\\\/]/, '')}</a></div> })}
        </div>
      </div>
    )
},
  prepareClientImageField: function (_id, name, media) {
    var that = this

    function onClose() {
      that.setState({
        lightboxIsOpen: false
      })
    }

    function onClickNext() {
      that.setState({
        currentLightBoxImage: that.state.currentLightBoxImage + 1
      })
    }

    function onClickPrev() {
      that.setState({
        currentLightBoxImage: that.state.currentLightBoxImage - 1
      })
    }

    var images = this.prepareImageMedia(media)
    return (
      <div key={_id} className="form-group">
        <label>{name}</label>
        <div className="inline-images">
          {this.prepareImgTags(images)}
        </div>
        <Lightbox isOpen={this.state.lightboxIsOpen} onClose={onClose} currentImage={this.state.currentLightBoxImage} onClickPrev={onClickPrev} onClickNext={onClickNext} images={images} />
      </div>
    )
  },
  prepareImgTags: function (images) {
    var that = this
    function onClick(index) {
      return function () {
        that.setState({
          lightboxIsOpen: true,
          currentLightBoxImage: index
        })
      }
    }
    return images.map(function (image, index) { return <img className="image img" onClick={onClick(index)} key={index} src={image.src} /> })
  },
  prepareClientVideoField: function (_id, name, media) {
    return media.map(function (item, index) {
      return <div key={index} className="video-preview"><br /><Player playsInline={true} fluid={false} src={item} width={410}
        height={280} /></div>
    })
  },
  prepareImageMedia: function (media) {
    var array = []
    media.forEach(function (item, index) {
      var object = {
        src: item
      }
      array.push(object)
    })
    return array
  },
  resolveTitle: function() {
    if (this.state.order != undefined) {
      return "Заказ №" + this.state.order.number
    }
  },
  discussionSent: function() {
    var that = this
    return function () {
      that.fetchOrder()
    }
  },
  resolveOrder: function() {
    if (this.state.order != undefined) {
      var cookies = new Cookies()
      var _id = cookies.get("_id")
      return <Discussion order={this.state.order} author={_id} discussionSent={this.discussionSent()}/>
    }
  },
  render: function () {
    return (
      <div>
        <h1>{this.resolveTitle()}</h1>
        <div className="row row-space">
          <div>
            <div className="well col-lg-6">
              {this.prepareContent()}
            </div>
            <div className="col-lg-6">
              <div className="well col-lg-offset-1 col-lg-11">
              {this.resolveOrder()}
              </div>
            </div>
          </div>
        </div>
        <Alert stack={{ limit: 3 }} />
      </div>
    )
  }
})

module.exports = Recipient
