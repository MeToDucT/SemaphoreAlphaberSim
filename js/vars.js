
/**
 * HTML elements
 */

const videoContainer = document.getElementById("video_container");
const canvasOutputContainer = document.getElementById("output_container");
const canvasContext = canvasOutputContainer.getContext("2d");
const landmarkContainer = document.getElementById("landmark_container");

const selfieModeSwitch = document.getElementById("selfie_mode_switch");
const segmentationSwitch = document.getElementById("segmentation_switch");

/**
 * Switch flags
 */

var isSelfieMode;
var isSegmented;

/**
 * MediaPipe utils
 */

const drawingUtils = window;
const mpPose = window;
var activeEffect = "mask";

const landmarkGrid = new LandmarkGrid(landmarkContainer, {
    connectionColor: 0xCCCCCC,
    definedColors: [{name: "LEFT", value: 0xffa500}, {name: "RIGHT", value: 0x00ffff}],
    range: 3,
    fitToGrid: true,
    labelSuffix: 'm',
    landmarkSize: 3,
    numCellsPerAxis: 3,
    showHidden: false,
    centered: true
});

const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.9
});

const camera = new Camera(videoContainer, {
    onFrame: async () => {
        await pose.send({image: videoContainer});
    },
    width: 1280,
    height: 720
});
