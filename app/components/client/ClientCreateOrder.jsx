var React = require('react');
var createReactClass = require('create-react-class');
var api = require('./api/api.jsx');
var Cookies = require('universal-cookie');
var { withRouter } = require('react-router-dom');
var Alert = require('react-s-alert').default;

var ClientCreateOrder = createReactClass({
  getInitialState: function () {
    return {
      orders: [],
      templates: [],
      assignedTo: '',
      ordertype: '',
      canworkwith: [],
      number: '',
      comment: '',
      mail: '',
      phone: '',
      validatedNameClassName: "form-group",
      validatedTypeClassName: "form-group",
      validatedAssignedToClassName: "form-group",
      validatedEmailClassName: "form-group"
    }
  },
  componentDidMount: function () {
    // this.fetchTemplates()
    this.fetchCanWorkWith()
  },
  fetchCanWorkWith: function () {
    var cookies = new Cookies()
    var that = this
    var _id = {
      "_id": cookies.get('_id')
    }
    var type = cookies.get('type')
    this.setState({
      type: type,
      _id: cookies.get('_id')
    })

    if (type == 'client') {
      api.getCanWorkWith(_id).then(function (response) {
        console.log(response)
        that.setState({
          canworkwith: response.canworkwith,
          orders: response.orders
        })
      }, function () {

      })
    } else {
      api.getCanWorkWith(_id).then(function (response) {
        that.setState({
          canworkwith: response.canworkwith,
          orders: response.orders
        })
      }, function () {

      })
    }


  },
  fetchTemplates: function () {
    var that = this
    api.getOrderTemplates().then(function (templates) {
      that.setState({
        templates: templates
      })
    }, function () {

    })
  },
  prepareTypes: function () {
    if (this.state.orders.length > 0) {
      return this.state.orders.map(function (template) { return <option key={template._id} value={template.name}>{template.name}</option> })
    }
  },
  prepareEmployee: function () {
    if (this.state.canworkwith.length > 0) {
      return this.state.canworkwith.map(function (user) { return <option key={user._id} value={user.name}>{user.name}</option> })
    }
  },
  handleNumberChange: function (e) {
    this.setState({
      number: e.target.value.replace(/[^a-z0-9]/i, "")
    })
  },
  handleCommentChange: function (e) {
    this.setState({
      comment: e.target.value
    })
  },
  handleAssignedToChanged: function (e) {
    this.setState({
      assignedTo: e.target.value
    })
  },
  handleTypeChange: function (e) {
    this.setState({
      ordertype: e.target.value
    })
  },
  handleMailChange: function (e) {
    this.setState({
      mail: e.target.value
    })
  },
  handlePhoneChange: function (e) {
    this.setState({
      phone: e.target.value
    })
  },
  submitHandler: function (e) {
    // e.preventDefault;

    if (this.state.number == undefined || this.state.number == "" || this.state.ordertype == "" || this.state.assignedTo == "") {
      if (this.state.number == undefined || this.state.number == "") {
        this.setState({
          validatedNameClassName: "has-error form-group"
        })
      } else {
        this.setState({
          validatedNameClassName: "form-group"
        })
      }

      if (this.state.ordertype == "") {
        this.setState({
          validatedTypeClassName: "has-error form-group"
        })
      } else {
        this.setState({
          validatedTypeClassName: "form-group"
        })
      }

      if (this.state.assignedTo == "") {
        this.setState({
          validatedAssignedToClassName: "has-error form-group"
        })
      } else {
        this.setState({
          validatedAssignedToClassName: "form-group"
        })
      }

      return
    }

    var that = this
    var cookies = new Cookies()
    api.getUserGroup(this.resolveClient()).then(function (group) {

      var order = {
        number: that.state.number  + '-' + that.generateRandomString(),
        date: new Date().getTime(),
        updated: new Date().getTime(),
        type: that.getOrderType(),
        currentstatus: "Создан",
        assignedTo: that.getAssignedTo(),
        comment: that.state.comment,
        statuses: that.getStatuses(),
        createdBy: cookies.get('_id'),
        group: group._id,
        recipientmail: that.state.mail,
        recipientphone: that.state.phone,
        client: that.resolveClient(),
        isArchived: false,
        cancelReason: '',
        messages: []
      }

      api.createOrder(order).then(function (response) {
        if (response.result == "ok") {
          that.props.history.push('/?created=true')
        } else {
          Alert.error('Ошибка! Номер заказа должен быть уникальным', {
            position: 'top',
            effect: 'slide',
            timeout: 10000
          });
        }
        
      }, function () {

      })

    }, function () {

    })
  },
  resolveClient: function () {
    if (this.state.type == 'client') {
      return this.state._id
    } else {
      return this.getClientId()
    }
  },
  getClientId: function () {
    for (var i = 0; i < this.state.canworkwith.length; i++) {
      if (this.state.canworkwith[i].name == this.state.assignedTo) {
        return this.state.canworkwith[i]._id
      }
    }
  },
  getAssignedTo: function () {
    if (this.state.type == 'client') {
      for (var i = 0; i < this.state.canworkwith.length; i++) {
        if (this.state.canworkwith[i].name == this.state.assignedTo) {
          return this.state.canworkwith[i]._id
        }
      }
    } else {
      return this.state._id
    }
  },
  getStatuses: function () {
    var orderId = this.getOrderType()
    var template = this.state.orders.filter(function (template) { return template._id == orderId })

    var statuses = []
    for (var i = 0; i < template[0].statuses.length; i++) {
      var fields = []
      for (var j = 0; j < template[0].statuses[i].fields.length; j++) {
        var field = {
          name: template[0].statuses[i].fields[j].name,
          type: template[0].statuses[i].fields[j].type,
          value: '',
          required: template[0].statuses[i].fields[j].required,
          recepientvisible: template[0].statuses[i].fields[j].recepientvisible,
          media: []
        }
        fields.push(field)
      }
      var status = {
        name: template[0].statuses[i].name,
        fields: fields,
        isFinal: template[0].statuses[i].isFinal || false
      }
      statuses.push(status)
    }
    return statuses
  },
  getOrderType: function () {
    for (var i = 0; i < this.state.orders.length; i++) {
      if (this.state.orders[i].name == this.state.ordertype) {
        return this.state.orders[i]._id
      }
    }
  },
  generateRandomString: function() {
      var text = "";
      var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 5; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  },
  render: function () {

    var that = this

    function resolveClientOrEmployeeTitle() {
      if (that.state.type == 'client') {
        return "Исполнитель"
      } else {
        return "Клиент"
      }
    }

    return (
      <div className="well as-mt-30">
        <h1 className="hide">Создать заказ</h1>
        <form onSubmit={this.submitHandler}>
          <div className={this.state.validatedNameClassName}>
            <label>Номер заказа</label>
            <input className="form-control" value={this.state.number} onChange={this.handleNumberChange} id="email" placeholder="Укажите номер"></input>
            <i>допустимы только латинские буквы и цифры</i>
          </div>
          <div className={this.state.validatedTypeClassName}>
            <label>Тип заказа</label>
            <select className="form-control" value={this.state.ordertype} onChange={this.handleTypeChange} id="type">
              <option value="">Выберите</option>
              {this.prepareTypes()}
            </select>
          </div>
          <div className={this.state.validatedAssignedToClassName}>
            <label>{resolveClientOrEmployeeTitle()}</label>
            <select className="form-control" value={this.state.assignedTo} onChange={this.handleAssignedToChanged} id="empoyee">
              <option value="">Выберите</option>
              {this.prepareEmployee()}
            </select>
          </div>
          <div className={this.state.validatedEmailClassName}>
            <label>Почтовый адрес получателя заказа</label>
            <input className="form-control" value={this.state.mail} onChange={this.handleMailChange} id="email" placeholder="Укажите электронный адрес получателя"></input>
          </div>
          <div className={this.state.validatedEmailClassName}>
            <label>Телефон получателя заказа</label>
            <input className="form-control" value={this.state.phone} onChange={this.handlePhoneChange} id="email" placeholder="Укажите телефон получателя"></input>
          </div>
          <div className="form-group">
            <label>Комментарий</label>
            <textarea className="form-control" id="comment" value={this.state.comment} onChange={this.handleCommentChange} placeholder="Если необходимо"></textarea>
          </div>
          <button onClick={this.submitHandler} className="btn btn-primary" >Создать</button>
        </form>
        <Alert stack={{ limit: 3 }} />
      </div>
    )
  }
})

module.exports = ClientCreateOrder
