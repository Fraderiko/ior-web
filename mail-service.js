var nodemailer = require('nodemailer');
var config = require('./config.js');

var transporter = nodemailer.createTransport({
    host: config.mail_host,
    port: config.mail_port,
    secure: false, 
    auth: {
        user: config.mail_user, 
        pass: config.mail_password  
    }
});

module.exports = {
    sendMail: function (mailOptions) {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));        
        });
    }
}