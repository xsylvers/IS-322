/**
 * Content Structuring Logic using Google Gemini API
 */
class ContentModule {
    async formatAsBlogPost(transcript) {
        const apiKey = window.CONFIG.GEMINI_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            // Fallback to OpenAI if Gemini isn't set (original logic)
            return this.formatUsingOpenAI(transcript);
        }

        const prompt = `You are a professional blog post creator. 
        Your task is to take a raw voice transcript and turn it into a high-quality, engaging Markdown blog post.
        Strict Rules:
        1. Output ONLY RAW MARKDOWN. No explanations, no introductory text, no conversational filler.
        2. Create a catchy title (H1).
        3. Use H2 and H3 subheadings to structure the content.
        4. Fix any obvious transcription errors while preserving the speaker's core intent.
        5. Use bullet points or numbered lists where appropriate for readability.
        6. Start immediately with the Markdown content.

        Transcript: "${transcript}"`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            // Gemini response structure: data.candidates[0].content.parts[0].text
            return data.candidates[0].content.parts[0].text.trim();
        } catch (error) {
            console.error("Gemini content formatting failed:", error);
            throw error;
        }
    }

    async formatUsingOpenAI(transcript) {
        const apiKey = window.CONFIG.OPENAI_API_KEY;
        if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
            throw new Error("Neither Gemini nor OpenAI API Keys are configured in js/config.js");
        }

        const systemPrompt = `You are a professional blog post creator. Output ONLY RAW MARKDOWN.`;
        const userPrompt = `Transcript: "${transcript}"`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
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
    }
}

window.ContentModule = new ContentModule();
