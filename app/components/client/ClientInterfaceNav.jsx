var React = require('react')
var createReactClass = require('create-react-class');
var {Link} = require('react-router-dom')

var ClientInterfaceNav = createReactClass({
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
              <li><Link to="/">Список заказов</Link></li>
              <li><Link to="/client-create-order">Создать заказ</Link></li>
              <li><Link to="/client-order-list?favorites=true">Избранные</Link></li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li><Link to="/feedback">Обратная связь</Link></li>
              <li><Link to="/profile">Профиль</Link></li>
              <li><a href="#" onClick={this.onLogoutClick}>Выход</a></li>
            </ul>
          </div>
        </nav>
      </div>
    )
  }
})

module.exports = ClientInterfaceNav
