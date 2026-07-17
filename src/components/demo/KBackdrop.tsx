import { motion, useTransform, type MotionValue } from "motion/react";
import type { SvdStop } from "@/engine";

/**
 * Giant hollow-outline number showing the current k value.
 * Stroke-width thickens as scroll progresses (image sharpens).
 */
export default function KBackdrop({
  scrollYProgress,
  stops,
}: {
  scrollYProgress: MotionValue<number>;
  stops: SvdStop[];
}) {
  const kValue = useTransform(scrollYProgress, (p) => {
    const index = Math.min(
      stops.length - 1,
      Math.max(0, Math.round(p * (stops.length - 1))),
    );
    return stops[index]?.k ?? 1;
  });

  const strokeWidth = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.8, 0.9],
    [0, 0.12, 0.12, 0],
  );

  return (
    <motion.span
      aria-hidden
      className="font-display pointer-events-none absolute inset-0 z-30 flex items-center justify-center leading-none select-none"
      style={{
        fontSize: "clamp(20rem, 45vw, 50rem)",
        WebkitTextStroke: useTransform(
          strokeWidth,
          (sw) => `${sw}px rgba(255,255,255,0.35)`,
        ),
        color: "transparent",
        opacity,
      }}
    >
      <motion.span>{kValue}</motion.span>
    </motion.span>
  );
}
