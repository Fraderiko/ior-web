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

    var state = {}

    User.findOne({_id: req.body.id}, function (err, user) {

        if (user.type == 'client') {
            var array = [
                { header: 'Номер', key: 'Id', width: 22 },
                { header: 'Создан', key: 'Date', width: 22 },
                { header: 'Обновлен', key: 'Updated', width: 22, outlineLevel: 1 },
                { header: 'Тип', key: 'Type', width: 22, outlineLevel: 1 },
                { header: 'Статус', key: 'Status', width: 22, outlineLevel: 1 },
                { header: 'Исполнитель', key: 'Employee', width: 22, outlineLevel: 1 },
            ];
        } else {
            var array = [
                { header: 'Номер', key: 'Id', width: 22 },
                { header: 'Создан', key: 'Date', width: 22 },
                { header: 'Обновлен', key: 'Updated', width: 22, outlineLevel: 1 },
                { header: 'Тип', key: 'Type', width: 22, outlineLevel: 1 },
                { header: 'Статус', key: 'Status', width: 22, outlineLevel: 1 },
                { header: 'Клиент', key: 'Client', width: 22, outlineLevel: 1 },
            ];
        }

        for (var i = 0; i < 40; i++) {
          array.push({ header: '', key: 'Info-' + i, width: 35, outlineLevel: 1 })
        }

        worksheet.columns = array

        function prepareInfo(item) {

            var array = []

            for (var i = 0; i < item.statuses.length; i++) {
                for (var j = 0; j < item.statuses[i].fields.length; j++) {
                    if (item.statuses[i].fields[j].type == 'video' || item.statuses[i].fields[j].type == 'image') {
                        if (item.statuses[i].fields[j].media.length > 0) {
                          item.statuses[i].fields[j].media.forEach(function (obj, index) {
                            var url = config.base_url + obj
                            var index = parseInt(index) + 1
                            array.push({ formula: "=HYPERLINK(\"" + url + "\", \"" + item.statuses[i].fields[j].name + " (Ссылка-" + index + ") \")" })
                          })
                        }
                    } else {
                        if (item.statuses[i].fields[j].value != "" && item.statuses[i].fields[j].value != undefined) {
                            var string = item.statuses[i].fields[j].name + " - " + item.statuses[i].fields[j].value
                            array.push(string)
                        }
                    }

                }
            }

            return array
        }

        if (user.type == 'employee') {
            req.body.orders.forEach(function (item) {

                var row = {Id: item.number, Date: moment.unix(item.date / 1000).locale("ru").format("LLL"), Updated: moment.unix(item.updated / 1000).locale("ru").format("LLL"), Type: item.type.name, Status: item.currentstatus, Client: item.client.name}

                var array = prepareInfo(item)

                array.forEach(function(item, index) {
                  row["Info-" + index] = item
                })

                worksheet.addRow(row);
            })
        } else {
            req.body.orders.forEach(function (item) {

                var row = {Id: item.number, Date: moment.unix(item.date / 1000).locale("ru").format("LLL"), Updated: moment.unix(item.updated / 1000).locale("ru").format("LLL"), Type: item.type.name, Status: item.currentstatus, Employee: getEmployee(item) }

                var array = prepareInfo(item)

                array.forEach(function(item, index) {
                  row["Info-" + index] = item
                })

                worksheet.addRow(row);
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
