var express = require('express');
var router = express.Router();

var Group = require('../model/employee-groups');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.delete('/egroup/:id', function (req, res) {
    Group.findOneAndRemove({ _id: req.params.id }, function (err) {
        if (err) throw err;

        res.send("DELETED!")
    });
})

    .put('/egroup', function (req, res) {
        Group.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, group) {
            if (err) throw err;

            res.send(group)
        });
    })

app.post('/egroup', function (req, res) {
    var group = new Group({ name: req.body.name, users: req.body.users })
    group.save(function (err) {
        if (err) throw err;
    })
    res.send('CREATED!')
})

app.get('/egroups', function (req, res) {
    Group.find({}).populate('users').exec(function (err, result) {
        res.send(result)
    })
})

app.post('/egroups/:id', function (req, res) {
    Group.findOne({ _id: req.params.id }).exec(function (err, group) {
        if (err) throw err;
        res.send(group)
    });
})
app.post('/egroup-user/', function (req, res) {
    Group.find({}).exec(function (err, result) {

        var array = []

        req.body.groups.forEach(function (groupToCheck) {
            result.forEach(function (concreteGroupInAllGroups) {
                if (concreteGroupInAllGroups._id == groupToCheck) {
                    array.push(concreteGroupInAllGroups)
                }
            })
        })
        
        var users = array.filter(function(group) { return group.users.indexOf(req.body.user) > -1})

        if (users.length > 0) {
            res.send({ "result": true })
        } else {
            res.send({ "result": false })
        }
    })
})

// app.post('/group-details/', function (req, res) {
//     Group.findOne({_id: req.body._id}).populate('canworkwith').populate('orders').exec(function (err, group) {
//         if (err) throw err;
//         res.send(group)
//     });
// })

// app.post('/group-by-user/', function (req, res) {
//     Group.find().populate('users').populate('canworkwith').populate('orders').populate({path: 'orders', populate: { path: 'statuses', populate: { path: 'fields' }}}).exec(function (err, groups) {
//         if (err) throw err;

//         var index;
//         for (var i = 0; i < groups.length; i++) {
//             for (var j = 0; j < groups[i].users.length; j++) {
//                 if (groups[i].users[j]._id == req.body._id) {
//                     index = i
//                 }
//             }
//         }

//         if (index != null) {
//             res.send(groups[index])
//         } else {
//             res.send([])
//         }
//     });
// })

// app.post('/groups/update', function (req, res) {
//     Group.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, group) {
//         if (err) throw err;

//         res.send(group)
//     });
// })

// app.post('/groups/delete', function (req, res) {
//     Group.findOneAndRemove({ _id: req.body._id }, function (err) {
//         if (err) throw err;

//         res.send("DELETED!")
//     });
// })

module.exports = app