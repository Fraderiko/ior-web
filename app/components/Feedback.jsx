var React = require('react');
var createReactClass = require('create-react-class');
var api = require('../api/api.jsx');
var Cookies = require('universal-cookie');

var Alert = require('react-s-alert').default;

require('react-s-alert/dist/s-alert-default.css');
require('react-s-alert/dist/s-alert-css-effects/slide.css');

var Feedback = createReactClass({
  submitHandler: function (e) {
    e.preventDefault;

    var cookies = new Cookies()
    var id = cookies.get("_id");

    var that = this

    api.getUser(id).then(function (user) {

      var object = {
        message: that.refs.body.value,
        sender: user.mail
      }

      api.sendFeedBack(object).then(function () {
        Alert.info('Спасибо, ваше сообщение отправлено. С вами свяжутся в ближайшее время.', {
          position: 'top',
          effect: 'slide',
          timeout: 10000
        });
        that.refs.body.value = ""
      }, function () {

      })

    }, function () {

    })
  },
  render: function () {
    return (
      <div className="well">
        <h1>Обратная связь</h1>
        <form onSubmit={this.submitHandler}>
          <div className="form-group">
            <label>Сообщение</label>
            <textarea className="form-control" id="phone" ref="body" placeholder="Напишите здесь"></textarea>
          </div>
          <button type="submit" className="btn btn-primary" >Сохранить</button>
        </form>
        <Alert stack={{ limit: 3 }} />
      </div>
    )
  }
})

module.exports = Feedback
