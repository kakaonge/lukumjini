// --- 1. GLOBAL THEME MANAGER ---
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const btn = document.getElementById('themeBtn');
    if(btn) {
        btn.innerText = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';
        btn.addEventListener('click', () => {
            const curr = document.documentElement.getAttribute('data-theme');
            const next = curr === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            btn.innerText = next === 'light' ? 'Dark Mode' : 'Light Mode';
        });
    }
})();

// --- 2. DYNAMIC CART LOGIC ---
const cartItemsContainer = document.getElementById('cartItems');

function renderCart() {
    // Retrieve cart from LocalStorage
    let cart = JSON.parse(localStorage.getItem('lukumjiniCart')) || [];
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div style="padding: 2rem; color: var(--text-muted); font-size:0.9rem;">Your cart is currently empty.</div>';
        updateTotals(0);
        return;
    }

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.qty;

        const itemHTML = `
            <div class="cart-item">
                <div class="item-img hover-trigger">
                    <img src="${item.img}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                    <div class="item-actions">
                        <div class="qty-selector">
                            <button class="qty-btn minus" onclick="changeQty(${index}, -1)">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn plus" onclick="changeQty(${index}, 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
                    </div>
                </div>
                <div class="item-price">KES ${(item.price * item.qty).toLocaleString()}</div>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
    });

    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    const tax = subtotal * 0.16;
    const shipping = subtotal > 0 ? 350 : 0;
    const total = subtotal + tax + shipping;

    document.getElementById('subtotal').innerText = 'KES ' + subtotal.toLocaleString();
    document.getElementById('tax').innerText = 'KES ' + Math.floor(tax).toLocaleString();
    document.getElementById('total').innerText = 'KES ' + Math.floor(total).toLocaleString();
}

// Global functions for inline onclick handlers
window.changeQty = function(index, change) {
    let cart = JSON.parse(localStorage.getItem('lukumjiniCart')) || [];
    if (cart[index].qty + change > 0) {
        cart[index].qty += change;
    }
    localStorage.setItem('lukumjiniCart', JSON.stringify(cart));
    renderCart();
};

window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem('lukumjiniCart')) || [];
    
    // Add removing animation
    const row = document.querySelectorAll('.cart-item')[index];
    row.classList.add('removing');
    
    setTimeout(() => {
        cart.splice(index, 1);
        localStorage.setItem('lukumjiniCart', JSON.stringify(cart));
        renderCart();
    }, 500);
};

// Initialize
renderCart();


// --- 3. SCROLL REVEAL ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
    observer.observe(el);
});


// --- 4. AUTO-AUDIO ENGINE (Consistent with other pages) ---
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

// Listen for hovers on dynamic content
document.body.addEventListener('mouseover', (e) => {
    if (e.target.closest('.hover-trigger')) {
        engine.triggerHover();
    }
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
