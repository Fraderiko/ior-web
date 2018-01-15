var express = require('express');
var router = express.Router();

var Field = require('../model/field.js');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.post('/fields/create', function (req, res) {
    var field = new Field({ name: req.body.name, type: req.body.type, required: req.body.required, recepientvisible: req.body.recepientvisible, media: req.body.media, value: req.body.value })
    field.save(function (err) {
        if (err) throw err;
    })
    res.send('CREATED!')
})

app.post('/fields/', function (req, res) {
    Field.find({}, function (err, fields) {
        if (err) throw err;
        res.send(fields)
    });
})

app.post('/fields/update', function (req, res) {
    Field.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, field) {
        if (err) throw err;

        res.send(field)
    });
})

app.post('/fields/delete', function (req, res) {
    Field.findOneAndRemove({ _id: req.body._id }, function (err) {
        if (err) throw err;

        res.send("DELETED!")
    });
})


module.exports = app;