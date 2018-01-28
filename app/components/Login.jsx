var React = require('react');
var createReactClass = require('create-react-class');
var api = require('./api/api.jsx');
var Cookies = require('universal-cookie');

var Alert = require('react-s-alert').default;

require('react-s-alert/dist/s-alert-default.css');
require('react-s-alert/dist/s-alert-css-effects/slide.css');

var Login = createReactClass({
  getInitialState: function () {
    return {
      mail: '',
      password: ''
    }
  },
  onLoginButton: function (e) {
    e.preventDefault();

    var that = this

    var creds = {
      mail: this.state.mail,
      password: this.state.password
    }

    api.auth(creds).then(function (response) {
      //that.props.onLogin(response.type)

      if (response.result == "ok") {
        console.log(response)
        var cookies = new Cookies()
        cookies.set('_id', response._id);
        cookies.set('type', response.type);
        location.reload()
      } else {
        Alert.error('Неверные логин/пароль!', {
          position: 'top',
          effect: 'slide',
          timeout: 10000
        });
      }


    }, function () {

    })
  },
  handleLoginChange: function (e) {
    this.setState({
      mail: e.target.value
    })
  },
  handlePasswordChange: function (e) {
    this.setState({
      password: e.target.value
    })
  },
  render: function () {
    return (
      <div>
        <div className="center-vertically">
          <div className="container">
            <div className="col align-items-center">
              <div className="row">
                <div className="well as col-sm-3 col-sm-offset-5">

                  <div className="as-auth-box">
                    <div className="as-auth-box--btn">
                      Авторизация
                    </div>
                    <div className="as-auth-box--btn">
                      <a href="http://iorcontrol.ru" target="_blank" >На IORcontrol</a>
                    </div>
                  </div>

                  <form className="as-login-form" onSubmit={this.onLoginButton}>
                    <div className="form-group">
                      <input ref="login" value={this.state.login} onChange={this.handleLoginChange} className="form-control input-lg" id="email" placeholder="Логин"></input>
                    </div>
                    <div className="form-group">
                      <input type="password" value={this.state.password} onChange={this.handlePasswordChange} className="form-control input-lg" id="pwd" placeholder="Пароль"></input>
                    </div>
                    <button type="submit" className="btn as-login btn-success">Войти</button>

                   
                  </form>



                </div>
              </div>
            </div>
          </div>
        </div>
        <Alert stack={{ limit: 3 }} />
      </div>
    )
  }
})

module.exports = Login;
