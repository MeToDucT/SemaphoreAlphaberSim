
var videoContainer;

/**
 * Method that gets video stream and plays it
 * @author Alexey Kozlov
 */
function getVideoStream() {

    videoContainer = document.getElementById("video_container");

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })      //requests video stream
    .then(function(stream) {                                                //if stream is received
        videoContainer.srcObject = stream;                                  //pass it to the VIDEO_CONTAINER
        videoContainer.play();                                              //and play
    });

}

//trying to get access to video stream after pages load
window.addEventListener('load', getVideoStream, false);