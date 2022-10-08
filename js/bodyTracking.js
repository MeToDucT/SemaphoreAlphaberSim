/**
 * @author Alexey Kozlov
 */

const videoElement = document.getElementById("video_container");
const canvasElement = document.getElementById("canvas_container");
const canvasCtx = canvasElement.getContext('2d');
const landmarkContainer = document.getElementById("landmark_container");

const drawingUtils = window;
const mpPose = window;

const grid = new LandmarkGrid(landmarkContainer, {
    connectionColor: 0xCCCCCC,
    definedColors: [{name: 'LEFT', value: 0xffa500}, {name: 'RIGHT', value: 0x00ffff}],
    range: 3,
    fitToGrid: true,
    labelSuffix: 'm',
    landmarkSize: 3,
    numCellsPerAxis: 3,
    showHidden: false,
    centered: true,
});

let activeEffect = 'mask';
function onResults(results) {

    if (!results.poseLandmarks) {
      grid.updateLandmarks([]);
      return;
    }
  
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.segmentationMask) {

        canvasCtx.drawImage(
            results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
            
        // Only overwrite existing pixels.
        if (activeEffect === 'mask' || activeEffect === 'both') {
            canvasCtx.globalCompositeOperation = 'source-in';
            canvasCtx.fillStyle = '#00FF007F';
            canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        
        } else {
            canvasCtx.globalCompositeOperation = 'source-out';
            canvasCtx.fillStyle = '#0000FF7F';
            canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        }
        
        // Only overwrite missing pixels.
        canvasCtx.globalCompositeOperation = 'destination-atop';
        canvasCtx.drawImage(
            results.image, 0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.globalCompositeOperation = 'source-over';

    } else {
        canvasCtx.drawImage(
            results.image, 0, 0, canvasElement.width, canvasElement.height);
    }

    if (results.poseLandmarks) {

        drawingUtils.drawConnectors(
            canvasCtx, results.poseLandmarks, mpPose.POSE_CONNECTIONS, {visibilityMin: 0.65, color: 'white'});
        
        drawingUtils.drawLandmarks(
            canvasCtx, Object.values(mpPose.POSE_LANDMARKS_LEFT)
            .map(index => results.poseLandmarks[index]),
            {visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)'});

        drawingUtils.drawLandmarks(
            canvasCtx, Object.values(mpPose.POSE_LANDMARKS_RIGHT)
            .map(index => results.poseLandmarks[index]),
            {visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)'});
    
        drawingUtils.drawLandmarks(
            canvasCtx, Object.values(mpPose.POSE_LANDMARKS_NEUTRAL)
            .map(index => results.poseLandmarks[index]),
            {visibilityMin: 0.65, color: 'white', fillColor: 'white'});

    }
    canvasCtx.restore();
    
    if (results.poseWorldLandmarks) {
        grid.updateLandmarks(results.poseWorldLandmarks, mpPose.POSE_CONNECTIONS, [
            {list: Object.values(mpPose.POSE_LANDMARKS_LEFT), color: 'LEFT'},
            {list: Object.values(mpPose.POSE_LANDMARKS_RIGHT), color: 'RIGHT'},
        ]);

    } else {
        grid.updateLandmarks([]);
    }

}
  
const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({image: videoElement});
    },
    width: 1280,
    height: 720
});
camera.start();
