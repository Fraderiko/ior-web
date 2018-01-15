var axios = require('axios');
var config = require('../../../../config.js');

module.exports = {

    getFields: function() {
        return axios.post(config.host + '/fields').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    createField: function(field) {
        return axios.post(config.host + '/fields/create', field).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    updateField: function(field) {
        return axios.post(config.host + '/fields/update', field).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    deleteField: function(field) {
        console.log(field)
        return axios.post(config.host + '/fields/delete', field).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    getStatuses: function() {
        return axios.post(config.host + '/statuses').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    createStatus: function(status) {
        return axios.post(config.host + '/statuses/create', status).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    updateStatus: function(status) {
        return axios.post(config.host + '/statuses/update', status).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    deleteStatus: function(status) {
        return axios.post(config.host + '/statuses/delete', status).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },



    getOrders: function() {
        return axios.post(config.host + '/order-templates').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    createOrder: function(order) {
        return axios.post(config.host + '/order-templates/create', order).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    updateOrder: function(order) {
        return axios.post(config.host + '/order-templates/update', order).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    deleteOrder: function(order) {
        return axios.post(config.host + '/order-templates/delete', order).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },


    getUsers: function() {
        return axios.post(config.host + '/users').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    createUser: function(user) {
        return axios.post(config.host + '/users/create', user).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    updateUser: function(user) {
        return axios.post(config.host + '/users/update', user).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    deleteUser: function(user) {
        return axios.post(config.host + '/users/delete', user).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },




    getGroups: function() {
        return axios.post(config.host + '/groups').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    createGroup: function(group) {
        return axios.post(config.host + '/groups/create', group).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    updateGroup: function(group) {
        return axios.post(config.host + '/groups/update', group).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    deleteGroup: function(group) {
        return axios.post(config.host + '/groups/delete', group).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    setAdminPassword: function(password) {
        return axios.post(config.host + '/adminpwd', password).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    getSettings: function(password) {
        return axios.get(config.host + '/settings').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    updateSettings: function(settings) {
        return axios.post(config.host + '/settings/update', settings).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
}