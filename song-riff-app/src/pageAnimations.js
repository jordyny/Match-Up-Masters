// src/pageAnimations.js

export const pageVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  in: {
    opacity: 1,
    filter: 'blur(0px)',
  },
  out: {
    opacity: 0,
    filter: 'blur(10px)',
  }
};

export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};