var express = require('express');
var router = express.Router();

var User = require('../model/user.js');
var bodyParser = require('body-parser');

var app = express();

var mail_service = require('../mail-service.js');

app.use(bodyParser.json());

app.post('/users/auth', function (req, res, next) {
    User.findOne({ "mail": req.body.mail, "password": req.body.password }, function (err, user) {
        if (err) throw err;
        if (user == undefined) {
            res.send({ "result": "error" })
        } else {
            res.send({ "result": "ok", "_id": user._id, "type": user.type, "name": user.name })
        }
    });
})

app.post('/users/create', function (req, res) {
    var status = new User({ name: req.body.name,
        mail: req.body.mail,
        type: req.body.type,
        phone: req.body.phone,
        password: req.body.password,
        permission_to_cancel_orders: req.body.permission_to_cancel_orders,
        permission_to_edit_orders: req.body.permission_to_edit_orders,
        new_orders_notification: req.body.new_orders_notification,
        new_status_notification: req.body.new_status_notification,
        new_orders_push_notification: req.body.new_orders_push_notification,
        new_status_push_notification: req.body.new_status_push_notification,
        push_id: req.body.push_id
     })
    status.save(function (err) {
        if (err) throw err;
    })

    var mailOptions = {
        from: '"IORcontrol" <support@iorcontrol.ru>',
        to: req.body.mail, 
        subject: 'Регистрация в IORcontrol', 
        html: '<p>Здравствуйте,</p><p>Вы были зарегистрированы в системе IORcontrol.</p><p>Ваш логин: <b>'+ req.body.mail +'</b></p><p>Ваш пароль: <b>'+ req.body.password + '</b></p></p><p>&nbsp;</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://online.iorcontrol.ru">live.iorcontrol.ru</a></p>' 
    };

    mail_service.sendMail(mailOptions)

    res.send('CREATED!')
})

app.post('/users/', function (req, res) {
    User.find().exec(function (err, users) {
        if (err) throw err;
        res.send(users)
    });
})

app.post('/users/employee', function (req, res) {
    User.find({ type: "employee" }).exec(function (err, users) {
        if (err) throw err;
        res.send(users)
    });
})

app.post('/users/update', function (req, res) {
    User.findOneAndUpdate({ _id: req.body._id }, { $set: { name: req.body.name,
        mail: req.body.mail,
        phone: req.body.phone,
        new_orders_notification: req.body.new_orders_notification,
        new_status_notification: req.body.new_status_notification,
        password: req.body.password,
        permission_to_cancel_orders: req.body.permission_to_cancel_orders,
        permission_to_edit_orders: req.body.permission_to_edit_orders,
        new_orders_push_notification: req.body.new_orders_push_notification,
        new_status_push_notification: req.body.new_status_push_notification,
        push_id: req.body.push_id } }, function (err, user) {
        if (err) throw err;

        res.send(user)
    });
})

app.post('/users/delete', function (req, res) {
    User.findOneAndRemove({ _id: req.body._id }, function (err) {
        if (err) throw err;

        res.send("DELETED!")
    });
})

app.post('/users/type', function (req, res) {
    User.findOne({ _id: req.body._id }, function (err, user) {
        if (err) throw err;

        res.send({ "type": user.type })
    });
})

app.post('/user/:id', function (req, res) {
    User.findOne({ _id: req.params.id }).exec(function (err, user) {
        if (err) throw err;
        res.send(user)
    });
})

app.post('/addfavorder/', function (req, res) {
    User.findOne({ _id: req.body._id }).exec(function (err, user) {
        user.favorites.push(req.body.order_id)
        User.findOneAndUpdate({ _id: req.body._id }, { $set: { favorites: user.favorites } }, function (err, user) {
            if (err) throw err;
            res.send(user)
        })
    });
})

app.post('/removefavorder/', function (req, res) {
    User.findOne({ _id: req.body._id }).exec(function (err, user) {

        var index;

        for (var i = 0; i < user.favorites.length; i++) {
            if (user.favorites[i] == req.body.order_id) {
                index = i
            }
        }

        user.favorites.splice(index, 1)

        User.findOneAndUpdate({ _id: req.body._id }, { $set: { favorites: user.favorites } }, function (err, user) {
            if (err) throw err;
            res.send(user)
        })
    });
})

app.post('/adminpwd/', function (req, res) {
    User.findOne({ type: 'admin' }).exec(function (err, user) {

        user.password = req.body.password

        User.findOneAndUpdate({ type: 'admin' }, { $set: { password: user.password } }, function (err, user) {
            if (err) throw err;
            res.send({ "result": "ok" })
        })
    });
})

app.post('/users/cancel-permission', function (req, res) {
    User.findOne({ _id: req.body._id }).exec(function (err, user) {
        if (err) throw err;
        res.send({ "permission": user.permission_to_cancel_orders })
    });
})

app.post('/users/set-push-id', function (req, res) {
    User.findOneAndUpdate({ _id: req.body._id }, { $set: { push_id: req.body.push_id }}).exec(function (err, user) {
        if (err) throw err;
        res.send({ "result": "ok" })
    });
});

module.exports = app