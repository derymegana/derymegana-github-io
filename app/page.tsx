"use client";

import { useState, useEffect, useRef } from "react";

const API_BASE = "/api/generate";

const langData: Record<string, Record<string, string>> = {
    id: {
        apiInfo: "Sistem kini mewajibkan API Key. Dapatkan secara gratis di",
        apiKeyLabel: "🔑 API Key (Otomatis Tersimpan)",
        promptLabel: "Prompt (Deskripsi Gambar)",
        promptPh: 'Contoh: Kota futuristik...',
        enhanceBtn: "Enhance",
        randomBtn: "Acak",
        negPrompt: "Negative Prompt (Hindari)",
        negPh: "buruk, kabur, kualitas rendah",
        modelLabel: "Model AI",
        styleLabel: "Gaya Artistik / Style",
        nsfwLabel: "Filter Konten Aman (Safe)",
        enhanceParam: "Parameter Auto Enhance",
        ultraDetail: "Super Ultra Detail",
        ratioLabel: "Aspek Rasio & Resolusi",
        advSettings: "Pengaturan Lanjutan",
        genBtn: "GENERATE GAMBAR",
        placeholder: "Gambar akan muncul di sini",
        download: "Simpan PNG",
        history: "Riwayat Prompt"
    },
    en: {
        apiInfo: "The system now requires an API Key. Get it for free at",
        apiKeyLabel: "🔑 API Key (Auto-Saved)",
        promptLabel: "Prompt (Image Description)",
        promptPh: 'Example: A futuristic city...',
        enhanceBtn: "Enhance",
        randomBtn: "Random",
        negPrompt: "Negative Prompt (Avoid)",
        negPh: "ugly, blurry, low quality",
        modelLabel: "AI Model",
        styleLabel: "Artistic Style",
        nsfwLabel: "Safe Content Filter",
        enhanceParam: "Auto Enhance Parameter",
        ultraDetail: "Super Ultra Detail",
        ratioLabel: "Aspect Ratio & Resolution",
        advSettings: "Advanced Settings",
        genBtn: "GENERATE IMAGE",
        placeholder: "Image will appear here",
        download: "Save PNG",
        history: "Prompt History"
    }
};

const randomPrompts = [
    "Astronaut meditating on a cloud of golden dust, cinematic lighting, 8k",
    "Cyberpunk street food vendor in Jakarta, neon rain, hyperrealistic",
    "Cute cat wearing a samurai armor, 3D Disney style, detailed texture"
];

