var React = require('react');
var createReactClass = require('create-react-class');
var AdminOrderDetails = require('./AdminOrderDetails.jsx');
var api = require('./api/api.jsx');

var AdminOrdersList = createReactClass({
    componentDidMount: function() {
        this.fetchOrders()
    },
    fetchOrders: function() {
        var that = this
        api.getOrders().then(function(orders) {
            that.setState({
                orders: orders
            })
        }, function() {

        })
    },
    getInitialState: function() {
        return {
            orders: [],
            modalIsActive: false
        }
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
        this.state.orders.forEach(function(order, index) {
           array.push(<OrderRow onRowClick={that.handleRowClick} key={index} item={order}/>)
        });
        return array
    },
    prepareModal: function () {
        if (this.state.modalIsActive == true) {
            return <AdminOrderDetails statuses={this.state.modalData.statuses} name={this.state.modalData.name} _id={this.state.modalData._id} finishModal={this.finishModal}/>
        }
    },
    finishModal: function() {
        $("#detailsModal").modal('hide');
        this.fetchOrders()
        this.setState({
            modalIsActive: false
        })
    },
    createOrder: function() {
        this.setState({
            modalIsActive: true,
            modalData: {},
            statuses:[]
        })
    },
    render: function() {
      return (
        <div className="row">

        <div className="well col-lg-8">
            <h1 className="hide">Типы заказов</h1>
            <div className="padding-top-20">
                <button type="button" onClick={this.createOrder} className="btn  btn-success">Создать тип заказа</button>
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

var OrderRow = createReactClass({
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

module.exports = AdminOrdersList