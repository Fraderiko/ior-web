var express = require('express');
var router = express.Router();

var OrderTemplate = require('../model/order-template.js');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());       

app.post('/order-templates/create', function (req, res) {
    console.log(req.body)
    var order = new OrderTemplate({ name: req.body.name, statuses: req.body.statuses })
    order.save(function (err) {
        if (err) throw err;
    })
    res.send('CREATED!')
})

app.post('/order-templates/', function (req, res) {
    OrderTemplate.find().populate({ path: 'statuses', populate: { path: 'fields' }}).exec(function (err, orders) {
        if (err) throw err;
        res.send(orders)
    });
})

app.post('/order-templates/update', function (req, res) {
    OrderTemplate.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, order) {
        if (err) throw err;

        res.send(order)
    });
})

app.post('/order-templates/delete', function (req, res) {
    OrderTemplate.findOneAndRemove({ _id: req.body._id }, function (err) {
        if (err) throw err;

        res.send("DELETED!")
    });
})

module.exports = app;