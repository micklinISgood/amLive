'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var uuid = require('uuid-random');
var url = require('url');
require('date-utils');
var videoFileExtension = '.webm';
var host = [];
var room = {};
var prevFilePath = '';

function StoreDataToWebm(data, hashid, ws) {
    var filePath = '../www/w/';
    if (!fs.existsSync(filePath)){
        fs.mkdirSync(filePath);
    }
    
    var livePath = filePath+hashid+'/';
    var t_hms = new Date().getTime();
    if (!fs.existsSync(livePath)){
        console.log('writing meta file');
        fs.mkdirSync(livePath);
        prevFilePath = livePath + "meta" + videoFileExtension;
        fs.writeFileSync(prevFilePath, data);

    }else{
      
        // prevFilePath = livePath + t_hms + videoFileExtension;
        // fs.writeFileSync(prevFilePath, data);
        //delete previous file
        // fs.unlinkSync(prevFilePath);
        broadcast_binary(ws,hashid,data);
    }


    if (!fs.existsSync(filePath + hashid + videoFileExtension)) {
        console.log('writing original file');
        fs.writeFileSync(filePath + hashid + videoFileExtension, data);
    } else {
        // console.log('appending File')
        fs.appendFileSync(filePath + hashid + videoFileExtension, data);
    }
}
function broadcast_binary(ws,hashid,data){
    // var para = {};
    // para[key] = data.toString();
    // console.log(room[hashid]);
    for(var i in room[hashid]){
        if(room[hashid][i]!= ws){
            // console.log("client"+room[hashid][i]);
            try {
                room[hashid][i].send(data);
            }catch(e){
                room[hashid][i].close();
                delete room[hashid][i];
            }
        }
    }
}
function broadcast(ws,hashid,key,data){
    var para = {};
    para[key] = data.toString();
    // console.log(room[hashid]);
    for(var i in room[hashid]){
        if(room[hashid][i]!= ws){
            console.log("client"+room[hashid][i]);
            try {
                room[hashid][i].send(JSON.stringify(para));
            }catch(e){
                room[hashid][i].close();
                delete room[hashid][i];
            }
        }
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

function close_subscriptions(ws,hashid){

    for(var i in room[hashid]){
        if(room[hashid][i]!= ws){
            console.log("client"+room[hashid][i]);
            try {
                room[hashid][i].close();
            }catch(e){
                room[hashid][i].close();
            }
        }
    }
}
module.exports = function (app) {
    // console.log(app.ws)
    app.ws('/', function (ws, req) {
      
        var hashid = uuid();
        ws.name = hashid;
        console.log('new connection established');
        ws.on('message', function(data) {
            if (data instanceof Buffer) {
                StoreDataToWebm(data, hashid, ws);
                if(!room[hashid]){
                    room[hashid] = [ws];
                    host.push(ws);
                }
            }else{
               data = JSON.parse(data);
               if(data["join"] && room[data["join"]]){
                    room[data["join"]].push(ws);
               }else if(data["join"] && !room[data["join"]]){
                    // var para = {};
                    // para["end"]=1;
                    // ws.send(JSON.stringify(para));
                    ws.close();
               }
            }
            // console.log(room);
        });
        ws.on('close', function(data) {
            //reload clients' <video> to full video 
            //delete real dir 
            var checkhost = host.indexOf(ws); 
            if(checkhost!= -1){
                var delid = host[checkhost].name;
                // console.log(host[checkhost].name);
                broadcast(ws,delid,"end",1);
                deleteRealDir(delid);
                delete host[checkhost]; 
                close_subscriptions(ws,delid);
                delete room[delid];
            }
       
        });
        ws.send(hashid);
    });
 
};