/**
 * Hand Detection Module using MediaPipe Hands
 * Handles camera initialization and hand tracking
 */

class HandDetector {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.onResultsCallback = null;
        this.isRunning = false;
        this.detectedHands = [];
    }

    async initialize(videoElement, canvasElement) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.canvasCtx = canvasElement.getContext('2d');

        try {
            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            this.hands.onResults((results) => this.processResults(results));

            // Initialize camera
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.hands && this.isRunning) {
                        await this.hands.send({ image: this.videoElement });
                    }
                },
                width: 640,
                height: 480
            });

            await this.camera.start();
            this.isRunning = true;

            return true;
        } catch (error) {
            console.error('Error initializing hand detector:', error);
            throw error;
        }
    }

    processResults(results) {
        // Clear canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        // Set canvas size to match video
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;

        // Process detected hands
        this.detectedHands = [];

        if (results.multiHandLandmarks && results.multiHandedness) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i].label; // "Left" or "Right"

                this.detectedHands.push({
                    landmarks: landmarks,
                    handedness: handedness,
                    index: i
                });

                // Draw hand landmarks
                this.drawHand(landmarks, handedness);
            }
        }

        this.canvasCtx.restore();

        // Call custom callback if set
        if (this.onResultsCallback) {
            this.onResultsCallback(this.detectedHands);
        }
    }

    drawHand(landmarks, handedness) {
        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],  // Index
            [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
            [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
            [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
            [5, 9], [9, 13], [13, 17]  // Palm
        ];

        const color = handedness === 'Right' ? '#4ECDC4' : '#FF6B9D';

        // Draw connections
        this.canvasCtx.strokeStyle = color;
        this.canvasCtx.lineWidth = 3;

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(
                startPoint.x * this.canvasElement.width,
                startPoint.y * this.canvasElement.height
            );
            this.canvasCtx.lineTo(
                endPoint.x * this.canvasElement.width,
                endPoint.y * this.canvasElement.height
            );
            this.canvasCtx.stroke();
        });

        // Draw landmarks
        this.canvasCtx.fillStyle = color;
        landmarks.forEach((landmark) => {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                landmark.x * this.canvasElement.width,
                landmark.y * this.canvasElement.height,
                5,
                0,
                2 * Math.PI
            );
            this.canvasCtx.fill();
        });

        // Draw label
        if (landmarks.length > 0) {
            const wrist = landmarks[0];
            this.canvasCtx.fillStyle = color;
            this.canvasCtx.font = 'bold 24px Arial';
            this.canvasCtx.fillText(
                handedness,
                wrist.x * this.canvasElement.width - 20,
                wrist.y * this.canvasElement.height - 20
            );
        }
    }

    getDetectedHands() {
        return this.detectedHands;
    }

    setOnResultsCallback(callback) {
        this.onResultsCallback = callback;
    }

    stop() {
        this.isRunning = false;
        if (this.camera) {
            this.camera.stop();
        }

        // Stop all video tracks
        if (this.videoElement && this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    }

    pause() {
        this.isRunning = false;
    }

    resume() {
        this.isRunning = true;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HandDetector;
}
