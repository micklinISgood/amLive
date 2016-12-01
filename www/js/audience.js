
var Chat = {},token;
Chat.socket = null;
var sourceBuffer = null, ms;
var init = false;

$('#live_url').html('<a onclick="window.open(\''+"https://"+window.location.host+'\');"style="color:#4286f4; text-decoration: underline;"><h3>Live your Lecture Now<h3></a>');


function hasMediaSource() {
  return !!(window.MediaSource || window.WebKitMediaSource);
}

function sourceOpen () {
  // console.log(this); // open
  // var vid = document.getElementById("watch_video");
  // // vid.src = window.URL.createObjectURL(ms);

  sourceBuffer = ms.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
  sourceBuffer.mode = 'sequence';
  //sourceBuffer.timestampOffset = 2.5;

  var full = head.substring(0,head.length-1);

  meta_location =  head+"meta.webm";
  console.log(sourceBuffer);
  console.log(ms.activeSourceBuffers);

  // meta_location = full+".webm";
  getChunkByURL(meta_location, appendSegment);


  var vid = document.getElementById("watch_video");
  vid.addEventListener('canplay', function () {
        
          vid.play();
     
  });

  init = true;
  
};
function liveappend (url) {
      // open

        getChunkByURL(url, appendSegment);
 
         var vid = document.getElementById("watch_video");
         vid.addEventListener('canplay', function () {
       
                 vid.play();
             
         });


  
};

function appendSegment (chunk) {

        sourceBuffer.appendBuffer(chunk);
     
};

var head = window.location.toString();
if (head[head.length-1]!="/"){
	head = head+"/";
}
Chat.connect = (function(host) {
    if ('WebSocket' in window) {
        Chat.socket = new WebSocket(host);
    } else if ('MozWebSocket' in window) {
        Chat.socket = new MozWebSocket(host);
    } else {
        console.log('Error: WebSocket is not supported by this browser.');
        return;
    }

    Chat.socket.onopen = function () {
         // console.log('Info: WebSocket connection opened.');
         var subscription ={};
         subscription.join = token;
         Chat.sendMessage(JSON.stringify(subscription));
        
     
        if (hasMediaSource()) {

          window.MediaSource = window.MediaSource || window.WebKitMediaSource;
          ms = new MediaSource;
          var video = document.getElementById("watch_video");
          video.src = URL.createObjectURL(ms);
          ms.addEventListener('sourceopen', sourceOpen);
          Chat.socket.binaryType = 'arraybuffer';

        } else {
            alert("Bummer. Your browser doesn't support the MediaSource API!");
        }

 
    };

    Chat.socket.onclose = function () {
      var vid = document.getElementById("watch_video");
      var full = head.substring(0,head.length-1);
      src_location =  full+".webm";
      console.log(src_location);
      vid.setAttribute('src', src_location);
      vid.play();
    	
    	Chat.socket = null;
    //   setTimeout(function() {
    //     Chat.initialize();
    //   },60000);
    };

    Chat.socket.onmessage = function (message) {
    	// console.log(message.data);

      try {
            // console.log(message.data instanceof Buffer);
            sourceBuffer.appendBuffer(message.data);
            // var action = JSON.parse(message.data);
            // if (action["live"] && init){
            //     //replace video src here
            //     // console.log(action["live"]);
            //     // var vid = document.getElementById("watch_video");
            //     sourceBuffer.appendBuffer(action["live"]);
            //     // src_location =  head+action["live"]+".webm";
            //     // // console.log(src_location);
            //     // // console.log(ms);
            //     // // ms.addEventListener('sourceopen',  liveappend(src_location));
            //     // liveappend(src_location);
         
            //     // vid.setAttribute('src', src_location);
            // }
            // if(action["end"]){
           
            //     // ms.endOfStream();
            // }
        }catch(err) {
            console.log(err);
            console.log(message);
            // Chat.initialize();
        }
    
        return false;
    };

});
  

Chat.initialize = function() {
	loc_str = window.location.toString();
	if (loc_str[loc_str.length-1]=="/"){
		loc_str = loc_str.substring(0,loc_str.length-1);
	}
	last = loc_str.lastIndexOf("/");
	token = loc_str.substring(last+1);
	console.log(window.location+","+token+","+last);
    if (window.location.protocol == 'http:') {
        Chat.connect('ws://' + window.location.host);
    } else {
        Chat.connect('wss://' + window.location.host);
    }
};

Chat.sendMessage = (function(message) {
   
        Chat.socket.send(message);
 
});
function getChunkByURL (url, cb) {
    // console.log(url); 
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    // xhr.setRequestHeader('Range', 'bytes=0-500'); // Request first 500 bytes of the video.
    xhr.onload = function(e) {

        if (xhr.status == 200){
           cb(xhr.response);
        }
       //  var WebMChunk = new Uint8Array(e.target.result);
       // sourceBuffer.append(WebMChunk);
    }
    xhr.send();
}

Chat.initialize();