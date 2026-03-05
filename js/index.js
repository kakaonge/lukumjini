// --- 1. GLOBAL THEME & INITIALIZATION ---
(function() {
    // Theme Check
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Preloader Check 
    const visited = sessionStorage.getItem('visited');
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    
    if (visited && preloader && mainContent) {
        preloader.style.display = 'none';
        mainContent.style.opacity = '1';
        document.body.style.overflowY = 'auto'; 
    } else {
        document.body.style.overflowY = 'hidden';
    }

    // UPDATED: Theme Toggle Logic (Works for Desktop AND Mobile buttons)
    const themeBtns = document.querySelectorAll('.theme-btn');
    if(themeBtns.length > 0) {
        themeBtns.forEach(btn => {
            btn.innerText = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';
            btn.addEventListener('click', () => {
                const curr = document.documentElement.getAttribute('data-theme');
                const next = curr === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                
                // Update text on all buttons simultaneously
                themeBtns.forEach(b => b.innerText = next === 'light' ? 'Dark Mode' : 'Light Mode');
            });
        });
    }
})();

// --- 2. MOBILE HAMBURGER MENU ---
const hamburger = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');

if(hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
}

// --- 3. PRELOADER & INTRO LOGIC ---
if (!sessionStorage.getItem('visited')) {
    
    const brandName = "LUKUMJINI";
    const titleWrapper = document.getElementById('title-wrapper');
    
    if (titleWrapper) {
        brandName.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.classList.add('big-letter');
            span.innerText = char;
            span.style.transitionDelay = `${index * 0.05}s`; 
            titleWrapper.appendChild(span);
        });
    }

    const letters = document.querySelectorAll('.big-letter');
    const enterBtn = document.getElementById('enter-trigger');
    const counter = document.getElementById('counter');
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');

    let count = 0;
    const interval = setInterval(() => {
        count++;
        if (counter) counter.innerText = count;
        if (count === 30) letters.forEach(l => l.style.transform = "translateY(0)");
        if (count >= 100) {
            clearInterval(interval);
            if (enterBtn) {
                enterBtn.style.opacity = 1;
                enterBtn.style.transform = "translateY(0)";
            }
        }
    }, 30);

    // Audio Engine (Intro)
    class IntroAudio {
        constructor() {
            this.ctx = null;
            this.masterGain = null;
        }
        init() {
            if(this.ctx) return;
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.8;
            this.masterGain.connect(this.ctx.destination);
            if(this.ctx.state === 'suspended') this.ctx.resume();
            this.atmosphere();
            this.thud();
        }
        atmosphere() {
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let last = 0;
            for(let i=0; i<bufferSize; i++) {
                const w = Math.random() * 2 - 1;
                data[i] = (last + (0.02 * w)) / 1.02;
                last = data[i];
                data[i] *= 3.5;
            }
            const n = this.ctx.createBufferSource();
            n.buffer = buffer; n.loop = true;
            const f = this.ctx.createBiquadFilter();
            f.type = 'lowpass'; f.frequency.value = 200;
            n.connect(f); f.connect(this.masterGain);
            n.start();
        }
        thud() {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.connect(g); g.connect(this.masterGain);
            const t = this.ctx.currentTime;
            osc.frequency.setValueAtTime(60, t);
            osc.frequency.exponentialRampToValueAtTime(10, t + 1.5);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.5, t + 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, t + 2);
            osc.start(t); osc.stop(t + 2);
        }
        fadeOut() {
            if(this.masterGain) {
                this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
                setTimeout(() => this.ctx.close(), 1200);
            }
        }
    }
    
    const introSys = new IntroAudio();

    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            introSys.init();
            
            sessionStorage.setItem('visited', 'true');

            enterBtn.style.opacity = 0;
            const counterWrap = document.querySelector('.counter-wrap');
            if (counterWrap) counterWrap.style.opacity = 0;
            
            letters.forEach(l => {
                l.style.transitionDelay = '0s';
                l.style.transition = 'transform 1s cubic-bezier(0.6, 0, 0.4, 1)';
                l.style.transform = "translateY(-150%)"; 
            });

            setTimeout(() => {
                if (preloader) {
                    preloader.style.opacity = 0;
                    preloader.style.pointerEvents = "none";
                }
                if (mainContent) mainContent.style.opacity = 1;
                document.body.style.overflowY = "auto"; 
                
                setTimeout(() => {
                    introSys.fadeOut();
                    if (preloader) preloader.style.display = 'none'; 
                }, 1000);
            }, 800);
        });
    }
}

