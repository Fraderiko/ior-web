var express = require('express');

var app = express();

var Settings = require('../model/settings.js');

var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/settings/create', function (req, res) {
    var settings = new Settings({ archivePeriod: req.body.archivePeriod })
    settings.save(function(err)  {
        if (err) throw err;
        res.send({"result": "ok"})
    })
})


app.post('/settings/update', function (req, res) {
    Settings.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, setting) {
        if (err) throw err;

        res.send({"result": "ok"})
    });
})

app.get('/settings', function (req, res) {
    Settings.find({}, function(err, settings) {
        if (err) throw err;
        res.send(settings[0])
    })
})

module.exports = app