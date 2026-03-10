/**
 * App Configuration and Persisted Settings
 */
const CONFIG = {
    // Hardcoded keys as requested
    OPENAI_API_KEY: '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',
    GITHUB_TOKEN: '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',
    
    // Core GitHub Details
    GITHUB_OWNER: 'xsylvers',
    GITHUB_REPO: 'IS-322',
    GITHUB_BRANCH: 'main',
    GITHUB_PATH: 'posts/'
};

/**
 * Update and persist settings
 */
window.updateSettings = (openaiKey, githubToken) => {
    if (openaiKey) {
        localStorage.setItem('OPENAI_API_KEY', openaiKey);
        CONFIG.OPENAI_API_KEY = openaiKey;
    }
    if (githubToken) {
        localStorage.setItem('GITHUB_TOKEN', githubToken);
        CONFIG.GITHUB_TOKEN = githubToken;
    }
};

window.CONFIG = CONFIG;
