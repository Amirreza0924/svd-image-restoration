import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Activity, Satellite, Database } from "lucide-react";

import { type Industry, type ClipVariant } from "@/types";
import { CLIP_PATHS } from "@/constants";
import { easeOutExpo, easeInOutCubic } from "@/lib/easing";
import { splitIntoWords } from "@/utils/text";
import { cn } from "@/lib/cn";
import { useIsMobile } from "@/hooks/useMobile";

import MRIImage from "@/assets/medical_industry.webp";
import SatelliteImage from "@/assets/space_industry.webp";
import DatabaseImage from "@/assets/data-compression_field.webp";

const industries: Industry[] = [
  {
    index: "01",
    kicker: "Medical Imaging",
    title: "Signal, without the noise",
    description:
      "MRI and CT scans inherit noise straight from the acquisition hardware. SVD isolates the dominant anatomical structure from high-frequency artifacts, sharpening diagnoses without new equipment.",
    Icon: Activity,
    image: MRIImage,
    clipVariant: "slit",
  },
  {
    index: "02",
    kicker: "Satellite & Space",
    title: "Terabytes, distilled",
    description:
      "Orbital sensors transmit enormous imagery through bandwidth-starved channels. Truncated decomposition compresses telemetry-grade footage for transport while preserving what scientists actually need.",
    Icon: Satellite,
    image: SatelliteImage,
    clipVariant: "aperture",
  },
  {
    index: "03",
    kicker: "Data Compression",
    title: "Every photo is a matrix",
    description:
      "Strip an image down to its most significant singular values and you can rebuild a near-identical picture at a fraction of the storage footprint — the same trick behind modern compression.",
    Icon: Database,
    image: DatabaseImage,
    clipVariant: "diagonal",
  },
];

export default function Introduction() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const isMobile = useIsMobile();

  const scale = useTransform(heroProgress, [0, 1], [1, 0.22]);
  const top = useTransform(heroProgress, [0, 1], ["50%", "5.5%"]);
  const left = useTransform(heroProgress, [0, 1], ["50%", "6%"]);
  const kickerOpacity = useTransform(heroProgress, [0, 0.35], [1, 0]);

  const headerOpacityDesktop = useTransform(
    sectionProgress,
    [0, 0.92, 1],
    [1, 1, 0],
  );
  const headerOpacityMobile = useTransform(
    heroProgress,
    [0, 0.75, 1],
    [1, 0, 0],
  );
  const headerOpacity = isMobile ? headerOpacityMobile : headerOpacityDesktop;

  return (
    <div
      ref={sectionRef}
      className="relative bg-neutral-950 pb-64 text-neutral-100"
    >
      <motion.div
        style={{ top, left, scale, opacity: headerOpacity }}
        className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 select-none"
      >
        <span className="font-display text-[16vw] leading-none tracking-tight whitespace-nowrap md:text-[13vw]">
          A = UΣV
          <sup className="relative top-[-1.3em] left-[0.2em] text-[0.45em]">
            T
          </sup>
        </span>
      </motion.div>

      <section ref={heroRef} className="relative h-[160vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-end px-6 pb-24">
          <motion.p
            style={{ opacity: kickerOpacity }}
            className="text-accent/80 font-mono text-xs tracking-[0.4em] uppercase md:text-sm"
          >
            Singular Value Decomposition
          </motion.p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-40 md:pt-28">
        <RevealLines
          lines={["Where it matters"]}
          className="text-accent/80 font-mono text-xs tracking-[0.4em] uppercase"
        />
        <RevealLines
          lines={["Three domains.", "One decomposition."]}
          className="font-display mt-4 text-4xl leading-[1.05] md:text-6xl"
        />

        <div className="mt-28 flex flex-col gap-32 md:mt-40 md:gap-48">
          {industries.map((industry, i) => (
            <IndustryRow
              key={industry.index}
              industry={industry}
              reverse={i % 2 === 1}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// #region IndustryRow component
function IndustryRow({
  industry,
  reverse,
}: {
  industry: Industry;
  reverse: boolean;
}) {
  const { index, kicker, title, description, Icon, clipVariant, image } =
    industry;
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 0.8", "end 0.6"],
  });

  return (
    <div
      ref={rowRef}
      className={cn(
        "grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16",
        reverse && "md:[&>*:first-child]:order-2",
      )}
    >
      <ClipReveal variant={clipVariant} progress={scrollYProgress}>
        <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/6 bg-neutral-900">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_28px)] opacity-[0.08]" />
          <div className="from-accent/10 absolute inset-0 bg-radial via-transparent to-transparent" />
          {image ? (
            <img
              src={image}
              alt={kicker}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon
              size={72}
              strokeWidth={1}
              className="text-accent/80 drop-shadow-[0_0_24px_var(--color-accent-soft)]"
            />
          )}
          <span className="absolute -right-2 -bottom-6 font-mono text-[8rem] leading-none text-white/6">
            {index}
          </span>
        </div>
      </ClipReveal>

      <div>
        <RevealLines
          lines={[kicker]}
          progress={scrollYProgress}
          className="text-accent/80 font-mono text-xs tracking-[0.35em] uppercase"
        />
        <RevealLines
          lines={[title]}
          progress={scrollYProgress}
          start={0.05}
          className="font-display mt-3 text-3xl leading-tight md:text-4xl"
        />
        <RevealWords
          text={description}
          progress={scrollYProgress}
          start={0.15}
          className="mt-6 max-w-md text-base leading-relaxed text-neutral-400 md:text-lg"
        />
      </div>
    </div>
  );
}
// #endregion

// #region RevealLines component
function RevealLines({
  lines,
  className,
  progress,
  start = 0,
  stagger = 0.1,
}: {
  lines: string[];
  className?: string;
  progress?: MotionValue<number>;
  start?: number;
  stagger?: number;
}) {
  return (
    <div className={className}>
      {lines.map((line, i) =>
        progress ? (
          <ScrollRevealItem
            key={i}
            progress={progress}
            start={start + i * stagger}
            endOffset={0.4}
          >
            {line}
          </ScrollRevealItem>
        ) : (
          <div key={i} className="overflow-hidden">
            <motion.p
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 1,
                delay: i * stagger,
                ease: easeOutExpo,
              }}
            >
              {line}
            </motion.p>
          </div>
        ),
      )}
    </div>
  );
}
// #endregion

