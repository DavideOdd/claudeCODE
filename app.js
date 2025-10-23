// DOM Elements
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const switchCameraBtn = document.getElementById('switchCameraBtn');
const handsToggle = document.getElementById('handsToggle');
const snapshotBtn = document.getElementById('snapshotBtn');
const startRecordBtn = document.getElementById('startRecordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const statusElement = document.getElementById('status');

// MediaPipe instances
let pose = null;
let hands = null;
let faceMesh = null;
let camera = null;
let isRunning = false;
let handsTrackingEnabled = false;
let currentFacingMode = 'user'; // 'user' for front camera, 'environment' for back camera

// Recording state
let isRecording = false;
let recordedFrames = [];
let recordingStartTime = 0;

// SVG dimensions
const SVG_WIDTH = 640;
const SVG_HEIGHT = 480;

// MediaPipe Pose landmark indices
const POSE_LANDMARKS = {
    NOSE: 0,
    LEFT_EYE_INNER: 1,
    LEFT_EYE: 2,
    LEFT_EYE_OUTER: 3,
    RIGHT_EYE_INNER: 4,
    RIGHT_EYE: 5,
    RIGHT_EYE_OUTER: 6,
    LEFT_EAR: 7,
    RIGHT_EAR: 8,
    MOUTH_LEFT: 9,
    MOUTH_RIGHT: 10,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_PINKY: 17,
    LEFT_INDEX: 18,
    LEFT_THUMB: 19,
    RIGHT_PINKY: 20,
    RIGHT_INDEX: 21,
    RIGHT_THUMB: 22,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28
};

// Face Mesh landmark indices for eyes and mouth
const FACE_LANDMARKS = {
    LEFT_EYE: 33,
    RIGHT_EYE: 263,
    MOUTH_TOP: 13,
    MOUTH_BOTTOM: 14,
    MOUTH_LEFT: 61,
    MOUTH_RIGHT: 291
};

// Current tracking data
let currentPoseLandmarks = null;
let currentFaceLandmarks = null;
let currentHandsResults = null;

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

    pose.onResults(onPoseResults);
}

// Initialize MediaPipe Hands
function initHands() {
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onHandsResults);
}

// Initialize MediaPipe Face Mesh
function initFaceMesh() {
    faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onFaceMeshResults);
}

// Handle pose detection results
function onPoseResults(results) {
    currentPoseLandmarks = results.poseLandmarks;
    updateVisualization();
}

// Handle hands detection results
function onHandsResults(results) {
    if (handsTrackingEnabled) {
        currentHandsResults = results;
        updateVisualization();
    }
}

// Handle face mesh results
function onFaceMeshResults(results) {
    currentFaceLandmarks = results.multiFaceLandmarks ? results.multiFaceLandmarks[0] : null;
    updateVisualization();
}

// Update all visualizations
function updateVisualization() {
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the video frame
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Draw pose landmarks on canvas
    if (currentPoseLandmarks) {
        drawConnectors(canvasCtx, currentPoseLandmarks, POSE_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 4
        });
        drawLandmarks(canvasCtx, currentPoseLandmarks, {
            color: '#FF0000',
            lineWidth: 2,
            radius: 6
        });

        statusElement.textContent = 'Tracking attivo ✓';
        statusElement.style.color = '#00ff88';
    } else {
        statusElement.textContent = 'Nessuna persona rilevata';
        statusElement.style.color = '#ffaa00';
    }

    // Draw hands landmarks on canvas
    if (handsTrackingEnabled && currentHandsResults && currentHandsResults.multiHandLandmarks) {
        for (const landmarks of currentHandsResults.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 3
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 2,
                radius: 4
            });
        }
    }

    // Draw face landmarks on canvas
    if (currentFaceLandmarks) {
        drawLandmarks(canvasCtx, currentFaceLandmarks, {
            color: '#0000FF',
            lineWidth: 1,
            radius: 2
        });
    }

    canvasCtx.restore();

    // Update SVG stickman
    updateStickman();

    // Record frame if recording
    if (isRecording) {
        recordFrame();
    }
}

