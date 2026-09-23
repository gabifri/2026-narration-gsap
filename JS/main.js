gsap.registerPlugin(ScrollTrigger,Observer,ScrollToPlugin,Draggable,MotionPathPlugin);

gsap.to("#hero", {
    scrollTrigger: {
    trigger: '#hero-content',
    start: 'top 60%',
    end: 'top 20%',
    scrub: 1,
    markers: true,
    id: "window2",
    toggleActions: 'play none reverse reset',
    },
    rotation: 360,
    duration: 2,
})