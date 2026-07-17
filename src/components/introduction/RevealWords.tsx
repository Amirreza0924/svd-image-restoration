import { motion, useTransform, type MotionValue } from "motion/react";
import { easeOutExpo } from "@/lib/easing";
import { splitIntoWords } from "@/utils/text";

export default function RevealWords({
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
  const words = splitIntoWords(text);

  return (
    <p className={className}>
      {words.map((word, i) => (
        <RevealWord
          key={i}
          word={word}
          progress={progress}
          inputStart={start + i * stagger}
        />
      ))}
    </p>
  );
}

function RevealWord({
  word,
  progress,
  inputStart,
}: {
  word: string;
  progress: MotionValue<number>;
  inputStart: number;
}) {
  const inputEnd = inputStart + 0.3;
  const y = useTransform(progress, [inputStart, inputEnd], ["100%", "0%"], {
    ease: easeOutExpo,
  });
  const opacity = useTransform(progress, [inputStart, inputEnd], [0, 1], {
    ease: easeOutExpo,
  });

  return (
    <>
      <span className="inline-block overflow-hidden">
        <motion.span className="inline-block" style={{ y, opacity }}>
          {word}
        </motion.span>
      </span>{" "}
    </>
  );
}
