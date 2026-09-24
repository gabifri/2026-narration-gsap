// Initialisation des plugins GSAP nécessaires pour le site
gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin, Draggable, MotionPathPlugin);

/* ==========================================================
   0. SMOOTH SCROLL SUR LES LIENS D'ANCRAGE
   ========================================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetID = this.getAttribute('href');
        
        // Animation fluide vers la section cible
        gsap.to(window, {
            duration: 1.2, // Durée du scroll en secondes (plus c'est haut, plus c'est lent)
            scrollTo: {
                y: targetID,
                autoKill: false
            },
            ease: "power3.inOut" // Effet d'accélération/décélération fluide
        });
    });
});

/* ==========================================================
   1. SECTION HERO : SLIDER HORIZONTAL AU SCROLL
   ========================================================== */
const heroContent = document.querySelector(".hero-content");
const slides = gsap.utils.toArray(".slide");

gsap.to(".hero-content", {
    x: () => -(heroContent.scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
        trigger: "#hero",
        pin: true, 
        start: "top top",
        end: () => "+=" + (heroContent.scrollWidth - window.innerWidth),
        scrub: 1, 
        snap: {
            snapTo: 1 / (slides.length - 1),
            duration: 0.3,
            ease: "power1.inOut"
        },
        invalidateOnRefresh: true,
        markers: false 
    }
});

/* ==========================================================
   2. SECTION CASSETTES : MECANIQUE DRAG & DROP
   ========================================================== */
let currentCassette = null; 

Draggable.create(".tape", {
    type: "x,y",
    bounds: "#cassette", 
    
    onDragStart: function() {
        document.querySelector(".lecteur").classList.add("is-glowing");
    },

    onDragEnd: function() {
        document.querySelector(".lecteur").classList.remove("is-glowing");

        if (this.hitTest(".lecteur")) {
            currentCassette = this.target;

            // --- Calcul Géométrique de Centrage ---
            const lecteurRect = document.querySelector(".lecteur").getBoundingClientRect();
            const tapeRect = this.target.getBoundingClientRect();
            
            const dx = (lecteurRect.left + lecteurRect.width / 2) - (tapeRect.left + tapeRect.width / 2);
            const dy = (lecteurRect.top + lecteurRect.height / 2) - (tapeRect.top + tapeRect.height / 2);

            gsap.to(this.target, { 
                x: gsap.getProperty(this.target, "x") + dx, 
                y: gsap.getProperty(this.target, "y") + dy, 
                scale: 1, 
                duration: 0.4, 
                ease: "power3.out" 
            });

            this.disable(); 

            // --- GESTION DYNAMIQUE DES COULEURS ---
            let typeCassette = this.target.dataset.type;
            let couleurBordure = "#ff0000"; 
            let couleurFond = "rgba(255, 0, 0, 0.4)"; 

            if (typeCassette === "docu") {
                couleurBordure = "#FFE44B";
                couleurFond = "rgba(255, 228, 75, 0.4)";
            } else if (typeCassette === "podcast") {
                couleurBordure = "#F15CEF"; 
                couleurFond = "rgba(241, 92, 239, 0.4)";
            } else if (typeCassette === "vlog") {
                couleurBordure = "#5C86F1"; 
                couleurFond = "rgba(92, 134, 241, 0.4)";
            } else if (typeCassette === "court-metrage") {
                couleurBordure = "#48FF48"; 
                couleurFond = "rgba(72, 255, 72, 0.4)";
            }

            gsap.to(".lecteur", { 
                borderColor: couleurBordure, 
                boxShadow: `0 0 30px ${couleurBordure}`,
                backgroundColor: couleurFond,
                backdropFilter: "blur(20px)",
                duration: 0.5 
            });

            // --- TRANSFERT DES DONNÉES ---
            document.getElementById("project-title").innerText = this.target.dataset.title || "Projet";
            document.getElementById("project-desc").innerText = this.target.dataset.desc || "";
            document.getElementById("project-video").src = this.target.dataset.yt || "";

            if (this.target.dataset.poster) {
                const playerBg = document.querySelector(".player-bg");
                playerBg.style.backgroundImage = `url('${this.target.dataset.poster}')`;
                gsap.to(playerBg, { opacity: 1, duration: 0.5 });
            }

            gsap.to(".project-modal", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.5 });
            gsap.to(".eject-btn", { opacity: 1, pointerEvents: "auto", duration: 0.3 });
            gsap.to(".lecteur-text", { opacity: 0, duration: 0.3 });

        } else {
            // Retour fluide si la cassette est lâchée à côté
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: "back.out" });
        }
    }
});

/* Bouton EJECT */
function ejectFunction() {
    gsap.to(".project-modal", { 
        opacity: 0, 
        y: 30, 
        pointerEvents: "none", 
        duration: 0.3,
        onComplete: () => {
            document.getElementById("project-video").src = ""; 
        }
    });

    gsap.to(".player-bg", { opacity: 0, duration: 0.5 });
    gsap.to(".lecteur-text", { opacity: 1, duration: 0.3 });
    gsap.to(".eject-btn", { opacity: 0, pointerEvents: "none", duration: 0.3 });
    
    gsap.to(".lecteur", { 
        borderColor: "#ff0000", 
        boxShadow: "0 0 15px rgba(255, 0, 0, 0.4)",
        backgroundColor: "#000000",
        backdropFilter: "blur(0px)",
        duration: 0.5 
    });

    if (currentCassette) {
        gsap.to(currentCassette, { 
            x: 0, 
            y: 0, 
            scale: 1, 
            duration: 0.6, 
            ease: "back.out",
            clearProps: "transform" 
        });
        Draggable.get(currentCassette).enable(); 
        currentCassette = null; 
    }
}

/* ==========================================================
   4. SECTION MAKING-OFF : SLIDER AVANT/APRÈS INIFINI
   ========================================================== */
gsap.to(".infinite-track", {
    xPercent: -50, 
    ease: "none",
    duration: 45, 
    repeat: -1    
});

let overlayTrack = document.querySelector(".fg-overlay"); 

// Initialisation au centre
gsap.set(".slider-handle", { x: window.innerWidth / 2 });
gsap.set(overlayTrack, { width: window.innerWidth / 2 });

Draggable.create(".slider-handle", {
    type: "x", 
    bounds: ".making-off", 
    onDrag: function() {
        gsap.set(overlayTrack, { width: this.x });
    }
});

// Recentre tout si la fenêtre est redimensionnée
window.addEventListener("resize", () => {
    let newWidth = window.innerWidth / 2;
    gsap.set(".slider-handle", { x: newWidth });
    gsap.set(overlayTrack, { width: newWidth });
});