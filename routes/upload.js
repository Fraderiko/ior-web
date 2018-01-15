var express = require('express');

var Upload = require('../model/upload.js');
var multer = require('multer')
var fs = require('fs')

var crypto = require('crypto');
var mime = require('mime');

var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, Date.now() + '-' + rus_to_latin(file.originalname));
        });
    }
});

var upload = multer({ storage: storage });

app.post('/upload', upload.array('file'), function (req, res) {
    var array = []

    req.files.forEach(function (item, index) {
        var upload = new Upload({ link: '/uploads/' + req.files[index].filename })
        var object = {
            _id: upload._id,
            url: upload.link
        }
        array.push(object)
    })

    Upload.insertMany(array, function (err, result) {
        if (err) throw err;
        res.send(array)
    })
})

app.post('/upload/delete', function (req, res) {
    var path = __dirname + '/..' + req.body.url
    Upload.findOneAndRemove({ _id: req.body._id }, function (err) {
        if (err) throw err;
        fs.unlinkSync(path)
        res.send({"result": "ok"})
    });
})

function rus_to_latin ( str ) {
    
    var ru = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 
        'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z', 'и': 'i', 
        'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 
        'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya', ' ': '_',
    }, n_str = [];
    
    str = str.replace(/[ъь]+/g, '').replace(/й/g, 'i');
    
    for ( var i = 0; i < str.length; ++i ) {
       n_str.push(
              ru[ str[i] ]
           || ru[ str[i].toLowerCase() ] == undefined && str[i]
           || ru[ str[i].toLowerCase() ].replace(/^(.)/, function ( match ) { return match.toUpperCase() })
       );
    }
    
    return n_str.join('');
}

module.exports = app