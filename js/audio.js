/**
 * Audio Recording Logic using MediaRecorder API
 */
class AudioModule {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
    }

    async startRecording() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            console.log("Recording started...");
        } catch (error) {
            console.error("Error accessing microphone:", error);
            throw error;
        }
    }

    stopRecording() {
        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.stream.getTracks().forEach(track => track.stop());
                console.log("Recording stopped. Blob created.");
                resolve(audioBlob);
            };
            this.mediaRecorder.stop();
        });
    }
}

window.AudioModule = new AudioModule();
