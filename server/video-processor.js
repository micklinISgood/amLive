'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var uuid = require('uuid-random');
var url = require('url');
require('date-utils');
var videoFileExtension = '.webm';
var blobs = [];
function writeOrAppendData(data, fileName, ws) {
    var filePath = '../www/w/';
    if (!fs.existsSync(filePath)){
        fs.mkdirSync(filePath);
    }
    var livePath = filePath+fileName;
    if (!fs.existsSync(livePath)){
        var t_hms = new Date().getTime();
        console.log(t_hms);
        fs.mkdirSync(livePath);

    }

    if (!fs.existsSync(filePath + fileName + videoFileExtension)) {
        console.log('writing original file');
        ws.send(fileName);
        fs.writeFileSync(filePath + fileName + videoFileExtension, data);
    } else {
        console.log('appending File')
        fs.appendFileSync(filePath + fileName + videoFileExtension, data);
    }
}

module.exports = function (app) {
    app.ws('/', function (ws, req) {
      
        var fileName = uuid();
        console.log('new connection established');
        ws.on('message', function(data) {
            if (data instanceof Buffer) {
                writeOrAppendData(data, fileName, ws);
            }
        });
        ws.send(fileName);
    });
 
};