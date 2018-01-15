var React = require('react')
var createReactClass = require('create-react-class');
var {Link} = require('react-router-dom')

var RecipientNav = createReactClass({
  onLogoutClick: function() {
    this.props.onLogoutClick()
  },
  render: function () {
    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="#">IOR</a>
            </div>
            <ul className="nav navbar-nav">
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li><a href="#" onClick={this.onLogoutClick}>Выход</a></li>
            </ul>
          </div>
        </nav>
      </div>
    )
  }
})

module.exports = RecipientNav
