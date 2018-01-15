var React = require('react');
var createReactClass = require('create-react-class');
var ReactTags = require('react-tag-input').WithContext;
var api = require('./api/api.jsx');

require('style-loader!react-tagsinput/react-tagsinput.css')

var AdminGroupDetails = createReactClass({
    componentDidMount: function () {
        $("#detailsModal").modal('show');
    },
    getInitialState: function () {
        return {
            selectedClients: this.prepareSelectedClients(),
            suggestionsClients: this.prepareClientSuggestions(),
            selectedEmployee: this.prepareSelectedEmployee(),
            suggestionsEmployee: this.prepareEmployeeSuggestions(),
            selectedOrders: this.prepareSelectedOrders(),
            suggestionsOrders: this.prepareOrderSuggestions(),
            name: this.props.name,
            type: this.props.type,
            employees: this.props.employees,
            clients: this.props.clients,
            validatedNameClassName: "form-group",
            validatedSelectedEmployeeClassName: "form-group",
            validatedSelectedClientsClassName: "form-group",
            orders: this.props.orders
        }
    },
    prepareSelectedClients: function () {
        if (this.props.initialSelectedClients == undefined) {
            return []
        } else {
            var array = []
            for (var i = 0; i < this.props.initialSelectedClients.length; i++) {
                var client = {
                    id: i,
                    text: this.props.initialSelectedClients[i].name
                }
                array.push(client)
            }
            return array
        }
    },
    prepareSelectedOrders: function () {
        if (this.props.initialSelectedOrders == undefined) {
            return []
        } else {
            var array = []
            for (var i = 0; i < this.props.initialSelectedOrders.length; i++) {
                var order = {
                    id: i,
                    text: this.props.initialSelectedOrders[i].name
                }
                array.push(order)
            }
            return array
        }
    },
    prepareSelectedEmployee: function () {
        if (this.props.initialSelectedEmployee == undefined) {
            return []
        } else {
            var array = []
            for (var i = 0; i < this.props.initialSelectedEmployee.length; i++) {
                var empoyee = {
                    id: i,
                    text: this.props.initialSelectedEmployee[i].name
                }
                array.push(empoyee)
            }
            return array
        }
    },
    prepareClientSuggestions: function () {
        if (this.props.clients == undefined) {
            return []
        } else {
            var array = []
            for (var i = 0; i < this.props.clients.length; i++) {
                var client = this.props.clients[i].name
                array.push(client)
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
    prepareOrderSuggestions: function () {
        if (this.props.orders == undefined) {
            return []
        } else {
            var array = []
            for (var i = 0; i < this.props.orders.length; i++) {
                var order = this.props.orders[i].name
                array.push(order)
            }
            return array
        }
    },
    handleDeleteClient: function (i) {
        var selectedClients = this.state.selectedClients;
        selectedClients.splice(i, 1);
        this.setState({ selectedClients: selectedClients });
    },
    handleDeleteOrder: function (i) {
        var selectedOrders = this.state.selectedOrders;
        selectedOrders.splice(i, 1);
        this.setState({ selectedClients: selectedOrders });
    },
    handleAdditionOrder: function (tag) {
        var selectedOrders = this.state.selectedOrders;
        selectedOrders.push({
            id: selectedOrders.length + 1,
            text: tag
        });
        this.setState({ selectedOrders: selectedOrders });
    },
    handleAdditionClient: function (tag) {
        var selectedClients = this.state.selectedClients;
        selectedClients.push({
            id: selectedClients.length + 1,
            text: tag
        });
        this.setState({ selectedClients: selectedClients });
    },

    handleDeleteEmployee: function (i) {
        var selectedEmployee = this.state.selectedEmployee;
        selectedEmployee.splice(i, 1);
        this.setState({ selectedEmployee: selectedEmployee });
    },
    handleAdditionEmployee: function (tag) {
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
            api.createGroup(this.prepareGroup()).then(function () {
                that.props.finishModal();
            }, function () {

            })
        } else {
            if (this.props.type == 'client') {
                if (this.prepareGroup().canworkwith != this.props.initialSelectedEmployee || this.prepareGroup().users != this.props.initialSelectedClients || this.prepareGroup().name != this.props.name || this.prepareGroup().orders != this.props.group.orders) {
                    api.updateGroup(this.prepareGroup()).then(function () {
                        that.props.finishModal();
                    }, function () {

                    })
                }
            } else {
                if (this.prepareGroup().users != this.props.initialSelectedEmployee || this.prepareGroup().name != this.props.name || this.prepareGroup().orders != this.props.group.orders) {
                    api.updateGroup(this.prepareGroup()).then(function () {
                        that.props.finishModal();
                    }, function () {

                    })
                }
            }
        }

    },
    close: function () {
        this.props.finishModal();
    },
    delete: function () {
        var that = this
        api.deleteGroup(this.prepareGroup()).then(function () {
            that.props.finishModal();
        }, function () {

        })
    },
    prepareGroup: function () {
        if (this.props.type == "employee") {

            var canworkwith = []
            for (var i = 0; i < this.state.selectedClients.length; i++) {
                for (var j = 0; j < this.state.clients.length; j++) {
                    if (this.state.selectedClients[i].text == this.state.clients[j].name) {
                        canworkwith.push(this.state.clients[j])
                    }
                }
            }

            var selectedEmployee = []
            for (var i = 0; i < this.state.selectedEmployee.length; i++) {
                for (var j = 0; j < this.state.employees.length; j++) {
                    if (this.state.selectedEmployee[i].text == this.state.employees[j].name) {
                        selectedEmployee.push(this.state.employees[j])
                    }
                }
            }

            var orders = []
            for (var i = 0; i < this.state.selectedOrders.length; i++) {
                for (var j = 0; j < this.state.orders.length; j++) {
                    if (this.state.selectedOrders[i].text == this.state.orders[j].name) {
                        orders.push(this.state.orders[j]._id)
                    }
                }
            }

            var group = {
                type: this.state.type,
                name: this.state.name,
                canworkwith: canworkwith,
                users: selectedEmployee,
                orders: orders,
                _id: this.props._id
            }

            return group
        } else {
            var canworkwith = []
            for (var i = 0; i < this.state.selectedEmployee.length; i++) {
                for (var j = 0; j < this.state.employees.length; j++) {
                    if (this.state.selectedEmployee[i].text == this.state.employees[j].name) {
                        canworkwith.push(this.state.employees[j])
                    }
                }
            }

            var selectedClients = []

            for (var i = 0; i < this.state.selectedClients.length; i++) {
                for (var j = 0; j < this.state.clients.length; j++) {
                    if (this.state.selectedClients[i].text == this.state.clients[j].name) {
                        selectedClients.push(this.state.clients[j])
                    }
                }
            }

            var orders = []
            for (var i = 0; i < this.state.selectedOrders.length; i++) {
                for (var j = 0; j < this.state.orders.length; j++) {
                    if (this.state.selectedOrders[i].text == this.state.orders[j].name) {
                        orders.push(this.state.orders[j]._id)
                    }
                }
            }

            var group = {
                type: this.state.type,
                name: this.state.name,
                canworkwith: canworkwith,
                users: selectedClients,
                orders: orders,
                _id: this.props._id
            }
            return group
        }
    },
    render: function () {

        var that = this

        function prepareClientTips() {
            return 'Например: ' + that.state.suggestionsClients.join()
        }

        function prepareEmployeeTips() {
            return 'Например: ' + that.state.suggestionsEmployee.join()
        }

        function prepareOrdersTips() {
            return 'Например: ' + that.state.suggestionsOrders.join()
        }

        var selectedEmployee = this.state.selectedEmployee
        var placeholder = "Начните писать"

        if (this.props.type == "client") {
            if (this.state.name == undefined) {
                var title = "Создать группу клиента"
            } else {
                var title = this.props.name
            }
        } else {
            if (this.state.name == undefined) {
                var title = "Создать группу исполнителя"
            } else {
                var title = this.props.name
            }
        }

        var that = this

        function handleAddition() {
            if (that.props.type == "client") {
                return that.handleAdditionClient
            } else {
                return that.handleAdditionEmployee
            }
        }

        function resolveCanWorkWith() {

            if (that.props.type == "client") {
                return (
                    <div className={that.state.validatedSelectedEmployeeClassName}>
                        <label>Исполнители, которые могут работать с клиентом</label>
                        <ReactTags tags={selectedEmployee}
                            placeholder={placeholder}
                            classNames={{ tagInputField: 'form-control' }}
                            suggestions={that.state.suggestionsEmployee}
                            handleDelete={that.handleDeleteEmployee}
                            handleAddition={that.handleAdditionEmployee}
                            handleChange={that.handleChange} />
                        <i>{prepareEmployeeTips()}</i>
                    </div>
                )
            } else {
                return (<div className={that.state.validatedSelectedEmployeeClassName}>
                    <label>Клиенты, которые могут работать с исполнителем</label>
                    <ReactTags tags={that.state.selectedClients}
                        placeholder={placeholder}
                        classNames={{ tagInputField: 'form-control' }}
                        suggestions={that.state.suggestionsClients}
                        handleDelete={that.handleDeleteClient}
                        handleAddition={that.handleAdditionClient}
                        handleChange={that.handleChange} />
                    <i>{prepareClientTips()}</i>
                </div>
                )
            }
        }

        function resolveAccountCreation() {
            if (that.props.type == "client") {
                return (
                    <div className={that.state.validatedSelectedClientsClassName}>
                        <label>Клиенты, входящие в группу</label>
                        <ReactTags tags={that.state.selectedClients}
                            classNames={{ tagInputField: 'form-control' }}
                            placeholder={placeholder}
                            suggestions={that.state.suggestionsClients}
                            handleDelete={that.handleDeleteClient}
                            handleAddition={that.handleAdditionClient}
                            handleChange={that.handleChange} />
                        <i>{prepareClientTips()}</i>
                    </div>
                )
            } else {
                return (
                    <div className={that.state.validatedSelectedEmployeeClassName}>
                        <label>Исполнители, входящие в группу</label>
                        <ReactTags tags={that.state.selectedEmployee}
                            classNames={{ tagInputField: 'form-control' }}
                            placeholder={placeholder}
                            suggestions={that.state.suggestionsEmployee}
                            handleDelete={that.handleDeleteClient}
                            handleAddition={that.handleAdditionEmployee}
                            handleChange={that.handleChange} />
                        <i>{prepareEmployeeTips()}</i>
                    </div>
                )
            }
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
                                {resolveAccountCreation()}
                                {resolveCanWorkWith()}

                                <div className={that.state.validatedSelectedEmployeeClassName}>
                                    <label>Заказы, доступные группе</label>
                                    <ReactTags tags={that.state.selectedOrders}
                                        classNames={{ tagInputField: 'form-control' }}
                                        placeholder={placeholder}
                                        suggestions={that.state.suggestionsOrders}
                                        handleDelete={that.handleDeleteOrder}
                                        handleAddition={that.handleAdditionOrder}
                                        handleChange={that.handleChange} />
                                    <i>{prepareOrdersTips()}</i>
                                </div>

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

module.exports = AdminGroupDetails
