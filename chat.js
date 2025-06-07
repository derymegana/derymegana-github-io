document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const botNameInput = document.getElementById('bot-name');
    const personalitySelect = document.getElementById('bot-personality');
    const apiEndpointInput = document.getElementById('api-endpoint');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const maxTokensSlider = document.getElementById('max-tokens');
    const maxTokensValue = document.getElementById('max-tokens-value');
    const systemPromptTextarea = document.getElementById('system-prompt');
    const saveSettingsButton = document.getElementById('save-settings');
    const copyApiButton = document.getElementById('copy-api');
    
    // Load settings from localStorage if available
    loadSettings();
    
    // Event Listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    temperatureSlider.addEventListener('input', function() {
        temperatureValue.textContent = this.value;
    });
    
    maxTokensSlider.addEventListener('input', function() {
        maxTokensValue.textContent = this.value;
    });
    
    saveSettingsButton.addEventListener('click', saveSettings);
    copyApiButton.addEventListener('click', copyApiEndpoint);
    
    // Functions
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addMessage('user', message);
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Prepare the prompt for the API
        const botName = botNameInput.value;
        const personality = personalitySelect.value;
        const systemPrompt = systemPromptTextarea.value;
        const temperature = parseFloat(temperatureSlider.value);
        const maxTokens = parseInt(maxTokensSlider.value);
        
        // Construct the full prompt with context
        const fullPrompt = `${systemPrompt}\n\nCurrent conversation:\nUser: ${message}\n${botName}:`;
        
        // Call the API
        fetchResponse(fullPrompt, temperature, maxTokens)
            .then(response => {
                // Remove typing indicator
                removeTypingIndicator();
                
                // Add bot response to chat
                addMessage('bot', response);
            })
            .catch(error => {
                // Remove typing indicator
                removeTypingIndicator();
                
                // Show error message
                addMessage('bot', `Sorry, I encountered an error: ${error.message}`);
                console.error('Error:', error);
            });
    }
    
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            typingDiv.appendChild(dot);
        }
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    async function fetchResponse(prompt, temperature, maxTokens) {
        const apiEndpoint = apiEndpointInput.value;
        
        // Encode the prompt for URL
        const encodedPrompt = encodeURIComponent(prompt);
        
        // Construct the full URL with parameters
        const url = `${apiEndpoint}${encodedPrompt}&temperature=${temperature}&max_tokens=${maxTokens}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.text();
        return data.trim();
    }
    
    function saveSettings() {
        const settings = {
            botName: botNameInput.value,
            personality: personalitySelect.value,
            apiEndpoint: apiEndpointInput.value,
            temperature: temperatureSlider.value,
            maxTokens: maxTokensSlider.value,
            systemPrompt: systemPromptTextarea.value
        };
        
        localStorage.setItem('deryAI_settings', JSON.stringify(settings));
        
        // Show save confirmation
        const originalText = saveSettingsButton.textContent;
        saveSettingsButton.textContent = 'Settings Saved!';
        saveSettingsButton.style.background = 'linear-gradient(to right, var(--success-color), var(--success-color))';
        
        setTimeout(() => {
            saveSettingsButton.textContent = originalText;
            saveSettingsButton.style.background = 'linear-gradient(to right, var(--primary-color), var(--secondary-color))';
        }, 2000);
    }
    
    function loadSettings() {
        const savedSettings = localStorage.getItem('deryAI_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            botNameInput.value = settings.botName || 'DERY AI';
            personalitySelect.value = settings.personality || 'friendly';
            apiEndpointInput.value = settings.apiEndpoint || 'https://text.pollinations.ai/prompt/';
            temperatureSlider.value = settings.temperature || 0.7;
            temperatureValue.textContent = settings.temperature || 0.7;
            maxTokensSlider.value = settings.maxTokens || 150;
            maxTokensValue.textContent = settings.maxTokens || 150;
            systemPromptTextarea.value = settings.systemPrompt || 'You are DERY AI, a helpful AI assistant. Provide detailed, accurate and helpful responses to the user\'s questions. Be polite and friendly in your tone.';
        }
    }
    
    function copyApiEndpoint() {
        apiEndpointInput.select();
        document.execCommand('copy');
        
        // Show copy confirmation
        const originalText = copyApiButton.textContent;
        copyApiButton.textContent = 'Copied!';
        
        setTimeout(() => {
            copyApiButton.textContent = originalText;
        }, 2000);
    }
});