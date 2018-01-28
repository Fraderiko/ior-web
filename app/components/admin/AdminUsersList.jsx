var React = require('react');
var createReactClass = require('create-react-class');
var AdminUserDetails = require('./AdminUserDetails');
var api = require('./api/api.jsx')

var AdminUsersList = createReactClass({
    componentDidMount: function() {
        this.fetchUsers()
    },
    getInitialState: function() {
        return {
            fetchedUsers: [],
            users: [],
            modalIsActive: false
        }
    },
    handleRowClick: function (e) {
        this.setState({
            modalIsActive: true,
            modalData: e
        })
    },
    fetchUsers: function() {
        var that = this
        api.getUsers().then(function(response) {
            var users = response.filter(function(user) { return user.type != 'order-details' })
            that.setState({
                users: users,
                fetchedUsers: users
            })
        }, function() {

        })
    },
    sortTable: function (field) {
        var that = this
        return function() {
          if (that.state[field+'sorted'] !== undefined) {
            if (that.state[field+'sorted'] == "asc") {
              var sorted = that.state.users.sort(function(a, b) { return a[field] < b[field] })
              that.setState({
                groups: sorted,
                [field+'sorted']: "desc"
              })
            } else {
              var sorted = that.state.users.sort(function(a, b) { return a[field] > b[field] })
              that.setState({
                groups: sorted,
                [field+'sorted']: "asc"
              })
            }
          } else {
            var sorted = that.state.users.sort(function(a, b) { return a[field] > b[field] })
            that.setState({
                groups: sorted,
                [field+'sorted']: "desc"
            })
          }
        }
      },
    showAll: function() {
        var that = this
        return function() {
            that.setState({
                users: that.state.fetchedUsers
            })
        }
    },
    showClients: function() {
        var that = this
        return function() {
            that.setState({
                users: that.state.fetchedUsers.filter(function(group) {return group.type == "client"})
            })
        }
    },
    showEmployee: function() {
        var that = this
        return function() {
            that.setState({
                users: that.state.fetchedUsers.filter(function(group) {return group.type == "employee"})
            })
        }
    },
    prepareRows: function () {
        var that = this
        var array = [];
        this.state.users.forEach( function(user, index) {
           array.push(<UserRow onRowClick={that.handleRowClick} key={index} item={user}/>)
        });
        return array
    },
    prepareModal: function () {
        if (this.state.modalIsActive == true) {
            if (this.state.modalData != undefined) {
                return <AdminUserDetails type={this.resolveType(this.state.modalData.type)} name={this.state.modalData.name} mail={this.state.modalData.mail} phone={this.state.modalData.phone} _id={this.state.modalData._id} permission_to_cancel_orders={this.state.modalData.permission_to_cancel_orders} permission_to_edit_orders={this.state.modalData.permission_to_edit_orders} password={this.state.modalData.password} finishModal={this.finishModal}/>
            } else {
                return <AdminUserDetails finishModal={this.finishModal}/>
            }
            
        }
    },
    finishModal: function() {
        $("#detailsModal").modal('hide');
        this.fetchUsers()
        this.setState({
            modalIsActive: false,
            modalData: {}
        })
    },
    createUser: function() {
        this.setState({
            modalIsActive: true
        })
    },
    resolveType: function (type) {
        if (type == "client") {
            return "Клиент"
        } else {
            return "Исполнитель"
        }
    },
    render: function() {
      return (
        <div className="row">

        <div className="well col-lg-8">
            <h1 className="hide">Пользователи</h1>
            <div className="padding-top-20">
                <button type="button" onClick={this.createUser} className="btn  btn-success">Создать пользователя</button>
            </div>
            <div className="padding-top-20">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th onClick={this.sortTable("name")}>Имя</th>
                        <th onClick={this.sortTable("type")}>Тип</th>
                        <th onClick={this.sortTable("email")}>Электронная почта</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.prepareRows()}
                    </tbody>
                </table>
                </div>
        </div>

        <div className="col-lg-4">
            <div className="well col-lg-offset-1 col-lg-11">
                <div className="text-center">
                <div className="btn-group-vertical" role="group">
                    <button type="button" onClick={this.showAll()} className="btn btn-success">Показать всех</button>
                    <button type="button" onClick={this.showClients()} className="btn btn-success">Показать только клиентов</button>
                    <button type="button" onClick={this.showEmployee()} className="btn btn-success">Показать только исполнителей</button>
                </div>
                </div>
            </div>
        </div>

        {this.prepareModal()}

        </div>
      )
    }
})

var UserRow = createReactClass({
    handleClick: function () {
      this.props.onRowClick(this.props.item)
    },
    resolveType: function(type) {
      if (type == "client") {
          return "Клиент"
      } else {
          return "Исполнитель"
      }
    },
    render: function () {
      return (
        <tr onClick={this.handleClick}>
          <td>{this.props.item.name}</td><td>{this.resolveType(this.props.item.type)}</td><td>{this.props.item.mail}</td>
        </tr>
      )
    }
  })

module.exports = AdminUsersList