export default function Home() {
    const [currentLang, setCurrentLang] = useState('id');
    const [isDarkMode, setIsDarkMode] = useState(true);
    

    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [model, setModel] = useState("flux");
    const [style, setStyle] = useState("");
    const [isSafe, setIsSafe] = useState(true);
    const [isEnhance, setIsEnhance] = useState(true);
    const [isUltra, setIsUltra] = useState(true);
    const [width, setWidth] = useState(1024);
    const [height, setHeight] = useState(1024);
    const [seed, setSeed] = useState("");
    
    const [advOpen, setAdvOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [history, setHistory] = useState<{url: string, prompt: string}[]>([]);
    
    const abortControllerRef = useRef<AbortController | null>(null);
    const currentObjectUrlRef = useRef<string | null>(null);
    const resultImgRef = useRef<HTMLImageElement>(null);

    const t = (key: string) => langData[currentLang][key] || key;

    useEffect(() => {

        
        const savedHistory = JSON.parse(localStorage.getItem('deryHistory') || '[]');
        setHistory(savedHistory);
        
        document.body.setAttribute('data-theme', 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        document.body.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    };

    const toggleLanguage = () => {
        setCurrentLang(currentLang === 'id' ? 'en' : 'id');
    };

    const enhancePrompt = () => {
        if (prompt.trim() !== "") {
            setPrompt(prev => prev + `, masterpiece, highly detailed, 8k resolution, trending on artstation`);
        } else {
            setPrompt(randomPrompts[Math.floor(Math.random() * randomPrompts.length)]);
        }
    };

    const setRatio = (w: number, h: number) => {
        setWidth(w);
        setHeight(h);
    };

    const buildFinalPrompt = () => {
        let finalPrompt = prompt.trim();
        if (style) finalPrompt += `, ${style}`;
        if (isEnhance) finalPrompt += `, masterpiece, highly detailed, vivid colors, sharp focus`;
        if (isUltra) finalPrompt += `, hyper detailed, ultra high resolution, photorealistic masterpiece`;
        if (isSafe) finalPrompt += `, safe for work, pg-13`;
        return finalPrompt;
    };

    const addToHistory = (url: string, p: string) => {
        const newHistory = [{ url, prompt: p }, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('deryHistory', JSON.stringify(newHistory));
    };

    const generateImage = async () => {
        if (!prompt.trim()) {
            alert(currentLang === 'id' ? "Mohon isi prompt!" : "Please fill in the prompt!");
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const pSeed = seed || Math.floor(Math.random() * 999999999).toString();
        const finalPrompt = buildFinalPrompt();
        const encodedPrompt = encodeURIComponent(finalPrompt);

        let fullUrl = `${API_BASE}?prompt=${encodedPrompt}&model=${model}&width=${width}&height=${height}&seed=${pSeed}`;
        if (negativePrompt.trim()) {
            fullUrl += `&negative=${encodeURIComponent(negativePrompt.trim())}`;
        }

        setIsGenerating(true);
        setErrorMsg(null);
        setResultUrl(null);

        if (currentObjectUrlRef.current) {
            URL.revokeObjectURL(currentObjectUrlRef.current);
            currentObjectUrlRef.current = null;
        }

        try {
            const response = await fetch(fullUrl, { signal: abortControllerRef.current.signal });

            if (response.status === 401 || response.status === 403) {
                throw new Error(currentLang === 'id' ? "Akses Ditolak (401/403). API Key Anda salah atau kuota model habis." : "Access Denied. API Key is invalid or quota exceeded.");
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            
            if (blob.type.includes('application/json') || blob.type.includes('text/html')) {
                throw new Error(currentLang === 'id' ? "Server gagal mengirim gambar. Periksa koneksi/API Key." : "Server failed to send image.");
            }

            const objUrl = URL.createObjectURL(blob);
            currentObjectUrlRef.current = objUrl;
            setResultUrl(objUrl);
            
            const historyUrl = `${API_BASE}?prompt=${encodedPrompt}&model=${model}&width=${width}&height=${height}&seed=${pSeed}`;
            addToHistory(historyUrl, prompt.trim());
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error('Generation error:', error);
            setErrorMsg(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = () => {
        if (!resultImgRef.current || !resultUrl) return;
        const imgEl = resultImgRef.current;

        const canvas = document.createElement('canvas');
        canvas.width = imgEl.naturalWidth;
        canvas.height = imgEl.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(imgEl, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `DERY-AI-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const shareSocial = (platform: string) => {
        if (!resultUrl) return;
        const text = encodeURIComponent("Coba lihat gambar yang saya buat dengan DERY AI!");
        let shareUrl = "";
        
        if (platform === 'wa') {
            shareUrl = `https://wa.me/?text=${text}`;
        } else if (platform === 'fb') {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        } else if (platform === 'tw') {
            shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
        }
        
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    };

    const handleHistoryClick = (itemUrl: string) => {
        setResultUrl(itemUrl);
        setErrorMsg(null);
    };

    const clearHistory = () => {
        localStorage.removeItem('deryHistory');
        setHistory([]);
    };

    return (
        <>
            <header>
                <div className="brand"><i className="fa-solid fa-bolt"></i> DERY AI</div>
                <div className="header-controls">
                    <button className="btn-icon" onClick={toggleLanguage}>{currentLang.toUpperCase()}</button>
                    <button className="btn-icon" onClick={toggleTheme}>
                        <i className={`fa-solid ${isDarkMode ? 'fa-moon' : 'fa-sun'}`}></i>
                    </button>
                </div>
            </header>

            <main>
                <aside className="sidebar">


                    <div className="control-group">
                        <label>{t('promptLabel')}</label>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t('promptPh')}></textarea>
                        <div className="btn-group">
                            <button className="btn-small" onClick={enhancePrompt}><i className="fa-solid fa-wand-magic-sparkles"></i> {t('enhanceBtn')}</button>
                            <button className="btn-small" onClick={() => setPrompt(randomPrompts[Math.floor(Math.random() * randomPrompts.length)])}><i className="fa-solid fa-dice"></i> {t('randomBtn')}</button>
                            <button className="btn-small" onClick={() => setPrompt('')} style={{background:'#444'}}><i className="fa-solid fa-eraser"></i></button>
                        </div>
                    </div>

                    <div className="control-group">
                        <label>{t('negPrompt')}</label>
                        <input type="text" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder={t('negPh')} />
                    </div>

                    <div className="control-group">
                        <label>{t('modelLabel')}</label>
                        <select value={model} onChange={e => setModel(e.target.value)}>
                            <option value="flux">Flux (Default & Cepat)</option>
                            <option value="flux-realism">Flux Realism (Fotorealistis)</option>
                            <option value="flux-pro">Flux Pro (Detail Tinggi)</option>
                            <option value="turbo">Turbo (Super Cepat)</option>
                            <option value="any-dark">Any Dark (Sinematik/Gelap)</option>
                            <option value="zimage">ZImage (Kualitas Premium)</option>
                            <option value="kontext">Kontext (Kreatif)</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>{t('styleLabel')}</label>
                        <select value={style} onChange={e => setStyle(e.target.value)}>
                            <option value="">Tidak ada (Sesuai Prompt)</option>
                            <option value="Cinematic lighting, 8k resolution, highly detailed, professional photo style">Cinematic lighting, 8k</option>
                            <option value="Quantum Fold Distortion, surreal collapsing realities, fractal patterns, intricate details">Quantum Fold</option>
                            <option value="Lowbrow Pop Surrealism, absurd and humorous character design, highly detailed">Pop Surrealism</option>
                            <option value="Tribal Explosion Graffiti, vibrant colors, kinetic energy, complex street art style">Tribal Graffiti</option>
                            <option value="Ukiyo-e Japanese Woodblock Print, traditional ink style, flowing lines">Ukiyo-e Woodblock</option>
                        </select>
                    </div>

                    <div className="toggle-container">
                        <span>{t('nsfwLabel')}</span>
                        <label className="switch"><input type="checkbox" checked={isSafe} onChange={e => setIsSafe(e.target.checked)} /><span className="slider"></span></label>
                    </div>
                    <div className="toggle-container">
                        <span>{t('enhanceParam')}</span>
                        <label className="switch"><input type="checkbox" checked={isEnhance} onChange={e => setIsEnhance(e.target.checked)} /><span className="slider"></span></label>
                    </div>
                    <div className="toggle-container">
                        <span>{t('ultraDetail')}</span>
                        <label className="switch"><input type="checkbox" checked={isUltra} onChange={e => setIsUltra(e.target.checked)} /><span className="slider"></span></label>
                    </div>

                    <div className="control-group">
                        <label>{t('ratioLabel')}</label>
                        <div className="ratio-grid">
                            <button className="btn-small" onClick={() => setRatio(1024,1024)}>1:1 Sq</button>
                            <button className="btn-small" onClick={() => setRatio(1024,768)}>4:3 Std</button>
                            <button className="btn-small" onClick={() => setRatio(1280,720)}>16:9 Wide</button>
                            <button className="btn-small" onClick={() => setRatio(720,1280)}>9:16 Port</button>
                            <button className="btn-small" onClick={() => setRatio(1024,1536)}>2:3 Tall</button>
                            <button className="btn-small" onClick={() => setRatio(2048,2048)}>2K+ Ultra</button>
                        </div>
                        <div style={{display:'flex', gap:'10px', marginTop:'5px'}}>
                            <div style={{flex:1}}>
                                <small>Width: <span>{width}</span>px</small>
                                <input type="range" min="256" max="3840" step="64" value={width} onChange={e => setWidth(Number(e.target.value))} />
                            </div>
                            <div style={{flex:1}}>
                                <small>Height: <span>{height}</span>px</small>
                                <input type="range" min="256" max="3840" step="64" value={height} onChange={e => setHeight(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    <button className="accordion" onClick={() => setAdvOpen(!advOpen)}>
                        <span>{t('advSettings')}</span> <i className={`fa-solid ${advOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </button>
                    <div className="panel" style={{ display: advOpen ? 'block' : 'none' }}>
                        <div className="control-group" style={{marginTop:'10px'}}>
                            <label>Seed (Acak jika kosong)</label>
                            <input type="number" value={seed} onChange={e => setSeed(e.target.value)} placeholder="12345" />
                        </div>
                    </div>

                    <button className="btn-generate" onClick={generateImage} disabled={isGenerating}>
                        {isGenerating ? <><i className="fa-solid fa-spinner fa-spin"></i> {currentLang === 'id' ? "MEMPROSES..." : "PROCESSING..."}</> : <><i className="fa-solid fa-bolt"></i> {t('genBtn')}</>}
                    </button>
                </aside>

                <section className="preview-area">
                    <div className={`image-container ${resultUrl ? 'success' : ''} ${errorMsg ? 'error' : ''}`}>
                        {isGenerating && (
                            <div className="loading-overlay" style={{ display: 'flex' }}>
                                <div className="dery-loader">DERY Loading...</div>
                                <div className="spinner"></div>
                                <p style={{marginTop:'15px', fontSize:'0.9rem', color:'var(--text-dim)'}}>{currentLang === 'id' ? "Menghubungi AI server..." : "Connecting to AI server..."}</p>
                            </div>
                        )}
                        
                        {!isGenerating && resultUrl && (
                            <img src={resultUrl} alt="Generated Image" className="result-img" ref={resultImgRef} crossOrigin="anonymous" style={{ display: 'block' }} />
                        )}
                        
                        {!isGenerating && !resultUrl && !errorMsg && (
                            <div style={{color:'var(--text-dim)', textAlign: 'center'}}>
                                <i className="fa-regular fa-image" style={{fontSize:'3rem', display:'block', marginBottom:'10px'}}></i>
                                <span>{t('placeholder')}</span>
                            </div>
                        )}

                        {!isGenerating && errorMsg && (
                            <div style={{ textAlign: 'center' }}>
                                <i className="fa-solid fa-triangle-exclamation" style={{fontSize:'2rem', color:'var(--danger)', display:'block', marginBottom:'10px'}}></i>
                                <span style={{color:'var(--danger)'}}>{errorMsg}</span>
                            </div>
                        )}
                    </div>

                    {resultUrl && !isGenerating && (
                        <div className="action-bar" style={{ display: 'flex' }}>
                            <button className="action-btn" onClick={downloadImage}><i className="fa-solid fa-download"></i> <span>{t('download')}</span></button>
                            <button className="action-btn" onClick={() => shareSocial('wa')}><i className="fa-brands fa-whatsapp"></i></button>
                            <button className="action-btn" onClick={() => shareSocial('fb')}><i className="fa-brands fa-facebook"></i></button>
                            <button className="action-btn" onClick={() => shareSocial('tw')}><i className="fa-brands fa-x-twitter"></i></button>
                        </div>
                    )}

                    <div className="history-section">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h3>{t('history')}</h3>
                            <button className="btn-small" onClick={clearHistory} style={{background:'var(--danger)'}}>Clear</button>
                        </div>
                        <div className="history-grid">
                            {history.map((item, idx) => (
                                <div key={idx} className="history-item" onClick={() => handleHistoryClick(item.url)}>
                                    <img src={item.url} alt={item.prompt} loading="lazy" crossOrigin="anonymous" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <p>&copy; 2026 DERY AI GENERATOR. Powered by Secure Pollinations API.</p>
                <p>Developed by Dery Lau.</p>
            </footer>
        </>
    );
}
