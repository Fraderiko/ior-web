var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');

var app = express();

var cors = require('cors')

var User = require('../model/user.js');

var corsOptions = {
    optionsSuccessStatus: 200 
}

app.use(bodyParser.json());

app.post('/auth/', cors(corsOptions), function (req, res) {
    User.findOne({"mail": req.body.mail, "password": req.body.password}, function (err, user) {
        if (err) throw err;
        res.send(user)
    });
})


module.exports = app;