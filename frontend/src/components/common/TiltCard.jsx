import { useRef } from "react";
import { useReducedMotion } from "framer-motion";

const TiltCard = ({
  children,
  className = "",
  maxTilt = 6,
  perspective = 900,
  scale = 1.015,
  ...props
}) => {
  const cardRef = useRef(null);
  const frameRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const resetCard = () => {
    const card = cardRef.current;

    if (!card || prefersReducedMotion) {
      return;
    }

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  const handlePointerMove = (event) => {
    const card = cardRef.current;

    if (
      !card ||
      prefersReducedMotion ||
      event.pointerType !== "mouse"
    ) {
      return;
    }

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * maxTilt;
      const rotateX = ((centerY - y) / centerY) * maxTilt;

      card.style.transform = `
        perspective(${perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${scale})
      `;
    });
  };

  return (
    <div
      ref={cardRef}
      className={[
        "will-change-transform",
        "transition-transform duration-300 ease-out",
        className,
      ].join(" ")}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
      {...props}
    >
      {children}
    </div>
  );
};

export default TiltCard;