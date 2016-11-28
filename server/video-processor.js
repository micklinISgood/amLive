'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var uuid = require('uuid-random');
var url = require('url');
require('date-utils');
var videoFileExtension = '.webm';
var blobs = [];
var room = {};
var prevFilePath = '';
function StoreDataToWebm(data, hashid, ws) {
    var filePath = '../www/w/';
    if (!fs.existsSync(filePath)){
        fs.mkdirSync(filePath);
    }
    
    // var livePath = filePath+hashid+'/';

    // if (!fs.existsSync(livePath)){
    //     var t_hms = new Date().getTime();
    //     fs.mkdirSync(livePath);
    //     prevFilePath = livePath + t_hms + videoFileExtension;
    //     fs.writeFileSync(prevFilePath, data);
    // }else{
    //     //delete previous file
    //     fs.unlinkSync(prevFilePath);
    //     var t_hms = new Date().getTime();
    //     prevFilePath = livePath + t_hms + videoFileExtension;
    //     fs.writeFileSync(prevFilePath, data);
    // }

    if (!fs.existsSync(filePath + hashid + videoFileExtension)) {
        console.log('writing original file');
        ws.send(hashid);
        fs.writeFileSync(filePath + hashid + videoFileExtension, data);
    } else {
        console.log('appending File')
        fs.appendFileSync(filePath + hashid + videoFileExtension, data);
    }
}
function deleteRealDir(hashid) {
    var filePath = '../www/w/';
    var livePath = filePath+hashid+'/';
    deleteFolderRecursive(livePath);

}
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
module.exports = function (app) {
    app.ws('/', function (ws, req) {
      
        var hashid = uuid();
        console.log('new connection established');
        ws.on('message', function(data) {
            if (data instanceof Buffer) {
                StoreDataToWebm(data, hashid, ws);
                if(!room[hashid]){
                    room[hashid] = [ws];
                }
            }else{
               data = JSON.parse(data);
               if(data["join"] && room[data["join"]]){
                    room[data["join"]].push(ws);
               }
            }
            // console.log(room);
        });
        ws.on('close', function(data) {
            //reload clients' <video> to full video 
            //delete real dir 
            console.log("close");
            deleteRealDir(hashid);
       
        });
        ws.send(hashid);
    });
 
};