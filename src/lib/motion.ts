import { tokens } from './tokens';

export const motionDur = tokens.motion;
export const ease = tokens.motion.ease;

export const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: motionDur.micro, ease } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: motionDur.micro, ease } },
  },
  slideUp: {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: motionDur.micro, ease } },
  },
};

export const dialogTransition = { duration: motionDur.dialog, ease };
