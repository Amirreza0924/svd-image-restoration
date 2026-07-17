import { motion, useTransform, type MotionValue } from "motion/react";
import { type ClipVariant } from "@/types";
import { CLIP_PATHS } from "@/constants";
import { easeInOutCubic } from "@/lib/easing";

export default function ClipReveal({
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
