gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin, Draggable, MotionPathPlugin);

const heroContent = document.querySelector(".hero-content");
const slides = gsap.utils.toArray(".slide");

// On calcule la distance exacte à parcourir (Largeur totale de la bande d'images - Largeur de l'écran)
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