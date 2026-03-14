/**
 * Content Structuring Logic using OpenAI Chat Completion API
 */
class ContentModule {
    getSystemPrompt() {
        return `You are a professional blog post creator. 
        Your task is to take a raw voice transcript and turn it into a high-quality, engaging Markdown blog post.
        Strict Rules:
        1. Output ONLY RAW MARKDOWN. No explanations, no introductory text, no conversational filler.
        2. Create a catchy title (H1).
        3. Use H2 and H3 subheadings to structure the content.
        4. Fix any obvious transcription errors while preserving the speaker's core intent.
        5. Use bullet points or numbered lists where appropriate for readability.
        6. Start immediately with the Markdown content.`;
    }

    async formatAsBlogPost(transcript) {
        const apiKey = window.CONFIG.OPENAI_API_KEY.trim();
        
        if (apiKey.toLowerCase() === 'demo') {
            console.log("Demo Mode Active: Returning mock blog post.");
            // Artificial delay for realism
            await new Promise(resolve => setTimeout(resolve, 2000));
            return `# Voice to Blog Demo Post

Welcome to the Voice to Blog proof of concept! This is an auto-generated mock blog post because you are currently running in **Demo Mode**.

## How it works

When you use a real OpenAI API Key, this application will:
1. Capture your voice using the Web Audio API.
2. Send the audio to OpenAI's Whisper model for exact transcription.
3. Send the raw text to GPT-4o to format it into beautiful Markdown.
4. Auto-publish the resulting file to this GitHub repository.

## Get Started

To use the real functionality, click the settings gear icon in the top right, enter a valid OpenAI API key, and try recording your own message!`;
        }

        if (!apiKey || apiKey.startsWith('YOUR_')) {
            throw new Error("OpenAI API Key is not configured correctly in js/config.js.");
        }

        const isLocalProxy = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        // Use a free public CORS proxy for GitHub Pages so it doesn't get blocked
        const apiDomain = isLocalProxy ? `${window.location.origin}/proxy/openai/` : 'https://cors-anywhere.herokuapp.com/https://api.openai.com/';
        const targetUrl = `${apiDomain}v1/chat/completions`;

        const userPrompt = `Transcript: "${transcript}"`;

        try {
            console.log(`Initiating Content API fetch via ${isLocalProxy ? 'Local Proxy' : 'Direct API'}...`);
            
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: this.getSystemPrompt() },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error("Content formatting failed:", error);
            throw error;
        }
    }
}

window.ContentModule = new ContentModule();
