'use strict';

// setup default env variables
const path = require('path');
const express = require('express');
const app = express();
const expressWs = require('express-ws');

const url = require('url');
const fs = require('fs')
const default_port = 5566;
const http_port = 9000;
const https = require('https')
const http = require('http')


const credentials = {
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
}

 
app.set('views', path.join(__dirname, 'views'));  
app.set('view engine', 'ejs');

app.use(express.static('../www/'));



// var port = Number(process.env.PORT || default_port);


const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
const expressWss = expressWs (app, httpsServer)
require('./video-processor')(app);

httpServer.listen(http_port);
console.log('Listening http on port:' + http_port);
httpsServer.listen(default_port);
console.log('Listening https on port:' + default_port);
// app.listen(port, function () {
//     console.log('Listening on port:' + port);
   
// });

//tell express what to do when the /about route is requested
app.get('/w/*', function(req, res){
	var pathname = url.parse(req.url).pathname;
    //console.log("Request file_path " + pathname[2]+ " received.");
    var params = {name:pathname}
    res.render('playback', params);
    
});

