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
        // Déclenche l'animation de respiration CSS
        document.querySelector(".lecteur").classList.add("is-glowing");
    },

    onDragEnd: function() {
        if (this.hitTest(".lecteur")) {
            currentCassette = this.target;

            // Calcul géométrique pour le centrage parfait
            const lecteurRect = document.querySelector(".lecteur").getBoundingClientRect();
            const tapeRect = this.target.getBoundingClientRect();
            
            const dx = (lecteurRect.left + lecteurRect.width / 2) - (tapeRect.left + tapeRect.width / 2);
            const dy = (lecteurRect.top + lecteurRect.height / 2) - (tapeRect.top + tapeRect.height / 2);

            // Aimantation au centre avec scale à 1
            gsap.to(this.target, { 
                x: gsap.getProperty(this.target, "x") + dx, 
                y: gsap.getProperty(this.target, "y") + dy, 
                scale: 1, 
                duration: 0.4, 
                ease: "power3.out" 
            });

            this.disable();

            // Injection des données de la cassette
            document.getElementById("project-title").innerText = this.target.dataset.title || "Projet";
            document.getElementById("project-desc").innerText = this.target.dataset.desc || "";
            document.getElementById("project-video").src = this.target.dataset.yt || "";

            // Affichage de l'affiche floutée en fond
            if (this.target.dataset.poster) {
                const playerBg = document.querySelector(".player-bg");
                playerBg.style.backgroundImage = `url('${this.target.dataset.poster}')`;
                gsap.to(playerBg, { opacity: 1, duration: 0.5 });
            }

            // Apparition de l'interface
            gsap.to(".project-modal", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.5 });
            gsap.to(".eject-btn", { opacity: 1, pointerEvents: "auto", duration: 0.3 });
            gsap.to(".lecteur-text", { opacity: 0, duration: 0.3 });

        } else {
            // Si on lâche à côté, retour à la case départ
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: "back.out" });
            document.querySelector(".lecteur").classList.remove("is-glowing");
        }
    }
});

/* --- 3. BOUTON EJECT --- */
function ejectFunction() {
    
    // Fermeture de l'interface et coupure de la vidéo
    gsap.to(".project-modal", { 
        opacity: 0, 
        y: 30, 
        pointerEvents: "none", 
        duration: 0.3,
        onComplete: () => {
            document.getElementById("project-video").src = ""; 
        }
    });

    // Extinction de la lumière et remise à zéro visuelle
    document.querySelector(".lecteur").classList.remove("is-glowing");
    gsap.to(".player-bg", { opacity: 0, duration: 0.5 });
    gsap.to(".lecteur-text", { opacity: 1, duration: 0.3 });
    gsap.to(".eject-btn", { opacity: 0, pointerEvents: "none", duration: 0.3 });

    // La cassette retourne dans la bibliothèque
    if (currentCassette) {
        gsap.to(currentCassette, { x: 0, y: 0, scale: 1, duration: 0.6, ease: "back.out" });
        Draggable.get(currentCassette).enable();
        currentCassette = null; 
    }
}