var React = require('react');
var createReactClass = require('create-react-class');
var ReactTags = require('react-tag-input').WithContext;
var api = require('./api/api.jsx');

var AdminOrderDetails = createReactClass({
    componentDidMount: function () {
        $("#detailsModal").modal('show');
        this.fetchStatuses()
    },
    getInitialState: function () {

        if (this.props.statuses == undefined) {
            var statuses = []
        } else {
            var array = []
            for (var i = 0; i < this.props.statuses.length; i++) {
                var status = {
                    id: i,
                    text: this.props.statuses[i].name
                }
                array.push(status)
            }
            var statuses = array
        }

        if (this.props.name == undefined) {
            var name = ''
        } else {
            var name = this.props.name
        }

        return {
            name: this.props.name,
            statuses: statuses,
            suggestions: [],
            validatedNameClassName: "form-group",
            validatedStatusesClassName: "form-group"
        }
    },
    prepareOrder: function() {

        var selectedStatuses = []
        for (var i = 0; i < this.state.statuses.length; i++) {
            for (var j = 0; j < this.state.allStatuses.length; j++) {
                if (this.state.statuses[i].text == this.state.allStatuses[j].name) {
                    selectedStatuses.push(this.state.allStatuses[j])
                }
            }
        }

        var order = {
            name: this.state.name,
            isTemplate: true,
            statuses: selectedStatuses,
            _id: this.props._id
        }

        return order
    },
    fetchStatuses: function() {
        var that = this
        api.getStatuses().then(function(statuses) {
            var suggestions = []
            for (var i = 0; i < statuses.length; i++) {
                suggestions.push(statuses[i].name)
            }
            that.setState({
                suggestions: suggestions,
                allStatuses: statuses
            })
        }, function() {

        })
    },
    delete: function() {
        var that = this
        api.deleteOrder(this.prepareOrder()).then(function() {
            that.props.finishModal();
        }, function() {

        })
    },
    close: function() {
        this.props.finishModal();
    },
    finishModal: function () {
        var that = this

        if (this.state.name == undefined || this.state.name == "" || this.state.statuses.length == 0) {
            if (this.state.name == undefined || this.state.name == "") {
                this.setState({
                    validatedNameClassName: "has-error form-group"
                })
            } else {
                this.setState({
                    validatedNameClassName: "form-group"
                })
            }

            if (this.state.statuses.length == 0) {
                this.setState({
                    validatedStatusesClassName: "has-error form-group"
                }) 
            } else {
                this.setState({
                    validatedStatusesClassName: "form-group"
                }) 
            }
            return
        }

        if (this.props._id == undefined) {
            api.createOrder(this.prepareOrder()).then(function () {
                that.props.finishModal();
            }, function () {

            })
        } else if (this.state.name != this.props.name || this.state.statuses != this.props.statuses) {
            api.updateOrder(this.prepareOrder()).then(function () {
                that.props.finishModal();
            }, function () {

            })
        }  
    },
    handleNameChange: function (e) {
        this.setState({
            name: e.target.value
        })
    },
    handleDeleteStatus: function (i) {
        var statuses = this.state.statuses;
        statuses.splice(i, 1);
        this.setState({ statuses: statuses });
    },
    handleAdditionStatus: function (tag) {
        var statuses = this.state.statuses;
        statuses.push({
            id: statuses.length + 1,
            text: tag
        });
        this.setState({ statuses: statuses });
    },
    handleStatusChange: function (e) {
        this.setState({
            statuses: e.target.value
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

                                <div className={this.state.validatedStatusesClassName}>
                                    <label>Статусы</label>
                                    <ReactTags
                                        tags={this.state.statuses}
                                        placeholder={"Начните писать"}
                                        classNames={{ tagInputField: 'form-control' }}
                                        suggestions={this.state.suggestions}
                                        handleDelete={this.handleDeleteStatus}
                                        handleAddition={this.handleAdditionStatus}
                                        handleChange={this.handleStatusChange} />
                                    <i>{prepareTips()}</i>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={this.close} className="btn btn-default" >Закрыть</button>
                                <button type="button" onClick={this.finishModal} className="btn btn-success">Сохранить</button>
                                <button type="button" onClick={this.delete} className="btn btn-danger" >Удалить</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = AdminOrderDetails