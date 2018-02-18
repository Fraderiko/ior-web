var express = require('express');
var router = express.Router();

var Group = require('../model/group.js');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.post('/groups/create', function (req, res) {
    console.log(req.body)
    var group = new Group({ name: req.body.name, type: req.body.type, users: req.body.users, canworkwith: req.body.canworkwith, orders: req.body.orders, canworkwithgroups: req.body.canworkwithgroups })
    group.save(function (err) {
        if (err) throw err;
    })
    res.send('CREATED!')
})

app.post('/groups/', function (req, res) {
    Group.find().populate('users').populate('canworkwith').populate('orders').populate('canworkwithgroups').exec(function (err, groups) {
        if (err) throw err;
        res.send(groups)
    });
})

app.post('/group/:id', function (req, res) {
    Group.findOne({users: req.params.id}).exec(function (err, group) {
        if (err) throw err;
        res.send({ "_id": group._id })
    });
})

app.post('/group-details/', function (req, res) {
    Group.findOne({_id: req.body._id}).populate('canworkwith').populate('canworkwithgroups').populate('orders').exec(function (err, group) {
        if (err) throw err;
        res.send(group)
    });
})

app.post('/group-by-user/', function (req, res) {
    Group.find().populate('users').populate('canworkwith').populate('canworkwithgroups').populate('orders').populate({path: 'orders', populate: { path: 'statuses', populate: { path: 'fields' }}}).exec(function (err, groups) {
        if (err) throw err;

        var index;
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i].users.length; j++) {
                if (groups[i].users[j]._id == req.body._id) {
                    index = i
                }
            }
        }

        if (index != null) {
            res.send(groups[index])
        } else {
            res.send([])
        }
    });
})

app.post('/groups/update', function (req, res) {
    Group.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, group) {
        if (err) throw err;

        res.send(group)
    });
})

app.post('/groups/delete', function (req, res) {
    Group.findOneAndRemove({ _id: req.body._id }, function (err) {
        if (err) throw err;

        res.send("DELETED!")
    });
})

module.exports = app