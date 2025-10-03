document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        promptInput: document.getElementById('promptInput'),
        negativePrompt: document.getElementById('negativePrompt'),
        widthInput: document.getElementById('width'),
        heightInput: document.getElementById('height'),
        seedInput: document.getElementById('seed'),
        randomSeedBtn: document.getElementById('randomSeedBtn'),
        modelSelect: document.getElementById('model'),
        styleSelect: document.getElementById('style'),
        // NEW: Advanced style select
        advancedStyleSelect: document.getElementById('advancedStyle'),
        aspectRatioSelect: document.getElementById('aspectRatio'),
        stepsInput: document.getElementById('steps'),
        stepsValue: document.getElementById('stepsValue'),
        colorPaletteSelect: document.getElementById('colorPalette'),
        compositionSelect: document.getElementById('composition'),
        nsfwToggle: document.getElementById('nsfwToggle'),
        generateBtn: document.getElementById('generateBtn'),
        enhancePromptBtn: document.getElementById('enhancePrompt'),
        ultraEnhanceBtn: document.getElementById('ultraEnhanceBtn'),
        randomPromptBtn: document.getElementById('randomPrompt'),
        downloadBtn: document.getElementById('downloadBtn'),
        saveHistoryBtn: document.getElementById('saveHistoryBtn'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        // NEW: Clear Prompts Button
        clearPromptsBtn: document.getElementById('clearPromptsBtn'),
        // NEW: Image to Image Button
        img2imgBtn: document.getElementById('img2imgBtn'),
        themeToggle: document.getElementById('themeToggle'),
        languageToggle: document.getElementById('languageToggle'),
        loadingElement: document.getElementById('loading'),
        imageElement: document.getElementById('generatedImage'),
        imageControls: document.getElementById('imageControls'),
        historyList: document.getElementById('historyList'),
        advancedBtn: document.getElementById('advancedBtn'),
        // NEW: Image Caption
        imageCaption: document.getElementById('imageCaption')
    };

    // State
    const state = {
        currentLanguage: 'en',
        history: JSON.parse(localStorage.getItem('promptHistory')) || [],
        advancedSettingsVisible: false,
        // NEW: To store the URL for img2img/reference
        lastGeneratedImageUrl: null
    };

    // Art Style Combinations (Extended)
    const artStyleCombinations = {
        'ghibli': ['fractal', 'surrealism'],
        'watercolor': ['airbrush', 'aquarelle'],
        'graphite': ['impressionism', 'oilpainting'],
        'graphitepencil': ['impressionism', 'oilpainting'],
        'digital': ['cinematic', 'ultradetailed'],
        'digitalart': ['cinematic', 'ultradetailed'],
        'cinematic': ['vintage', 'hyperrealism'],
        'psychedelic': ['macabre', 'sanctuary'],
        'macabre': ['sanctuary', 'surrealism'],
        'sanctuary': ['surrealism', 'fantasy'],
        'surrealism': ['fractalvorter', 'surreal'],
        'darkfantasy': ['fantasy', 'mystery'],
        'fractalvorter': ['fractalspiral', 'surreal'],
        'fractal': ['spiral', 'surreal'],
        'geometric': ['zentangle', 'isometric'],
        'ornamentgeometric': ['zentangle', 'isometric'],
        'futurism': ['scifi', 'hyperrealism'],
        'futuristic': ['cyberpunk', 'fantasy']
    };

    // Translations
    const translations = {
        en: {
            promptPlaceholder: "Enter your image description...",
            negativePromptPlaceholder: "Negative prompt (what you don't want to see)...",
            generateBtn: "GENERATE IMAGE",
            enhancePrompt: "Enhance",
            ultraEnhance: "Ultra Enhance",
            randomPrompt: "Random",
            clearPrompts: "Clear Prompts", // NEW
            loadingText: "DERY AI LOADING",
            historyTitle: "Prompt History",
            clearHistory: "Clear History",
            download: "Download",
            save: "Save",
            useAsBase: "Use as Base Image", // NEW
            copyright: "Copyright &copy; 2025 DERY AI GENERATOR",
            poweredBy: "Powered by Pollinations API | Developed by Dery Lau",
            thanks: "Thanks to Github, Cloudflare & DeepSeek",
            advanced: "Advanced",
            hide: "Hide",
            noImageBase: "No image generated yet to use as a base." // NEW
        },
        id: {
            promptPlaceholder: "Masukkan deskripsi gambar Anda...",
            negativePromptPlaceholder: "Prompt negatif (yang tidak ingin Anda lihat)...",
            generateBtn: "BUAT GAMBAR",
            enhancePrompt: "Tingkatkan",
            ultraEnhance: "Tingkatkan Ultra",
            randomPrompt: "Acak",
            clearPrompts: "Hapus Prompt", // NEW
            loadingText: "DERY AI MEMPROSES",
            historyTitle: "Riwayat Prompt",
            clearHistory: "Hapus Riwayat",
            download: "Unduh",
            save: "Simpan",
            useAsBase: "Gunakan sebagai Gambar Dasar", // NEW
            copyright: "Hak Cipta &copy; 2025 DERY AI GENERATOR",
            poweredBy: "Didukung oleh Pollinations API | Dikembangkan oleh Dery Lau",
            thanks: "Terima kasih untuk Github, Cloudflare & DeepSeek",
            advanced: "Lanjutan",
            hide: "Sembunyikan",
            noImageBase: "Belum ada gambar yang dibuat untuk digunakan sebagai gambar dasar." // NEW
        }
    };

    // Initialize
    init();

    function init() {
        // Event listeners
        setupEventListeners();
        
        // Load history
        renderHistory();
        
        // Update aspect ratio
        updateAspectRatio();
        
        // Set initial language
        updateLanguage();
        
        // Generate random seed
        generateRandomSeed();
        
        // Hide advanced settings by default
        toggleAdvancedSettings(false);

        // Setup Tab switching functionality
        setupTabs();
    }

    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    function setupEventListeners() {
        // Generate button
        elements.generateBtn.addEventListener('click', generateImage);
        
        // Enhance prompt button
        elements.enhancePromptBtn.addEventListener('click', enhancePrompt);
        
        // Ultra enhance button
        elements.ultraEnhanceBtn.addEventListener('click', ultraEnhancePrompt);
        
        // Random prompt button
        elements.randomPromptBtn.addEventListener('click', generateRandomPrompt);

        // NEW: Clear Prompts button
        elements.clearPromptsBtn.addEventListener('click', clearPrompts);
        
        // Random seed button
        elements.randomSeedBtn.addEventListener('click', generateRandomSeed);
        
        // Download button
        elements.downloadBtn.addEventListener('click', downloadImage);
        
        // Save to history button
        elements.saveHistoryBtn.addEventListener('click', saveToHistory);
        
        // Clear history button
        elements.clearHistoryBtn.addEventListener('click', clearHistory);

        // NEW: Use as Base Image button
        elements.img2imgBtn.addEventListener('click', useAsBaseImage);
        
        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);
        
        // Language toggle
        elements.languageToggle.addEventListener('click', toggleLanguage);
        
        // Steps slider
        elements.stepsInput.addEventListener('input', function() {
            elements.stepsValue.textContent = this.value;
        });
        
        // Aspect ratio change
        elements.aspectRatioSelect.addEventListener('change', updateAspectRatio);
        
        // History item click
        elements.historyList.addEventListener('click', function(e) {
            if (e.target.tagName === 'LI') {
                elements.promptInput.value = e.target.dataset.prompt;
                if (e.target.dataset.negativePrompt) {
                    elements.negativePrompt.value = e.target.dataset.negativePrompt;
                }
            }
        });
        
        // Advanced settings button
        elements.advancedBtn.addEventListener('click', function() {
            toggleAdvancedSettings();
        });
    }

    function applyArtStyleCombination(baseStyle) {
        const normalizedBaseStyle = baseStyle.toLowerCase().replace(/\s+/g, '');
        
        if (artStyleCombinations[normalizedBaseStyle]) {
            const combinedStyles = [baseStyle, ...artStyleCombinations[normalizedBaseStyle]];
            const combinedValue = combinedStyles.join('-');
            
            // Check if the combined style exists, if not add it
            if (!Array.from(elements.styleSelect.options).some(opt => opt.value === combinedValue)) {
                const option = document.createElement('option');
                option.value = combinedValue;
                option.textContent = combinedStyles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' + ');
                elements.styleSelect.appendChild(option);
            }
            
            elements.styleSelect.value = combinedValue;
            return true;
        }
        
        return false;
    }

    // NEW: Function to clear prompts
    function clearPrompts() {
        elements.promptInput.value = '';
        elements.negativePrompt.value = '';
    }

    // NEW: Function to set last generated image as base
    function useAsBaseImage() {
        if (!state.lastGeneratedImageUrl) {
            alert(translations[state.currentLanguage].noImageBase);
            return;
        }

        elements.promptInput.value = elements.promptInput.value.trim() 
            ? `${elements.promptInput.value.trim()} --img ${state.lastGeneratedImageUrl}`
            : `--img ${state.lastGeneratedImageUrl}`;

        alert(state.currentLanguage === 'en' 
            ? "Last image URL added to the prompt as a base image." 
            : "URL gambar terakhir ditambahkan ke prompt sebagai gambar dasar.");
    }

    function generateImage() {
        let prompt = elements.promptInput.value.trim();
        
        // Check for special style combination format
        const styleMatch = prompt.match(/^style:(\w+)\s+(.+)/i);
        if (styleMatch) {
            const baseStyle = styleMatch[1];
            const description = styleMatch[2];
            
            if (applyArtStyleCombination(baseStyle)) {
                // Update prompt with just the description
                elements.promptInput.value = description;
                prompt = description;
            }
        }
        
        if (!prompt) {
            alert(state.currentLanguage === 'en' ? "Please enter a prompt first!" : "Silakan masukkan prompt terlebih dahulu!");
            return;
        }

        // If seed is empty, generate random seed
        if (!elements.seedInput.value.trim()) {
            generateRandomSeed();
        }

        // Show loading, hide previous image
        elements.loadingElement.style.display = 'block';
        elements.imageElement.style.display = 'none';
        elements.imageControls.style.display = 'none';
        elements.imageCaption.style.display = 'none';

        // Get parameters
        const width = elements.widthInput.value || 1024;
        const height = elements.heightInput.value || 1024;
        const seed = elements.seedInput.value ? `&seed=${elements.seedInput.value}` : '';
        const model = getModelEndpoint(elements.modelSelect.value);
        
        // Combine base and advanced styles
        let style = elements.styleSelect.value;
        const advancedStyle = elements.advancedStyleSelect.value;
        if (advancedStyle && style) {
            style = `${style}-${advancedStyle}`;
        } else if (advancedStyle) {
            style = advancedStyle;
        }
        style = style ? `&style=${style}` : '';

        const steps = `&steps=${elements.stepsInput.value}`;
        const nsfw = `&safe=${!elements.nsfwToggle.checked}`;
        const colorPalette = elements.colorPaletteSelect.value ? `&palette=${elements.colorPaletteSelect.value}` : '';
        const composition = elements.compositionSelect.value ? `&composition=${elements.compositionSelect.value}` : '';
        const negativePrompt = elements.negativePrompt.value ? `&negative=${encodeURIComponent(elements.negativePrompt.value)}` : '';

        // Enhanced parameters for best quality PNG
        const qualityParams = `&format=png&quality=100&enhance=true&nologo=true&private=false&upscale=true`;

        // Encode prompt for URL
        const encodedPrompt = encodeURIComponent(prompt);

        // Build image URL based on model
        let imageUrl;
        if (model.includes('http')) {
            // Special models with different endpoints (might not be needed for Pollinations)
            imageUrl = `${model}${encodedPrompt}?width=${width}&height=${height}${style}${steps}${seed}${nsfw}${colorPalette}${composition}${negativePrompt}${qualityParams}`;
        } else {
            // Default pollinations.ai
            imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}${model}${style}${steps}${seed}${nsfw}${colorPalette}${composition}${negativePrompt}${qualityParams}`;
        }

        // Set state for img2img feature
        state.lastGeneratedImageUrl = imageUrl;
        
        // Set timeout for image loading
        const loadingTimeout = setTimeout(() => {
            elements.loadingElement.style.display = 'none';
            alert(state.currentLanguage === 'en' 
                ? "Image generation is taking longer than expected. Please try again or modify your prompt." 
                : "Pembuatan gambar memakan waktu lebih lama dari yang diharapkan. Silakan coba lagi atau ubah prompt Anda.");
        }, 45000); // Increased timeout to 45 seconds for better stability

        // Load image
        elements.imageElement.onload = function() {
            clearTimeout(loadingTimeout);
            elements.loadingElement.style.display = 'none';
            elements.imageElement.style.display = 'block';
            elements.imageControls.style.display = 'flex';
            elements.imageCaption.textContent = `Prompt: ${prompt}`; // Set caption
            elements.imageCaption.style.display = 'block';
        };

        elements.imageElement.onerror = function() {
            clearTimeout(loadingTimeout);
            elements.loadingElement.style.display = 'none';
            alert(state.currentLanguage === 'en' 
                ? "Failed to generate image. Please try again with a different prompt." 
                : "Gagal membuat gambar. Silakan coba dengan prompt yang berbeda.");
        };

        elements.imageElement.src = imageUrl;
    }

    function getModelEndpoint(model) {
        switch(model) {
            // NEW Models
            case 'nanobanana':
                return '&model=nanobanana';
            case 'seedream':
                return '&model=seedream';
            case 'imagen4':
                return '&model=imagen-4'; // Assuming this is the API parameter

            // Existing Models
            case 'dalle3':
                return '&model=dalle3';
            case 'midjourney':
                return '&model=midjourney';
            case 'stablediffusion':
                return '&model=stablediffusion-xl';
            case 'kandinsky':
                return '&model=kandinsky';
            case 'deepfloyd':
                return '&model=deepfloyd';
            case 'gptimage':
                return '&model=gptimage';
            case 'flux':
                return '&model=flux';
            case 'turbo':
                return '&model=turbo';
            default:
                return ''; // Default pollinations.ai
        }
    }

    function enhancePrompt() {
        const prompt = elements.promptInput.value.trim();
        if (!prompt) return;
        
        const enhanced = `highly detailed, 4k, ultra HD, professional photography, ${prompt}`;
        elements.promptInput.value = enhanced;
    }

    function ultraEnhancePrompt() {
        const prompt = elements.promptInput.value.trim();
        if (!prompt) return;
        
        const enhanced = `ultra detailed, 8k, ultra HD, professional photography, cinematic lighting, intricate details, hyper realistic, ${prompt}`;
        elements.promptInput.value = enhanced;
        
        // Set quality parameters automatically for ultra enhance
        elements.widthInput.value = 1536; // Increased to 1536 for Ultra Enhance
        elements.heightInput.value = 1024; // Use a common HD ratio
        elements.stepsInput.value = 100;
        elements.stepsValue.textContent = '100';
    }

    function generateRandomPrompt() {
        const randomPrompts = [
            "A futuristic cityscape at sunset with flying cars and neon lights, hyperrealism, 8k",
            "A mystical forest with glowing mushrooms and fairies, watercolor style, soft lighting",
            "A cyberpunk samurai standing in the rain at night, cinematic lighting, ultra detailed",
            "An astronaut exploring an alien jungle, low angle, vibrant colors",
            "A steampunk airship flying over mountains, detailed engine parts, dramatic clouds",
            "A dragon sleeping on a pile of gold in a cave, dark fantasy, macabre style",
            "A magical library floating in space, deep focus, wide shot, stablediffusion",
            "A post-apocalyptic wasteland with a lone wanderer, film grain, cool tones",
            "A underwater city with glass domes and mermaids, concept art, flux model",
            "A giant robot fighting a kaiju in downtown Tokyo, vivid, anime style"
        ];
        
        const randomIndex = Math.floor(Math.random() * randomPrompts.length);
        elements.promptInput.value = randomPrompts[randomIndex];
    }

    function generateRandomSeed() {
        // Increased seed range for better randomization
        const randomSeed = Math.floor(Math.random() * 9999999999); 
        elements.seedInput.value = randomSeed;
    }

    function downloadImage() {
        if (!elements.imageElement.src) return;
        
        const link = document.createElement('a');
        // Use the generated prompt as a filename (sanitized)
        const promptForName = elements.promptInput.value.trim().substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.href = elements.imageElement.src;
        link.download = `dery-ai-${promptForName}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function saveToHistory() {
        // ... (rest of the saveToHistory function remains the same)
    }

    function clearHistory() {
        // ... (rest of the clearHistory function remains the same)
    }

    function renderHistory() {
        // ... (rest of the renderHistory function remains the same)
    }

    function toggleTheme() {
        // ... (rest of the toggleTheme function remains the same)
    }

    function toggleLanguage() {
        // ... (rest of the toggleLanguage function remains the same)
    }

    function updateLanguage() {
        const lang = translations[state.currentLanguage];
        
        // Update UI elements
        elements.promptInput.placeholder = lang.promptPlaceholder;
        elements.negativePrompt.placeholder = lang.negativePromptPlaceholder;
        elements.generateBtn.innerHTML = `<i class="fas fa-cogs"></i> ${lang.generateBtn}`;
        elements.enhancePromptBtn.innerHTML = `<i class="fas fa-magic"></i> ${lang.enhancePrompt}`;
        elements.ultraEnhanceBtn.innerHTML = `<i class="fas fa-stars"></i> ${lang.ultraEnhance}`;
        elements.randomPromptBtn.innerHTML = `<i class="fas fa-random"></i> ${lang.randomPrompt}`;
        elements.clearPromptsBtn.innerHTML = `<i class="fas fa-eraser"></i> ${lang.clearPrompts}`; // NEW
        elements.img2imgBtn.innerHTML = `<i class="fas fa-image"></i> ${lang.useAsBase}`; // NEW
        document.querySelector('.loading-text').textContent = lang.loadingText;
        document.querySelector('.history-section h2').innerHTML = `<i class="fas fa-history"></i> ${lang.historyTitle}`;
        elements.clearHistoryBtn.textContent = lang.clearHistory;
        elements.downloadBtn.innerHTML = `<i class="fas fa-download"></i> ${lang.download}`;
        elements.saveHistoryBtn.innerHTML = `<i class="fas fa-save"></i> ${lang.save}`;
        
        // Update footer
        const footerParagraphs = document.querySelectorAll('footer p');
        footerParagraphs[0].innerHTML = lang.copyright;
        footerParagraphs[1].textContent = lang.poweredBy;
        footerParagraphs[2].textContent = lang.thanks;
        
        // Update advanced button
        elements.advancedBtn.innerHTML = state.advancedSettingsVisible 
            ? `<i class="fas fa-times"></i> ${lang.hide}` 
            : `<i class="fas fa-sliders-h"></i> ${lang.advanced}`;
    }

    function updateAspectRatio() {
        const ratio = elements.aspectRatioSelect.value;
        let width, height;
        
        switch(ratio) {
            case '1:1':
                width = height = 1024;
                break;
            case '4:3':
                width = 1366;
                height = 1024;
                break;
            case '16:9':
                width = 1920;
                height = 1080;
                break;
            case '9:16':
                width = 1080;
                height = 1920;
                break;
            case '3:2':
                width = 1536;
                height = 1024;
                break;
            case '2:3':
                width = 1024;
                height = 1536;
                break;
            default:
                width = height = 1024;
        }
        
        elements.widthInput.value = width;
        elements.heightInput.value = height;
    }

    function toggleAdvancedSettings(animate = true) {
        state.advancedSettingsVisible = !state.advancedSettingsVisible;
        
        const advancedSettings = document.querySelectorAll('.settings-column:nth-child(n+2)');
        advancedSettings.forEach(setting => {
            if (state.advancedSettingsVisible) {
                setting.style.display = 'block';
                // Using GSAP for a smoother reveal effect (as per the original code)
                if (animate) {
                    gsap.from(setting, {
                        opacity: 0,
                        y: 20,
                        duration: 0.3,
                        stagger: 0.1
                    });
                }
            } else {
                setting.style.display = 'none';
            }
        });
        
        const lang = translations[state.currentLanguage];
        elements.advancedBtn.innerHTML = state.advancedSettingsVisible 
            ? `<i class="fas fa-times"></i> ${lang.hide}` 
            : `<i class="fas fa-sliders-h"></i> ${lang.advanced}`;
    }

    // Social share functions
    // ... (rest of the social share functions remains the same)
    document.querySelector('.share-btn.facebook').addEventListener('click', function() {
        shareOnSocial('facebook');
    });

    document.querySelector('.share-btn.whatsapp').addEventListener('click', function() {
        shareOnSocial('whatsapp');
    });

    document.querySelector('.share-btn.twitter').addEventListener('click', function() {
        shareOnSocial('twitter');
    });

    function shareOnSocial(platform) {
        if (!elements.imageElement.src) return;
        
        const text = encodeURIComponent(state.currentLanguage === 'en' 
            ? "Check out this AI-generated image I created with DERY AI!" 
            : "Lihat gambar AI yang saya buat dengan DERY AI!");
        const url = encodeURIComponent(elements.imageElement.src);
        
        let shareUrl;
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text} ${url}`;
                break;
            default:
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
});
