var CronJob = require('cron').CronJob;
var Settings = require('./model/settings.js'); 
var Order = require('./model/order.js');

module.exports = {
    archiveOrders: function () {
        
        new CronJob('00 00 00 * * 0-6', function() {
            Settings.find().exec(function(err, settings) {
                if (settings[0] != null) {
                    if (settings[0].archivePeriod != null) {
                        Order.find({ isArchived: false }).exec(function (err, orders) {
                            if (err) throw err;
                            orders.forEach(function(order) {
                                if ((settings[0].archivePeriod * 1000 * 60 * 60 * 24) < (new Date().getTime() - order.updated)) {
                                    Order.findOneAndUpdate({ _id: order._id }, { isArchived: true } , function(err, order) { 
                                        if (err) throw err
                                    })
                                }
                            });
                        });
                    }
                }
            })
          }, function () {
            /* This function is executed when the job stops */
          },
          true, /* Start the job right now */
          'Europe/Moscow' /* Time zone of this job. */
        );

        
    }
}