// SOURCE : Documentation officielle GSAP (Installation & Core)
gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin, Draggable, MotionPathPlugin);

/* ==========================================================
   0. SMOOTH SCROLL SUR LES LIENS D'ANCRAGE
   ========================================================== */
// SOURCE : MDN Web Docs (querySelector) & Docs GSAP ScrollToPlugin
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetID = this.getAttribute('href');
        
        // SOURCE : Documentation GSAP (Plugin ScrollTo)
        gsap.to(window, {
            duration: 1.2, 
            scrollTo: {
                y: targetID,
                autoKill: false 
            },
            ease: "power3.inOut" 
        });
    });
});

/* ==========================================================
   1. SECTION HERO : SLIDER HORIZONTAL AU SCROLL
   ========================================================== */
const heroContent = document.querySelector(".hero-content");
const slides = gsap.utils.toArray(".slide");

// SOURCE : CodePen officiel GreenSock "Horizontal Scroll Section" & Docs ScrollTrigger
gsap.to(".hero-content", {
    // SOURCE : Docs GSAP (Function-based values pour recalculer la valeur au resize)
    x: () => -(heroContent.scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
        trigger: "#hero", 
        pin: true, 
        start: "top top", 
        end: () => "+=" + (heroContent.scrollWidth - window.innerWidth), 
        scrub: 1, 
        // SOURCE : Docs GSAP ScrollTrigger (Propriété "snap" et calcul d'aimantation par ratio)
        snap: {
            snapTo: 1 / (slides.length - 1), 
            duration: 0.3,
            ease: "power1.inOut"
        },
        // SOURCE : Docs GSAP (invalidateOnRefresh : force le recalcul des fonctions () => lors d'un resize)
        invalidateOnRefresh: true,
        markers: false 
    }
});


/* ==========================================================
   2. MATCHMEDIA GSAP : RESPONSIVE DESIGN (Desktop vs Mobile)
   ========================================================== */
// SOURCE : Documentation GSAP (gsap.matchMedia pour le Responsive sans utiliser de !important en CSS)
let mm = gsap.matchMedia();

// Configuration Desktop (Écrans normaux)
mm.add("(min-width: 769px)", () => {
    // La modale prend la moitié gauche de l'écran, toute la hauteur
    gsap.set(".project-modal", { 
        width: "calc(50% - 2px)", 
        height: "100%", 
        top: "0" 
    });
});

// Configuration Mobile (Téléphones)
mm.add("(max-width: 768px)", () => {
    // La modale ne se place que sur la moitié basse (45vh) pour ne pas masquer le bouton EJECT du lecteur !
    gsap.set(".project-modal", { 
        width: "100%", 
        height: "55vh", 
        top: "45vh" 
    });
});


/* ==========================================================
   3. SECTION CASSETTES : MECANIQUE DRAG & DROP
   ========================================================== */
let currentCassette = null; 

// SOURCE : Documentation GSAP Draggable
Draggable.create(".tape", {
    type: "x,y", 
    bounds: "#cassette", 
    
    onDragStart: function() {
        document.querySelector(".lecteur").classList.add("is-glowing");
    },

    onDragEnd: function() {
        document.querySelector(".lecteur").classList.remove("is-glowing");

        // SOURCE : Docs GSAP Draggable (Méthode hitTest pour la détection de collision)
        if (this.hitTest(".lecteur")) {
            currentCassette = this.target;

            // SOURCE : Généré par Gemini (Mathématiques pures de géométrie spatiale en JS)
            // Récupère les coordonnées écran pour centrer deux éléments qui n'ont pas le même parent/référentiel
            const lecteurRect = document.querySelector(".lecteur").getBoundingClientRect();
            const tapeRect = this.target.getBoundingClientRect();
            
            const dx = (lecteurRect.left + lecteurRect.width / 2) - (tapeRect.left + tapeRect.width / 2);
            const dy = (lecteurRect.top + lecteurRect.height / 2) - (tapeRect.top + tapeRect.height / 2);

            // SOURCE : Docs GSAP Core (gsap.getProperty) mixé avec l'équation de Gemini
            gsap.to(this.target, { 
                x: gsap.getProperty(this.target, "x") + dx, 
                y: gsap.getProperty(this.target, "y") + dy, 
                scale: 1, 
                duration: 0.4, 
                ease: "power3.out" 
            });

            this.disable(); 

            // SOURCE : Généré par Gemini (Logique DOM classique pour attribuer les couleurs dynamiques)
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

            // SOURCE : MDN Web Docs (Manipulation des attributs data-* via dataset)
            document.getElementById("project-title").innerText = this.target.dataset.title || "Projet";
            document.getElementById("project-desc").innerText = this.target.dataset.desc || "";
            document.getElementById("project-video").src = this.target.dataset.yt || "";

            if (this.target.dataset.poster) {
                const playerBg = document.querySelector(".player-bg");
                playerBg.style.backgroundImage = `url('${this.target.dataset.poster}')`;
                gsap.to(playerBg, { opacity: 1, duration: 0.5 });
            }

            gsap.to(".project-modal", { opacity: 1, pointerEvents: "auto", duration: 0.5 });
            gsap.to(".eject-btn", { opacity: 1, pointerEvents: "auto", duration: 0.3 });
            gsap.to(".lecteur-text", { opacity: 0, duration: 0.3 });

        } else {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: "back.out" });
        }
    }
});

/* ==========================================================
   4. FONCTION D'ÉJECTION DES CASSETTES (EJECT)
   ========================================================== */
function ejectFunction() {
    gsap.to(".project-modal", { 
        opacity: 0, 
        pointerEvents: "none", 
        duration: 0.3,
        onComplete: () => {
            // SOURCE : StackOverflow / Forums (Technique standard pour couper le son d'une iframe YouTube)
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
        // SOURCE : Docs GSAP Core (Propriété spéciale clearProps pour purger le CSS en ligne injecté par GSAP)
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
   5. SECTION MAKING-OFF : SLIDER AVANT/APRÈS INFINI
   ========================================================== */
// SOURCE : Tutoriels Web "GSAP Seamless Infinite Scroll" (Traduction de la boucle infinie CSS vers GSAP)
gsap.to(".infinite-track", {
    xPercent: -50, 
    ease: "none",
    duration: 45, 
    repeat: -1    
});

let overlayTrack = document.querySelector(".fg-overlay"); 

// SOURCE : Généré par Gemini (Inspiré des logiques de tutoriels "Custom Before/After Image Slider")
// On centre dynamiquement le curseur et la limite du masque d'écrêtage selon la taille de l'écran du visiteur
gsap.set(".slider-handle", { x: window.innerWidth / 2 });
gsap.set(overlayTrack, { width: window.innerWidth / 2 });

Draggable.create(".slider-handle", {
    type: "x", 
    bounds: ".making-off", 
    onDrag: function() {
        gsap.set(overlayTrack, { width: this.x });
    }
});

// SOURCE : Généré par Gemini (Responsive design JS pur pour recalibrer au changement de taille d'écran)
window.addEventListener("resize", () => {
    let newWidth = window.innerWidth / 2;
    gsap.set(".slider-handle", { x: newWidth });
    gsap.set(overlayTrack, { width: newWidth });
});