var express = require('express');
var router = express.Router();

var Order = require('../model/order.js');
var User = require('../model/user.js');
var Group = require('../model/group.js')
var bodyParser = require('body-parser');
var Moment = require('moment')

var nodemailer = require('nodemailer');

var mail_service = require('../mail-service.js');
var conf = require('../config')

var app = express();

var api = require('../api.js');

app.use(bodyParser.json());       

function makePassword() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

app.post('/order/create', function (req, res) {
    var newOrder = new Order({ 
        number: req.body.number,
        date: req.body.date,
        updated: req.body.date,
        type: req.body.type,
        assignedTo: req.body.assignedTo,
        comment: req.body.comment,
        currentstatus: req.body.currentstatus,
        statuses: req.body.statuses,
        createdBy: req.body.createdBy,
        group: req.body.group,
        recipientmail: req.body.recipientmail,
        recipientphone: req.body.recipientphone,
        client: req.body.client,
        cancelReason: '',
        isArchived: req.body.isArchived,
        discussion: req.body.discussion,
        messages: req.body.messages,
     })

    Order.findOne({number : req.body.number}, function (err, order) {
        if (order != null) {
            res.send({"result": "error", "error_details": "number already exist!"})
        } else {
            newOrder.save(function (err) {
                if (err) throw err;
        
                User.findOne({_id: req.body.createdBy}, function(err, user) {
                    if (user.type == 'client') {
                        User.findOne({_id: req.body.assignedTo}, function(err, assigned_to_user) {
                            if (assigned_to_user.new_orders_notification == true) { 
                                var name = assigned_to_user.name
                                var mailOptions = {
                                    from: '"IORcontrol" <support@iorcontrol.ru>', 
                                    to: assigned_to_user.mail, // 
                                    subject: 'Новый заказ в IORcontrol',
                                    html: '<p>Здравствуйте, ' + name + '.</p><p>Для Вас был создан новый заказ: <b>' + req.body.number + '</b>.</p></p><p>&nbsp;</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://live.iorcontrol.ru">live.iorcontrol.ru</a></p>'
                                };
                            
                                mail_service.sendMail(mailOptions)
                            }

                            if (assigned_to_user.new_orders_push_notification == true) {
                                api.postPush(assigned_to_user.push_id, "Для Вас был создан новый заказ")
                            }
                        })
                    } else {
                        User.findOne({_id: req.body.client}, function(err, user) {
                            if (user.new_orders_notification == true) { 
                                var name = user.name
                                var mailOptions = {
                                    from: '"IORcontrol" <support@iorcontrol.ru>', 
                                    to: user.mail, // 
                                    subject: 'Новый заказ в IORcontrol',
                                    html: '<p>Здравствуйте, ' + name + '.</p><p>Для Вас был создан новый заказ: <b>' + req.body.number + '</b>.</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://live.iorcontrol.ru">http://live.iorcontrol.ru</a></p>'
                                };
                            
                                mail_service.sendMail(mailOptions)
                            }

                            if (user.new_orders_push_notification == true) {
                                api.postPush(user.push_id, "Для Вас был создан новый заказ")
                            }
                        })
                    }
                })        
            })
            res.send({"result": "ok"})
        }
    }); 
})

app.post('/order/', function (req, res) {
    Order.find().populate({ path:'type', select: 'name -_id'}).populate({ path:'assignedTo', select: "name"}).populate({ path:'createdBy'}).populate({ path:'client'}).exec(function (err, orders) {
        if (err) throw err;
        res.send(orders)
    });
})

app.post('/order-by-employee/:id', function (req, res) {
    Order.find({ $and: [ { $or: [ { assignedTo: req.params.id }, { createdBy: req.params.id }] }, { isArchived: false } ]}).populate({ path:'type', select: 'name -_id'}).populate({ path:'assignedTo', select: "name"}).populate({ path:'createdBy', select: "name"}).populate({ path:'client', select: "name"}).exec(function (err, orders) {
        if (err) throw err;
        res.send(orders)
    });
})

app.post('/order-search-by-client/', function (req, res) {
    Group.findOne({users: req.body.id}, function(err, group) {
        if (group != null) {
            Order.find( { $and: [{ group: group._id }, { number : {$regex : ".*"+req.body.query+".*"} }] }).populate({ path:'type', select: 'name -_id'}).populate({ path:'assignedTo', select: "name"}).populate({ path:'createdBy'}).populate({ path:'client'}).exec(function (err, orders) {
                if (err) throw err;
                res.send(orders)
            });
        } else {
            res.send([])
        }
    });  
})

app.post('/order-search-by-employee/', function (req, res) {
    console.log(req.params)
    Order.find({ $and: [ { $or: [ { assignedTo: req.body.id }, { createdBy: req.body.id }] }, { number : {$regex : ".*"+req.body.query+".*"}}] }).populate({ path:'type', select: 'name -_id'}).populate({ path:'assignedTo', select: "name"}).populate({ path:'createdBy', select: "name"}).populate({ path:'client', select: "name"}).exec(function (err, orders) {
        if (err) throw err;
        res.send(orders)
    });
})

