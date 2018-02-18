var React = require('react');
var createReactClass = require('create-react-class');
var AdminStatusDetails = require('./AdminStatusDetails.jsx');
var api = require('./api/api.jsx');

var AdminStatusesList = createReactClass({
    getInitialState: function () {
        return {
            statuses: [],
            modalIsActive: false
        }
    },
    componentDidMount: function () {
        this.fetchStatuses()
    },
    fetchStatuses: function () {
        var that = this
        api.getStatuses().then(function (statuses) {
            that.setState({
                statuses: statuses
            })
        }, function () {

        })
    },
    handleRowClick: function (e) {
        this.setState({
            modalIsActive: true,
            modalData: e
        })
    },
    prepareRows: function () {
        var that = this
        var array = [];
        this.state.statuses.forEach(function (status, index) {
            array.push(<StatusRow onRowClick={that.handleRowClick} key={index} item={status} />)
        });
        return array
    },
    prepareModal: function () {
        if (this.state.modalIsActive == true) {

            return <AdminStatusDetails
            fields={this.state.modalData.fields}
            name={this.state.modalData.name}
            _id={this.state.modalData._id}
            isFinal={this.state.modalData.isFinal}
            groups_permission_to_edit={this.state.modalData.groups_permission_to_edit}
            users_permission_to_edit={this.state.modalData.users_permission_to_edit}
            finishModal={this.finishModal} />
        }
    },
    finishModal: function () {
        $("#detailsModal").modal('hide');
        this.fetchStatuses()
        this.setState({
            modalIsActive: false
        })

    },
    createStatus: function () {
        this.setState({
            modalIsActive: true,
            modalData: {},
            fields: []
        })
    },
    render: function () {
        return (
            <div className="row">

                <div className="well col-lg-8">
                    <h1 className="hide">Статусы</h1>
                    <div className="padding-top-20">
                        <button type="button" onClick={this.createStatus} className="btn  btn-success">Создать статус</button>
                    </div>
                    <div className="padding-top-20">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Тип</th>
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

var StatusRow = createReactClass({
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

module.exports = AdminStatusesList