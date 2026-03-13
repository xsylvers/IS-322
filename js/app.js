/**
 * Main Application Orchestrator
 */
class App {
    constructor() {
        this.recordBtn = document.getElementById('recordBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.timerDisplay = document.getElementById('timer');
        this.statusLogs = document.getElementById('statusLogs');
        this.clearLogsBtn = document.getElementById('clearLogs');

        // Modal Elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.geminiInput = document.getElementById('geminiKey');
        this.githubInput = document.getElementById('githubToken');

        this.seconds = 0;
        this.timerInterval = null;
        this.isRecording = false;

        this.init();
        this.checkInitialSettings();
    }

    init() {
        if (window.location.protocol === 'file:') {
            this.addLog('Error: Security Block. You must run the app through a server. Close this and double-click the "RUN_APP.bat" file in your folder.', 'error');
        }

        this.recordBtn.addEventListener('click', () => this.handleStart());
        this.stopBtn.addEventListener('click', () => this.handleStop());
        this.clearLogsBtn.addEventListener('click', () => {
            this.statusLogs.innerHTML = '';
            this.addLog('Logs cleared.', 'system');
        });

        // Settings Modal Events
        this.settingsBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // Close modal on outside click
        window.onclick = (event) => {
            if (event.target == this.settingsModal) this.closeModal();
        };
    }

    checkInitialSettings() {
        if (!window.CONFIG.OPENAI_API_KEY || !window.CONFIG.GITHUB_TOKEN) {
            this.addLog('API keys missing. Opening settings...', 'error');
            setTimeout(() => this.openModal(), 1000);
        } else {
            // Fill inputs if they exist
            this.geminiInput.value = window.CONFIG.OPENAI_API_KEY;
            this.githubInput.value = window.CONFIG.GITHUB_TOKEN;
        }
    }

    openModal() {
        this.settingsModal.classList.add('active');
        this.geminiInput.value = window.CONFIG.OPENAI_API_KEY;
        this.githubInput.value = window.CONFIG.GITHUB_TOKEN;
    }

    closeModal() {
        this.settingsModal.classList.remove('active');
    }

    saveSettings() {
        const geminiVal = this.geminiInput.value.trim();
        const githubVal = this.githubInput.value.trim();

        if (!geminiVal || !githubVal) {
            alert('Please provide both keys.');
            return;
        }

        window.updateSettings(geminiVal, githubVal);
        this.addLog('Settings saved successfully.', 'success');
        this.closeModal();
    }

    addLog(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        entry.textContent = `[${time}] ${message}`;
        this.statusLogs.appendChild(entry);
        this.statusLogs.scrollTop = this.statusLogs.scrollHeight;
    }

    startTimer() {
        this.seconds = 0;
        this.timerInterval = setInterval(() => {
            this.seconds++;
            const mins = Math.floor(this.seconds / 60).toString().padStart(2, '0');
            const secs = (this.seconds % 60).toString().padStart(2, '0');
            this.timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    async handleStart() {
        try {
            await window.AudioModule.startRecording();
            this.isRecording = true;
            this.recordBtn.disabled = true;
            this.recordBtn.classList.add('recording');
            this.stopBtn.disabled = false;
            this.startTimer();
            this.addLog('Microphone active. Recording...', 'info');
        } catch (err) {
            this.addLog(`Error: ${err.message}`, 'error');
        }
    }

    async handleStop() {
        this.stopTimer();
        this.recordBtn.classList.remove('recording');
        this.stopBtn.disabled = true;
        this.addLog('Stop triggered. Processing audio...', 'info');

        try {
            const audioBlob = await window.AudioModule.stopRecording();
            this.addLog('Audio captured. Transcribing with AI...', 'info');

            // 1. Transcription
            const transcript = await window.TranscriptionModule.transcribe(audioBlob);
            this.addLog('Transcription complete!', 'success');
            console.log('Transcript:', transcript);

            // 2. Formatting
            this.addLog('Generating blog structure with LLM...', 'info');
            const markdown = await window.ContentModule.formatAsBlogPost(transcript);
            this.addLog('Blog post formatted!', 'success');

            // 3. Publishing
            this.addLog('Pushing to GitHub...', 'info');
            const result = await window.GitHubModule.publishBlogPost(markdown);
            
            this.addLog(`Successfully published: ${result.fileName}`, 'success');
            this.addLog(`Link: ${result.url}`, 'success');

        } catch (err) {
            this.addLog(`Process failed: ${err.message}`, 'error');
            console.error(err);
        } finally {
            this.recordBtn.disabled = false;
            this.timerDisplay.textContent = '00:00';
            this.isRecording = false;
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.App = new App();
});
