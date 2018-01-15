var axios = require('axios');
var config = require('../../../config.js');

module.exports = {

    auth: function(creds) {
        return axios.post(config.host + '/users/auth', creds).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERRR!");
            console.log(res);
        });
    },

    getUser: function(id) {
        return axios.post(config.host + '/user/'+id).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("EROR!");
            console.log(res);
        });
    },

    updateUser: function(user) {
        return axios.post(config.host +  '/users/update', user).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    config: function() {
        return {
            headers: { 'content-type': 'multipart/form-data' }
        }
    },
    
    upload: function(data) {
        return axios.post(config.host + '/upload', data, this.config()).then(function (res) {
            console.log(res.data);
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    deleteUpload: function(_id) {
        return axios.post(config.host +  '/upload/delete', _id).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    getOrder: function(id) {
        return axios.get(config.host + '/order/'+id).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("EROR!");
            console.log(res);
        });
    },

    sendDiscussion: function (object) {
        return axios.post(config.host + '/order/add-discussion', object).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("EROR!");
            console.log(res);
        });
    }
}