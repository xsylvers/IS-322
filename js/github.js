/**
 * Publishing Logic using GitHub REST API
 */
class GitHubModule {
    async publishBlogPost(markdownContent) {
        const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_PATH, GITHUB_BRANCH } = window.CONFIG;
        
        if (!GITHUB_TOKEN || GITHUB_TOKEN === 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN_HERE') {
            throw new Error("GitHub Token is not configured in js/config.js");
        }

        // Generate a random filename with date
        const date = new String(new Date().toISOString().split('T')[0]);
        const randomId = Math.random().toString(36).substring(2, 7);
        const fileName = `${date}-${randomId}.md`;
        const path = `${GITHUB_PATH}${fileName}`;

        // Prepare Base64 content
        // Need to use TextEncoder for UTF-8 and then btoa for Base64 safely
        const bytes = new TextEncoder().encode(markdownContent);
        const base64Content = btoa(String.fromCharCode(...bytes));

        const payload = {
            message: `Publish blog post: ${fileName}`,
            content: base64Content,
            branch: GITHUB_BRANCH
        };

        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            return {
                url: data.content.html_url,
                fileName: fileName
            };
        } catch (error) {
            console.error("GitHub publishing failed:", error);
            throw error;
        }
    }
}

window.GitHubModule = new GitHubModule();