app.post('/order-search/', function (req, res) {
    Order.find({ number : {$regex : ".*"+req.body.query+".*"}}).populate({ path:'type', select: 'name -_id'}).populate({ path:'assignedTo', select: "name"}).populate({ path:'createdBy', select: "name"}).populate({ path:'client', select: "name"}).exec(function (err, orders) {
        if (err) throw err;
        res.send(orders)
    });
})

app.post('/order-by-group/:id', function (req, res) {
    Group.findOne({users: req.params.id}, function(err, group) {
        if (group != null) {
            Order.find( { $and: [{ group: group._id }, { isArchived: false }] }).populate({ path:'type', select: 'name -_id'}).populate({ path:'assignedTo', select: "name"}).populate({ path:'createdBy'}).populate({ path:'client'}).exec(function (err, orders) {
                if (err) throw err;
                res.send(orders)
            });
        }
    });    
})

app.post('/order/update', function (req, res) {
    Order.findOneAndUpdate({ _id: req.body._id }, { statuses: req.body.statuses }, function (err, order) {
        if (err) throw err;

        res.send(order)
    });
})

app.post('/order/share-to-email', function (req, res) {

    function prepareStatuses() {
        var statuses = "";
        req.body.order.statuses.forEach(function(status) {
            status.fields.forEach(function (field) {
                if (field.type == 'text' || field.type == 'digit' || field.type == 'date' || field.type == 'time') {
                    if (field.value != "") {
                        var string = '<p>' + field.name + ': <b>' + field.value + '</b>'
                        statuses = statuses + string
                    }
                }
            }) 
        })
        return statuses
    }

    function prepeareAttachments() {
        var array = [];
        req.body.order.statuses.forEach(function(status) {
            status.fields.forEach(function (field) {
                if (field.type == 'image' || field.type == 'video') {
                    field.media.forEach(function (item) {
                        array.push({filename: 'file. ' + item.split('.').pop() +' ', path: conf.host + item})
                    })
                }
            }) 
        })
        return array
    }

    var mailOptions = {
        from: '"IORcontrol" <support@iorcontrol.ru>', 
        to: req.body.email, // 
        subject: 'Данные по заказу № ' + req.body.order.number + ' от IORcontrol',
        attachments: prepeareAttachments(),
        html: '<p>Номер: <b> ' + req.body.order.number + '</b></p><p>Создан: <b>' + Moment(req.body.order.date).format('DD/MM/YYYY') + '</b></p><p>Обновлен: <b>' + Moment(req.body.order.updated).format('DD/MM/YYYY') + '</b></p><p>Тип: <b>' + req.body.order.type.name + '</b></p><p>Текущий статус: <b>' + req.body.order.currentstatus + '</b></p><p>Комментарий: <b>' + req.body.order.comment + '</b></p><p>Исполнитель: <b>' + req.body.order.assignedTo.name + '</b></p><p>Клиент: <b>' + req.body.order.client.name + '</b></p>'+ prepareStatuses() +'</p><p>&nbsp;</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://live.iorcontrol.ru">live.iorcontrol.ru</a></p>'
    };

    mail_service.sendMail(mailOptions)

    res.send("OK")
})

