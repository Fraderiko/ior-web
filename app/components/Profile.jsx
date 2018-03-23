var React = require('react');
var createReactClass = require('create-react-class');
var api = require('./api/api.jsx');
var Cookies = require('universal-cookie');
var Alert = require('react-s-alert').default;

var Profile = createReactClass({
  componentDidMount: function() {
    var cookies = new Cookies()
    var id = cookies.get("_id")
    var type = cookies.get("type")
    var that = this
    api.getUser(id).then(function(user) {

      if (user.new_chat_notification == null) {
        var new_chat_notification = true
      } else {
        var new_chat_notification = user.new_chat_notification
      }

      that.setState({
        name: user.name,
        mail: user.mail,
        phone: user.phone,
        _id: id,
        type: type,
        newOrdersNotifications: user.new_orders_notification,
        newStatusesNotifications: user.new_status_notification,
        new_chat_notification: new_chat_notification,
        password: user.password
      })
    }, function() {

    })
  },
  getInitialState: function() {
    return {
      name: '',
      mail: '',
      phone: '',
      newOrdersNotifications: false,
      newStatusesNotifications: false
    }
  },
  submitHandler: function (e) {
    e.preventDefault;

    var user = {
      _id: this.state._id,
      name: this.state.name,
      mail: this.state.mail,
      phone: this.state.phone,
      new_orders_notification: this.state.newOrdersNotifications,
      new_status_notification: this.state.newStatusesNotifications,
      new_chat_notification: this.state.new_chat_notification,
      password: this.state.password
    }

    api.updateUser(user).then(function(response) {
      Alert.info('Профиль успешно обновлен', {
                    position: 'top',
                    effect: 'slide',
                    timeout: 3000
                });
    }, function() {

    })
  },
  handleMailChange: function (e) {
    this.setState({
      mail: e.target.value
    })
  },
  handleNameChange: function (e) {
    this.setState({
      name: e.target.value
    })
  },
  handlePhoneChange: function (e) {
    this.setState({
      phone: e.target.value
    })
  },
  handleNewStatusesNotifications: function (e) {
    this.setState({
      newStatusesNotifications: e.target.checked
    })
  },
  handleNewOrdersNotifications: function (e) {
    this.setState({
      newOrdersNotifications: e.target.checked
    })
  },
  handleNewChatNotification: function (e) {
    this.setState({
      new_chat_notification: e.target.checked
    })
  },
  shouldShowNewOrdersAlert: function() {
    if (this.state.type == 'employee') {
      return (<div key={'shouldShowNewOrdersAlert'} className="checkbox">
            <label><input value={this.state.newOrdersNotifications} onChange={this.handleNewOrdersNotifications} checked={this.state.newOrdersNotifications} type="checkbox"></input>Присылать почтовые уведомления о новых заказах</label>
          </div>)
    }
  },
  shouldShowNewStatusesAlert: function() {
    if (this.state.type == 'client') {
      return (
        <div key={'shouldShowNewStatusesAlert'} className="checkbox">
            <label><input value={this.state.newStatusesNotifications} onChange={this.handleNewStatusesNotifications} checked={this.state.newStatusesNotifications} type="checkbox"></input>Присылать почтовые уведомления о новых статусах</label>
          </div>
      )
    }
  },
  render: function () {
    return (
      <div className="well as-mt-30">
        <h1 className="hide">Профиль</h1>
        <form onSubmit={this.submitHandler}>
          <div className="form-group">
            <label>ФИО</label>
            <input className="form-control" value={this.state.name} onChange={this.handleNameChange} id="name" placeholder="Укажите ФИО"></input>
          </div>
          <div className="form-group">
            <label>Электронная почта</label>
            <input className="form-control" value={this.state.mail} onChange={this.handleMailChange} id="email" placeholder="Укажите электронную почту"></input>
          </div>
          <div className="form-group">
            <label>Телефон</label>
            <input className="form-control" value={this.state.phone} onChange={this.handlePhoneChange} id="phone" placeholder="Укажите телефон"></input>
          </div>
          <div key={'shouldShowNewChatAlert'} className="checkbox">
              <label><input value={this.state.new_chat_notification} onChange={this.handleNewChatNotification} checked={this.state.new_chat_notification} type="checkbox"></input>Присылать почтовые уведомления о новых сообщения в чате</label>
            </div>
          {this.shouldShowNewOrdersAlert()}
          {this.shouldShowNewStatusesAlert()}
          <button type="submit" className="btn btn-primary" >Сохранить</button>
        </form>
        <Alert stack={{ limit: 3 }} />
      </div>
    )
  }
})

module.exports = Profile
