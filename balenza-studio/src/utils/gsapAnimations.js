import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const fadeInUp = (element, options = {}) =>
  gsap.fromTo(
    element,
    { y: options.y ?? 40, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: options.duration ?? 0.7,
      ease: options.ease ?? "power3.out",
      delay: options.delay ?? 0,
      scrollTrigger: options.trigger
        ? { trigger: options.trigger, start: options.start ?? "top 75%" }
        : undefined,
    }
  );

export const staggerFadeIn = (elements, trigger, options = {}) =>
  gsap.fromTo(
    elements,
    { y: 30, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: options.duration ?? 0.6,
      stagger: options.stagger ?? 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger, start: options.start ?? "top 80%" },
    }
  );

export const lineReveal = (element, trigger) =>
  gsap.fromTo(
    element,
    { scaleX: 0, transformOrigin: "left center" },
    {
      scaleX: 1, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger, start: "top 75%" },
    }
  );

export const parallaxY = (element, amount = 40) =>
  gsap.to(element, {
    y: amount,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });