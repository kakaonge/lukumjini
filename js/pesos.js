       // --- 1. GLOBAL THEME MANAGER ---
        (function() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateCartCount(); // Update nav count on load
        })();
    
        // --- 2. ADD TO CART LOGIC (The Fix) ---
        const buttons = document.querySelectorAll('.add-btn');
        const toast = document.getElementById('toast');
    
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                // A. Visual Feedback
                const originalText = this.innerText;
                this.innerText = "Adding...";
                this.style.opacity = "0.6";
    
                // B. Grab Product Details
                const card = this.closest('.product-card');
                const product = {
                    id: Date.now(), // Unique ID for removal later
                    name: card.querySelector('.info h3').innerText,
                    desc: card.querySelector('.info p').innerText,
                    // Clean price string to just numbers (e.g. "KES 12,000" -> 12000)
                    price: parseInt(card.querySelector('.price').innerText.replace(/[^0-9]/g, '')),
                    img: card.querySelector('img').src,
                    qty: 1
                };
    
                // C. Save to Local Storage
                let cart = JSON.parse(localStorage.getItem('lukumjiniCart')) || [];
                cart.push(product);
                localStorage.setItem('lukumjiniCart', JSON.stringify(cart));
    
                // D. Update UI
                setTimeout(() => {
                    updateCartCount();
                    this.innerText = "Added";
                    this.style.opacity = "1";
                    this.style.background = "var(--text-main)";
                    this.style.color = "var(--bg-color)";
    
                    toast.classList.add('active');
                    setTimeout(() => toast.classList.remove('active'), 2500);
    
                    setTimeout(() => {
                        this.innerText = originalText;
                        this.style.background = "transparent";
                        this.style.color = "var(--text-main)";
                    }, 2000);
                }, 600);
            });
        });
    
        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('lukumjiniCart')) || [];
            const countElements = document.querySelectorAll('#cartCount'); // Select all incase of multiple
            countElements.forEach(el => el.innerText = cart.length);
        }
    
        // --- 3. SCROLL REVEAL (Standard) ---
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
        // --- 4. AUDIO ENGINE (Standard) ---
        // [Keep your existing SoundEngine class here]
        class SoundEngine {
                constructor() {
                    this.ctx = null;
                    this.init();
                }
    
                init() {
                    if (this.ctx) return;
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContext();
                    this.masterGain = this.ctx.createGain();
                    this.masterGain.gain.value = 0.5;
                    this.masterGain.connect(this.ctx.destination);
                    
                    const unlock = () => {
                        if (this.ctx.state === 'suspended') this.ctx.resume();
                        ['mousemove', 'scroll', 'touchstart'].forEach(e => window.removeEventListener(e, unlock));
                    };
                    ['mousemove', 'scroll', 'touchstart'].forEach(e => window.addEventListener(e, unlock));
    
                    this.createWind();
                }
    
                createWind() {
                    const bufferSize = this.ctx.sampleRate * 2;
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
                    
                    this.windNode = this.ctx.createBufferSource();
                    this.windNode.buffer = buffer;
                    this.windNode.loop = true;
                    
                    this.windFilter = this.ctx.createBiquadFilter();
                    this.windFilter.type = 'lowpass';
                    this.windFilter.frequency.value = 100;
                    
                    this.windGain = this.ctx.createGain();
                    this.windGain.gain.value = 0;
                    
                    this.windNode.connect(this.windFilter);
                    this.windFilter.connect(this.windGain);
                    this.windGain.connect(this.masterGain);
                    this.windNode.start();
                }
    
                triggerHover() {
                    if (!this.ctx) this.init();
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.connect(gain);
                    gain.connect(this.masterGain);
                    
                    const notes = [523.25, 659.25, 783.99, 880.00];
                    osc.type = 'sine';
                    osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
                    
                    gain.gain.setValueAtTime(0, this.ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
                    
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.3);
                }
    
                updateScroll(vel) {
                    if (!this.ctx) return;
                    const now = this.ctx.currentTime;
                    const intensity = Math.min(vel / 40, 1);
                    this.windFilter.frequency.setTargetAtTime(100 + (intensity * 800), now, 0.1);
                    this.windGain.gain.setTargetAtTime(intensity * 0.2, now, 0.1);
                }
            }
    
            const engine = new SoundEngine();
    
            document.querySelectorAll('.hover-trigger').forEach(el => {
                el.addEventListener('mouseenter', () => engine.triggerHover());
            });
    
            let lastScrollY = window.scrollY;
            let isScrolling;
            window.addEventListener('scroll', () => {
                const v = Math.abs(window.scrollY - lastScrollY);
                lastScrollY = window.scrollY;
                engine.updateScroll(v);
                clearTimeout(isScrolling);
                isScrolling = setTimeout(() => engine.updateScroll(0), 100);
            });
    