var React = require('react');
var createReactClass = require('create-react-class');
var ReactTags = require('react-tag-input').WithContext;
var api = require('./api/api.jsx');

require('style-loader!react-tagsinput/react-tagsinput.css')

var AdminEmployeeGroupDetails = createReactClass({
    componentDidMount: function () {
        $("#detailsModal").modal('show');
    },
    getInitialState: function () {
        return {
            selectedEmployee: this.prepareSelectedEmployee(),
            suggestionsEmployee: this.prepareEmployeeSuggestions(),
            name: this.props.name,
            employees: this.props.employees,
            validatedNameClassName: "form-group",
            validatedSelectedEmployeeClassName: "form-group",
            validatedSelectedClientsClassName: "form-group",
            orders: this.props.orders
        }
    },
    prepareSelectedEmployee: function () {
        if (this.props.initialSelectedEmployee == undefined) {
            return []
        } else {
            var array = []
            for (var i = 0; i < this.props.group.users.length; i++) {
                var empoyee = {
                    id: i,
                    text: this.props.group.users[i].name
                }
                array.push(empoyee)
            }
            return array
        }
    },
    prepareEmployeeSuggestions: function () {

        if (this.props.employees == undefined) {
            return []
        } else {
            var array = []
            for (var i = 0; i < this.props.employees.length; i++) {
                var empoyee = this.props.employees[i].name
                array.push(empoyee)
            }
            return array
        }
    },

    handleDelete: function (i) {
        var selectedEmployee = this.state.selectedEmployee;
        selectedEmployee.splice(i, 1);
        this.setState({ selectedEmployee: selectedEmployee });
    },
    handleAddition: function (tag) {
        var selectedEmployee = this.state.selectedEmployee;
        selectedEmployee.push({
            id: selectedEmployee.length + 1,
            text: tag
        });
        this.setState({ selectedEmployee: selectedEmployee });
    },
    handleGroupChange: function (e) {
        this.setState({
            name: e.target.value
        })
    },
    finishModal: function () {

        if (this.props.type == "employee") {
            if (this.state.selectedEmployee.length == 0 || this.state.name == undefined || this.state.name == "") {
                if (this.state.selectedEmployee.length == 0) {
                    this.setState({
                        validatedSelectedEmployeeClassName: "has-error form-group"
                    })
                } else {
                    this.setState({
                        validatedSelectedEmployeeClassName: "form-group"
                    })
                }

                if (this.state.name == undefined || this.state.name == "") {
                    this.setState({
                        validatedNameClassName: "has-error form-group"
                    })
                } else {
                    this.setState({
                        validatedNameClassName: "form-group"
                    })
                }
                return
            }
        } else {
            if (this.state.selectedEmployee.length == 0 || this.state.selectedClients.length == 0 || this.state.name == undefined || this.state.name == "") {
                if (this.state.name == undefined || this.state.name == "") {
                    this.setState({
                        validatedNameClassName: "has-error form-group"
                    })
                } else {
                    this.setState({
                        validatedNameClassName: "form-group"
                    })
                }

                if (this.state.selectedEmployee.length == 0) {
                    this.setState({
                        validatedSelectedEmployeeClassName: "has-error form-group"
                    })
                } else {
                    this.setState({
                        validatedSelectedEmployeeClassName: "form-group"
                    })
                }

                if (this.state.selectedClients.length == 0) {
                    this.setState({
                        validatedSelectedClientsClassName: "has-error form-group"
                    })
                } else {
                    this.setState({
                        validatedSelectedClientsClassName: "form-group"
                    })
                }


                return
            }
        }

        var that = this
        if (this.props._id == undefined) {
            api.createEmplGroups(this.prepareGroup()).then(function () {
                that.props.finishModal();
            }, function () {

            })
        } else {
            if (this.prepareGroup().users != this.props.initialSelectedEmployee || this.prepareGroup().name != this.props.name) {
                api.updateEmplGroups(this.prepareGroup()).then(function () {
                    that.props.finishModal();
                }, function () {

                })
            }
        }

    },
    close: function () {
        this.props.finishModal();
    },
    delete: function () {
        var that = this
        console.log(this.prepareGroup())
        api.deleteEmplGroups(this.prepareGroup()).then(function () {
            that.props.finishModal();
        }, function () {

        })
    },
    prepareGroup: function () {
        if (this.props.type == "employee") {

            var users = []
            for (var i = 0; i < this.state.selectedEmployee.length; i++) {
                for (var j = 0; j < this.state.employees.length; j++) {
                    if (this.state.selectedEmployee[i].text == this.state.employees[j].name) {
                        users.push(this.state.employees[j])
                    }
                }
            }

            var group = {
                name: this.state.name,
                users: users,
                _id: this.props._id
            }

            return group
        }
    },
    render: function () {

        var that = this

        function prepareEmployeeTips() {
            return 'Например: ' + that.state.suggestionsEmployee.join()
        }

        var selectedEmployee = this.state.selectedEmployee
        var placeholder = "Начните писать"


        if (this.state.name == undefined) {
            var title = "Создать группу исполнителя"
        } else {
            var title = this.props.name
        }


        var that = this

        function prepareTagsField() {
            return (
                <div className={that.state.validatedSelectedEmployeeClassName}>
                    <label>Исполнители, входящие в группу</label>
                    <ReactTags tags={selectedEmployee}
                        placeholder={placeholder}
                        classNames={{ tagInputField: 'form-control' }}
                        suggestions={that.state.suggestionsEmployee}
                        handleDelete={that.handleDelete}
                        handleAddition={that.handleAddition}
                        handleChange={that.handleChange} />
                    <i>{prepareEmployeeTips()}</i>
                </div>
            )
        }

        return (

            <div>

                <div id="detailsModal" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog orderModal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={this.close}>&times;</button>
                                <h4 className="modal-title">{title}</h4>
                            </div>
                            <div className="modal-body">

                                <div className={this.state.validatedNameClassName}>
                                    <label>Название</label>
                                    <input className="form-control" id="name" onChange={this.handleGroupChange} value={this.state.name} placeholder="Укажите название"></input>
                                </div>
                                {prepareTagsField()}

                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={this.close} className="btn btn-default" >Закрыть</button>
                                <button type="button" onClick={this.finishModal} className="btn btn-success" >Сохранить</button>
                                <button type="button" onClick={this.delete} className="btn btn-danger" >Удалить</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = AdminEmployeeGroupDetails
