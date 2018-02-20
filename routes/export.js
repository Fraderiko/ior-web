var Excel = require('exceljs');
var express = require('express');
var moment = require('moment');

var bodyParser = require('body-parser');
var config = require('../config.js');
var app = express();

var User = require('../model/user')

app.use(bodyParser.json());

app.post('/export/', function (req, res) {
    
    var workbook = new Excel.Workbook();
    var sheet = workbook.addWorksheet('Sheet');
    var worksheet = workbook.getWorksheet(1);

    User.findOne({_id: req.body.id}, function (err, user) {

        if (user.type == 'client') {
            worksheet.columns = [
                { header: 'Номер', key: 'Id', width: 32 },
                { header: 'Создан', key: 'Date', width: 32 },
                { header: 'Обновлен', key: 'Updated', width: 32, outlineLevel: 1 },
                { header: 'Тип', key: 'Type', width: 32, outlineLevel: 1 },
                { header: 'Статус', key: 'Status', width: 32, outlineLevel: 1 },
                { header: 'Исполнитель', key: 'Employee', width: 32, outlineLevel: 1 },
                { header: 'Дополнительная информация', key: 'Info', width: 200, outlineLevel: 1 }          
            ];
        } else {
            worksheet.columns = [
                { header: 'Номер', key: 'Id', width: 32 },
                { header: 'Создан', key: 'Date', width: 32 },
                { header: 'Обновлен', key: 'Updated', width: 32, outlineLevel: 1 },
                { header: 'Тип', key: 'Type', width: 32, outlineLevel: 1 },
                { header: 'Статус', key: 'Status', width: 32, outlineLevel: 1 },
                { header: 'Клиент', key: 'Client', width: 32, outlineLevel: 1 },
                { header: 'Дополнительная информация', key: 'Info', width: 200, outlineLevel: 1 }          
            ];
        }
        
        
    
        function prepareInfo(item) {
            var string = ""
            for (var i = 0; i < item.statuses.length; i++) {
                for (var j = 0; j < item.statuses[i].fields.length; j++) {
                    if (item.statuses[i].fields[j].type == 'video' || item.statuses[i].fields[j].type == 'image') {
                        if (item.statuses[i].fields[j].media.length > 0) {
                            var string = string + " | " + item.statuses[i].fields[j].name + " - " + item.statuses[i].fields[j].media.map(function(item) {return config.base_url + item}).join(", ")
                        }
                    } else {
                        if (item.statuses[i].fields[j].value != "") {
                            var string = string + " | " + item.statuses[i].fields[j].name + " - " + item.statuses[i].fields[j].value
                        }
                    }
                    
                }
            }
            
            return string
        }
    
        if (user.type == 'employee') {
            req.body.orders.forEach(function (item) {
                worksheet.addRow({Id: item.number, Date: moment.unix(item.date / 1000).locale("ru").format("LLL"), Updated: moment.unix(item.updated / 1000).locale("ru").format("LLL"), Type: item.type.name, Status: item.currentstatus, Client: item.createdBy.name, Info: prepareInfo(item) });
            })
        } else {
            req.body.orders.forEach(function (item) {
                worksheet.addRow({Id: item.number, Date: moment.unix(item.date / 1000).locale("ru").format("LLL"), Updated: moment.unix(item.updated / 1000).locale("ru").format("LLL"), Type: item.type.name, Status: item.currentstatus, Employee: getEmployee(item), Info: prepareInfo(item) });
            })
        }
    
        function getEmployee(item) {
            if (item.assignedTo == undefined) {
                return item.assignedToGroup.name
            } else {
                return item.assignedTo.name
            }
        }

        var filename = new Date().getTime()
    
        workbook.xlsx.writeFile('./uploads/'+filename+'.xlsx')
        .then(function() {
            res.download('./uploads/'+filename+'.xlsx')
        });


    })

    
})

module.exports = app;