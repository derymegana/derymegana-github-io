document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Text-to-speech functionality
    const ttsPromptInput = document.getElementById('tts-prompt');
    const ttsVoiceSelect = document.getElementById('tts-voice');
    const ttsGenerateBtn = document.getElementById('tts-generate-btn');
    const ttsLoadingDiv = document.getElementById('tts-loading');
    const ttsAudioContainer = document.getElementById('tts-audio-container');
    const ttsAudioPlayer = document.getElementById('tts-audio-player');
    const ttsDownloadBtn = document.getElementById('tts-download-btn');
    const ttsVoiceDesc = document.getElementById('tts-voice-desc');
    
    // Voice descriptions
    const voiceDescriptions = {
        'alloy': 'Clear and versatile voice suitable for most content.',
        'echo': 'Bright and energetic voice great for announcements.',
        'fable': 'Storytelling tone perfect for narratives and books.',
        'onyx': 'Deep and rich voice with authoritative tone.',
        'nova': 'Warm and expressive voice with emotional range.',
        'shimmer': 'Soft and calming voice ideal for relaxation content.'
    };
    
    // Update voice description when selection changes
    ttsVoiceSelect.addEventListener('change', function() {
        ttsVoiceDesc.textContent = voiceDescriptions[this.value];
    });
    
    // Generate audio
    ttsGenerateBtn.addEventListener('click', function() {
        const text = ttsPromptInput.value.trim();
        const voice = ttsVoiceSelect.value;
        
        if (!text) {
            alert('Please enter some text to generate audio.');
            return;
        }
        
        // Show loading, hide audio container
        ttsLoadingDiv.style.display = 'block';
        ttsAudioContainer.style.display = 'none';
        ttsGenerateBtn.disabled = true;
        
        // Encode the text for URL
        const encodedText = encodeURIComponent(text);
        const apiUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;
        
        // Set the audio source
        ttsAudioPlayer.src = apiUrl;
        
        // Check when audio is ready
        ttsAudioPlayer.addEventListener('canplaythrough', function() {
            ttsLoadingDiv.style.display = 'none';
            ttsAudioContainer.style.display = 'block';
            ttsGenerateBtn.disabled = false;
        }, { once: true });
        
        // Handle errors
        ttsAudioPlayer.addEventListener('error', function() {
            ttsLoadingDiv.style.display = 'none';
            ttsGenerateBtn.disabled = false;
            alert('Error generating audio. Please try again.');
        }, { once: true });
    });
    
    // Download audio
    ttsDownloadBtn.addEventListener('click', function() {
        if (!ttsAudioPlayer.src) return;
        
        const text = ttsPromptInput.value.trim().substring(0, 20).replace(/\s+/g, '-');
        const voice = ttsVoiceSelect.value;
        const filename = `dery-ai-audio-${voice}-${text || 'output'}.mp3`;
        
        // Create a temporary link to download the audio
        const link = document.createElement('a');
        link.href = ttsAudioPlayer.src;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});