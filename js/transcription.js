/**
 * Transcription Logic using OpenAI Whisper API
 */
class TranscriptionModule {
    async transcribe(audioBlob) {
        const apiKey = window.CONFIG.OPENAI_API_KEY.trim();
        
        if (!apiKey || apiKey.startsWith('YOUR_')) {
            throw new Error("OpenAI API Key is not configured correctly in js/config.js.");
        }

        if (audioBlob.size === 0) {
            throw new Error("Audio recording is empty. Please try recording again.");
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        formData.append('model', 'whisper-1');

        try {
            console.log("Initiating Whisper API fetch...");
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            }).catch(err => {
                if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                    throw new Error("Network error: 'Failed to fetch'. This often happens if you are running the file locally (file://) or if an ad-blocker is blocking OpenAI. Try running on a local server or disable ad-blockers.");
                }
                throw err;
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Whisper API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error("Transcription failed detail:", error);
            throw error;
        }
    }
}

window.TranscriptionModule = new TranscriptionModule();
