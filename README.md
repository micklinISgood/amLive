# amLive

## run
1. [install node](https://nodejs.org/en/download/package-manager/)
2. npm install
3. cd server
4. node index.js
5. Point your browser to: [http://localhost:5566](http://localhost:5566) 

### Architecture diagram:
![http://localhost:5566](https://github.com/micklinISgood/amLive/blob/master/live_final.png) 

####1.navigator.mediaDevices.getUserMedia(): 


A MediaStream object has an input and an output that represent the combined input and output of all the object's tracks. The output of the MediaStream controls how the object is rendered, e.g., what is saved if the object is recorded to a file or what is displayed if the object is used in a video element. A single MediaStream object can be attached to multiple different outputs at the same time.
src:https://github.com/micklinISgood/amLive/blob/master/www/js/main.js#L12


####2.arraybuffer via websocket:

This is the critical part of uploading the user’s stream to server. Websocket provides a keep-alive connection to upload the streaming data, which saves the redundant tcp connections comparing to HTTP post. After trial and error, we found that setting the socket channel as binaryType = ‘arraybuffer’ gets the best performance. In addition, because it’s data buffer, we can save the data with assigning a file extension directly, no need to do additional data parsing.  
The ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer. You cannot directly manipulate the contents of an ArrayBuffer; instead, you create one of the typed array objects or a DataView object which represents the buffer in a specific format, and use that to read and write the contents of the buffer.
Src: https://github.com/micklinISgood/amLive/blob/master/www/js/main.js#L54-L63


####3.Dynamic playback url:

We initially used jade as our fronted template cooperating with Node.js, but then we found ejs has a clearer syntax which is beneficial to our frontend development.
Src: http://www.embeddedjs.com/


####4.MediaSource API:

MediaSource.SourceBuffer is the critical component for appending real-time video data. For every opened client connection, we will try to open the MediaSource.SourceBuffer and then append the live streaming data to it. By utilizing this api, we can play dynamic data through a HTML5 <video> tag. Before using this api, we tried to replace the src of the video tag periodically and failed. The simply setting of src seems can only handle static and full file playback. But if we want to splice a video in different sections of video from multiple sources, it doesn’t support. Here is why MediaSource api comes into play.
src: https://github.com/micklinISgood/amLive/blob/master/www/js/audience.js#L88-L92


The mode property of the SourceBuffer interface controls whether media segments can be appended to the SourceBuffer in any order, or in a strict sequence.
The two available values are:
segments: The media segment timestamps determine the order in which the segments are played. The segments can be appended to the SourceBuffer in any order.
sequence: The order in which the segments are appended to the SourceBuffer determines the order in which they are played. Segment timestamps are generated automatically for the segments that observe this order.
Src: https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/mode




####5.xhr get for meta.webm for client:
The first portion of a webm file is the "initialization chunk". It contains the container's header information and should always be the first segment added. Since we generated a unique id for each live streaming, the client will try to get the meta.webm while sourceBuffer is open.
Server src:https://github.com/micklinISgood/amLive/blob/master/server/video-processor.js#L21-L25
Client  src:https://github.com/micklinISgood/amLive/blob/master/www/js/audience.js#L23-L30


####6.In-memory broadcasting:

This is the best websocket practice of MediaSource.SourceBuffer. In the beginning, we make a chat room for each live stream and broadcast every uploaded chunk’s url to clients. When a client received a specific json key, it will fetch the live chunk by using xhr get. This method works but costly. For every xhr get, the client needs to initialize a tcp connection to server first and server needs to do disk reads to return chunk. However, by using the trick of setting websocket biniaryType after it opened, the client can successfully fetch the live chunk through websocket connection. In addition, since the live chunk can be broadcasted after server received, server doesn’t need to save the live chunk. Finally, all the broadcasting is in-memory, which is faster than reading data from disk then returning to xhr get.  
Server src:https://github.com/micklinISgood/amLive/blob/master/server/video-processor.js#L45-L60
Client  src:https://github.com/micklinISgood/amLive/blob/master/www/js/audience.js#L93


7.Clean up after live:
	After a user has done a live, we still keep his video on server. In the beginning, we just broadcasted a signal to clients that the live is off and clients will reset the video src to lived video’s url. However, the websocket connection of a client is still open because we didn’t close those connections on the server side. And this causes the connection leak on the server as long as the client stays on the web page. We noticed this problem because we set the binarytype of the websocket and cannot use json to notify the clients. In the end, the server just simply close the subscription connections to show the live was done. And hence, no more connection leaks.  
Server src:https://github.com/micklinISgood/amLive/blob/master/server/video-processor.js#L145-L149
Client  src:https://github.com/micklinISgood/amLive/blob/master/www/js/audience.js#L102-L114


Website Snapshot:
Demo url: https://104.198.177.73:5566/
Video url: https://www.youtube.com/watch?v=w9pZ_rcmSvg
