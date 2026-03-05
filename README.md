 lukumjini | Kenyan Fashion Editorial

A high-end, immersive e-commerce and editorial platform showcasing Nairobi's premier streetwear and avant-garde fashion brands: Makasi Studio, Pe$os Nairobi, Studio 18, and Metamorphosized. 

Designed with a minimalist, brutalist aesthetic, the site features fluid typography, ambient soundscapes, and stateful e-commerce functionality.

 Features

* **Immersive Preloader:** A one-time (session-based) loading sequence featuring a percentage counter, exclusion-blend typography, and a custom audio trigger.
* **Web Audio API Engine:** Generates real-time, algorithmic audio rather than using static MP3s. Features ambient wind noise linked to scroll speed and frequency-based hover sounds for interactive UI elements.
* **Dynamic Theming:** Seamless Dark/Light mode toggle that saves user preference across sessions using `localStorage`.
* **Stateful Shopping Cart:** "Add to Cart" functionality that updates globally across all pages using `localStorage`, complete with interactive button states and sliding Toast notifications.
* **Ethereal UI/UX:** CSS-generated animated fog blobs, smooth scroll-reveal animations using `IntersectionObserver`, and fluid typography that scales perfectly on mobile devices.
* **Fully Responsive:** Custom mobile navigation with a sleek, slide-out hamburger menu and safe-area padding for modern smartphones.

 Tech Stack

This project is built entirely from scratch using pure, vanilla web technologies for maximum performance and zero dependencies.

HTML5: Semantic structure and accessible forms.
CSS3: Native CSS Variables for theming, CSS Grid/Flexbox for layout, advanced `@keyframes` animations, and viewport-based fluid typography (`vw`).
Vanilla JavaScript (ES6+): DOM manipulation, `localStorage`/`sessionStorage` management, Intersection Observers, and custom Web Audio synthesis.

 Project Structure

To ensure maximum compatibility with web servers and GitHub Pages, all asset folders use lowercase naming with no spaces or special characters.

text
lukumjini/
├── index.html                 # Main editorial homepage
├── metamorphisized.html       # Individual brand collection page
├── cart.html                  # Shopping cart / checkout logic
├── README.md                  # Project documentation
│
├── css/
│   ├── home.css               # Homepage styling (Preloader, fog, hero)
│   └── metarmorphisized.css   # Collection-specific styling
│
├── js/
│   ├── index.js               # Homepage logic & audio engine
│   └── metarmophisized.js     # Collection cart logic & interactions
│
└── assets/                    # Optimized image assets
    ├── makasi/                
    ├── pesos/                 
    ├── studio18/              
    └── metamorphisized/