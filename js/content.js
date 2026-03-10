/**
 * Content Structuring Logic using OpenAI LLM API
 */
class ContentModule {
    async formatAsBlogPost(transcript) {
        const apiKey = window.CONFIG.OPENAI_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
            throw new Error("OpenAI API Key is not configured in js/config.js");
        }

        const systemPrompt = `You are a professional blog post creator. 
        Your task is to take a raw voice transcript and turn it into a high-quality, engaging Markdown blog post.
        Strict Rules:
        1. Output ONLY RAW MARKDOWN. No explanations, no introductory text, no conversational filler.
        2. Create a catchy title (H1).
        3. Use H2 and H3 subheadings to structure the content.
        4. Fix any obvious transcription errors while preserving the speaker's core intent.
        5. Use bullet points or numbered lists where appropriate for readability.
        6. Start immediately with the Markdown content.`;

        const userPrompt = `Transcript: "${transcript}"`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o', // Using a standard high-quality model
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`LLM API Error: ${errorData.error?.message || response.statusText}`);
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
