import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import heroManifest from "@/heroManifest.json";

export default function Demo() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  const stops = heroManifest.stops;
  const { width, height, kEffectiveMax: maxK } = heroManifest;

  const currentK = useTransform(scrollYProgress, (progress) => {
    if (stops.length === 0) return 1;
    const index = Math.min(
      stops.length - 1,
      Math.max(0, Math.round(progress * (stops.length - 1))),
    );
    return stops[index]?.k ?? 1;
  });

  const headerAnimationProgress = useTransform(
    scrollYProgress,
    [0, 0.08],
    [0, 1],
  );
  const headerX = useTransform(
    headerAnimationProgress,
    (p) => `calc(-${(1 - p) * 50}% - ${p * 50}vw + ${p * 2}rem)`,
  );
  const headerY = useTransform(
    headerAnimationProgress,
    (p) => `calc(${p * 4}rem)`,
  );
  const headerScale = useTransform(
    headerAnimationProgress,
    (p) => 1 - p * 0.25,
  );

  const imageY = useTransform(headerAnimationProgress, [0, 1], ["12vh", "0vh"]);
  const imageScale = useTransform(headerAnimationProgress, [0, 1], [0.9, 1]);

  return (
    <section
      ref={scrollContainerRef}
      className="relative bg-neutral-950"
      style={{ height: `${Math.max(300, stops.length * 55)}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <KBackdrop scrollYProgress={scrollYProgress} currentK={currentK} />

        <motion.div
          className="absolute top-12 left-1/2 z-20 flex flex-col items-center whitespace-nowrap md:top-0 md:items-start"
          style={{
            x: headerX,
            y: headerY,
            scale: headerScale,
            transformOrigin: "top left",
          }}
        >
          <h2 className="font-display text-3xl text-neutral-100 drop-shadow-lg md:text-5xl">
            Scroll to reconstruct
          </h2>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-accent/70 font-mono text-xs tracking-[0.35em] uppercase drop-shadow-md">
              Singular values
            </span>
            <motion.span className="border-accent/20 bg-accent/5/80 text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm backdrop-blur-sm">
              k = <motion.span>{currentK}</motion.span>
              <span className="text-accent/40">/ {maxK}</span>
            </motion.span>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 flex w-full items-center justify-center"
          style={{ y: imageY, scale: imageScale }}
        >
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
                index={i}
                total={stops.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function KBackdrop({
  scrollYProgress,
  currentK,
}: {
  scrollYProgress: MotionValue<number>;
  currentK: MotionValue<number>;
}) {
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
      <motion.span>{currentK}</motion.span>
    </motion.span>
  );
}

function ImageLayer({
  src,
  index,
  total,
  scrollYProgress,
}: {
  src: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const fadeStart = index / total;
  const fadeEnd = (index + 0.8) / total;

  const opacity = useTransform(scrollYProgress, (progress) => {
    if (index === 0) return 1;
    if (progress <= fadeStart) return 0;
    if (progress >= fadeEnd) return 1;
    return (progress - fadeStart) / (fadeEnd - fadeStart);
  });

  const blurAmount = Math.max(0, 3 - (index / Math.max(1, total - 1)) * 3);

  return (
    <motion.img
      src={src}
      alt="SVD reconstruction layer"
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
