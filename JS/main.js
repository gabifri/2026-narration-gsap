// Enregistrement des plugins GSAP nécessaires au fonctionnement des animations
gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin, Draggable, MotionPathPlugin);

/* ==========================================================
   0. SMOOTH SCROLL SUR LES LIENS D'ANCRAGE
   Source : Gémini
   ========================================================== */
// Sélectionne tous les liens internes commençant par #
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Écoute le clic de l'utilisateur sur chaque lien d'ancre
    anchor.addEventListener('click', function(e) {
        // Empêche le saut brutal par défaut du navigateur
        e.preventDefault();
        // Récupère l'identifiant de la section cible
        const targetID = this.getAttribute('href');
        
        // Anime le défilement fluide de la fenêtre vers la cible avec GSAP
        gsap.to(window, {
            duration: 1.2, // Durée de l'animation en secondes
            scrollTo: {
                y: targetID, // Position verticale de la cible
                autoKill: false // Empêche l'interruption prématurée du scroll
            },
            ease: "power3.inOut" // Effet d'accélération et de décélération fluide
        });
    });
});

/* ==========================================================
   1. SECTION HERO : SLIDER HORIZONTAL AU SCROLL
   ========================================================== */
// Sélectionne le conteneur global du contenu horizontal du Hero
const heroContent = document.querySelector(".hero-content");
// Récupère toutes les slides individuelles dans un tableau
const slides = gsap.utils.toArray(".slide");

// Anime le déplacement horizontal du conteneur en fonction du scroll vertical
gsap.to(".hero-content", {
    // Calcule la distance totale à parcourir horizontalement
    x: () => -(heroContent.scrollWidth - window.innerWidth),
    // Désactive l'accélération par défaut pour un mouvement linéaire lié au scroll
    ease: "none",
    scrollTrigger: {
        trigger: "#hero", // Élément déclencheur de l'effet
        pin: true, // Épingle la section à l'écran pendant le défilement horizontal
        start: "top top", // Début de l'animation quand le haut touche le haut de la fenêtre
        end: () => "+=" + (heroContent.scrollWidth - window.innerWidth), // Fin de l'animation basée sur la largeur totale
        scrub: 1, // Lie l'animation directement au mouvement de la molette (avec 1s de lissage)
        snap: {
            snapTo: 1 / (slides.length - 1), // Calcule les paliers d'aimantation pour chaque slide
            duration: 0.3, // Durée de l'effet d'aimantation
            ease: "power1.inOut" // Fluidité de l'aimantation
        },
        invalidateOnRefresh: true, // Recalcule les dimensions lors du redimensionnement
        markers: false // Désactive les repères visuels de débogage de GSAP
    }
});

/* ==========================================================
   2. SECTION CASSETTES : MECANIQUE DRAG & DROP
   ========================================================== */
// Initialise une variable pour suivre la cassette actuellement insérée
let currentCassette = null; 

// Rend chaque élément .tape déplaçable à la souris ou au tactile
Draggable.create(".tape", {
    type: "x,y", // Permet le mouvement horizontal et vertical
    bounds: "#cassette", // Restreint le déplacement à l'intérieur de la section cassette
    
    // Déclenché au début du glissement de la cassette
    onDragStart: function() {
        // Ajoute un effet lumineux (halo) sur le lecteur
        document.querySelector(".lecteur").classList.add("is-glowing");
    },

    // Déclenché lorsque l'utilisateur lâche la cassette
    onDragEnd: function() {
        // Retire l'effet lumineux du lecteur
        document.querySelector(".lecteur").classList.remove("is-glowing");

        // Vérifie si la cassette est lâchée pile au-dessus de la zone du lecteur
        if (this.hitTest(".lecteur")) {
            // Enregistre la cassette active
            currentCassette = this.target;

            // Récupère les dimensions et coordonnées exactes du lecteur
            const lecteurRect = document.querySelector(".lecteur").getBoundingClientRect();
            // Récupère les dimensions et coordonnées exactes de la cassette
            const tapeRect = this.target.getBoundingClientRect();
            
            // Calcule l'écart horizontal exact pour centrer la cassette
            const dx = (lecteurRect.left + lecteurRect.width / 2) - (tapeRect.left + tapeRect.width / 2);
            // Calcule l'écart vertical exact pour centrer la cassette
            const dy = (lecteurRect.top + lecteurRect.height / 2) - (tapeRect.top + tapeRect.height / 2);

            // Anime le positionnement final de la cassette au centre du lecteur
            gsap.to(this.target, { 
                x: gsap.getProperty(this.target, "x") + dx, 
                y: gsap.getProperty(this.target, "y") + dy, 
                scale: 1, 
                duration: 0.4, 
                ease: "power3.out" 
            });

            // Désactive le glisser-déposer de cette cassette verrouillée
            this.disable(); 

            // Récupère le type de média défini dans les attributs de la cassette
            let typeCassette = this.target.dataset.type;
            // Définit une couleur de bordure par défaut (rouge)
            let couleurBordure = "#ff0000"; 
            // Définit une couleur de fond par défaut (rouge transparent)
            let couleurFond = "rgba(255, 0, 0, 0.4)"; 

            // Change la couleur si le type est un documentaire
            if (typeCassette === "docu") {
                couleurBordure = "#FFE44B";
                couleurFond = "rgba(255, 228, 75, 0.4)";
            // Change la couleur si le type est un podcast
            } else if (typeCassette === "podcast") {
                couleurBordure = "#F15CEF"; 
                couleurFond = "rgba(241, 92, 239, 0.4)";
            // Change la couleur si le type est un vlog
            } else if (typeCassette === "vlog") {
                couleurBordure = "#5C86F1"; 
                couleurFond = "rgba(92, 134, 241, 0.4)";
            // Change la couleur si le type est un court-métrage
            } else if (typeCassette === "court-metrage") {
                couleurBordure = "#48FF48"; 
                couleurFond = "rgba(72, 255, 72, 0.4)";
            }

            // Anime l'apparence du lecteur avec les couleurs dynamiques du projet
            gsap.to(".lecteur", { 
                borderColor: couleurBordure, 
                boxShadow: `0 0 30px ${couleurBordure}`,
                backgroundColor: couleurFond,
                backdropFilter: "blur(20px)",
                duration: 0.5 
            });

            // Injecte le titre du projet dans la modale
            document.getElementById("project-title").innerText = this.target.dataset.title || "Projet";
            // Injecte la description du projet dans la modale
            document.getElementById("project-desc").innerText = this.target.dataset.desc || "";
            // Injecte l'URL de la vidéo YouTube dans l'iframe
            document.getElementById("project-video").src = this.target.dataset.yt || "";

            // Vérifie si une image de fond (poster) est spécifiée
            if (this.target.dataset.poster) {
                const playerBg = document.querySelector(".player-bg");
                // Applique l'image de fond floutée correspondante
                playerBg.style.backgroundImage = `url('${this.target.dataset.poster}')`;
                // Fait apparaître le fond en fondu
                gsap.to(playerBg, { opacity: 1, duration: 0.5 });
            }

            // Fait apparaître la modale contenant les détails du projet
            gsap.to(".project-modal", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.5 });
            // Affiche le bouton d'éjection
            gsap.to(".eject-btn", { opacity: 1, pointerEvents: "auto", duration: 0.3 });
            // Masque le texte d'instruction du lecteur
            gsap.to(".lecteur-text", { opacity: 0, duration: 0.3 });

        } else {
            // Fait retourner la cassette à sa position initiale si elle est lâchée à côté
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: "back.out" });
        }
    }
});