// #region RevealWords component
function RevealWords({
  text,
  className,
  progress,
  start = 0,
  stagger = 0.015,
}: {
  text: string;
  className?: string;
  progress: MotionValue<number>;
  start?: number;
  stagger?: number;
}) {
  return (
    <p className={className}>
      {splitIntoWords(text).map((word, i) => (
        <ScrollRevealItem
          key={i}
          progress={progress}
          start={start + i * stagger}
          endOffset={0.3}
          inline
        >
          {word}
        </ScrollRevealItem>
      ))}
    </p>
  );
}
// #endregion

// #region ScrollRevealItem
function ScrollRevealItem({
  children,
  progress,
  start,
  endOffset,
  inline = false,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  start: number;
  endOffset: number;
  inline?: boolean;
}) {
  const y = useTransform(progress, [start, start + endOffset], ["100%", "0%"], {
    ease: easeOutExpo,
  });
  const opacity = useTransform(progress, [start, start + endOffset], [0, 1], {
    ease: easeOutExpo,
  });

  if (inline) {
    return (
      <>
        <span className="inline-block overflow-hidden">
          <motion.span className="inline-block" style={{ y, opacity }}>
            {children}
          </motion.span>
        </span>{" "}
      </>
    );
  }

  return (
    <div className="overflow-hidden">
      <motion.p style={{ y, opacity }}>{children}</motion.p>
    </div>
  );
}
// #endregion

// #region ClipReveal
function ClipReveal({
  variant,
  progress,
  children,
}: {
  variant: ClipVariant;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const paths = CLIP_PATHS[variant];
  const clipPath = useTransform(
    progress,
    [0, 1],
    [paths.hidden, paths.visible],
    { ease: easeInOutCubic },
  );

  return (
    <motion.div className="overflow-hidden rounded-2xl" style={{ clipPath }}>
      {children}
    </motion.div>
  );
}
// #endregion
