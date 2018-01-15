var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

var mail_service = require('../mail-service.js');

app.post('/feedback/', function (req, res) {
    
    var mailOptions = {
        from: '"IOR Support 👻" <support@iorcontrol.ru>', 
        to: 'support@iorcontrol.ru', 
        subject: 'Вам поступило сообщение по обратной связи', 
        html: '<p>Отправитель: '+ req.body.sender +'</p><p>' + req.body.message + '</p>' 
    };

    res.send({"result": "ok"})

    mail_service.sendMail(mailOptions)

})


module.exports = app;