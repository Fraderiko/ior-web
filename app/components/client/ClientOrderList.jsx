var React = require('react');
var createReactClass = require('create-react-class');
var DatePicker = require('react-datepicker').default;
var moment = require('moment');
var ClientOrder = require(__dirname + '/ClientOrder.jsx')
var api = require('./api/api.jsx')
var Dropzone = require('react-dropzone').default // для локальной сбоки .default НЕ указываем, только для сервера
var Cookies = require('universal-cookie');
var Lightbox = require('react-images').default;
var Alert = require('react-s-alert').default;
var TimeField = require('react-simple-timefield').default;
var FileDownload = require('react-file-download');
var { Player } = require('video-react');
var Chat = require('../Chat').default
var EditOrder = require('./EditOrder')
var Socket = require('socket.io-client');
var { NotificationContainer, NotificationManager } = require('react-notifications')
var Discussion = require('../Discussion');
var config = require('../../../config');

import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'


require('react-s-alert/dist/s-alert-default.css');
require('react-s-alert/dist/s-alert-css-effects/slide.css');
require('video-react/dist/video-react.css');
require('react-notifications/lib/notifications.css');

var ClientOrderList = createReactClass({
  componentDidMount: function () {

    loadProgressBar()

    var that = this

    $('#orderModal').on('hidden.bs.modal', function () {
      that.setState({ activeOrder: undefined })
    })

    this.resolveFavorites()
    var cookies = new Cookies()
    var _id = cookies.get('_id')
    var type = cookies.get('type')
    this.setState({
      _id: _id,
      type: type
    })
    this.fetchOrders()

    if (this.checkGETParams("created") != null) {
      Alert.info('Заказ успешно создан', {
        position: 'top',
        effect: 'slide',
        timeout: 3000
      });
    }
    var that = this
  },
  getInitialState: function () {
    var that = this

    function resolveEmployeeTitle() {
      if (that.props.employee == false) {
        return "Исполнитель"
      } else {
        return "Клиент"
      }
    }

    var cookies = new Cookies()
    var _id = cookies.get('_id')

    var socket = Socket(config.base_url + ':3001/')
    socket.emit("_id", _id)

    return {
      orders: [],
      fetchedOrders: [],
      clearbuttonclasses: "btn btn-default hidden",
      startDate: moment(),
      endDate: moment(),
      employeeTitle: resolveEmployeeTitle(),
      data: {},
      lightboxIsOpen: false,
      socket: socket,
      messages: [],
      mailOrderClassValidation: "",
      startingOrdersPage: 0
    }
  },
  fetchOrders: function (withInitialReload) {

    var that = this

    if (this.state.socket) {
      var orders = this.state.subscribedOrders || []
      orders.forEach(function (order) {
        that.state.socket.removeListener(order)
      })
    }

    if (withInitialReload) {
      this.setState({ startingOrdersPage: 0, orders: [], fetchedOrders: [] })
    }


    var that = this
    var cookies = new Cookies()
    if (cookies.get('type') == 'client') {
      api.getOrdersByUser(cookies.get('_id'), this.state.startingOrdersPage).then(function (orders) {
        api.getUser(that.state._id).then(function (user) {

          for (var i = 0; i < user.favorites.length; i++) {
            for (var j = 0; j < orders.length; j++) {
              if (user.favorites[i] == orders[j]._id) {
                orders[j].favorites = true
              }
            }
          }

          var sorted = orders.sort(function (a, b) { return b.updated - a.updated })

          if (that.state.isFavState) {
            that.setState({
              orders: that.state.orders.concat(sorted.filter(function (order) { return order.favorites == true })),
              fetchedOrders: that.state.orders.concat(sorted),
              userHasPermissionToEdit: user.permission_to_edit_orders,
              startingOrdersPage: that.state.startingOrdersPage + 1
            })
          } else {
            that.setState({
              orders: that.state.orders.concat(sorted),
              fetchedOrders: that.state.orders.concat(sorted),
              userHasPermissionToEdit: user.permission_to_edit_orders,
              startingOrdersPage: that.state.startingOrdersPage + 1
            })
          }

          that.subscribeToSocket(orders)
        }, function () {
        })
      }, function () {
      })
    } else if (cookies.get('type') == 'employee') {
      api.getOrdersByEmployeeId(cookies.get('_id'), that.state.startingOrdersPage).then(function (orders) {
        api.getUser(that.state._id).then(function (user) {

          for (var i = 0; i < user.favorites.length; i++) {
            for (var j = 0; j < orders.length; j++) {
              if (user.favorites[i] == orders[j]._id) {
                orders[j].favorites = true
              }
            }
          }

          var sorted = orders.sort(function (a, b) { return b.updated - a.updated })

          if (that.state.isFavState) {
            that.setState({
              orders: that.state.orders.concat(sorted.filter(function (order) { return order.favorites == true })),
              fetchedOrders: that.state.orders.concat(sorted),
              userHasPermissionToCancel: user.permission_to_cancel_orders,
              userHasPermissionToEdit: user.permission_to_edit_orders,
              startingOrdersPage: that.state.startingOrdersPage + 1
            })
          } else {
            that.setState({
              orders: that.state.orders.concat(sorted),
              fetchedOrders: that.state.orders.concat(sorted),
              userHasPermissionToCancel: user.permission_to_cancel_orders,
              userHasPermissionToEdit: user.permission_to_edit_orders,
              startingOrdersPage: that.state.startingOrdersPage + 1
            })
          }

          that.subscribeToSocket(orders)

          orders.forEach(function (order) {
            order.statuses.forEach(function (status) {
              api.checkIfUserHasPermissionToEditStatus({ groups: status.groups_permission_to_edit, user: that.state._id }).then(function (response) {

                if (that.state.groups_permission_to_edit == undefined) {
                  var groups_permission_to_edit = {}
                  groups_permission_to_edit[status._id] = response.result
                } else {
                  var groups_permission_to_edit = that.state.groups_permission_to_edit
                  groups_permission_to_edit[status._id] = response.result
                }


                if (that.state.isFavState) {
                  that.setState({
                    groups_permission_to_edit: groups_permission_to_edit
                  })
                } else {
                  that.setState({
                    groups_permission_to_edit: groups_permission_to_edit
                  })
                }
              }, function () {
              })
            })
          })
        }, function () {
        })
      }, function () {
      })
    } else if ((cookies.get('type') == 'admin')) {
      api.getOrders().then(function (orders) {
        that.setState({
          orders: that.state.orders.concat(orders.sort(function (a, b) { return b.updated - a.updated })),
          fetchedOrders: that.state.orders.concat(orders.sort(function (a, b) { return b.updated - a.updated })),
          startingOrdersPage: that.state.startingOrdersPage + 1
        })
      }, function () {

      })
    }

  },
  makeKey: function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

  unsubscribeFromSocket: function () {
    var orders = this.state.subscribedOrders || []

    orders.forEach(function (order) {
      this.state.socket.removeListener(order)
    })
  },

  subscribeToSocket: function (orders) {
    var that = this

    that.setState({
      subscribedOrders: orders.map(function (order) { return order._id })
    })

    orders.forEach(function (order) {
      var id = order._id
      that.state.socket.on(id, function (message) {


        that.state.orders.forEach(function (item, index) {

          if (item._id == id) {
            var orders = that.state.orders
            var order = orders[index]
            order.messages.push(message)
            orders[index] = order

            var cookies = new Cookies()
            var type = cookies.get('type')

            that.setState({
              orders: orders,
              type: type,
            })

            if (message.username != that.state._id) {
              NotificationManager.info('Смотреть', 'Новое сообщение по заказу ' + order.number, 5000, function () {
                $('#orderModal').modal('show');
                for (var i = 0; i < order.statuses.length; i++) {
                  if (order.statuses[i].state == undefined || order.statuses[i].state == 'preFilled') {
                    var currentStatusIndex = i
                    break
                  }
                }

                that.setState({
                  statusIndex: 0,
                  activeOrder: order,
                  messagesOrder: order._id,
                  currentStatusIndex: currentStatusIndex,
                })
              });
            }
          }
        })
      })
    })
  },
  handleStartDateChange: function (e) {
    this.setState({
      startDate: moment(e).startOf('day'),
      clearbuttonclasses: "btn btn-default",
    });
  },
  handleEndDateChange: function (e) {
    this.setState({
      endDate: moment(e).endOf('day'),
      clearbuttonclasses: "btn btn-default",
    });
  },
  checkGETParams: function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },
  componentWillReceiveProps: function (nextProps) {

    this.resolveFavorites()
    this.setState({ startingOrdersPage: 0, orders: [], fetchedOrders: [] }, this.fetchOrders)
  },
  resolveFavorites: function () {
    if (this.checkGETParams("favorites") === null) {
      this.setState({
        title: "Заказы",
        isFavState: false
      })
    } else {
      this.setState({
        title: "Избранные заказы",
        isFavState: true
      })
    }
  },
  sortTable: function (field) {
    var that = this
    return function () {
      if (that.state[field + 'sorted'] !== undefined) {
        if (that.state[field + 'sorted'] == "asc") {
          var sorted = that.state.fetchedOrders.sort(function (a, b) {
            if (field == 'date' || field == 'updated') {
              return a[field] - b[field]
            } else {
              if (field == "assignedTo" || field == "type" || field == "createdBy" || field == "client") {
                if (a[field].name > b[field].name) return -1;
                if (a[field].name < b[field].name) return 1;
                return 0
              } else {
                if (a[field] > b[field]) return -1;
                if (a[field] < b[field]) return 1;
              }


            }
          })
          that.setState({
            orders: sorted,
            [field + 'sorted']: "desc"
          })
        } else {
          var sorted = that.state.fetchedOrders.sort(function (a, b) {
            if (field == 'date' || field == 'updated') {
              return b[field] - a[field]
            } else {
              if (field == "assignedTo" || field == "type" || field == "createdBy" || field == "client") {
                if (a[field].name < b[field].name) return -1;
                if (a[field].name > b[field].name) return 1;
                return 0
              } else {
                if (a[field] < b[field]) return -1;
                if (a[field] > b[field]) return 1;
                return 0
              }

            }
          })
          that.setState({
            orders: sorted,
            [field + 'sorted']: "asc"
          })
        }
      } else {
        var sorted = that.state.fetchedOrders.sort(function (a, b) {
          if (field == 'date' || field == 'updated') {
            return a[field] - b[field]
          } else {
            if (field == "assignedTo" || field == "type" || field == "createdBy" || field == "client") {
              if (a[field].name > b[field].name) return -1;
              if (a[field].name < b[field].name) return 1;
              return 0
            } else {
              if (a[field] > b[field]) return -1;
              if (a[field] < b[field]) return 1;
              return 0
            }

          }
        })
        that.setState({
          orders: sorted,
          [field + 'sorted']: "desc"
        })
      }
    }
  },
  prepareRows: function () {
    var that = this
    var array = [];
    this.state.orders.forEach(function (order) {
      array.push(<OrdersRow handleFavs={that.handleFavs} onRowClick={that.handleRowClick} onRowEditClick={that.handleRowEditClick} key={order._id} item={order} permissionToEdit={that.state.userHasPermissionToEdit} />)
    });
    return array
  },
  handleFavs: function (fav, order_id) {
    var that = this

    var order = {
      _id: this.state._id,
      order_id: order_id
    }

    var orders = this.state.orders

    if (fav) {
      for (var i = 0; i < orders.length; i++) {
        if (orders[i]._id == order_id) {
          orders[i].favorites = true
        }
      }
      api.addOrderToFav(order).then(function () { }, function () { })
    } else {
      for (var i = 0; i < orders.length; i++) {
        if (orders[i]._id == order_id) {
          orders[i].favorites = false
        }
      }
      api.removeOrderFromFav(order).then(function () { }, function () { })
    }
    if (this.state.isFavState == true) {
      this.setState({
        orders: orders.filter(function (order) { return order.favorites == true })
      })
    } else {
      this.setState({
        orders: orders
      })
    }
  },
  discussionSent: function () {
    var that = this
    return function () {
      that.fetchOrders()
      $("#orderModal").modal('hide');
    }
  },
  prepareOrder: function () {

    if (this.state.statusIndex == 0) {
      if (this.state.activeOrder !== undefined) {
        var that = this
        var array = []
        Object.keys(this.state.activeOrder).map(function (keyName, keyIndex) {

          if (keyName == "number") {
            array.push(<ClientOrder key={that.makeKey()} name={"Номер заказа"} value={that.state.activeOrder[keyName]} />)
          } else if (keyName == "date") {
            array.push(<ClientOrder key={that.makeKey()} name={"Дата заказа"} value={that.resolveTime(that.state.activeOrder[keyName])} />)
          } else if (keyName == "updated") {
            array.push(<ClientOrder key={that.makeKey()} name={"Обновленно"} value={that.resolveTime(that.state.activeOrder[keyName])} />)
          } else if (keyName == "type") {
            array.push(<ClientOrder key={that.makeKey()} name={"Тип заказа"} value={that.state.activeOrder[keyName].name} />)
          } else if (keyName == "status") {
            array.push(<ClientOrder key={that.makeKey()} name={"Статус заказа"} value={that.state.activeOrder[keyName]} />)
          } else if (keyName == "comment" && that.state.activeOrder.comment != "") {
            array.push(<ClientOrder key={that.makeKey()} name={"Комментарий"} value={that.state.activeOrder[keyName]} />)
          } else if (keyName == "recipientmail" && that.state.activeOrder.recipientmail != "") {
            array.push(<ClientOrder key={that.makeKey()} name={"Почта получателя"} value={that.state.activeOrder[keyName]} />)
          } else if (keyName == "cancelReason" && that.state.activeOrder.cancelReason != "") {
            array.push(<ClientOrder key={that.makeKey()} name={"Причина отмены"} value={that.state.activeOrder[keyName]} />)
          }

          if (keyName == "assignedTo") {
            if (that.state.type == 'client' || that.state.type == 'admin') {
              array.push(<ClientOrder key={that.makeKey()} name={that.state.employeeTitle} value={that.state.activeOrder[keyName].name} />)
            }
          }

          if (keyName == "client") {
            if (that.state.type == 'employee') {
              array.push(<ClientOrder key={that.makeKey()} name={that.state.employeeTitle} value={that.state.activeOrder[keyName].name} />)
            }
          }

        })

        var filledStatuses = this.state.activeOrder.statuses.filter(function (status) { return status.state == 'Filled' })

        if (this.state.activeOrder.cancelPending == true) {
          array.push(that.prepareCancelOrderComment())
        }

        if (this.state.type == 'client') {
          if (filledStatuses.length == 0 && this.state.activeOrder.currentstatus != 'Отменен') {
            array.push(that.prepareCancelOrderButton())
          }
        } else {
          if (filledStatuses.length == 0 && this.state.activeOrder.currentstatus != 'Отменен') {
            if (this.state.userHasPermissionToCancel == true) {
              array.push(that.prepareCancelOrderButton())
            }
          }
        }

        if (this.state.type == 'admin') {
          array.push(that.prepareDeleteOrderButton())
        }

        return <div><div className="row"><div className="col-sm-6">{array}</div><div className="col-sm-6">{that.showChat()}</div></div>{that.prepareDiscussion()}</div>
      }
    } else {

      return this.prepareStatusDetails(this.state.statusIndex || 0)
    }
  },
  prepareDiscussion: function () {
    var cookies = new Cookies()
    var userType = cookies.get('type')

    if (userType == 'client' && this.state.activeOrder.discussion.length > 0) {
      return <div className="row well"><Discussion order={this.state.activeOrder} author={this.state._id} discussionSent={this.discussionSent()} /></div>
    }
  },
  prepareDeleteOrderButton: function () {
    var that = this
    function onClick() {
      return function () {
        var order = that.state.activeOrder

        api.deleteOrder(that.state.activeOrder).then(function (response) {
          $("#orderModal").modal('hide');
          that.fetchOrders()
          Alert.success('Заказ удален', {
            position: 'top',
            effect: 'slide',
            timeout: 3000
          });
        }, function () {

        })
      }
    }

    return (
      <button key={'deleteOrderKey'} type="button" onClick={onClick()} className="btn btn-danger" >Удалить заказ</button>
    )
  },
  prepareCancelOrderButton: function () {
    var that = this
    function onClick() {
      return function () {
        var order = that.state.activeOrder

        if (order.cancelPending == undefined || order.cancelPending == false) {
          order.cancelPending = true
          that.setState({
            activeOrder: order
          })
          return
        }

        if (order.cancelReason == undefined || order.cancelReason == "") {
          Alert.error('Ошибка! Для отмены заказа необходимо указать причину отмены', {
            position: 'top',
            effect: 'slide',
            timeout: 10000
          });
          return
        } else {
          order.currentstatus = 'Отменен'
          that.setState({
            activeOrder: order
          })
          api.cancelOrder(that.state.activeOrder).then(function (response) {
            $("#orderModal").modal('hide');
            that.fetchOrders()
            Alert.success('Заказ отменен', {
              position: 'top',
              effect: 'slide',
              timeout: 3000
            });
          }, function () {

          })
        }
      }
    }

    return (
      <button key={'cancelOrderKey'} type="button" onClick={onClick()} className="btn btn-danger" >Отменить заказ</button>
    )
  },
  prepareCancelOrderComment: function () {

    var that = this

    function handleChange(e) {
      var activeOrder = that.state.activeOrder
      activeOrder.cancelReason = e.target.value
      that.setState({
        activeOrder: activeOrder
      })
    }

    return (
      <div key={'CancelOrderComment'}>
        <div className="form-group">
          <label>Причина отмены</label>
          <textarea className="form-control" value={this.state.activeOrder.cancelReason} onChange={handleChange}></textarea>
        </div>
      </div>
    )
  },
  prepareStatusDetails: function () {
    var that = this

    if (this.state.activeOrder != undefined) {
      return this.prepareStatusFields()
    }
  },
  onStatusSubmit: function () {
    var that = this

    return function () {

      var status = that.state.activeOrder.statuses[that.state.statusIndex - 1]

      for (var i = 0; i < status.fields.length; i++) {
        if (status.fields[i].type != 'image' && status.fields[i].type != 'video' && status.fields[i].type != 'file') {
          if (status.fields[i].type == 'date') {
            status.fields[i].value = moment(that.state.data[status.fields[i]._id]).locale('ru').format('DD MM YYYY')
          } else {
            status.fields[i].value = that.state.data[status.fields[i]._id]
          }
        } else {
          if (that.state.data[status.fields[i]._id] != undefined) {
            if (that.state.data[status.fields[i]._id].files != undefined) {
              for (var j = 0; j < that.state.data[status.fields[i]._id].files.length; j++) {
                status.fields[i].media.push(that.state.data[status.fields[i]._id].files[j].url)
              }
            }
          }
        }
      }
      var order = that.state.activeOrder
      status.state = "preFilled"
      status.updated = new Date().getTime()
      order.statuses[that.state.statusIndex - 1] = status
      api.setStatusForOrder(order).then(function (response) {
        if (response.status == "error") {
          Alert.error('Ошибка! Следующие поля обязательны для заполнения: ' + response.missedFields.join(', '), {
            position: 'top',
            effect: 'slide',
            timeout: 10000
          });
        }

        if (response.status == "ok") {
          $("#orderModal").modal('hide');
          that.fetchOrders(true)
          Alert.success('Заказ обновлен', {
            position: 'top',
            effect: 'slide',
            timeout: 3000
          });
        }
      }, function () {

      })
    }
  },
  orderUpdated: function () {
    $("#editOrderModal").modal('hide');
    this.fetchOrders(true)
    Alert.success('Заказ обновлен', {
      position: 'top',
      effect: 'slide',
      timeout: 3000
    });
  },
  prepareStatusFields: function () {
    var cookies = new Cookies()
    var userType = cookies.get('type')

    var that = this

    var hasPermission = false;

    var status;

    if (that.state.activeOrder.statuses[that.state.statusIndex - 1].users_permission_to_edit == undefined && this.state.activeOrder.statuses[this.state.statusIndex - 1].groups_permission_to_edit == undefined) {
      hasPermission = true
    }

    if (this.state.groups_permission_to_edit != undefined) {
      if (this.state.groups_permission_to_edit[this.state.activeOrder.statuses[that.state.statusIndex - 1]._id] == true) {
        hasPermission = true
      }
    }



    if (this.state.activeOrder.statuses[this.state.statusIndex - 1].users_permission_to_edit.includes(that.state._id)) {
      hasPermission = true
    }

    if (that.state.currentStatusIndex == (that.state.statusIndex - 1) || userType == 'client' || userType == 'admin' || that.state.activeOrder.statuses[that.state.statusIndex - 1].state == 'Filled') {
      var array = []
      for (var i = 0; i < that.state.activeOrder.statuses[that.state.statusIndex - 1].fields.length; i++) {
        var name = that.state.activeOrder.statuses[that.state.statusIndex - 1].fields[i].name
        var _id = that.state.activeOrder.statuses[that.state.statusIndex - 1].fields[i]._id
        var type = that.state.activeOrder.statuses[that.state.statusIndex - 1].fields[i].type
        var value = that.state.activeOrder.statuses[that.state.statusIndex - 1].fields[i].value
        if (that.state.activeOrder.statuses[that.state.statusIndex - 1].fields[i].media != undefined) {
          var media = that.state.activeOrder.statuses[that.state.statusIndex - 1].fields[i].media
        } else {
          var media = []
        }

        if (userType == 'employee' && hasPermission == false && that.state.activeOrder.statuses[that.state.statusIndex - 1].state != 'Filled') {
          status = <h1 key={that.makeKey()} className="text-center">Нет прав для заполнения статуса</h1>
          // that.setState({ activeStatus: status, lastStatusIndex: that.state.statusIndex })
          return status
        }

        if (value != undefined) {
          array.push(that.prepareFieldByType(type, name, _id, value, media))
        } else if (media.length > 0) {
          array.push(that.prepareFieldByType(type, name, _id, value, media))
        } else if (value == undefined && type == 'employee') {
          array.push(that.prepareFieldByType(type, name, _id, value, media))
        }
      }

      if (userType == 'employee' && that.state.activeOrder.statuses[that.state.statusIndex - 1].state != 'Filled') {
        array.push(<button key={'status-submit-button'} className="btn btn-primary" onClick={that.onStatusSubmit()}>Сохранить</button>)
      }
      status = array
      // that.setState({ activeStatus: status, lastStatusIndex: that.state.statusIndex })
      return status
    } else {
      status = <h1 key={that.makeKey()} className="text-center">Необходимо заполнить предыдущий статус, прежде чем заполнять данный</h1>
      // that.setState({ activeStatus: status, lastStatusIndex: that.state.statusIndex })
      return status
    }
    // }
  },
  prepareFieldByType: function (type, name, _id, value, media) {
    var cookies = new Cookies()
    var usertype = cookies.get('type')

    if (usertype == "employee") {
      if (this.state.activeOrder.statuses[this.state.statusIndex - 1].state == 'Filled') {
        if (type == 'text' || type == 'digit' || type == 'date' || type == 'time') {
          return <ClientOrder key={_id} name={name} value={value} />
        } else if (type == 'image') {
          return this.prepareClientImageField(_id, name, media)
        } else if (type == 'video') {
          return this.prepareClientVideoField(_id, name, media)
        } else if (type == 'file') {
          return this.prepareClientFileField(_id, name, media)
        }
      } else {
        if (type == 'text') {
          return this.prepareTextField(type, name, _id)
        } else if (type == 'image') {
          return this.prereImageField(type, name, _id)
        } else if (type == 'digit') {
          return this.prepareNumberField(type, name, _id)
        } else if (type == 'date') {
          return this.prepareDateField(type, name, _id)
        } else if (type == 'time') {
          return this.prepareTimeField(type, name, _id)
        } else if (type == 'video') {
          return this.prepareVideoField(type, name, _id)
        } else if (type == 'file') {
          return this.prepareFileField(type, name, _id)
        }
      }

    } else {
      if (type == 'text' || type == 'digit' || type == 'date' || type == 'time') {
        return <ClientOrder key={_id} name={name} value={value} />
      } else if (type == 'image') {
        return this.prepareClientImageField(_id, name, media)
      } else if (type == 'video') {
        return this.prepareClientVideoField(_id, name, media)
      } else if (type == 'file') {
        return this.prepareClientFileField(_id, name, media)
      }
    }
  },
  prepareVideoField: function (type, name, _id) {
    var that = this

    function onDrop(accepted, rejected) {

      if (rejected.length > 0) {
        Alert.error('Ошибка! Формат видео должен быть mp4!', {
          position: 'top',
          effect: 'slide',
          timeout: 10000
        });
        return
      }

      var data = that.state.data

      var form = new FormData()

      accepted.forEach(function (item) {
        form.append('file', item)
      })

      if (data[_id] == undefined) {
        data[_id] = {
          type: "video",
          files: []
        }

        that.setState({
          isLoading: true
        })

        api.upload(form).then(function (response) {
          response.forEach(function (item) {
            var file = {
              url: item.url,
              _id: item._id
            }
            data[_id].files.push(file)
          })

          that.setState({
            data: data,
            isLoading: false
          })
        }, function () {

        })
      } else {
        api.upload(form).then(function (response) {
          response.forEach(function (item) {
            var file = {
              url: item.url,
              _id: item._id
            }
            data[_id].files.push(file)
          })
          that.setState({
            data: data,
            isLoading: false
          })
        }, function () {

        })
      }
    }

    function deleteHandler(index) {
      return function () {
        var data = that.state.data
        var file = that.state.data[_id].files[index]
        api.deleteUpload(file).then(function () {
          data[_id].files.splice(index, 1)
          that.setState({
            data: data
          })
        }, function () {

        })
      }
    }

    function preview() {
      if (that.state.data[_id] != undefined) {
        var array = []
        for (var i = 0; i < that.state.data[_id].files.length; i++) {
          var file = that.state.data[_id].files[i]
          array.push(<div key={that.makeKey()} className="video-preview"><br /><Player playsInline={true} fluid={false} src={file.url} width={410} height={280} /><button onClick={deleteHandler(i)} className="btn btn-sm btn-danger">Удалить</button></div>)
        }
        return array
      }
    }
    return (
      <div key={_id} className="form-group">
        <label>{name}</label>
        <Dropzone accept={"video/mp4"} className="filezone" onDrop={onDrop}>
          <h5>Перенесите сюда видео, которые необходимо загрузить</h5>
        </Dropzone>
        <div className="image-container">
          {this.loader()}
          {preview()}
        </div>
      </div>
    )
  },
  prepareFileField: function (type, name, _id) {
    var that = this

    function onDrop(accepted, rejected) {
      var data = that.state.data
      var form = new FormData()
      accepted.forEach(function (item) {
        form.append('file', item)
      })

      if (data[_id] == undefined) {
        data[_id] = {
          type: "file",
          files: []
        }

        that.setState({
          isLoading: true
        })

        api.upload(form).then(function (response) {
          response.forEach(function (item) {
            var file = {
              url: item.url,
              _id: item._id
            }
            data[_id].files.push(file)
          })

          that.setState({
            data: data,
            isLoading: false
          })
        }, function () {

        })
      } else {
        api.upload(form).then(function (response) {
          response.forEach(function (item) {
            var file = {
              url: item.url,
              _id: item._id
            }
            data[_id].files.push(file)
          })
          that.setState({
            data: data,
            isLoading: false
          })
        }, function () {

        })
      }
    }

    function deleteHandler(index) {
      return function () {
        var data = that.state.data
        var file = that.state.data[_id].files[index]
        api.deleteUpload(file).then(function () {
          data[_id].files.splice(index, 1)
          that.setState({
            data: data
          })
        }, function () {

        })
      }
    }

    function preview() {
      if (that.state.data[_id] != undefined) {
        var array = []
        for (var i = 0; i < that.state.data[_id].files.length; i++) {
          var file = that.state.data[_id].files[i]
          array.push(<div key={that.makeKey()} ><br /><a href={file.url}>{file.url.replace(/^.*[\\\/]/, '')}</a><button onClick={deleteHandler(i)} className="btn btn-sm btn-danger">Удалить</button></div>)
        }
        return array
      }
    }
    return (
      <div key={_id} className="form-group">
        <label>{name}</label>
        <Dropzone className="filezone" onDrop={onDrop}>
          <h5>Перенесите сюда файлы, которые необходимо загрузить</h5>
        </Dropzone>
        <div className="image-container">
          {this.loader()}
          {preview()}
        </div>
      </div>
    )
  },
  loader: function () {
    if (this.state.isLoading) {

      return (
        <div key={'loader'} className="sk-circle">
          <div className="sk-circle1 sk-child"></div>
          <div className="sk-circle2 sk-child"></div>
          <div className="sk-circle3 sk-child"></div>
          <div className="sk-circle4 sk-child"></div>
          <div className="sk-circle5 sk-child"></div>
          <div className="sk-circle6 sk-child"></div>
          <div className="sk-circle7 sk-child"></div>
          <div className="sk-circle8 sk-child"></div>
          <div className="sk-circle9 sk-child"></div>
          <div className="sk-circle10 sk-child"></div>
          <div className="sk-circle11 sk-child"></div>
          <div className="sk-circle12 sk-child"></div>
        </div>
      )
    }
  },
  prepareClientImageField: function (_id, name, media) {
    var that = this

    function onClose() {
      that.setState({
        lightboxIsOpen: false
      })
    }

    function onClickNext() {
      that.setState({
        currentLightBoxImage: that.state.currentLightBoxImage + 1
      })
    }

    function onClickPrev() {
      that.setState({
        currentLightBoxImage: that.state.currentLightBoxImage - 1
      })
    }

    var images = this.prepareImageMedia(media)
    return (
      <div key={_id} className="form-group">
        <label>{name}</label>
        <div className="inline-images">
          {this.prepareImgTags(images)}
        </div>
        <Lightbox isOpen={this.state.lightboxIsOpen} onClose={onClose} currentImage={this.state.currentLightBoxImage} onClickPrev={onClickPrev} onClickNext={onClickNext} images={images} />
      </div>
    )
  },
  prepareImgTags: function (images) {
    var that = this
    function onClick(index) {
      return function () {
        that.setState({
          lightboxIsOpen: true,
          currentLightBoxImage: index
        })
      }
    }
    return images.map(function (image, index) { return <img className="image img" onClick={onClick(index)} key={index} src={image.src} /> })
  },
  prepareClientVideoField: function (_id, name, media) {
    var that = this
    return media.map(function (item, index) {
      return <div>
        <div key={_id} className="form-group">
          <label>{name}</label>
          <div key={that.makeKey()} className="video-preview"><br /><Player playsInline={true} fluid={false} src={item} width={410}
            height={280} /></div></div>
      </div>
    })
  },
  prepareClientFileField: function (_id, name, media) {
    var that = this
    return (
      <div key={_id} className="form-group">
        <label>{name}</label>
        <div className="inline-images">
          {media.map(function (item, index) { return <div key={that.makeKey()}><br /><a href={item}>{item.replace(/^.*[\\\/]/, '')}</a></div> })}
        </div>
      </div>
    )
  },
  prepareImageMedia: function (media) {
    var array = []
    media.forEach(function (item, index) {
      var object = {
        src: item
      }
      array.push(object)
    })
    return array
  },
  prepareTextField: function (type, name, _id) {
    var that = this
    function handleTextChange(e) {
      var data = that.state.data
      data[_id] = e.target.value
      that.setState({
        data: data
      })
    }

    return (
      <div key={_id} className="form-group">
        <label>{name}</label>
        <input id={_id} className="form-control" value={this.state.data[_id]} onChange={handleTextChange} id="email" placeholder={name}></input>
      </div>
    )
  },
  prepareNumberField: function (type, name, _id) {
    var that = this
    function handleTextChange(e) {
      var data = that.state.data
      data[_id] = e.target.value
      that.setState({
        data: data
      })
    }

    return (
      <div key={_id} className="form-group">
        <label>{name}</label>
        <input id={_id} className="form-control" type="number" value={this.state.data[_id]} onChange={handleTextChange} id="email" placeholder={name}></input>
      </div>
    )
  },
  prereImageField: function (type, name, _id) {
    var that = this

    function onDrop(accepted, rejected) {
      var data = that.state.data

      var form = new FormData()

      accepted.forEach(function (item) {
        form.append('file', item)
      })

      if (data[_id] == undefined) {
        data[_id] = {
          type: "image",
          files: []
        }



        that.setState({
          isLoading: true
        })

        api.upload(form).then(function (response) {
          response.forEach(function (item) {
            var file = {
              url: item.url,
              _id: item._id
            }
            data[_id].files.push(file)
          })

          that.setState({
            data: data,
            isLoading: false
          })

          that.forceUpdate()

        }, function () {

        })

      } else {
        api.upload(form).then(function (response) {
          response.forEach(function (item) {
            var file = {
              url: item.url,
              _id: item._id
            }
            data[_id].files.push(file)
          })
          that.setState({
            data: data,
            isLoading: false
          })

        }, function () {

        })
      }
    }

    function deleteHandler(index) {
      return function () {
        var data = that.state.data
        var file = that.state.data[_id].files[index]
        api.deleteUpload(file).then(function () {
          data[_id].files.splice(index, 1)
          that.setState({
            data: data
          })
        }, function () {

        })
      }
    }

    function preview() {

      if (that.state.data[_id] != undefined) {
        var array = []
        for (var i = 0; i < that.state.data[_id].files.length; i++) {
          var file = that.state.data[_id].files[i]
          array.push(<div key={that.makeKey()}><img className="img-preview" src={file.url} /><br /><button onClick={deleteHandler(i)} className="btn btn-sm btn-danger">Удалить</button></div>)
        }
        return array
      }
    }

    return (
      <div key={_id} className="form-group">
        <label>{name}</label>
        <Dropzone className="filezone" onDrop={onDrop}>
          <h5>Перенесите сюда фотографии, которые необходимо загрузить</h5>
        </Dropzone>
        <div className="image-container">
          {this.loader()}
          {preview()}
        </div>
      </div>
    )

  },
  prepareTimeField: function (type, name, _id) {
    var that = this

    function onTimeChange(e) {
      var data = that.state.data
      data[_id] = e
      that.setState({
        data: data
      })
    }

    function resolveTime() {
      var data = that.state.data
      if (that.state.data[_id] == undefined) {
        return "00:00"
      } else {
        return that.state.data[_id]
      }
    }

    return (<div key={_id} className="form-group">
      <label>{name}</label>
      <br></br>
      <TimeField style={{
        border: '2px solid #666',
        fontSize: 22,
        width: 147,
        padding: '5px 8px',
        color: '#333',
        borderRadius: 3
      }}
        value={resolveTime()}
        onChange={onTimeChange} />
    </div>
    )
  },
  prepareDateField: function (type, name, _id) {
    var that = this
    function handleDateChange(e) {

      var data = that.state.data
      data[_id] = e
      that.setState({
        data: data
      })
    }
    return (<div key={_id} className="form-group">
      <label>{name}</label>
      <DatePicker dateFormat="LL" placeholderText="Нажмите, чтобы указать дату" dateFormat={"DD/MM/YYYY"} className="form-control" selected={moment(this.state.data[_id])} onChange={handleDateChange} />
    </div>
    )
  },
  preparePills: function () {
    if (this.state.activeOrder != undefined && this.state.activeOrder.currentstatus != 'Отменен') {
      var array = []
      for (var i = 0; i < this.state.activeOrder.statuses.length; i++) {
        if (this.state.type == 'client' || this.state.type == 'admin') {
          if (this.state.activeOrder.statuses[i].state == "Filled") {
            array.push(<li key={this.makeKey()} onClick={this.setStatus(i + 1)}><a href="#">{this.state.activeOrder.statuses[i].name}</a></li>)
          }
        } else {
          array.push(<li key={this.makeKey()} onClick={this.setStatus(i + 1)}><a href="#">{this.state.activeOrder.statuses[i].name}</a></li>)
        }
      }
      return array
    }
  },
  resolveTime: function (date) {
    var date = date / 1000
    if (moment().date() === moment.unix(date).date()) {
      return "Сегодня, " + moment.unix(date).locale("ru").format("HH:mm")
    } else if (moment().date() === moment.unix(date).add(1, 'day').date()) {
      return "Вчера, " + moment.unix(date).locale("ru").format("HH:mm")
    } else {
      return moment.unix(date).locale("ru").format("LLL")
    }
  },
  handleRowClick: function (e) {
    $("#orderModal").modal('show');
    for (var i = 0; i < e.statuses.length; i++) {
      if (e.statuses[i].state == undefined || e.statuses[i].state == 'preFilled') {
        var currentStatusIndex = i
        break
      }
    }
    this.setState({
      statusIndex: 0,
      activeOrder: e,
      messagesOrder: e._id,
      currentStatusIndex: currentStatusIndex
    })
  },

  handleRowEditClick: function (e) {
    $("#editOrderModal").modal('show');
    this.setState({
      editingOrder: e
    })
  },

  prepareOrderForEdit: function () {
    if (this.state.editingOrder != undefined) {
      return <EditOrder order={this.state.editingOrder} orderUpdated={this.orderUpdated} />
    }
  },

  filterByNumber: function () {
    var that = this
    return function () {
      var query = that.refs.searchQuery.value

      var cookies = new Cookies()
      var usertype = cookies.get('type')

      if (usertype == 'client') {
        api.searchOrderClient({ id: that.state._id, query: that.refs.searchQuery.value }).then(function (response) {
          that.setState({
            orders: response,
            clearbuttonclasses: "btn btn-default"
          })
        }, function () {

        })
      } else if (usertype == 'employee') {
        api.searchOrderEmployee({ id: that.state._id, query: that.refs.searchQuery.value }).then(function (response) {
          that.setState({
            orders: response,
            clearbuttonclasses: "btn btn-default",
          })
        }, function () {

        })
      } else if (usertype == 'admin') {
        api.searchOrder({ query: that.refs.searchQuery.value }).then(function (response) {
          that.setState({
            orders: response,
            clearbuttonclasses: "btn btn-default",
          })
        }, function () {

        })
      }

    }
  },
  restoreOrders: function () {
    var that = this
    return function () {
      that.setState({
        orders: that.state.fetchedOrders,
        clearbuttonclasses: "btn btn-default hidden"
      })
    }
  },
  setCommonStatusState: function () {
    var that = this
    return function () {
      that.setState({
        statusIndex: 0
      })
    }
  },
  setStatus: function (index) {
    var that = this
    return function () {
      that.setState({
        statusIndex: index
      })
    }
  },
  excelExport: function () {

    var that = this

    return function () {
      api.exportExcel({ orders: that.state.orders, id: that.state._id }).then(function (response) {
        var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileDownload(blob, 'report.xlsx');
      }, function () {

      })
    }
  },
  filterByDate: function () {
    var that = this
    return function () {
      that.setState({
        orders: that.state.fetchedOrders.filter(function (item) { return item.date <= that.state.endDate }).filter(function (item) { return item.date >= that.state.startDate })
      })
    }

  },
  showChat: function () {
    if (this.state.messagesOrder != undefined && this.state.type != 'admin') {
      return <Chat order={this.state.messagesOrder} username={this.state._id} socket={this.state.socket} messages={this.state.activeOrder.messages} />
    }
  },

  resolveEditOrder: function () {
    var cookies = new Cookies()
    var type = cookies.get('type')
    if (type == 'admin') {
      return (<th></th>)
    }
  },

  handleMailOrderChange: function (e) {
    this.setState({
      mailOrder: e.target.value,
      mailOrderClassValidation: ""
    })
  },
  mailOrder: function () {

  },
  sendOrderToEmail: function () {
    var that = this
    return function () {

      var mailValidation = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (mailValidation.test(that.state.mailOrder)) {
        api.sendOrderToEmail({ order: that.state.activeOrder, email: that.state.mailOrder }).then(function () {
          that.showOrderSentAlert()
          $("#editOrderModal").modal('hide');
          that.setState({
            mailOrder: ""
          })
        }, function () {

        })
      } else {
        that.setState({
          mailOrderClassValidation: "has-error"
        })
      }
    }
  },
  showOrderSentAlert: function () {
    Alert.success('Заказ отправлен', {
      position: 'top',
      effect: 'slide',
      timeout: 3000
    });
  },
  renderContent: function () {

    var that = this

    function resolveAccountTypeSort() {
      if (that.props.employee == false) {
        return "assignedTo"
      } else {
        return "client"
      }
    }

    return (
      <div>
        <div className="row row-space">
          <div className="well col-lg-8">
            <h2 className="hide">{this.state.title}</h2>
            <table id="orders-table" className="table table-striped">
              <thead>
                <tr>
                  <th></th>
                  <th onClick={this.sortTable("number")}>Номер</th>
                  <th onClick={this.sortTable("date")}>Дата</th>
                  <th onClick={this.sortTable("updated")}>Обновлено</th>
                  <th onClick={this.sortTable("type")}>Тип</th>
                  <th onClick={this.sortTable("currentstatus")}>Статус</th>
                  <th onClick={this.sortTable(resolveAccountTypeSort())}>{this.state.employeeTitle}</th>
                  <th>{this.state.type != 'admin' ? 'Избранное' : ""}</th>
                  {this.resolveEditOrder()}
                </tr>
              </thead>
              <tbody>
                {this.prepareRows()}
                <tr><td colSpan="9"><button onClick={() => this.fetchOrders()} className="btn btn-success">Показать еще</button></td></tr>
              </tbody>
            </table>
          </div>

          <div className="col-lg-4">
            <div className="well col-lg-offset-1 col-lg-11">
              <div className="input-group">
                <input ref="searchQuery" type="text" className="form-control" id="search" placeholder="Искать заказ"></input>
                <span className="input-group-btn">
                  <button className="btn btn-default" type="button" onClick={this.filterByNumber()}>Искать</button>
                </span>
              </div>
              <br></br>
              <div className="btn-toolbar">
                <button className="btn btn-default" type="button" data-toggle="modal" data-target="#filterByDateModal">Фильтровать по датам</button>
                <button className="btn btn-success" onClick={this.excelExport()} type="button">Выгрузить в .xls</button>
              </div>
              <br></br>
              <div className="btn-toolbar">
                <button className={this.state.clearbuttonclasses} type="button" onClick={this.restoreOrders()}>Очистить</button>
              </div>
            </div>
          </div>
        </div>
        <div id="filterByDateModal" className="modal fade" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <h4 className="modal-title">Выберите даты для фильтрации</h4>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Начало периода</label>
                      <DatePicker dateFormat="LL" className="form-control input-lg" selected={this.state.startDate} onChange={this.handleStartDateChange} />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Окончание периода</label>
                      <DatePicker dateFormat="LL" className="form-control input-lg" selected={this.state.endDate} onChange={this.handleEndDateChange} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.filterByDate()}>Фильтровать</button>
              </div>
            </div>
          </div>
        </div>

        <Alert stack={{ limit: 3 }} />
        <NotificationContainer />

        <div id="orderModal" className="modal fade" role="dialog">
          <div className="modal-dialog orderModal">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <div className="container">
                  <ul className="nav nav-pills">
                    <li className="active" onClick={this.setCommonStatusState()}><a href="#">Общая информация</a></li>
                    {this.preparePills()}
                  </ul>
                </div>
                <h4 className="modal-title"></h4>
              </div>
              <div className="modal-body">
                {this.prepareOrder()}
              </div>
              <div className="modal-footer">
                <div className={this.state.mailOrderClassValidation}>
                  <input className="form-control pull-left" value={this.state.mailOrder} onChange={this.handleMailOrderChange} style={{ width: 200, marginRight: 20 }} placeholder={"Укажите адрес почты"}></input>
                </div>
                <button type="button" className="btn btn-primary pull-left" onClick={this.sendOrderToEmail()}>Отправить</button>
                <button type="button" className="btn btn-default" data-dismiss="modal">Закрыть</button>
              </div>
            </div>
          </div>
        </div>

        <div id="editOrderModal" className="modal fade" role="dialog">
          <div className="modal-dialog orderModal">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <h4 className="modal-title"></h4>
              </div>
              <div className="modal-body">
                {this.prepareOrderForEdit()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal">Закрыть</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  },
  render: function () {

    return (
      <div>
        {this.renderContent()}
      </div>
    )
  }
})

var OrdersRow = createReactClass({
  getInitialState: function () {

    if (this.props.item.favorites == false || this.props.item.favorites == undefined) {
      var img = "./static/star.png"
      var fav = false
    } else {
      var img = "./static/star-filled.png"
      var fav = true
    }

    return {
      img: img,
      fav: fav
    }
  },
  resolveFav: function () {
    var cookies = new Cookies()
    var type = cookies.get("type")

    if (type != 'admin') {
      return <img onClick={this.handleFavClick} width="25px" height="25px" src={this.state.img}></img>
    }
  },
  handleFavClick: function () {
    if (this.state.fav == false) {
      this.props.handleFavs(true, this.props.item._id)
      this.setState({
        fav: true,
        img: "./static/star-filled.png"
      })
    } else {
      this.props.handleFavs(false, this.props.item._id)
      this.setState({
        fav: false,
        img: "./static/star.png"
      })
    }
  },
  resolveTime: function (date) {
    var date = date / 1000
    if (moment().date() === moment.unix(date).date() && moment().month() === moment.unix(date).month()) {
      return "Сегодня, " + moment.unix(date).locale("ru").format("HH:mm")
    } else if (moment().date() === moment.unix(date).add(1, 'day').date() && moment().month() === moment.unix(date).month()) {
      return "Вчера, " + moment.unix(date).locale("ru").format("HH:mm")
    } else {
      return moment.unix(date).locale("ru").format("LLL")
    }
  },
  handleClick: function () {
    this.props.onRowClick(this.props.item)
    var cookies = new Cookies()
    var seenOrders = cookies.get("seenOrders")

    if (seenOrders == undefined) {
      var entry = this.props.item._id + '-' + this.props.item.updated
      cookies.set("seenOrders", entry)
    } else {
      var entry = seenOrders + ' ' + this.props.item._id + '-' + this.props.item.updated
      cookies.set("seenOrders", entry)
    }
  },
  resolveAssignedOrClientField: function () {
    var cookies = new Cookies()
    var type = cookies.get("type")
    if (type == 'client') {
      if (this.props.item.assignedTo != undefined) {
        return this.props.item.assignedTo.name
      } else {
        return this.props.item.assignedToGroup.name
      }
    } else {
      return this.props.item.client.name
    }
  },
  resolveTrStyle: function () {
    var cookies = new Cookies()
    var seenOrders = cookies.get("seenOrders")
    if (seenOrders == undefined) {
      return "success"
    } else {
      if (seenOrders.includes(this.props.item._id + '-' + this.props.item.updated) == false) {
        return "success"
      }
    }
  },
  resolveChatCounter: function () {

  },
  onEditClick: function () {
    this.props.onRowEditClick(this.props.item)
  },
  resolveEditOrder: function () {
    var cookies = new Cookies()
    var type = cookies.get('type')
    if (type == 'admin' || this.props.permissionToEdit == true) {
      return (<td><button key={'edit-' + this.props.item._id + ''} type="button" onClick={this.onEditClick} className="btn btn-danger">Редактировать</button></td>)
    }
  },
  render: function () {
    return (
      <tr className={this.resolveTrStyle()}>
        <td>{this.resolveChatCounter()}</td><td onClick={this.handleClick}>{this.props.item.number}</td><td onClick={this.handleClick}>{this.resolveTime(this.props.item.date)}</td><td onClick={this.handleClick}>{this.resolveTime(this.props.item.updated)}</td><td onClick={this.handleClick}>{this.props.item.type.name}</td><td onClick={this.handleClick}>{this.props.item.currentstatus}</td><td onClick={this.handleClick}>{this.resolveAssignedOrClientField()}</td><td>{this.resolveFav()}</td>{this.resolveEditOrder()}
      </tr>
    )
  }
})

module.exports = ClientOrderList
