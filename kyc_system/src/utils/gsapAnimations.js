import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Page entrance animations
export const pageEntrance = (element) => {
  gsap.fromTo(element, 
    { 
      opacity: 0, 
      y: 50,
      duration: 0.8 
    },
    { 
      opacity: 1, 
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }
  );
};

// Stagger animation for lists
export const staggerAnimation = (elements, stagger = 0.1) => {
  gsap.fromTo(elements,
    { 
      opacity: 0, 
      x: -50 
    },
    { 
      opacity: 1, 
      x: 0,
      duration: 0.6,
      stagger: stagger,
      ease: "power2.out"
    }
  );
};

// Hover animations
export const hoverScale = (element) => {
  gsap.to(element, {
    scale: 1.05,
    duration: 0.3,
    ease: "power2.out"
  });
};

export const hoverScaleOut = (element) => {
  gsap.to(element, {
    scale: 1,
    duration: 0.3,
    ease: "power2.out"
  });
};

// Button hover effects
export const buttonHover = (element) => {
  gsap.to(element, {
    scale: 1.02,
    duration: 0.2,
    ease: "power2.out"
  });
};

export const buttonHoverOut = (element) => {
  gsap.to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out"
  });
};

// Card hover effects
export const cardHover = (element) => {
  gsap.to(element, {
    y: -10,
    scale: 1.02,
    duration: 0.3,
    ease: "power2.out",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
  });
};

export const cardHoverOut = (element) => {
  gsap.to(element, {
    y: 0,
    scale: 1,
    duration: 0.3,
    ease: "power2.out",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  });
};

// Slide animations
export const slideInLeft = (element) => {
  gsap.fromTo(element,
    { x: -100, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
  );
};

export const slideInRight = (element) => {
  gsap.fromTo(element,
    { x: 100, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
  );
};

export const slideInUp = (element) => {
  gsap.fromTo(element,
    { y: 100, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
  );
};

// Fade animations
export const fadeIn = (element) => {
  gsap.fromTo(element,
    { opacity: 0 },
    { opacity: 1, duration: 0.6, ease: "power2.out" }
  );
};

export const fadeInUp = (element) => {
  gsap.fromTo(element,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  );
};

// Text animations
export const textReveal = (element) => {
  gsap.fromTo(element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
  );
};

// Loading animations
export const loadingPulse = (element) => {
  gsap.to(element, {
    opacity: 0.5,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
  });
};

// Scroll-triggered animations
export const scrollReveal = (element, trigger = element) => {
  gsap.fromTo(element,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: trigger,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    }
  );
};

// Form animations
export const formFieldAnimation = (element) => {
  gsap.fromTo(element,
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
  );
};

// Success/Error animations
export const successBounce = (element) => {
  gsap.to(element, {
    scale: 1.1,
    duration: 0.2,
    ease: "power2.out",
    yoyo: true,
    repeat: 1
  });
};

export const errorShake = (element) => {
  gsap.to(element, {
    x: -10,
    duration: 0.1,
    ease: "power2.out",
    yoyo: true,
    repeat: 5
  });
}; 