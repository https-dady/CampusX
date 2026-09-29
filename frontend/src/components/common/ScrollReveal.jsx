import { motion, useReducedMotion } from "framer-motion";

const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  duration = 0.95,
  y = 42,
  amount = 0.18,
  once = true,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  const initial = prefersReducedMotion
    ? {
        opacity: 1,
      }
    : {
        opacity: 0,
        y,
      };

  const whileInView = {
    opacity: 1,
    y: 0,
  };

  const transition = prefersReducedMotion
    ? {
        duration: 0,
      }
    : {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      };

  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      viewport={{
        once,
        amount,
      }}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;