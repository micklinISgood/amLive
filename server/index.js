'use strict';

// setup default env variables
var path = require('path');
var express = require('express');
var expressWss = require('express-ws')(express());
var appWs = expressWss.app;
// appWs.use('/uploads',express.static('./uploads'));
var url = require('url');
var default_port = 5566

appWs.set('views', path.join(__dirname, 'views'));  
appWs.set('view engine', 'jade');

appWs.use(express.static('../www/'));

require('./video-processor')(appWs);

var port = Number(process.env.PORT || default_port);

appWs.listen(port, function () {
    console.log('Listening on port:' + port);
   
});

//tell express what to do when the /about route is requested
appWs.get('/w/*', function(req, res){
	var pathname = url.parse(req.url).pathname;
    //console.log("Request file_path " + pathname[2]+ " received.");
    var params = {name:pathname}
    res.render('playback', params);
    
});

