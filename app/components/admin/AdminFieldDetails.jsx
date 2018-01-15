var React = require('react');
var createReactClass = require('create-react-class');
var api = require('./api/api.jsx');

var AdminFieldDetails = createReactClass({
    componentDidMount: function () {
        $("#detailsModal").modal('show');
    },
    getInitialState: function () {
        return {
            name: this.props.name,
            type: this.props.type,
            required: this.props.required || false,
            recepientvisible: this.props.recepientvisible || false,
            _id: this.props._id,
            validatedNameClassName: "form-group",
            validatedTypeClassName: "form-group"
        }
    },
    finishModal: function () {
        var that = this

        if (this.state.name == undefined || this.state.name == "" || this.state.type == undefined || this.state.type == "") {

            if (this.state.name == undefined || this.state.name == "") {
                this.setState({
                    validatedNameClassName: "has-error form-group"
                })
            } else {
                this.setState({
                    validatedNameClassName: "form-group"
                })
            }

            if (this.state.type == undefined || this.state.type == "") {
                this.setState({
                    validatedTypeClassName: "has-error form-group"
                })
            } else {
                this.setState({
                    validatedTypeClassName: "form-group"
                })
            }

            return
        }

        if (this.state._id != undefined) {
            var field = this.prepareField()
            api.updateField(field).then(function () {
                that.props.finishModal();
            }, function () {

            });
        } else if (this.state.name != this.props.name || this.state.type != this.props.type || this.state.required != this.props.required || this.state.recepientvisible != this.props.recepientvisible) {
            var field = this.prepareField()
            api.createField(field).then(function () {
                that.props.finishModal();
            }, function () {

            });
        } else {
            that.props.finishModal();
        }
    },
    close: function () {
        this.props.finishModal();
    },
    delete: function () {
        var that = this
        return function () {
            var field = that.prepareField()
            api.deleteField(field).then(function () {
                that.props.finishModal();
            }, function () {

            });
        }
    },
    prepareField: function () {
        return {
            name: this.state.name,
            type: this.state.type,
            required: this.state.required,
            recepientvisible: this.state.recepientvisible,
            _id: this.props._id,
            media: [],
            value: ''
        }
    },
    handleNameChange: function (e) {
        this.setState({
            name: e.target.value
        })
    },
    handleTypeChange: function (e) {
        this.setState({
            type: e.target.value
        })
    },
    handleVisibleChange: function (e) {
        this.setState({
            recepientvisible: e.target.checked
        })
    },
    handleRequiredChange: function (e) {
        this.setState({
            required: e.target.checked
        })
    },
    render: function () {
        return (
            <div>

                <div id="detailsModal" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog orderModal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" onClick={this.close} className="close">&times;</button>
                                <h4 className="modal-title">{this.state.name}</h4>
                            </div>
                            <div className="modal-body">

                                <div className={this.state.validatedNameClassName}>
                                    <label>Название</label>
                                    <input className="form-control" id="name" value={this.state.name} onChange={this.handleNameChange} placeholder="Укажите название"></input>
                                </div>

                                <div className={this.state.validatedTypeClassName}>
                                    <label>Тип</label>
                                    <select className="form-control" id="type-select" value={this.state.type} onChange={this.handleTypeChange}>
                                        <option value="">Выберите</option>
                                        <option value="text">Текстовое</option>
                                        <option value="digit">Цифровое</option>
                                        <option value="image">Фото</option>
                                        <option value="video">Видео</option>
                                        <option value="date">Дата</option>
                                        <option value="time">Время</option>
                                        <option value="file">Файл</option>
                                    </select>
                                </div>

                                <div className="checkbox">
                                    <label><input value={this.state.recepientvisible} onChange={this.handleVisibleChange} checked={this.state.recepientvisible} type="checkbox"></input>Видно грузополучателю</label>
                                </div>
                                <div className="checkbox">
                                    <label><input value={this.state.required} onChange={this.handleRequiredChange} checked={this.state.required} type="checkbox"></input>Обязательно для заполнения</label>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={this.close} className="btn btn-default">Закрыть</button>
                                <button type="button" onClick={this.finishModal} className="btn btn-success">Сохранить</button>
                                <button type="button" onClick={this.delete()} className="btn btn-danger">Удалить</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = AdminFieldDetails