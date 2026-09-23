gsap.registerPlugin(ScrollTrigger,Observer,ScrollToPlugin,Draggable,MotionPathPlugin);

gsap.to("#hero-content", {
    x: "400px",
    rotation: 360,
    duration: 2,
})