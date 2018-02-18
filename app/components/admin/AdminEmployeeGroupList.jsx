var React = require('react');
var createReactClass = require('create-react-class');
var AdminEmployeeGroupDetails = require('./AdminEmployeeGroupDetails');
var api = require('./api/api.jsx');

var AdminEmployeeGroupList = createReactClass({
    componentDidMount: function () {
        this.fetchEmplGroups()
        this.fetchUsers()
    },
    getInitialState: function () {
        return {
            fetchedGroups: [],
            groups: [],
            users: [],
            group: {}
        }
    },
    fetchUsers: function () {
        var that = this
        api.getUsers().then(function (users) {
            var employees = users.filter(function (user) { return user.type == "employee" })

            that.setState({
                users: employees
            })
        }, function () {

        })
    },
    fetchEmplGroups: function () {
        var that = this
        api.getEmplGroups().then(function (groups) {
            that.setState({
                groups: groups,
                fetchedGroups: groups
            })
        }, function () {

        })
    },
    prepareRows: function () {
        var that = this
        var array = [];
        this.state.groups.forEach(function (group, index) {
            array.push(<UserGroupRow onRowClick={that.onRowClick} key={index} item={group} />)
        });
        return array
    },
    sortTable: function (field) {
        var that = this
        return function () {
            if (that.state[field + 'sorted'] !== undefined) {
                if (that.state[field + 'sorted'] == "asc") {
                    var sorted = that.state.groups.sort(function (a, b) { return a[field] < b[field] })
                    that.setState({
                        groups: sorted,
                        [field + 'sorted']: "desc"
                    })
                } else {
                    var sorted = that.state.groups.sort(function (a, b) { return a[field] > b[field] })
                    that.setState({
                        groups: sorted,
                        [field + 'sorted']: "asc"
                    })
                }
            } else {
                var sorted = that.state.groups.sort(function (a, b) { return a[field] > b[field] })
                that.setState({
                    groups: sorted,
                    [field + 'sorted']: "desc"
                })
            }
        }
    },

    onCreateGroup: function () {
        this.setState({
            modalIsActive: true
        })
    },

    prepareModal: function () {
        if (this.state.modalIsActive == true) {
            return <AdminEmployeeGroupDetails type={"employee"}
                finishModal={this.finishModal}
                group={this.state.group}
                name={this.state.group.name}
                _id={this.state.group._id}
                initialSelectedEmployee={this.state.group.users}
                employees={this.state.users} />
        }
    },
    finishModal: function () {
        $("#detailsModal").modal('hide');
        this.fetchEmplGroups()
        this.setState({
            modalIsActive: false,
            group: {}
        })
    },
    onRowClick: function (e) {
        this.setState({
            group: e,
            modalIsActive: true
        })
    },
    render: function () {
        return (
            <div className="row">

                <div className="well col-lg-8">
                    <h1 className="hide">Группы</h1>
                    <div className="btn-group padding-top-20">
                        <button type="button" onClick={this.onCreateGroup} className="btn btn-success">Создать группу исполнителей</button>
                    </div>
                    <br></br>
                    <br></br>
                    <div className="">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th onClick={this.sortTable("group")}>Имя</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.prepareRows()}
                            </tbody>
                        </table>
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
    render: function () {
        return (
            <tr onClick={this.handleClick}>
                <td>{this.props.item.name}</td>
            </tr>
        )
    }
})

module.exports = AdminEmployeeGroupList