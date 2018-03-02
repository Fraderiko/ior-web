var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var cronjobs = require('./cronjobs.js')
var socket = require('socket.io')
var http = require('http')
var config = require('./config')

var app = express();
var server = http.Server(app);
var websocket = socket(server)

var api = require('./api')

var MailService = require('./mail-service');

var Order = require('./model/order.js');
var User = require('./model/user');
var Egroup = require('./model/employee-groups')

app.use(function (req, res, next) {
  console.log('After CORS ' + req.method + ' ' + req.url);
  next();
});

app.use(cors());

app.use(require('./routes/order-templates.js'));
app.use(require('./routes/statuses.js'));
app.use(require('./routes/fields.js'));
app.use(require('./routes/users.js'));
app.use(require('./routes/groups.js'));
app.use(require('./routes/upload.js'));
app.use(require('./routes/feedback.js'));
app.use(require('./routes/export.js'));
app.use(require('./routes/settings.js'));
app.use(require('./routes/employee-group'));

app.use(require('./routes/order.js'));

app.use(express.static('public'));
app.use("/uploads", express.static(__dirname + '/uploads'));

var mongoDB = 'mongodb://root:2007200788@localhost/ior';

mongoose.connect(mongoDB, {
  useMongoClient: true
});

app.listen(80, function () {
  cronjobs.archiveOrders()
  resolveAdminAccount()
  console.log('Fired at ' + Date());
});

server.listen(3001)

var connectedUsers = []


function resolveAdminAccount() {
  User.find({ type: "admin"}, function (err, user) {
    if (user == null) {
      var admin = new User({ 
        name: "",
        mail: "support@iorcontrol.ru",
        type: "admin",
        phone: "",
        password: config.adminPassword,
        permission_to_cancel_orders: false,
        new_orders_notification: false,
        new_status_notification: false,
        new_orders_push_notification: false,
        new_status_push_notification: false,
        push_id: req.body.push_id
     })

     admin.save(function (err) {
      if (err) throw err;
    })
    }
  })
}

websocket.on('connection', function (connection) {
  console.log('A client just joined on', connection.id)

  connection.on("_id", function (_id) {
    connectedUsers.push({ connectionID: connection.id, userID: _id })
  })

  connection.on('messageString', function (data) {
    data = JSON.parse(data)
    websocket.emit(data.order, data)
    processChatMessage(data)
  })

  connection.on('message', function (data) {
    websocket.emit(data.order, data)
    processChatMessage(data)
  });

  connection.on('disconnect', function () {
    var index;
    connectedUsers.forEach(function (item, i) {
      if (item.connectionID == connection.id) {
        index = i
      }
      if (index !== undefined && index !== null) {
        connectedUsers.splice(index, 1)
      }
    })

  })
})

function processChatMessage(data) {
  Order.findOne({ _id: data.order }, function (err, order) {
    var now = new Date().getTime()
    data.date = now
    var messages = order.messages
    messages.push(data)
    order.messages = messages
    order.updated = now
    order.save(function (err) {
      if (err) throw err
    })

    var userOnline = false

    if (order.assignedToGroup != undefined) {
      Egroup.findOne({ _id: order.assignedToGroup }).populate('users').exec(function (err, group) { 

        var onlineUsers = [];

        if (data.username == order.client) {
          connectedUsers.forEach(function (item, index) {
            group.users.forEach(function (user) {
              if (item.userID == user._id) {
                onlineUsers.push(user)
              }
            })
          })

         group.users.forEach(function(userInGroup) {

          if (onlineUsers.includes(userInGroup) == false) {
            sendNewChatMail(userInGroup, order.number)
          }

          User.findOne({ _id: userInGroup }, function (err, user) {
            if (user.push_id != "") {
              api.postPushWithData(user.push_id, "Новое сообщение по заказу " + order.number, data.order)
            }
          })

         })
        } else {
          connectedUsers.forEach(function (item, index) {
            if (item.userID == order.client) {
              userOnline = true
            }
          })
    
          if (userOnline == false) {
            User.findOne({ _id: order.client }, function (err, user) {
              console.log("OFFLINE, SENDING TO", user)
              sendNewChatMail(user, order.number)
            })
          }

          group.users.forEach(function(userInGroup) {

            if (onlineUsers.includes(userInGroup) == false) {
              if (userInGroup != data.username) {
                sendNewChatMail(userInGroup, order.number)
              }
            }
  
            User.findOne({ _id: userInGroup }, function (err, user) {
              if (user.push_id != "") {
                api.postPushWithData(user.push_id, "Новое сообщение по заказу " + order.number, data.order)
              }
            })
  
           })

          if (order.assignedTo == data.username) {
            User.findOne({ _id: order.client }, function (err, user) {
              console.log("user is ", user)
              if (user.push_id != "") {
                api.postPushWithData(user.push_id, "Новое сообщение по заказу " + order.number, data.order)
              }
            })
          }
        }
      })
    } else {
      if (data.username == order.client) {
        connectedUsers.forEach(function (item, index) {
          if (item.userID == order.assignedTo) {
            userOnline = true
          }
        })
  
        if (userOnline == false) {
          User.findOne({ _id: order.assignedTo }, function (err, user) {
            sendNewChatMail(user, order.number)
          })
        }
      }
  
      if (data.username == order.assignedTo) {
        connectedUsers.forEach(function (item, index) {
          if (item.userID == order.client) {
            userOnline = true
          }
        })
  
        if (userOnline == false) {
          User.findOne({ _id: order.client }, function (err, user) {
            sendNewChatMail(user, order.number)
          })
        }
      }
  
      if (order.client == data.username) {
        User.findOne({ _id: order.assignedTo }, function (err, user) {
          console.log("user is ", user)
          if (user.push_id != "") {
            api.postPushWithData(user.push_id, "Новое сообщение по заказу " + order.number, data.order)
          }
        })
      }
  
      if (order.assignedTo == data.username) {
        User.findOne({ _id: order.client }, function (err, user) {
          console.log("user is ", user)
          if (user.push_id != "") {
            api.postPushWithData(user.push_id, "Новое сообщение по заказу " + order.number, data.order)
          }
        })
      }
    }
  })
}


function sendNewChatMail(user, order) {

  var mail = user.mail
  var name = user.name

  var mailOptions = {
    from: '"IORcontrol" <support@iorcontrol.ru>',
    to: mail, // 
    subject: 'Новое сообщение в чате IORcontrol',
    html: '<p>Здравствуйте, ' + name + '.</p><p>По заказу: <b>' + order + '</b> поступило новое сообщение в чате.</p></p><p>&nbsp;</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://live.iorcontrol.ru">live.iorcontrol.ru</a></p>'
  };

  MailService.sendMail(mailOptions)

}


