var Chat = {},token;
Chat.socket = null;
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
         console.log('Info: WebSocket connection opened.');
         var subscription ={};
         subscription.join = token;
         Chat.sendMessage(JSON.stringify(subscription));
 
    };

    Chat.socket.onclose = function () {
    	
    	Chat.socket = null;
      setTimeout(function() {
        Chat.initialize();
      },60000);
    };

    Chat.socket.onmessage = function (message) {
    	var action = JSON.parse(message.data);
    	 
    	console.log(action);
         
        //Chat.sendMessage(message.data);
        return false;
    };

});
  

Chat.initialize = function() {
	loc_str = window.location.toString();
	last = loc_str.lastIndexOf("/");
	token = loc_str.substring(last+1);
	// console.log(window.location+","+token+","+last);
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