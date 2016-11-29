'use strict';

// setup default env variables
var fs = require('fs');
var path = require('path');
var express = require('express');
var expressWss = require('express-ws')(express());
var appWs = expressWss.app;
// appWs.use('/uploads',express.static('./uploads'));
var url = require('url');
var default_port = 5566

appWs.set('views', path.join(__dirname, 'views'));  
appWs.set('view engine', 'ejs');

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


appWs.get('/stream/*', function(req, res){
	var pathname = url.parse(req.url).pathname;
    var params = {name:pathname}
	movieStream = fs.createReadStream(pathname+'.webm');
	console.log(pathname)
	var range = req.headers.range;
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    var chunksize = (end - start) + 1;
	movieStream.on('open', function () {
	    res.writeHead(206, {
	        "Content-Range": "bytes " + start + "-" + end + "/" + total,
	            "Accept-Ranges": "bytes",
	            "Content-Length": chunksize,
	            "Content-Type": "video/webm"
	    });
	    // This just pipes the read stream to the response object (which goes 
	    //to the client)
	    movieStream.pipe(res);
	});

	movieStream.on('error', function (err) {
	    res.end(err);
	});
});