// Update SVG stickman based on all tracking data
function updateStickman() {
    if (!currentPoseLandmarks || currentPoseLandmarks.length === 0) return;

    const landmarks = currentPoseLandmarks;

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
    const leftEye = getLandmark(POSE_LANDMARKS.LEFT_EYE);
    const rightEye = getLandmark(POSE_LANDMARKS.RIGHT_EYE);
    const mouthLeft = getLandmark(POSE_LANDMARKS.MOUTH_LEFT);
    const mouthRight = getLandmark(POSE_LANDMARKS.MOUTH_RIGHT);
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

    // Update eyes
    updateCircle('leftEye', leftEye.x, leftEye.y);
    updateCircle('rightEye', rightEye.x, rightEye.y);

    // Update mouth (curved line)
    const mouth = document.getElementById('mouth');
    const mouthCenterX = (mouthLeft.x + mouthRight.x) / 2;
    const mouthCenterY = (mouthLeft.y + mouthRight.y) / 2;
    const mouthPath = `M ${mouthLeft.x} ${mouthLeft.y} Q ${mouthCenterX} ${mouthCenterY + 5} ${mouthRight.x} ${mouthRight.y}`;
    mouth.setAttribute('d', mouthPath);

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

    // Update hands if tracking is enabled
    if (handsTrackingEnabled && currentHandsResults && currentHandsResults.multiHandLandmarks) {
        updateHandsOnStickman(currentHandsResults, leftWrist, rightWrist);
    } else {
        // Hide hands if not tracking
        document.getElementById('leftHand').style.display = 'none';
        document.getElementById('rightHand').style.display = 'none';
    }
}

// Update hands on stickman
function updateHandsOnStickman(handsResults, leftWrist, rightWrist) {
    const leftHandGroup = document.getElementById('leftHand');
    const rightHandGroup = document.getElementById('rightHand');

    // Hide both hands initially
    leftHandGroup.style.display = 'none';
    rightHandGroup.style.display = 'none';

    if (!handsResults.multiHandLandmarks) return;

    for (let i = 0; i < handsResults.multiHandLandmarks.length; i++) {
        const handLandmarks = handsResults.multiHandLandmarks[i];
        const handedness = handsResults.multiHandedness[i].label; // "Left" or "Right"

        // Determine which hand group to use
        const handGroup = handedness === 'Left' ? rightHandGroup : leftHandGroup; // Mirrored because of camera
        const wrist = handedness === 'Left' ? rightWrist : leftWrist;

        handGroup.style.display = 'block';

        // Get finger landmarks (simplified - just show main finger lines)
        const fingerIndices = [
            [0, 2, 3, 4],   // Thumb
            [0, 5, 6, 7, 8],     // Index
            [0, 9, 10, 11, 12],  // Middle
            [0, 13, 14, 15, 16], // Ring
            [0, 17, 18, 19, 20]  // Pinky
        ];

        const fingers = handGroup.querySelectorAll('.finger');

        for (let f = 0; f < 5; f++) {
            const fingerTip = handLandmarks[fingerIndices[f][fingerIndices[f].length - 1]];
            const fingerBase = handLandmarks[fingerIndices[f][0]];

            const tipX = fingerTip.x * SVG_WIDTH;
            const tipY = fingerTip.y * SVG_HEIGHT;
            const baseX = wrist.x;
            const baseY = wrist.y;

            fingers[f].setAttribute('x1', baseX);
            fingers[f].setAttribute('y1', baseY);
            fingers[f].setAttribute('x2', tipX);
            fingers[f].setAttribute('y2', tipY);
        }
    }
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

// Process video frame through all models
async function processFrame() {
    if (!isRunning) return;

    try {
        // Send frame to Pose
        if (pose) {
            await pose.send({ image: videoElement });
        }

        // Send frame to Hands if enabled
        if (hands && handsTrackingEnabled) {
            await hands.send({ image: videoElement });
        }

        // Send frame to Face Mesh
        if (faceMesh) {
            await faceMesh.send({ image: videoElement });
        }
    } catch (error) {
        console.error('Error processing frame:', error);
    }

    // Request next frame
    if (isRunning) {
        requestAnimationFrame(processFrame);
    }
}

// Start camera
async function startCamera() {
    try {
        statusElement.textContent = 'Inizializzazione...';
        statusElement.style.color = '#ffaa00';

        // Initialize models if not already done
        if (!pose) initPose();
        if (!hands) initHands();
        if (!faceMesh) initFaceMesh();

        // Stop existing camera if any
        if (camera) {
            await camera.stop();
        }

        // Get video stream with current facing mode
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });

        videoElement.srcObject = stream;
        await videoElement.play();

        // Set canvas size
        canvasElement.width = 640;
        canvasElement.height = 480;

        isRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        switchCameraBtn.disabled = false;
        handsToggle.disabled = false;
        snapshotBtn.disabled = false;
        startRecordBtn.disabled = false;

        statusElement.textContent = 'Fotocamera avviata';
        statusElement.style.color = '#00ff88';

        // Start processing frames
        processFrame();
    } catch (error) {
        console.error('Error starting camera:', error);
        statusElement.textContent = 'Errore: ' + error.message;
        statusElement.style.color = '#ff5252';
    }
}

