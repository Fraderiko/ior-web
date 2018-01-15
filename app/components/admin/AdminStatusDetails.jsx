var React = require('react');
var createReactClass = require('create-react-class');
var ReactTags = require('react-tag-input').WithContext;
var api = require('./api/api.jsx');

var AdminStatusDetails = createReactClass({
    componentDidMount: function () {
        $("#detailsModal").modal('show');
        this.getFields()
    },
    getFields: function () {
        var that = this
        api.getFields().then(function (fields) {
            var suggestions = []
            for (var i = 0; i < fields.length; i++) {
                suggestions.push(fields[i].name)
            }
            that.setState({
                suggestions: suggestions,
                allFields: fields
            })
        }, function () {

        })
    },
    getInitialState: function () {

        if (this.props.fields == undefined) {
            var fields = []
        } else {
            var array = []
            for (var i = 0; i < this.props.fields.length; i++) {
                console.log(this.props.fields[i])
                var field = {
                    id: i,
                    text: this.props.fields[i].name
                }
                array.push(field)
            }
            var fields = array
        }

        if (this.props.name == undefined) {
            var name = ''
        } else {
            var name = this.props.name
        }

        if (this.props.isFinal == undefined) {
            var isFinal = false
        } else {
            var isFinal = this.props.isFinal
        }

        return {
            name: name,
            fields: fields,
            suggestions: [],
            validatedNameClassName: "form-group",
            validatedFieldsClassName: "form-group",
            isFinal: isFinal
        }
    },
    prepareStatus: function () {
        var selectedFields = []
        for (var i = 0; i < this.state.fields.length; i++) {
            for (var j = 0; j < this.state.allFields.length; j++) {
                if (this.state.fields[i].text == this.state.allFields[j].name) {
                    selectedFields.push(this.state.allFields[j])
                }
            }
        }

        var status = {
            name: this.state.name,
            fields: selectedFields,
            _id: this.props._id,
            isFinal: this.state.isFinal
        }
        console.log(status)
        return status
    },
    finishModal: function () {
        var that = this

        if (this.state.name == undefined || this.state.name == "" || this.state.fields.length == 0) {
            if (this.state.name == undefined || this.state.name == "") {
                this.setState({
                    validatedNameClassName: "has-error form-group"
                })
            } else {
                this.setState({
                    validatedNameClassName: "form-group"
                })
            }

            if (this.state.fields.length == 0) {
                this.setState({
                    validatedFieldsClassName: "has-error form-group"
                })
            } else {
                this.setState({
                    validatedFieldsClassName: "form-group"
                })
            }
            return

        }

        if (this.props._id == undefined) {
            api.createStatus(this.prepareStatus()).then(function () {
                that.props.finishModal();
            }, function () {

            })
        } else if (this.state.name != this.props.name || this.state.fields != this.props.fields) {
            api.updateStatus(this.prepareStatus()).then(function () {
                that.props.finishModal();
            }, function () {

            })
        }
    },
    close: function () {
        this.props.finishModal();
    },
    delete: function () {
        var that = this
        api.deleteStatus(this.prepareStatus()).then(function () {
            that.props.finishModal();
        }, function () {

        })
    },
    handleNameChange: function (e) {
        this.setState({
            name: e.target.value
        })
    },
    handleDeleteField: function (i) {
        var fields = this.state.fields;
        fields.splice(i, 1);
        this.setState({ fields: fields });
    },
    handleAdditionField: function (tag) {
        var fields = this.state.fields;
        fields.push({
            id: fields.length + 1,
            text: tag
        });
        this.setState({ fields: fields });
    },
    handleStatusChange: function (e) {
        this.setState({
            feilds: e.target.value
        })
    },
    handleFinal: function (e) {
        this.setState({
            isFinal: e.target.checked
        })
    },
    render: function () {

        var that = this

        function prepareTips() {
            return 'Например: ' + that.state.suggestions.join()
        }

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

                                <div className={this.state.validatedNameClassName}>
                                    <label>Название</label>
                                    <input className="form-control" id="name" value={this.state.name} onChange={this.handleNameChange} placeholder="Название"></input>
                                </div>

                                <div className={this.state.validatedFieldsClassName}>
                                    <label>Поля</label>
                                    <ReactTags
                                        tags={this.state.fields}
                                        placeholder={"Начните писать"}
                                        classNames={{ tagInputField: 'form-control' }}
                                        suggestions={this.state.suggestions}
                                        handleDelete={this.handleDeleteField}
                                        handleAddition={this.handleAdditionField}
                                        handleChange={this.handleFieldChange} />
                                    <i>{prepareTips()}</i>
                                </div>
                                <div className="checkbox">
                                    <label><input value={this.state.isFinal} onChange={this.handleFinal} checked={this.state.isFinal} type="checkbox"></input>Этот статус завершает заказ</label>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={this.close} className="btn btn-default">Закрыть</button>
                                <button type="button" onClick={this.finishModal} className="btn btn-success">Сохранить</button>
                                <button type="button" onClick={this.delete} className="btn btn-danger">Удалить</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = AdminStatusDetails