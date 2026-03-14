/**
 * Transcription Logic using OpenAI Whisper API
 */
class TranscriptionModule {
    async transcribe(audioBlob) {
        const apiKey = window.CONFIG.OPENAI_API_KEY.trim();
        
        if (apiKey.toLowerCase() === 'demo') {
            console.log("Demo Mode Active: Returning mock transcript.");
            // Artificial delay for realism
            await new Promise(resolve => setTimeout(resolve, 1500));
            return "This is a demonstration of the Voice to Blog application. In a real scenario, this text would be generated from your recorded audio using the OpenAI Whisper API. For now, we are just using a mock response to test the user interface.";
        }

        if (!apiKey || apiKey.startsWith('YOUR_')) {
            throw new Error("OpenAI API Key is not configured correctly in js/config.js.");
        }

        if (audioBlob.size === 0) {
            throw new Error("Audio recording is empty. Please try recording again.");
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        formData.append('model', 'whisper-1');

        const isLocalProxy = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        // Use a free public CORS proxy for GitHub Pages so it doesn't get blocked
        const apiDomain = isLocalProxy ? `${window.location.origin}/proxy/openai/` : 'https://cors-anywhere.herokuapp.com/https://api.openai.com/';
        const targetUrl = `${apiDomain}${(isLocalProxy ? '' : '')}v1/audio/transcriptions`;

        try {
            console.log(`Initiating Whisper API fetch via ${isLocalProxy ? 'Local Proxy' : 'Direct API'}...`);
            
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            }).catch(err => {
                console.error("Fetch error object:", err);
                let msg = "Network error: 'Failed to fetch'. ";
                if (window.location.protocol === 'file:') {
                    msg += "REASON: You are running via file://. Use RUN_APP.bat instead.";
                } else if (isLocalProxy) {
                    msg += "REASON: The local proxy server failed. Restart RUN_APP.bat and refresh the page.";
                } else {
                    msg += "REASON: Your browser or an ad-blocker is blocking OpenAI. Please disable ad-blockers/VPNs or try another browser.";
                }
                throw new Error(msg);
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
