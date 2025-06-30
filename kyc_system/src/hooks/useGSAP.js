import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  pageEntrance, 
  staggerAnimation, 
  hoverScale, 
  hoverScaleOut,
  buttonHover,
  buttonHoverOut,
  cardHover,
  cardHoverOut,
  slideInLeft,
  slideInRight,
  slideInUp,
  fadeIn,
  fadeInUp,
  textReveal,
  scrollReveal,
  formFieldAnimation,
  successBounce,
  errorShake
} from '../utils/gsapAnimations';

export const useGSAP = () => {
  const elementRef = useRef(null);

  // Page entrance animation
  const animatePageEntrance = () => {
    if (elementRef.current) {
      pageEntrance(elementRef.current);
    }
  };

  // Stagger animation for lists
  const animateStagger = (stagger = 0.1) => {
    if (elementRef.current) {
      const children = elementRef.current.children;
      staggerAnimation(children, stagger);
    }
  };

  // Hover animations
  const addHoverScale = () => {
    if (elementRef.current) {
      const element = elementRef.current;
      element.addEventListener('mouseenter', () => hoverScale(element));
      element.addEventListener('mouseleave', () => hoverScaleOut(element));
    }
  };

  // Button hover effects
  const addButtonHover = () => {
    if (elementRef.current) {
      const element = elementRef.current;
      element.addEventListener('mouseenter', () => buttonHover(element));
      element.addEventListener('mouseleave', () => buttonHoverOut(element));
    }
  };

  // Card hover effects
  const addCardHover = () => {
    if (elementRef.current) {
      const element = elementRef.current;
      element.addEventListener('mouseenter', () => cardHover(element));
      element.addEventListener('mouseleave', () => cardHoverOut(element));
    }
  };

  // Slide animations
  const animateSlideInLeft = () => {
    if (elementRef.current) {
      slideInLeft(elementRef.current);
    }
  };

  const animateSlideInRight = () => {
    if (elementRef.current) {
      slideInRight(elementRef.current);
    }
  };

  const animateSlideInUp = () => {
    if (elementRef.current) {
      slideInUp(elementRef.current);
    }
  };

  // Fade animations
  const animateFadeIn = () => {
    if (elementRef.current) {
      fadeIn(elementRef.current);
    }
  };

  const animateFadeInUp = () => {
    if (elementRef.current) {
      fadeInUp(elementRef.current);
    }
  };

  // Text animations
  const animateTextReveal = () => {
    if (elementRef.current) {
      textReveal(elementRef.current);
    }
  };

  // Scroll-triggered animations
  const animateScrollReveal = (trigger) => {
    if (elementRef.current) {
      scrollReveal(elementRef.current, trigger);
    }
  };

  // Form animations
  const animateFormField = () => {
    if (elementRef.current) {
      formFieldAnimation(elementRef.current);
    }
  };

  // Success/Error animations
  const animateSuccess = () => {
    if (elementRef.current) {
      successBounce(elementRef.current);
    }
  };

  const animateError = () => {
    if (elementRef.current) {
      errorShake(elementRef.current);
    }
  };

  // Custom animation
  const animate = (animation) => {
    if (elementRef.current) {
      animation(elementRef.current);
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (elementRef.current) {
      gsap.killTweensOf(elementRef.current);
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return {
    elementRef,
    animatePageEntrance,
    animateStagger,
    addHoverScale,
    addButtonHover,
    addCardHover,
    animateSlideInLeft,
    animateSlideInRight,
    animateSlideInUp,
    animateFadeIn,
    animateFadeInUp,
    animateTextReveal,
    animateScrollReveal,
    animateFormField,
    animateSuccess,
    animateError,
    animate,
    cleanup
  };
}; 