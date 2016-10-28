'use strict';

// setup default env variables
var path = require('path');
var express = require('express');
var expressWss = require('express-ws')(express());
var appWs = expressWss.app;
// appWs.use('/uploads',express.static('./uploads'));
var url = require('url');

appWs.use(express.static('../www/'));

require('./video-processor')(appWs);

var port = Number(process.env.PORT || 7000);

appWs.listen(port, function () {
    console.log('Listening on port:' + port);
   
});

//tell express what to do when the /about route is requested
appWs.get('/w/*', function(req, res){
	var pathname = url.parse(req.url).pathname.split("/");
    console.log("Request file_path " + pathname[2]+ " received.");
    
});