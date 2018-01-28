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

var MailService = require('./mail-service');

var Order = require('./model/order.js');
var User = require('./model/user');

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

app.use(require('./routes/order.js'));

app.use(express.static('public'));
app.use("/uploads", express.static(__dirname + '/uploads'));

var mongoDB = 'mongodb://localhost/ior';

mongoose.connect(mongoDB, {
  useMongoClient: true
});

app.listen(3000, function () {
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

  connection.on('message', function (data) {
    console.log(data);
    websocket.emit(data.order, data)
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

      if (data.username == order.client) {
        connectedUsers.forEach(function (item, index) {
          if (item.userID == order.assignedTo) {
            userOnline = true
          }
        })

        if (userOnline == false) {
          User.find({ _id: order.assignedTo }, function (err, user) {
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
          User.find({ _id: order.client }, function (err, user) {
            sendNewChatMail(user, order.number)
          })
        }
      }
    })
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


function sendNewChatMail(user, order) {

  var mail = user[0].mail
  var name = user[0].name

  var mailOptions = {
    from: '"IORcontrol" <support@iorcontrol.ru>',
    to: mail, // 
    subject: 'Новое сообщение в чате IORcontrol',
    html: '<p>Здравствуйте, ' + name + '.</p><p>По заказу: <b>' + order + '</b> поступило новое сообщение в чате.</p></p><p>&nbsp;</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://live.iorcontrol.ru">live.iorcontrol.ru</a></p>'
  };

  MailService.sendMail(mailOptions)

}


