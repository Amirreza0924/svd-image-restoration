import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { SvdStackState } from "@/engine";
import heroManifest from "@/heroManifest.json";
import ImageStack from "./ImageStack";
import KBackdrop from "./KBackdrop";

export default function Demo() {
  const state: Extract<SvdStackState, { status: "done" }> = {
    status: "done",
    stops: heroManifest.stops,
    kEffectiveMax: heroManifest.kEffectiveMax,
    width: heroManifest.width,
    height: heroManifest.height,
  };

  return <DemoContent state={state} />;
}

function DemoContent({
  state,
}: {
  state: Extract<SvdStackState, { status: "done" }>;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  const { stops, width, height, kEffectiveMax: kMax } = state;

  const currentK = useTransform(scrollYProgress, (p) => {
    if (stops.length === 0) return 1;
    const idx = Math.min(
      stops.length - 1,
      Math.max(0, Math.round(p * (stops.length - 1))),
    );
    return stops[idx]?.k ?? 1;
  });

  const progress = useTransform(scrollYProgress, [0, 0.08], [0, 1]);

  const headerX = useTransform(
    progress,
    (p) => `calc(-${(1 - p) * 50}% - ${p * 50}vw + ${p * 2}rem)`,
  );
  const headerY = useTransform(progress, (p) => `calc(${p * 4}rem)`);
  const headerScale = useTransform(progress, (p) => 1 - p * 0.25); // 1 -> 0.75

  const imageY = useTransform(progress, [0, 1], ["12vh", "0vh"]);
  const imageScale = useTransform(progress, [0, 1], [0.9, 1]);

  return (
    <section
      ref={scrollContainerRef}
      className="relative bg-neutral-950"
      style={{ height: `${Math.max(300, stops.length * 55)}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <KBackdrop scrollYProgress={scrollYProgress} stops={stops} />

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
              <span className="text-accent/40">/ {kMax}</span>
            </motion.span>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 flex w-full items-center justify-center"
          style={{
            y: imageY,
            scale: imageScale,
          }}
        >
          <ImageStack
            stops={stops}
            scrollYProgress={scrollYProgress}
            width={width}
            height={height}
          />
        </motion.div>
      </div>
    </section>
  );
}