// --- 4. MAIN SITE SCROLL ANIMATIONS ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// --- 5. MAIN SITE SOUND ENGINE ---
class MainSound {
    constructor() {
        this.ctx = null; this.g = null; this.f = null; this.wg = null;
    }
    init() {
        if(this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.g = this.ctx.createGain(); this.g.gain.value = 0.5;
        this.g.connect(this.ctx.destination);
        
        const bS = this.ctx.sampleRate * 2;
        const b = this.ctx.createBuffer(1, bS, this.ctx.sampleRate);
        const d = b.getChannelData(0);
        for(let i=0; i<bS; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
        
        const src = this.ctx.createBufferSource();
        src.buffer = b; src.loop = true;
        
        this.f = this.ctx.createBiquadFilter();
        this.f.type = 'lowpass'; this.f.frequency.value = 100;
        
        this.wg = this.ctx.createGain(); 
        this.wg.gain.value = 0; 
        
        src.connect(this.f); this.f.connect(this.wg); this.wg.connect(this.g);
        src.start();
    }
    hover() {
        if(!this.ctx) this.init();
        if(this.ctx.state === 'suspended') this.ctx.resume();
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g); g.connect(this.g);
        const t = this.ctx.currentTime;
        o.type='sine'; o.frequency.value = [523.25, 659.25, 783.99][Math.floor(Math.random()*3)];
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05, t+0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t+0.3);
        o.start(t); o.stop(t+0.3);
    }
    scroll(v) {
        if(!this.ctx) this.init(); 
        if(this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        
        const t = this.ctx.currentTime;
        const i = Math.min(v/40, 1);
        
        if(this.f && this.wg) {
            this.f.frequency.setTargetAtTime(100+(i*800), t, 0.1);
            this.wg.gain.setTargetAtTime(i*0.2, t, 0.1);
        }
    }
}

const mainAudio = new MainSound();

document.querySelectorAll('.hover-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => mainAudio.hover());
});

let lastScrollY = window.scrollY;
let isScrolling;
window.addEventListener('scroll', () => {
    const v = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;
    mainAudio.scroll(v);
    
    clearTimeout(isScrolling);
    isScrolling = setTimeout(() => mainAudio.scroll(0), 100);
});

document.body.addEventListener('click', () => {
    if(!mainAudio.ctx) mainAudio.init();
    if(mainAudio.ctx && mainAudio.ctx.state === 'suspended') mainAudio.ctx.resume();
}, { once: true });
// --- 6. NEWSLETTER SUBMISSION LOGIC ---
const newsletterForm = document.querySelector('.newsletter-form');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        // Prevent the page from reloading
        e.preventDefault(); 
        
        // Grab the email input
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value;

        if (email) {
            // Transform the form into a sleek success message
            newsletterForm.innerHTML = `
                <span style="font-family: var(--font-display); font-size: 1.5rem; color: var(--text-muted); padding: 1rem 0; animation: fadeUp 0.8s ease forwards;">
                    Thank you. You're on the list.
                </span>
            `;
            
            // Optional: If you also want to trigger your audio hover sound for a nice click effect
            if (typeof mainAudio !== 'undefined') {
                mainAudio.hover();
            }
        }
    });
}