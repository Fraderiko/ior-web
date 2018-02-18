var express = require('express');
var router = express.Router();

var Status = require('../model/status.js');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.post('/statuses/create', function (req, res) {
    console.log(req.body)
    var status = new Status({ name: req.body.name, state: "New", fields: req.body.fields, isFinal: req.body.isFinal, users_permission_to_edit: req.body.users_permission_to_edit, groups_permission_to_edit: req.body.groups_permission_to_edit })
    status.save(function (err) {
        if (err) throw err;
    })
    res.send('CREATED!')
})

app.post('/statuses/', function (req, res) {
    Status.find().populate('fields').populate('groups_permission_to_edit').populate('users_permission_to_edit').exec(function (err, statuses) {
        if (err) throw err;
        res.send(statuses)
    });
})

app.post('/statuses/update', function (req, res) {
    Status.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, field) {
        if (err) throw err;

        res.send(field)
    });
})

app.post('/statuses/delete', function (req, res) {
    Status.findOneAndRemove({ _id: req.body._id }, function (err) {
        if (err) throw err;

        res.send("DELETED!")
    });
})

module.exports = app