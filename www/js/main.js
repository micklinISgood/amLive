(function () {
    var recorder;
    var mediaStream;
    var fileName;
    var connection;
    var fileLocation;
    var AbleToRecord = true;
    var port = 5566;

    function getVideoStream() {
        var config = { video: true, audio: true };
        navigator.mediaDevices.getUserMedia(config).then(OnSuccess).catch(handleError);
    };

 

    function handleError(error) {
        AbleToRecord = false;
        console.log('Cannot get user video', error);
        var error =document.getElementById('error');
        $('#error').show();
        $('#error').html('Cannot access camera.<br/> Please allow the permisson and refresh your page.');
        //change layout here
    }

    function OnSuccess(stream) {
         mediaStream = stream;
         document.getElementsByTagName('video')[0].setAttribute('src', window.URL.createObjectURL(mediaStream));
         getRecorder();
    }
   
    function getRecorder() {
        var options = {
                audioBitsPerSecond : 128000,
                videoBitsPerSecond : 2500000,
                mimeType : 'video/webm'
            }

        recorder = new MediaRecorder(mediaStream, options);
        recorder.ondataavailable = videoDataHandler;
    };

    function videoDataHandler(event) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(event.data);
        reader.onloadend = function (event) {
            if(AbleToRecord){
                connection.send(reader.result);
            }
        };
    };

    function getWebSocket() {
        var websocketEndpoint = 'ws://localhost:' + port;
        connection = new WebSocket(websocketEndpoint);
        connection.binaryType = 'arraybuffer';
        connection.onmessage = function (message) {
            fileName = message.data;
            fileLocation = 'http://localhost:' + port + '/w/'+ fileName;

            var recButton = document.getElementById('record');
            recButton.innerHTML = "Stop recording";
            $("#record").removeClass("btn-primary").addClass("btn-danger");

            $('#share').show();
            $('#share').html('<p> Now live on: </p><a onclick="window.open(\''+fileLocation+"/"+'\');"style="color:#d6d6f5;">'+fileLocation+'</a>');
            AbleToRecord = true;

        }
        connection.onclose = function () {
            AbleToRecord = true;
           


        }
        connection.onopen = function () {
            
            recorder.start(125);


        }

    };
    function openInNewTab(url) {
        console.log(url);
        var win = window.open(url, '_blank');
        win.focus();
    }
    function updateVideoFile() {
        var video = document.getElementById('recorded-video');
        var fileLocation = 'http://localhost:' + port + '/w/'
            + fileName + '.webm';
        console.log(fileLocation);
        video.setAttribute('src', fileLocation);
    };

    var recButton = document.getElementById('record');
    recButton.addEventListener('click', function (e) {
        if(AbleToRecord){
            if(recButton.innerHTML == "Start recording"){
                getWebSocket();
                AbleToRecord = false;


            }else{
                AbleToRecord = false;
                recorder.stop();
                connection.close();

                $('#share').html('<p style="color:#d6d6f5;">Lived on: </p><a onclick="window.open(\''+fileLocation+'\');" style="color:#ffffff;">'+fileLocation+'</a>');
                // $('#share').hide();


                //updateVideoFile();
                $("#record").removeClass("btn-danger").addClass("btn-primary");
            

                recButton.innerHTML = "Start recording";

            }
        }
    });
 

    getVideoStream();


   
})();