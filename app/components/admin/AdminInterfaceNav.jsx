var React = require('react')
var createReactClass = require('create-react-class');
var {Link} = require('react-router-dom')

var AdminInterfaceNav = createReactClass({
  processClick: function () {

  },
  componentDidMount: function () {
    $(document).click(function(event) {
      $("li").each(function() {
        $(this).removeClass("active")
      })
      $(event.target).closest("li").addClass("active");
    });
  },
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
              <li><Link to="/">Заказы</Link></li>
              <li><Link to="/groups">Группы</Link></li>
              <li><Link to="/users">Пользователи</Link></li>
              <li><Link to="/orders">Типы заказов</Link></li>
              <li><Link to="/statuses">Статусы</Link></li>
              <li><Link to="/fields">Поля</Link></li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li><Link to="/pwd">Пароль админа</Link></li>
              <li><Link to="/settings">Настройки</Link></li>
              <li><a href="#" onClick={this.onLogoutClick}>Выход</a></li>
            </ul>
          </div>
        </nav>
      </div>
    )
  }
})

module.exports = AdminInterfaceNav