app.post('/order/set-status', function (req, res) {

        var ordernumber = req.body.number
        var createdBy = req.body.createdBy.name

        var array = [];

        var statuses = req.body.statuses

        var statusName;

        statuses.forEach(function(item, index) {
            if (item.state == 'preFilled') {
                array.push(item)
                statuses[index].state = 'Filled'
                statusName = statuses[index].name
            }
        })

        var status = array[array.length - 1]

        var arrayOfMissedFiellds = []

        status.fields.forEach(function (item) {
            if (item.required == true) {
                if (item.type == "image" || item.type == "video") {
                    if (item.media.length == 0) {
                        arrayOfMissedFiellds.push(item.name)
                    }
                } else {
                    if (item.value == "" || item.value == undefined || item.value == null) {
                        
                        arrayOfMissedFiellds.push(item.name)
                    }
                }
            }
        })

        if (arrayOfMissedFiellds.length > 0) {
            res.send({"status": "error", "missedFields" : arrayOfMissedFiellds})
            return
        }
        
        res.send({"status": "ok"})

        if (status.isFinal == true) {

                var password = makePassword()

                var user = new User({ name: req.body.number, mail: req.body.number, push_id: "", mail_for_order: req.body.recipientmail, type: 'order-details', phone: '', password: password, permission_to_cancel_orders: false })

                user.save(function (err) {
                    if (err) throw err;
                })
            
            if (req.body.recipientmail != '') {

                var mailOptions = {
                    from: '"IORcontrol" <support@iorcontrol.ru>',
                    to: req.body.recipientmail, 
                    subject: 'Информация о Вашем заказе в IORcontrol', 
                    html: '<p>Здравствуйте,</p><p>Вам был отгружен заказ: <b>'+ req.body.number +'</b>.</p><p>Для получения более подробной информации необходимо авторизоваться в системе <a href="http://live.iorcontrol.ru/" target="_blank">IORcontrol</a>, используя учетные данные ниже: </p><p>Логин: <b>'+ req.body.number +'</b></p><p>Пароль: <b>'+ password + '</b></p></p><p>&nbsp;</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://live.iorcontrol.ru">live.iorcontrol.ru</a></p>' 
                };

                mail_service.sendMail(mailOptions)
            }
                
            if (req.body.recipientphone != "") {
                var message = "Dear Customer, your order "+ req.body.number +" is shipped. Login: " + req.body.number + " Password: "+ password +" live.iorcontrol.ru"
                api.sendSms(req.body.recipientphone, message).then(function(response) {
                    console.log(response)
                }, function() {

                })
            }
        }

    Order.findOneAndUpdate({ _id: req.body._id }, { statuses: statuses, updated: new Date().getTime(), currentstatus: statusName}, function (err, order) {
        if (err) throw err;

        User.findOne({_id: req.body.client._id}, function(err, user) {
            console.log(user)
            if (user.new_status_notification == true) {
                var mailOptions = {
                    from: '"IORcontrol" <support@iorcontrol.ru>', 
                    to: user.mail, // 
                    subject: 'Обновление заказа в IORcontrol', 
                    html: '<p>Здравствуйте, ' + createdBy + '.</p><p>У заказа номер <b>' + ordernumber + '</b> изменился статус.</p><p>Новый статус: <b>'+ statusName +'</b>.</p></p><p>&nbsp;</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://live.iorcontrol.ru">live.iorcontrol.ru</a></p>' 
                };
            
                mail_service.sendMail(mailOptions)
            }

            if (user.new_status_push_notification) {
                api.postPush(user.push_id, "У заказа номер "+ ordernumber +" изменился статус")
            }
        })
    });
})

app.post('/order/cancel', function (req, res) {
    Order.findOneAndUpdate({ _id: req.body._id }, { currentstatus: req.body.currentstatus, updated: new Date().getTime(), cancelReason: req.body.cancelReason}, function (err, order) {
        if (err) throw err;
        res.send({'result': 'ok'})
    })
})

app.post('/order/delete', function (req, res) {
    Order.findOneAndRemove({ _id: req.body._id }, function (err) {
        if (err) throw err;

        res.send("DELETED!")
    });
})

app.post('/order/add-discussion', function (req, res) {
    Order.findOne({ _id: req.body._id }).populate({path: 'client'}).exec(function (err, order) {
            if (err) throw err;
    
            order.discussion.push(req.body.discussion)
    
            var clientMail = order.client.mail
            var clientName = order.client.name
            var recipientmail = order.recipientmail
            var clientID = order.client._id
            var clientPush_id = order.client.push_id

            Order.findOneAndUpdate({_id: order._id}, {discussion: order.discussion, updated: new Date().getTime()}, function(err, order) {

                if (req.body.discussion.author != clientID) {

                    var mailOptions = {
                        from: '"IORcontrol" <support@iorcontrol.ru>', 
                        to: clientMail, // 
                        subject: 'Обратная связь по заказу в IORcontrol', 
                        html: '<p>Здравствуйте, ' + clientName + '.</p><p>По заказу номер <b>' + order.number + '</b> поступило сообщение.</p></p><p>&nbsp;</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://live.iorcontrol.ru">live.iorcontrol.ru</a></p>' 
                    };
                
                    mail_service.sendMail(mailOptions)

                    if (clientPush_id != "") {
                        api.postPush(clientPush_id, "По заказу №"+ order.number +" получена обратная связь")
                    }

                } else {
                    var mailOptions = {
                        from: '"IORcontrol" <support@iorcontrol.ru>', 
                        to: recipientmail, // 
                        subject: 'Новое сообщение по заказу в IORcontrol', 
                        html: '<p>Здравствуйте, </p><p>По заказу номер <b>' + order.number + '</b> поступило сообщение.</p></p><p>&nbsp;</p><p>С уважением,</p><p>служба технической поддержки.</p><p><a href="http://live.iorcontrol.ru">live.iorcontrol.ru</a></p>' 
                    };
                
                    mail_service.sendMail(mailOptions)

                    User.findOne({name: order.number}, function (err, user) {
                        if (user.push_id != "") {
                            api.postPush(user.push_id, "По заказу №"+ order.number +" поступило сообщение")
                        }
                    })
                }

                res.send(order)
            })
        }
    );
})

app.get('/order/:number', function(req, res) {
    Order.findOne({ number: req.params.number }).populate({ path:'type', select: 'name -_id'}).populate({ path:'assignedTo', select: "name"}).populate({ path:'createdBy'}).populate({ path:'client'}).exec(function (err, order) {
        if (err) throw err;

        res.send(order)
    })
});

module.exports = app;