/* ==========================================================
   3. FONCTION D'ÉJECTION DES CASSETTES (EJECT)
   ========================================================== */
// Déclare la fonction globale déclenchée par le bouton EJECT
function ejectFunction() {
    // Masque la modale vidéo et vide l'iframe à la fin pour couper la lecture
    gsap.to(".project-modal", { 
        opacity: 0, 
        y: 30, 
        pointerEvents: "none", 
        duration: 0.3,
        onComplete: () => {
            document.getElementById("project-video").src = ""; 
        }
    });

    // Efface l'image de fond floutée
    gsap.to(".player-bg", { opacity: 0, duration: 0.5 });
    // Réaffiche le texte d'instruction dans le lecteur
    gsap.to(".lecteur-text", { opacity: 1, duration: 0.3 });
    // Masque le bouton d'éjection
    gsap.to(".eject-btn", { opacity: 0, pointerEvents: "none", duration: 0.3 });
    
    // Remet le lecteur dans son état visuel par défaut (rouge)
    gsap.to(".lecteur", { 
        borderColor: "#ff0000", 
        boxShadow: "0 0 15px rgba(255, 0, 0, 0.4)",
        backgroundColor: "#000000",
        backdropFilter: "blur(0px)",
        duration: 0.5 
    });

    // Vérifie si une cassette était activement insérée
    if (currentCassette) {
        // Fait revenir la cassette à sa place d'origine avec un effet rebond
        gsap.to(currentCassette, { 
            x: 0, 
            y: 0, 
            scale: 1, 
            duration: 0.6, 
            ease: "back.out",
            clearProps: "transform" 
        });
        // Réactive les propriétés de glisser-déposer sur cette cassette
        Draggable.get(currentCassette).enable(); 
        // Réinitialise la variable de la cassette active
        currentCassette = null; 
    }
}

/* ==========================================================
   4. SECTION MAKING-OFF : SLIDER AVANT/APRÈS INFINI
   ========================================================== */
// Lance l'animation de défilement infini en boucle constante des pistes d'images
gsap.to(".infinite-track", {
    xPercent: -50, // Déplace la piste de 50% vers la gauche
    ease: "none", // Mouvement linéaire constant
    duration: 45, // Durée d'un cycle complet en secondes
    repeat: -1 // Répète l'animation à l'infini
});

// Sélectionne la superposition du premier plan pour l'effet avant/après
let overlayTrack = document.querySelector(".fg-overlay"); 

// Positionne initialement le curseur de séparation exactement au milieu de l'écran
gsap.set(".slider-handle", { x: window.innerWidth / 2 });
// Ajuste la largeur de la couche de superposition au milieu de l'écran
gsap.set(overlayTrack, { width: window.innerWidth / 2 });

// Permet à l'utilisateur de glisser le curseur de gauche à droite
Draggable.create(".slider-handle", {
    type: "x", // Mouvement uniquement horizontal
    bounds: ".making-off", // Restreint le mouvement à la section Making-off
    // Modifie en temps réel la largeur du masque lorsque l'on déplace le curseur
    onDrag: function() {
        gsap.set(overlayTrack, { width: this.x });
    }
});

// Écoute le redimensionnement de la fenêtre du navigateur
window.addEventListener("resize", () => {
    // Recalcule le milieu exact de la nouvelle largeur d'écran
    let newWidth = window.innerWidth / 2;
    // Replace le curseur au centre
    gsap.set(".slider-handle", { x: newWidth });
    // Ajuste la superposition en conséquence
    gsap.set(overlayTrack, { width: newWidth });
});