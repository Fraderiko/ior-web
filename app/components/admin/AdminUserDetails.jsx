var React = require('react');
var createReactClass = require('create-react-class');
var api = require('./api/api.jsx')

var AdminUserDetails = createReactClass({
    componentDidMount: function () {
        $("#detailsModal").modal('show');
    },
    getInitialState: function () {

        var that = this

        function resolvePassword() {
            if (that.props.password == undefined) {
                return makePassword()
            } else {
                return that.props.password
            }
        }

        function makePassword() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 5; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        return {
            name: this.props.name,
            mail: this.props.mail,
            phone: this.props.phone,
            type: this.props.type,
            permission_to_cancel_orders: this.props.permission_to_cancel_orders || false,
            permission_to_edit_orders: this.props.permission_to_edit_orders || false,
            password: resolvePassword(),
            validatedNameClassName: "form-group",
            validatedNameMailName: "form-group",
            validatedNameTypeName: "form-group",
        }
    },
    finishModal: function () {
        var that = this

        if (this.state.name == undefined || this.state.name == "" || this.state.mail == undefined || this.state.mail == "" || this.state.type == undefined || this.state.type == "") {
            if (this.state.name == undefined || this.state.name == "") {
                this.setState({
                    validatedNameClassName: "has-error form-group"
                })
            } else {
                this.setState({
                    validatedNameClassName: "form-group"
                })
            }

            if (this.state.mail == undefined || this.state.mail == "") {
                this.setState({
                    validatedNameMailName: "has-error form-group"
                })
            } else {
                this.setState({
                    validatedNameMailName: "form-group"
                })
            }

            if (this.state.type == undefined || this.state.type == "") {
                this.setState({
                    validatedNameTypeName: "has-error form-group"
                })
            } else {
                this.setState({
                    validatedNameTypeName: "form-group"
                })
            }

            return
        }

        if (this.props._id == undefined) {
            api.createUser(this.prepareUser()).then(function () {
                that.props.finishModal();
            }, function () {

            })
        } else {
            api.updateUser(this.prepareUser()).then(function () {
                that.props.finishModal();
            }, function () {

            })
        }
    },
    delete: function () {
        var that = this
        api.deleteUser(this.prepareUser()).then(function () {
            that.props.finishModal();
        }, function () {

        })
    },
    close: function () {
        this.props.finishModal();
    },
    prepareUser: function () {

        if (this.props.permission_to_edit_orders == null) {
          var permission_to_edit_orders = true
        }

        if (this.props.new_orders_notification == null) {

        }

        var user = {
            name: this.state.name,
            mail: this.state.mail,
            phone: this.state.phone || "",
            type: this.state.type,
            new_orders_notification: this.props.new_orders_notification || true,
            new_status_notification: this.props.new_status_notification || true,
            new_chat_notification: this.props.new_chat_notification || true,
            _id: this.props._id,
            password: this.state.password,
            permission_to_cancel_orders: this.state.permission_to_cancel_orders,
            permission_to_edit_orders: this.state.permission_to_edit_orders,
            push_id: '',
            new_orders_push_notification: this.props.new_orders_push_notification || true,
            new_status_push_notification: this.props.new_status_push_notification || true
        }
        return user
    },
    handleNameChange: function (e) {
        this.setState({
            name: e.target.value
        })
    },
    handleMailChange: function (e) {
        this.setState({
            mail: e.target.value
        })
    },
    handlePasswordChange: function (e) {
        this.setState({
            password: e.target.value
        })
    },
    handlePhoneChange: function (e) {
        this.setState({
            phone: e.target.value
        })
    },
    handleTypeChange: function (e) {
        this.setState({
            type: e.target.value
        })
    },
    handleCancelChange: function (e) {
        this.setState({
            permission_to_cancel_orders: e.target.checked
        })
    },
    handleEditChange: function (e) {
        this.setState({
            permission_to_edit_orders: e.target.checked
        })
    },
    render: function () {
        return (
            <div>

                <div id="detailsModal" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog orderModal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={this.close}>&times;</button>
                                <h4 className="modal-title">{this.state.name}</h4>
                            </div>
                            <div className="modal-body">

                                <div className="form-group">
                                    <label>Тип</label>
                                    <select className="form-control" id="type-select" value={this.state.type} onChange={this.handleTypeChange}>
                                        <option value="">Выберите</option>
                                        <option value="client">Клиент</option>
                                        <option value="employee">Исполнитель</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>ФИО</label>
                                    <input className="form-control" id="name" value={this.state.name} onChange={this.handleNameChange} placeholder="Укажите ФИО"></input>
                                </div>
                                <div className="form-group">
                                    <label>Электронная почта</label>
                                    <input className="form-control" id="email" value={this.state.mail} onChange={this.handleMailChange} placeholder="Укажите электронную почту"></input>
                                </div>
                                <div className="form-group">
                                    <label>Пароль</label>
                                    <input className="form-control" id="phone" value={this.state.password} onChange={this.handlePasswordChange} placeholder="Укажите пароль"></input>
                                </div>
                                <div className="form-group">
                                    <label>Телефон</label>
                                    <input className="form-control" id="phone" value={this.state.phone} onChange={this.handlePhoneChange} placeholder="Укажите телефон"></input>
                                </div>
                                <div className="checkbox">
                                    <label><input value={this.state.permission_to_cancel_orders} onChange={this.handleCancelChange} checked={this.state.permission_to_cancel_orders} type="checkbox"></input>Может отменять заказы</label>
                                </div>
                                <div className="checkbox">
                                    <label><input value={this.state.permission_to_edit_orders} onChange={this.handleEditChange} checked={this.state.permission_to_edit_orders} type="checkbox"></input>Может редактировать заказы</label>
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

module.exports = AdminUserDetails
