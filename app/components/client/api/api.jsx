var axios = require('axios');
var config = require('../../../../config.js');

module.exports = {

    getOrderTemplates: function() {
        return axios.post(config.host + '/order-templates').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    getCanWorkWith: function(_id) {
        return axios.post(config.host + '/group-by-user', _id).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    getAllEmployee: function() {
        return axios.post(config.host + '/users/employee').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    getOrders: function() {
        return axios.post(config.host + '/order').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    getOrdersByEmployeeId: function(id) {
        return axios.post(config.host + '/order-by-employee/'+id).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    getUserGroup: function(id) {
        return axios.post(config.host + '/group/'+id).then(function (res) {
            return res.data
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    getGroupDetails: function (id) {
        return axios.post(config.host + '/group-details/', id).then(function (res) {
            return res.data
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    getOrdersByUser: function(id) {
        return axios.post(config.host + '/order-by-group/'+id+'').then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    createOrder: function(data) {
        return axios.post(config.host +  '/order/create', data).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    setStatusForOrder: function(data) {
        return axios.post(config.host + '/order/set-status', data).then(function (res) {
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

    addOrderToFav: function(order) {
        return axios.post(config.host + '/addfavorder/', order).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    removeOrderFromFav: function(order) {
        return axios.post(config.host + '/removefavorder/', order).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    getUser: function (id) {
        return axios.post(config.host + '/user/'+id).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    exportExcel: function (orders) {
        return axios.post(config.host + '/export/', orders, { responseType: 'arraybuffer' }).then(function (res) {
            return res;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    cancelOrder: function (order) {
        return axios.post(config.host + '/order/cancel', order).then(function (res) {
            return res;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    deleteOrder: function (order) {
        return axios.post(config.host + '/order/delete', order).then(function (res) {
            return res;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    userHasPermissionToCancel: function(_id) {
        return axios.post(config.host + '/users/cancel-permission', _id).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },
    searchOrderEmployee: function(query) {
        return axios.post(config.host + '/order-search-by-employee/', query).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    searchOrderClient: function(query) {
        return axios.post(config.host + '/order-search-by-client/', query).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    searchOrder: function(query) {
        return axios.post(config.host + '/order-search/', query).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    updateOrder: function(order) {
        return axios.post(config.host + '/order/update', order).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    },

    sendOrderToEmail: function(data) {
        return axios.post(config.host + '/order/share-to-email', data).then(function (res) {
            return res.data;
        }, function(res) {
            console.log("ERROR!");
            console.log(res);
        });
    }
}