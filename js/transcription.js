/**
 * Transcription Logic using Google Gemini API
 */
class TranscriptionModule {
    async transcribe(audioBlob) {
        const apiKey = window.CONFIG.GEMINI_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            throw new Error("Gemini API Key is not configured correctly in js/config.js. Please check your key.");
        }

        try {
            const base64Data = await this.blobToBase64(audioBlob);
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Please transcribe this audio exactly as it is spoken. Output only the transcript." },
                            { inline_data: { mime_type: "audio/wav", data: base64Data } }
                        ]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini Transcription Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error("Gemini failed to generate a transcript. Please try speaking more clearly.");
            }

            return data.candidates[0].content.parts[0].text.trim();
        } catch (error) {
            console.error("Gemini transcription failed:", error);
            throw error;
        }
    }

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

window.TranscriptionModule = new TranscriptionModule();
