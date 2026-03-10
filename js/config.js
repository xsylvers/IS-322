/**
 * App Configuration and Persisted Settings
 */
const CONFIG = {
    // Hardcoded keys as requested to clear JS problem
    GEMINI_API_KEY: 'AIzaSyCf50QUeOXzqB3PETouZPdGliPeB0sG_PA',
    GITHUB_TOKEN: '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',
    
    // Core GitHub Details
    GITHUB_OWNER: 'xsylvers',
    GITHUB_REPO: 'IS-322',
    GITHUB_BRANCH: 'main',
    GITHUB_PATH: 'posts/'
};

/**
 * Update and persist settings (for the popup/settings menu)
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
