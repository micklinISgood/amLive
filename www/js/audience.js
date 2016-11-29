var Chat = {},token;
Chat.socket = null;
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
 
    };

    Chat.socket.onclose = function () {
    	
    	Chat.socket = null;
    //   setTimeout(function() {
    //     Chat.initialize();
    //   },60000);
    };

    Chat.socket.onmessage = function (message) {
    	// console.log(message.data);

      try {
            var action = JSON.parse(message.data);
            if (action["live"]){
                //replace video src here
                // console.log(action["live"]);
                var vid = document.getElementById("watch_video");
                src_location =  head+action["live"]+".webm";
                console.log(src_location);
                vid.setAttribute('src', src_location);
            }
            if(action["end"]){
                var vid = document.getElementById("watch_video");
                var full = head.substring(0,head.length-1);
                src_location =  full+".webm";
                console.log(src_location);
                vid.setAttribute('src', src_location);
            }
        }catch(err) {
            console.log(err);
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
Chat.initialize();