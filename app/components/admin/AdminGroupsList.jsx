var React = require('react');
var createReactClass = require('create-react-class');
var AdminGroupDetails = require('./AdminGroupDetails.jsx');
var api = require('./api/api.jsx');

var AdminGroupsList = createReactClass({
    componentDidMount: function() {
        this.fetchGroups()
        this.fetchUsers()
    },
    getInitialState: function () {
        return {
            fetchedGroups: [],
            groups: [],
            clients: [],
            empoloyees: []
        }
    },
    fetchUsers: function () {
        var that = this
        api.getUsers().then(function(users) {
            var clients = users.filter(function(user) { return user.type == "client" })
            var employees = users.filter(function(user) { return user.type == "employee" })

            that.setState({
                clients: clients,
                employees: employees
            })
        }, function() {

        })

        api.getOrders().then(function(orders) {
            that.setState({
                orders: orders
            })
        }, function() {

        })
    },
    fetchGroups: function () {
        var that = this
        api.getGroups().then(function(groups) {
            that.setState({
                groups: groups,
                fetchedGroups: groups
            })
        }, function() {

        })
    },
    createClientGroup: function() {
        this.props.onClientGroupCreate()
        this.setState({
            modalIsActive: true
        })
    },
    createEmployeeGroup: function() {
        this.props.onEmployeeGroupCreate()
        this.setState({
            modalIsActive: true
        })   
    },
    prepareRows: function () {
        var that = this
        var array = [];
        this.state.groups.forEach( function(group, index) {
           array.push(<UserGroupRow onRowClick={that.onRowClick} key={index} item={group}/>)
        });
        return array  
    },
    sortTable: function (field) {
        var that = this
        return function() {
          if (that.state[field+'sorted'] !== undefined) {
            if (that.state[field+'sorted'] == "asc") {
              var sorted = that.state.groups.sort(function(a, b) { return a[field] < b[field] })
              that.setState({
                groups: sorted,
                [field+'sorted']: "desc"
              })
            } else {
              var sorted = that.state.groups.sort(function(a, b) { return a[field] > b[field] })
              that.setState({
                groups: sorted,
                [field+'sorted']: "asc"
              })
            }
          } else {
            var sorted = that.state.groups.sort(function(a, b) { return a[field] > b[field] })
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
                groups: that.state.fetchedGroups
            })
        }
    },
    showClients: function() {
        var that = this
        return function() {
            that.setState({
                groups: that.state.fetchedGroups.filter(function(group) {return group.type == "client"})
            })
        }
    },
    showEmployee: function() {
        var that = this        
        return function() {
            that.setState({
                groups: that.state.fetchedGroups.filter(function(group) {return group.type == "employee"})
            })
        }
    },
    onClientGroupCreate: function() {
        this.setState({
            modalIsActive: true,            
            type: "create-client"
        })
    },
    onEmployeeGroupCreate: function() {
        this.setState({
            type: "create-employee",
            modalIsActive: true
        })
    },
    onClientRowClick: function(group) {
        this.setState({
            type: "details-client",
            group: group,
            modalIsActive: true
        })
    },
    onEmployeeRowClick: function(group) {
        this.setState({
            type: "details-employee",
            group: group,
            modalIsActive: true
        })
    },
    prepareModal: function () {
        if (this.state.modalIsActive == true) {
            if (this.state.type == "create-client") {
                return <AdminGroupDetails type={"client"} clients={this.state.clients} employees={this.state.employees} finishModal={this.finishModal}/>
            } else if (this.state.type == "create-employee") {
                return <AdminGroupDetails type={"employee"} employees={this.state.employees} clients={this.state.clients} finishModal={this.finishModal}/>
            } else if (this.state.type == "details-client") {
                return <AdminGroupDetails type={"client"}
                                          finishModal={this.finishModal}
                                          name={this.state.group.name}
                                          _id={this.state.group._id}
                                          initialSelectedClients={this.state.group.users}
                                          clients={this.state.clients}
                                          employees={this.state.employees}
                                          initialSelectedEmployee={this.state.group.canworkwith}
                                          initialSelectedOrders={this.state.group.orders}
                                          orders={this.state.orders}
                                          />
            } else if (this.state.type == "details-employee") {
                return <AdminGroupDetails type={"employee"}
                                          finishModal={this.finishModal}
                                          name={this.state.group.name}
                                          _id={this.state.group._id}
                                          initialSelectedEmployee = {this.state.group.users}
                                          initialSelectedClients = {this.state.group.canworkwith}
                                          initialSelectedOrders={this.state.group.orders}
                                          clients = {this.state.clients}
                                          orders={this.state.orders}
                                          employees={this.state.employees}/>
            }
        }
    },
    finishModal: function() {
        $("#detailsModal").modal('hide');
        this.fetchGroups()
        this.setState({
            modalIsActive: false
        })
    },
    onRowClick: function(e) {
        if (e.type == "client") {
            this.onClientRowClick(e)
        } else {
            this.onEmployeeRowClick(e)
        }
    },
    render: function() {
      return (
        <div className="row">
          
        <div className="well col-lg-8">
            <h1 className="hide">Группы</h1>
            <div className="btn-group padding-top-20">
                <button type="button" onClick={this.onClientGroupCreate} className="btn btn-success">Создать группу клиента</button>
                <button type="button" onClick={this.onEmployeeGroupCreate} className="btn btn-success">Создать группу исполнителей</button>
            </div>
            <br></br>
            <br></br>
            <div className="">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th onClick={this.sortTable("group")}>Имя</th>
                        <th onClick={this.sortTable("type")}>Тип</th>
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
                <div className="btn-group-vertical center-horizontally" role="group">
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

var UserGroupRow = createReactClass({
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
          <td>{this.props.item.name}</td><td>{this.resolveType(this.props.item.type)}</td>
        </tr>
      )
    }
  })

module.exports = AdminGroupsList