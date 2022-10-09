
/**
 * Body (pose) tracking based on MediaPipe libs
 * @author Alexey Kozlov
 */
function onResults(results) {

    if (!results.poseLandmarks) {
      landmarkGrid.updateLandmarks([]);
      return;
    }
  
    canvasContext.save();
    canvasContext.clearRect(0, 0, canvasOutputContainer.width, canvasOutputContainer.height);

    if (results.segmentationMask) {

        canvasContext.drawImage(
            results.segmentationMask, 0, 0, canvasOutputContainer.width, canvasOutputContainer.height);
            
        // Only overwrite existing pixels.
        if (activeEffect === "mask" || activeEffect === "both") {
            canvasContext.globalCompositeOperation = "source-in";
            canvasContext.fillStyle = "#00FF007F";
            canvasContext.fillRect(0, 0, canvasOutputContainer.width, canvasOutputContainer.height);
        
        } else {
            canvasContext.globalCompositeOperation = "source-out";
            canvasContext.fillStyle = "#0000FF7F";
            canvasContext.fillRect(0, 0, canvasOutputContainer.width, canvasOutputContainer.height);
        }
        
        // Only overwrite missing pixels.
        canvasContext.globalCompositeOperation = "destination-atop";
        canvasContext.drawImage(
            results.image, 0, 0, canvasOutputContainer.width, canvasOutputContainer.height);
        canvasContext.globalCompositeOperation = "source-over";

    } else {
        canvasContext.drawImage(
            results.image, 0, 0, canvasOutputContainer.width, canvasOutputContainer.height);
    }

    if (results.poseLandmarks) {

        drawingUtils.drawConnectors(
            canvasContext, results.poseLandmarks, mpPose.POSE_CONNECTIONS,
            {visibilityMin: 0.65, color: "white"});
        
        drawingUtils.drawLandmarks(
            canvasContext, Object.values(mpPose.POSE_LANDMARKS_LEFT)
            .map(index => results.poseLandmarks[index]),
            {visibilityMin: 0.65, color: "white", fillColor: "rgb(255,138,0)"});

        drawingUtils.drawLandmarks(
            canvasContext, Object.values(mpPose.POSE_LANDMARKS_RIGHT)
            .map(index => results.poseLandmarks[index]),
            {visibilityMin: 0.65, color: "white", fillColor: "rgb(0,217,231)"});
    
        drawingUtils.drawLandmarks(
            canvasContext, Object.values(mpPose.POSE_LANDMARKS_NEUTRAL)
            .map(index => results.poseLandmarks[index]),
            {visibilityMin: 0.65, color: "white", fillColor: "white"});

    }
    canvasContext.restore();
    
    if (results.poseWorldLandmarks) {
        landmarkGrid.updateLandmarks(results.poseWorldLandmarks, mpPose.POSE_CONNECTIONS, [
            {list: Object.values(mpPose.POSE_LANDMARKS_LEFT), color: "LEFT"},
            {list: Object.values(mpPose.POSE_LANDMARKS_RIGHT), color: "RIGHT"},
        ]);

    } else {
        landmarkGrid.updateLandmarks([]);
    }

}

pose.onResults(onResults);  //start tracking
camera.start();             //start video stream