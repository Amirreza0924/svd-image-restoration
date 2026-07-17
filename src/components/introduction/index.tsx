import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Activity, Satellite, Database } from "lucide-react";
import { type Industry } from "@/types";
import IndustryRow from "./IndustryRow";
import RevealLines from "./RevealLines";

import MRIImage from "@/assets/medical_industry.webp";
import SatelliteImage from "@/assets/space_industry.webp";
import DatabaseImage from "@/assets/data-compression_field.webp";
import { useIsMobile } from "@/hooks/useMobile";

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
