/**
 * Transcription Logic using OpenAI Whisper API
 */
class TranscriptionModule {
    async transcribe(audioBlob) {
        const apiKey = window.CONFIG.OPENAI_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
            throw new Error("OpenAI API Key is not configured in js/config.js");
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        formData.append('model', 'whisper-1');

        try {
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Whisper API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error("Transcription failed:", error);
            throw error;
        }
    }
}

window.TranscriptionModule = new TranscriptionModule();
