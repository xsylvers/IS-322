/**
 * App Configuration and Persisted Settings
 */
const CONFIG = {
    // These will be overridden by localStorage if they exist
    GEMINI_API_KEY: localStorage.getItem('GEMINI_API_KEY') || '',
    GITHUB_TOKEN: localStorage.getItem('GITHUB_TOKEN') || '',
    
    // Core GitHub Details
    GITHUB_OWNER: 'xsylvers',
    GITHUB_REPO: 'IS-322',
    GITHUB_BRANCH: 'main',
    GITHUB_PATH: 'posts/'
};

/**
 * Update and persist settings
 */
window.updateSettings = (geminiKey, githubToken) => {
    if (geminiKey) {
        localStorage.setItem('GEMINI_API_KEY', geminiKey);
        CONFIG.GEMINI_API_KEY = geminiKey;
    }
    if (githubToken) {
        localStorage.setItem('GITHUB_TOKEN', githubToken);
        CONFIG.GITHUB_TOKEN = githubToken;
    }
};

window.CONFIG = CONFIG;
