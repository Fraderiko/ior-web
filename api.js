var axios = require('axios');
var config = require('./config')

module.exports = {
    
        postPush: function(id, message) {

            var object = {
                "app_id": "50f12693-ffef-48b7-ba86-0e38607dbe31",
                "include_player_ids": [id],
                "data": {},
                "contents": {"en": message}
            }

            return axios.post('https://onesignal.com/api/v1/notifications', object).then(function (res) {
                return res.data;
            }, function(res) {
                console.log("ERROR!");
                console.log(res);
            });
        },

        sendSms: function(phone, message) {            
                        return axios.post('https://smsc.ru/sys/send.php?login='+ config.sms_login +'&psw='+ config.sms_password +'&phones='+ phone +'&mes='+ message +'&charset=utf-8').then(function (res) {
                            return res.data;
                        }, function(res) {
                            console.log("ERROR!");
                            console.log(res);
                        });
                    }
}