import { motion, useTransform, type MotionValue } from "motion/react";
import { easeOutExpo } from "@/lib/easing";

export default function RevealLines({
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
          <ScrollRevealLine
            key={i}
            line={line}
            progress={progress}
            inputStart={start + i * stagger}
          />
        ) : (
          <MountRevealLine key={i} line={line} delay={i * stagger} />
        ),
      )}
    </div>
  );
}

function ScrollRevealLine({
  line,
  progress,
  inputStart,
}: {
  line: string;
  progress: MotionValue<number>;
  inputStart: number;
}) {
  const inputEnd = inputStart + 0.4;
  const y = useTransform(progress, [inputStart, inputEnd], ["100%", "0%"], {
    ease: easeOutExpo,
  });
  const opacity = useTransform(progress, [inputStart, inputEnd], [0, 1], {
    ease: easeOutExpo,
  });

  return (
    <div className="overflow-hidden">
      <motion.p style={{ y, opacity }}>{line}</motion.p>
    </div>
  );
}

function MountRevealLine({ line, delay }: { line: string; delay: number }) {
  return (
    <div className="overflow-hidden">
      <motion.p
        initial={{ y: "100%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        transition={{ duration: 1, delay, ease: easeOutExpo }}
      >
        {line}
      </motion.p>
    </div>
  );
}
