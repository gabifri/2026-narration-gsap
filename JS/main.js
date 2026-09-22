// Initialisation du drag sur l'élément .carte
Draggable.create(".carte", {
  type: "x,y",
  bounds: "body", // Bloque la carte à l'intérieur de la page
  onPress: function() {
    // Grossit légèrement au clic pour donner l'impression d'attraper la carte
    gsap.to(this.target, { scale: 1.05, border: "1px solid rgba(255, 255, 255, 0.6)", duration: 0.2 }); 
  },
  onRelease: function() {
    // Revient à son état normal quand on relâche
    gsap.to(this.target, { scale: 1, border: "1px solid rgba(255, 255, 255, 0.3)", duration: 0.2 }); 
  }
});