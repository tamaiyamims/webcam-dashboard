var videoElement = document.getElementById('webcam');
var canvasElement = document.getElementById('canvas');
var canvasCtx = canvasElement.getContext('2d');
var resultText = document.getElementById('result');
var checkbox = document.getElementById("myCheckbox");

// ==========================
// COUNT FINGERS FUNCTION
// ==========================
function countFingers(landmarks, handLabel) {
    var count = 0;
    var tips = [8, 12, 16, 20];
    var base = [6, 10, 14, 18];

    // Thumb logic
    if (handLabel === "Right") {
        if (landmarks[4].x < landmarks[3].x) count++;
    } else {
        if (landmarks[4].x > landmarks[3].x) count++;
    }

    for (var i = 0; i < tips.length; i++) {
        if (landmarks[tips[i]].y < landmarks[base[i]].y) {
            count++;
        }
    }
    return count;
}

// ==========================
// MEDIAPIPE HANDS
// ==========================
var hands = new Hands({
    locateFile: (file) =>
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(function (results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    var leftCount = 0;
    var rightCount = 0;
    var outputText = "";

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {

        for (var i = 0; i < results.multiHandLandmarks.length; i++) {
            var landmarks = results.multiHandLandmarks[i];
            var handedness = results.multiHandedness[i].label;

            var fingerCount = countFingers(landmarks, handedness);

            if (handedness === "Left") leftCount = fingerCount;
            if (handedness === "Right") rightCount = fingerCount;

            outputText += handedness + ": " + fingerCount + " fingers\n";
        }

        var total = leftCount + rightCount;
        outputText += "\nTotal: " + total;

        // Extended functions
        outputText += "\n--- Functions ---";

        if (leftCount === 1) {
            outputText += "\nMultiply x2: " + (rightCount * 2);
        } else if (leftCount === 2) {
            outputText += "\nSquare: " + (rightCount ** 2);
        } else if (leftCount === 3) {
            outputText += "\nSquare Root: " + Math.sqrt(rightCount).toFixed(2);
        } else if (leftCount === 5) {
            outputText += "\nBinary: " + rightCount.toString(2);
        }

        if (checkbox.checked) {
            outputText += "\nWith Tax: " + (total * 1.07).toFixed(2);
        }

    } else {
        outputText = "No hand detected";
    }

    resultText.innerText = outputText;
    canvasCtx.restore();
});

// ==========================
// CAMERA
// ==========================
var camera = new Camera(videoElement, {
    onFrame: async function () {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

camera.start();
