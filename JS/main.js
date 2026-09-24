gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin, Draggable, MotionPathPlugin);

/* --- 1. SLIDER HORIZONTAL --- */
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

/* --- 2. MECANIQUE DRAG & DROP DES CASSETTES --- */
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

            // Calcul géométrique pour le centrage
            const lecteurRect = document.querySelector(".lecteur").getBoundingClientRect();
            const tapeRect = this.target.getBoundingClientRect();
            
            const dx = (lecteurRect.left + lecteurRect.width / 2) - (tapeRect.left + tapeRect.width / 2);
            const dy = (lecteurRect.top + lecteurRect.height / 2) - (tapeRect.top + tapeRect.height / 2);

            // Aimantation au centre
            gsap.to(this.target, { 
                x: gsap.getProperty(this.target, "x") + dx, 
                y: gsap.getProperty(this.target, "y") + dy, 
                scale: 1, 
                duration: 0.4, 
                ease: "power3.out" 
            });

            this.disable();

            /* --- GESTION DES COULEURS & GLASSMORPHISM TEINTÉ --- */
            let typeCassette = this.target.dataset.type;
            let couleurBordure = "#ff0000"; 
            let couleurFond = "rgba(255, 0, 0, 0.4)"; // Transparence à 0.4

            // Conversion de tes couleurs HEX en RGBA(..., 0.4) pour le fond
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

            // Animation de la bordure, du halo fixe et du fond teinté en mode glassmorphism
            gsap.to(".lecteur", { 
                borderColor: couleurBordure, 
                boxShadow: `0 0 30px ${couleurBordure}`,
                backgroundColor: couleurFond,
                backdropFilter: "blur(20px)",
                duration: 0.5 
            });
            /* --------------------------------------------------- */

            // Remplissage des données
            document.getElementById("project-title").innerText = this.target.dataset.title || "Projet";
            document.getElementById("project-desc").innerText = this.target.dataset.desc || "";
            document.getElementById("project-video").src = this.target.dataset.yt || "";

            // Apparition de l'affiche floutée en fond
            if (this.target.dataset.poster) {
                const playerBg = document.querySelector(".player-bg");
                playerBg.style.backgroundImage = `url('${this.target.dataset.poster}')`;
                gsap.to(playerBg, { opacity: 1, duration: 0.5 });
            }

            // Apparition de l'interface complète
            gsap.to(".project-modal", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.5 });
            gsap.to(".eject-btn", { opacity: 1, pointerEvents: "auto", duration: 0.3 });
            gsap.to(".lecteur-text", { opacity: 0, duration: 0.3 });

        } else {
            // Si on lâche à côté : la cassette retourne à sa place
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: "back.out" });
        }
    }
});

/* --- 3. BOUTON EJECT --- */
function ejectFunction() {
    
    // Disparition de la modale et coupure de la vidéo
    gsap.to(".project-modal", { 
        opacity: 0, 
        y: 30, 
        pointerEvents: "none", 
        duration: 0.3,
        onComplete: () => {
            document.getElementById("project-video").src = ""; 
        }
    });

    // Remise à zéro de l'interface droite
    gsap.to(".player-bg", { opacity: 0, duration: 0.5 });
    gsap.to(".lecteur-text", { opacity: 1, duration: 0.3 });
    gsap.to(".eject-btn", { opacity: 0, pointerEvents: "none", duration: 0.3 });
    
    // Le lecteur retrouve son état noir opaque avec le halo rouge d'origine
    gsap.to(".lecteur", { 
        borderColor: "#ff0000", 
        boxShadow: "0 0 15px rgba(255, 0, 0, 0.4)",
        backgroundColor: "#000000",
        backdropFilter: "blur(0px)",
        duration: 0.5 
    });

    // Retour de la cassette dans la bibliothèque
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