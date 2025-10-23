// DOM Elements
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusElement = document.getElementById('status');

// MediaPipe Pose
let pose = null;
let camera = null;
let isRunning = false;

// SVG dimensions
const SVG_WIDTH = 640;
const SVG_HEIGHT = 480;

// MediaPipe Pose landmark indices
const POSE_LANDMARKS = {
    NOSE: 0,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28
};

// Initialize MediaPipe Pose
function initPose() {
    pose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
    });

    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(onResults);
}

// Handle pose detection results
function onResults(results) {
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the video frame
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Draw pose landmarks on canvas
    if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 4
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: '#FF0000',
            lineWidth: 2,
            radius: 6
        });

        // Update SVG stickman
        updateStickman(results.poseLandmarks);

        statusElement.textContent = 'Tracking attivo ✓';
        statusElement.style.color = '#00ff88';
    } else {
        statusElement.textContent = 'Nessuna persona rilevata';
        statusElement.style.color = '#ffaa00';
    }

    canvasCtx.restore();
}

// Update SVG stickman based on pose landmarks
function updateStickman(landmarks) {
    if (!landmarks || landmarks.length === 0) return;

    // Helper function to get landmark coordinates
    const getLandmark = (index) => {
        const landmark = landmarks[index];
        return {
            x: landmark.x * SVG_WIDTH,
            y: landmark.y * SVG_HEIGHT,
            visibility: landmark.visibility
        };
    };

    // Get all relevant landmarks
    const nose = getLandmark(POSE_LANDMARKS.NOSE);
    const leftShoulder = getLandmark(POSE_LANDMARKS.LEFT_SHOULDER);
    const rightShoulder = getLandmark(POSE_LANDMARKS.RIGHT_SHOULDER);
    const leftElbow = getLandmark(POSE_LANDMARKS.LEFT_ELBOW);
    const rightElbow = getLandmark(POSE_LANDMARKS.RIGHT_ELBOW);
    const leftWrist = getLandmark(POSE_LANDMARKS.LEFT_WRIST);
    const rightWrist = getLandmark(POSE_LANDMARKS.RIGHT_WRIST);
    const leftHip = getLandmark(POSE_LANDMARKS.LEFT_HIP);
    const rightHip = getLandmark(POSE_LANDMARKS.RIGHT_HIP);
    const leftKnee = getLandmark(POSE_LANDMARKS.LEFT_KNEE);
    const rightKnee = getLandmark(POSE_LANDMARKS.RIGHT_KNEE);
    const leftAnkle = getLandmark(POSE_LANDMARKS.LEFT_ANKLE);
    const rightAnkle = getLandmark(POSE_LANDMARKS.RIGHT_ANKLE);

    // Calculate center points
    const shoulderCenter = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
    };

    const hipCenter = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
    };

    // Update head
    const head = document.getElementById('head');
    head.setAttribute('cx', nose.x);
    head.setAttribute('cy', nose.y);

    // Update spine
    const spine = document.getElementById('spine');
    spine.setAttribute('x1', shoulderCenter.x);
    spine.setAttribute('y1', shoulderCenter.y);
    spine.setAttribute('x2', hipCenter.x);
    spine.setAttribute('y2', hipCenter.y);

    // Update left arm
    updateLine('leftShoulder', shoulderCenter.x, shoulderCenter.y, leftShoulder.x, leftShoulder.y);
    updateLine('leftUpperArm', leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y);
    updateLine('leftLowerArm', leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y);

    // Update right arm
    updateLine('rightShoulder', shoulderCenter.x, shoulderCenter.y, rightShoulder.x, rightShoulder.y);
    updateLine('rightUpperArm', rightShoulder.x, rightShoulder.y, rightElbow.x, rightElbow.y);
    updateLine('rightLowerArm', rightElbow.x, rightElbow.y, rightWrist.x, rightWrist.y);

    // Update left leg
    updateLine('leftUpperLeg', hipCenter.x, hipCenter.y, leftKnee.x, leftKnee.y);
    updateLine('leftLowerLeg', leftKnee.x, leftKnee.y, leftAnkle.x, leftAnkle.y);

    // Update right leg
    updateLine('rightUpperLeg', hipCenter.x, hipCenter.y, rightKnee.x, rightKnee.y);
    updateLine('rightLowerLeg', rightKnee.x, rightKnee.y, rightAnkle.x, rightAnkle.y);

    // Update joints
    updateCircle('leftShouderJoint', leftShoulder.x, leftShoulder.y);
    updateCircle('rightShoulderJoint', rightShoulder.x, rightShoulder.y);
    updateCircle('leftElbowJoint', leftElbow.x, leftElbow.y);
    updateCircle('rightElbowJoint', rightElbow.x, rightElbow.y);
    updateCircle('leftWristJoint', leftWrist.x, leftWrist.y);
    updateCircle('rightWristJoint', rightWrist.x, rightWrist.y);
    updateCircle('leftHipJoint', leftHip.x, leftHip.y);
    updateCircle('rightHipJoint', rightHip.x, rightHip.y);
    updateCircle('leftKneeJoint', leftKnee.x, leftKnee.y);
    updateCircle('rightKneeJoint', rightKnee.x, rightKnee.y);
    updateCircle('leftAnkleJoint', leftAnkle.x, leftAnkle.y);
    updateCircle('rightAnkleJoint', rightAnkle.x, rightAnkle.y);
}

// Helper function to update line
function updateLine(id, x1, y1, x2, y2) {
    const line = document.getElementById(id);
    if (line) {
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
    }
}

// Helper function to update circle
function updateCircle(id, cx, cy) {
    const circle = document.getElementById(id);
    if (circle) {
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
    }
}

// Start camera
async function startCamera() {
    try {
        statusElement.textContent = 'Inizializzazione...';
        statusElement.style.color = '#ffaa00';

        // Initialize pose if not already done
        if (!pose) {
            initPose();
        }

        // Setup camera
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await pose.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });

        await camera.start();

        // Set canvas size
        canvasElement.width = 640;
        canvasElement.height = 480;

        isRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;

        statusElement.textContent = 'Fotocamera avviata';
        statusElement.style.color = '#00ff88';
    } catch (error) {
        console.error('Error starting camera:', error);
        statusElement.textContent = 'Errore: ' + error.message;
        statusElement.style.color = '#ff5252';
    }
}

// Stop camera
function stopCamera() {
    if (camera) {
        camera.stop();
        camera = null;
    }

    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;

    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    statusElement.textContent = 'Fotocamera fermata';
    statusElement.style.color = '#ffaa00';
}

// Event listeners
startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);

// Initial status
statusElement.textContent = 'Premi "Avvia Fotocamera" per iniziare';
statusElement.style.color = '#fff';
