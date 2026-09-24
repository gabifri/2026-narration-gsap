gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin, Draggable, MotionPathPlugin);

const heroContent = document.querySelector(".hero-content");
const slides = gsap.utils.toArray(".slide");

function getScrollAmount() {
    return -(heroContent.scrollWidth - window.innerWidth);
}

gsap.to(".hero-content", {
    x: getScrollAmount, // On utilise x plutôt que xPercent pour une précision au pixel près
    ease: "none",
    scrollTrigger: {
        trigger: "#hero",
        pin: true,
        start: "top top",
        // La durée du scroll est exactement proportionnelle au nombre d'images
        end: () => "+=" + (heroContent.scrollWidth - window.innerWidth),
        scrub: 1,
        // C'est ici qu'on règle le "cul entre deux chaises"
        snap: {
            snapTo: 1 / (slides.length - 1), // S'aimante parfaitement sur chaque image
            duration: 0.3, // Vitesse de l'aimantation
            ease: "power1.inOut" // Rendu fluide
        },
        invalidateOnRefresh: true, // Recalcule tout bien si tu redimensionnes ta fenêtre
        markers: false // J'ai désactivé les marqueurs pour faire propre
    }
});

/* --- MECANIQUE DRAG & DROP DES CASSETTES --- */
let currentCassette = null; // Variable pour mémoriser la cassette en cours de lecture

// 1. Création du Draggable
Draggable.create(".tape", {
    type: "x,y",
    bounds: "#cassette", // Limite le déplacement à la section
    
    // 2. Événement au moment où on lâche le clic
    onDragEnd: function() {
        
        // 3. hitTest : Vérifie si la cassette touche la zone de dépôt (.lecteur)
        if (this.hitTest(".lecteur")) {
            
            currentCassette = this.target;

            // --- LE CALCUL POUR CENTRER LA CASSETTE ---
            // On récupère les dimensions et positions du lecteur et de la cassette
            const lecteurRect = document.querySelector(".lecteur").getBoundingClientRect();
            const tapeRect = this.target.getBoundingClientRect();
            
            // On calcule l'écart entre le centre du lecteur et le centre de la cassette
            const dx = (lecteurRect.left + lecteurRect.width / 2) - (tapeRect.left + tapeRect.width / 2);
            const dy = (lecteurRect.top + lecteurRect.height / 2) - (tapeRect.top + tapeRect.height / 2);
            
            // On ajoute cet écart à la position X et Y actuelle de la cassette
            const newX = gsap.getProperty(this.target, "x") + dx;
            const newY = gsap.getProperty(this.target, "y") + dy;

            // On aimante la cassette au centre et on la rétrécit pour faire "insérée"
            gsap.to(this.target, { 
                x: newX, 
                y: newY, 
                scale: 0.8, 
                duration: 0.4, 
                ease: "power3.out" // Un effet de glissade très fluide
            });

            // On désactive le glisser-déposer sur cette cassette pendant la lecture
            this.disable();

            // On récupère les infos stockées dans le HTML
            let titre = this.target.getAttribute("data-title");
            let desc = this.target.getAttribute("data-desc");
            let youtubeLink = this.target.getAttribute("data-yt");

            // On injecte les infos dans la fenêtre
            document.getElementById("project-title").innerText = titre;
            document.getElementById("project-desc").innerText = desc;
            document.getElementById("project-video").src = youtubeLink;

            // On affiche la fenêtre vidéo et le bouton EJECT avec gsap.to
            gsap.to(".project-modal", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.5 });
            gsap.to(".eject-btn", { opacity: 1, pointerEvents: "auto", duration: 0.3 });
            gsap.to(".lecteur-text", { opacity: 0, pointerEvents: "none", duration: 0.3 });

        } else {
            // Si on lâche à côté, retour à la position de départ
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: "back.out" });
        }
    }
});


/* --- BOUTON EJECT --- */
function ejectFunction() {
    
    // 1. On cache la fenêtre vidéo (avec onComplete pour couper la vidéo à la fin)
    gsap.to(".project-modal", { 
        opacity: 0, 
        y: 30, 
        pointerEvents: "none", 
        duration: 0.3,
        onComplete: () => {
            document.getElementById("project-video").src = ""; // Coupe le son Youtube
        }
    });

    // 2. On cache le bouton EJECT
    gsap.to(".eject-btn", { opacity: 0, pointerEvents: "none", duration: 0.3 });

    // 3. On renvoie la cassette dans la bibliothèque
    if (currentCassette) {
        
        // gsap.to vers x:0 et y:0 pour la remettre à sa place initiale
        gsap.to(currentCassette, { x: 0, y: 0, scale: 1, duration: 0.6, ease: "back.out" });
        
        // On réactive le Draggable pour qu'on puisse à nouveau la déplacer
        Draggable.get(currentCassette).enable();
        
        currentCassette = null; // On vide le lecteur
    }
};