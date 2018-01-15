var axios = require('axios');
var config = require('../../config.js');

module.exports = {

    getUserType: function(type) {
        return axios.post(config.host + '/users/type', type).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    getUser: function(id) {
        return axios.post(config.host + '/user/'+id).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    sendFeedBack: function(body) {
        return axios.post(config.host + '/feedback', body).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    }
}