// Stop camera
function stopCamera() {
    if (videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }

    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    switchCameraBtn.disabled = true;
    handsToggle.disabled = true;
    snapshotBtn.disabled = true;
    startRecordBtn.disabled = true;

    // Stop recording if active
    if (isRecording) {
        stopRecording();
    }

    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    statusElement.textContent = 'Fotocamera fermata';
    statusElement.style.color = '#ffaa00';
}

// Switch camera (front/back)
async function switchCamera() {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    await startCamera();
}

// Toggle hands tracking
function toggleHandsTracking() {
    handsTrackingEnabled = handsToggle.checked;

    if (!handsTrackingEnabled) {
        currentHandsResults = null;
        document.getElementById('leftHand').style.display = 'none';
        document.getElementById('rightHand').style.display = 'none';
    }
}

// Take snapshot of SVG
function takeSnapshot() {
    const svgElement = document.getElementById('stickman');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `stickman-snapshot-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);

    statusElement.textContent = 'Snapshot salvato! ✓';
    setTimeout(() => {
        if (isRunning) {
            statusElement.textContent = 'Tracking attivo ✓';
        }
    }, 2000);
}

// Record frame for animation
function recordFrame() {
    const svgElement = document.getElementById('stickman');
    const svgClone = svgElement.cloneNode(true);
    const timestamp = Date.now() - recordingStartTime;

    recordedFrames.push({
        svg: new XMLSerializer().serializeToString(svgClone),
        timestamp: timestamp
    });
}

// Start recording
function startRecording() {
    isRecording = true;
    recordedFrames = [];
    recordingStartTime = Date.now();

    startRecordBtn.style.display = 'none';
    stopRecordBtn.style.display = 'inline-block';
    stopRecordBtn.disabled = false;

    statusElement.textContent = '🔴 Registrazione in corso...';
    statusElement.style.color = '#ff5252';
}

// Stop recording and export animated SVG
function stopRecording() {
    isRecording = false;

    startRecordBtn.style.display = 'inline-block';
    stopRecordBtn.style.display = 'none';

    if (recordedFrames.length === 0) {
        statusElement.textContent = 'Nessun frame registrato';
        return;
    }

    // Create animated SVG
    const animatedSVG = createAnimatedSVG();

    const svgBlob = new Blob([animatedSVG], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `stickman-animation-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);

    statusElement.textContent = `Animazione salvata! (${recordedFrames.length} frames) ✓`;
    recordedFrames = [];

    setTimeout(() => {
        if (isRunning) {
            statusElement.textContent = 'Tracking attivo ✓';
            statusElement.style.color = '#00ff88';
        }
    }, 2000);
}

// Create animated SVG from recorded frames
function createAnimatedSVG() {
    const fps = 30;
    const frameDuration = 1000 / fps; // milliseconds per frame
    const totalDuration = recordedFrames[recordedFrames.length - 1].timestamp / 1000; // in seconds

    // Get the base SVG structure
    const baseSVG = `<svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <!-- Animated Stickman - ${recordedFrames.length} frames -->
    <style>
        @keyframes stickmanAnimation {
${generateKeyframes(recordedFrames, totalDuration)}
        }

        #animatedStickman {
            animation: stickmanAnimation ${totalDuration}s linear infinite;
        }
    </style>

    <g id="animatedStickman">
${extractSVGContent(recordedFrames[0].svg)}
    </g>
</svg>`;

    return baseSVG;
}

// Generate CSS keyframes from recorded frames
function generateKeyframes(frames, totalDuration) {
    let keyframes = '';

    for (let i = 0; i < frames.length; i++) {
        const percentage = (frames[i].timestamp / 1000 / totalDuration) * 100;
        keyframes += `            ${percentage.toFixed(2)}% { opacity: 1; }\n`;
    }

    return keyframes;
}

// Extract SVG content (remove svg wrapper)
function extractSVGContent(svgString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    return svgElement.innerHTML;
}

// Event listeners
startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);
switchCameraBtn.addEventListener('click', switchCamera);
handsToggle.addEventListener('change', toggleHandsTracking);
snapshotBtn.addEventListener('click', takeSnapshot);
startRecordBtn.addEventListener('click', startRecording);
stopRecordBtn.addEventListener('click', stopRecording);

// Initial status
statusElement.textContent = 'Premi "Avvia Fotocamera" per iniziare';
statusElement.style.color = '#fff';
