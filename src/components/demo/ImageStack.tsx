import { motion, useTransform, type MotionValue } from "motion/react";
import type { SvdStop } from "@/engine";

/**
 * Stacks pre-rendered SVD reconstruction images on top of each other.
 */
export default function ImageStack({
  stops,
  scrollYProgress,
  width,
  height,
}: {
  stops: SvdStop[];
  scrollYProgress: MotionValue<number>;
  width: number;
  height: number;
}) {
  const total = stops.length;

  return (
    <div
      className="shadow-accent/5 relative overflow-hidden rounded-2xl border border-white/8 shadow-2xl"
      style={{
        width: "min(56rem, 85vw)",
        aspectRatio: `${width} / ${height}`,
      }}
    >
      {stops.map((stop, i) => (
        <ImageLayer
          key={stop.k}
          src={stop.src}
          k={stop.k}
          index={i}
          total={total}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}

function ImageLayer({
  src,
  k,
  index,
  total,
  scrollYProgress,
}: {
  src: string;
  k: number;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const fadeStart = index / total;
  const fadeEnd = (index + 0.8) / total;

  const opacity = useTransform(scrollYProgress, (p) => {
    if (index === 0) return 1;
    if (p <= fadeStart) return 0;
    if (p >= fadeEnd) return 1;
    return (p - fadeStart) / (fadeEnd - fadeStart);
  });

  const blurAmount = Math.max(0, 3 - (index / Math.max(1, total - 1)) * 3);

  return (
    <motion.img
      src={src}
      alt={`SVD reconstruction at k=${k}`}
      className="absolute inset-0 h-full w-full object-cover"
      style={{
        opacity,
        filter: blurAmount > 0.1 ? `blur(${blurAmount}px)` : undefined,
        zIndex: index,
      }}
      loading="eager"
    />
  );
}
