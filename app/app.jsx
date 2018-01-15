var React = require('react');
var createReactClass = require('create-react-class');
var ReactDOM = require('react-dom');
var { HashRouter, BrowserRouter, Route, IndexRoute, Link, Switch } = require('react-router-dom');
var Login = require(__dirname + '/components/Login.jsx');
var ClientInterfaceNav = require(__dirname + '/components/client/ClientInterfaceNav.jsx')
var ClientCreateOrder = require(__dirname + '/components/client/ClientCreateOrder.jsx')
var ClientOrderList = require(__dirname + '/components/client/ClientOrderList.jsx')
var Profile = require(__dirname + '/components/Profile.jsx')
var Feedback = require(__dirname + '/components/Feedback.jsx')

var AdminInterfaceNav = require(__dirname + '/components/admin/AdminInterfaceNav.jsx')
var AdminGroupsList = require(__dirname + '/components/admin/AdminGroupsList.jsx')
var AdminUsersList = require(__dirname + '/components/admin/AdminUsersList.jsx')
var AdminOrdersList = require(__dirname + '/components/admin/AdminOrdersList.jsx')
var AdminStatusesList = require(__dirname + '/components/admin/AdminStatusesList.jsx')
var AdminFieldsList = require(__dirname + '/components/admin/AdminFieldsList.jsx')
var AdminPassword = require(__dirname + '/components/admin/AdminPassword.jsx')
var AdminSettings = require(__dirname + '/components/admin/AdminSettings.jsx')

var Recipient = require(__dirname + '/components/Recipient/Recipient.jsx')
var RecipientNav = require(__dirname + '/components/Recipient/RecipientNav.jsx')

var Cookies = require('universal-cookie');

var api = require('./api/api.jsx');

require('style-loader!bootstrap/dist/css/bootstrap.css')
require('style-loader!react-datepicker/dist/react-datepicker.css')
require(__dirname + '/public/style.css')

var Container = createReactClass({
  componentWillMount: function () {
    var cookies = new Cookies()
    var that = this
    if (cookies.get("_id") != null) {
      var object = {
        _id: cookies.get("_id")
      }
      api.getUserType(object).then(function (type) {
        that.setState({
          type: type.type,
          isLoggedIn: true
        })
      }, function () {

      })
    } else {
      this.setState({
        isLoggedIn: false
      })
    }
  },
  getInitialState: function () {
    return {

    }
  },
  onLogin: function (result) {
    this.setState({
      isLoggedIn: true,
      type: result
    })
  },
  onLogoutClick: function () {

    function deleteAllCookies() {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++)
        deleteCookie(cookies[i].split("=")[0]);
    }

    function setCookie(name, value, expirydays) {
      var d = new Date();
      d.setTime(d.getTime() + (expirydays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = name + "=" + value + "; " + expires;
    }

    function deleteCookie(name) {
      setCookie(name, "", -1);
    }

    deleteAllCookies()

    this.setState({
      isLoggedIn: false
    })
    location.reload()
  },
  render: function () {

    var that = this

    function resolveLogin() {
      if (that.state.isLoggedIn == null) {
        return <Overlay />
      } else {
        if (that.state.isLoggedIn && that.state.type == "client") {
          return <ClientInterface onLogoutClick={that.onLogoutClick} />
        } if (that.state.isLoggedIn && that.state.type == "admin") {
          return <AdminInterface onLogoutClick={that.onLogoutClick} />
        } if (that.state.isLoggedIn && that.state.type == "employee") {
          return <ClientInterface onLogoutClick={that.onLogoutClick} employee={true} />
        } if (that.state.isLoggedIn && that.state.type == "order-details") {
          return <OrderDetailsInterface onLogoutClick={that.onLogoutClick} />
        } else {
          return <Login onLogin={that.onLogin} />
        }
      }

    }

    return (
      <div>
        {resolveLogin()}
      </div>
    );
  }
});

var ClientInterface = createReactClass({
  onLogoutClick: function () {
    this.props.onLogoutClick()
  },
  render: function () {
    var that = this
    function employee() {
      if (that.props.employee != undefined) {
        return true
      } else {
        return false
      }
    }
    return (
      <div>
        <HashRouter>
          <ClientInterfaceApp onLogoutClick={this.onLogoutClick} employee={employee()} />
        </HashRouter>
      </div>
    )
  }
})

var OrderDetailsInterface = createReactClass({
  onLogoutClick: function () {
    this.props.onLogoutClick()
  },
  render: function () {
    return (
      <div>
          <RecipientNav onLogoutClick={this.onLogoutClick} />
          <Recipient/>
      </div>
    )
  }
})

var AdminInterface = createReactClass({
  onLogoutClick: function () {
    this.props.onLogoutClick();
  },
  render: function () {
    return (
      <div>
        <HashRouter>
          <AdminInterfaceApp onLogoutClick={this.onLogoutClick} />
        </HashRouter>
      </div>
    )
  }
})

var ClientInterfaceApp = createReactClass({
  resolveClientOrderList: function () {
    if (this.props.employee == true) {
      return <ClientOrderList employee={true} />
    } else {
      return <ClientOrderList employee={false} />
    }
  },
  onLogoutClick: function () {
    this.props.onLogoutClick();
  },
  render: function () {
    return (
      <div>
        <ClientInterfaceNav onLogoutClick={this.onLogoutClick} />
        <Switch>
          <Route exact path="/" render={this.resolveClientOrderList} />
          <Route path="/client-create-order" component={ClientCreateOrder} />
          <Route path="/client-order-list" component={ClientOrderList} />
          <Route path="/profile" component={Profile} />
          <Route path="/feedback" component={Feedback} />
        </Switch>
      </div>
    )
  }
})

var AdminInterfaceApp = createReactClass({
  onLogoutClick: function () {
    this.props.onLogoutClick();
  },
  render: function () {
    return (
      <div>
        <AdminInterfaceNav onLogoutClick={this.onLogoutClick} />
        <Switch>
          <Route exact path="/" component={ClientOrderList}/>
          <Route path="/groups" component={AdminGroupsList} />
          <Route path="/users" component={AdminUsersList} />
          <Route path="/orders" component={AdminOrdersList} />
          <Route path="/statuses" component={AdminStatusesList} />
          <Route path="/fields" component={AdminFieldsList} />
          <Route path="/pwd" component={AdminPassword} />
          <Route path="/settings" component={AdminSettings} />
        </Switch>
      </div>
    )
  }
})

var Overlay = createReactClass({
  render: function () {
    return (
      <div>
        <div className="enter-vertically loader" />
      </div>
    )
  }
})

ReactDOM.render(
  <Container />,
  document.getElementById('app')
)
