import { useRef } from "react";
import { useScroll } from "motion/react";
import { cn } from "@/lib/cn";
import { type Industry } from "@/types";
import RevealLines from "./RevealLines";
import RevealWords from "./RevealWords";
import ClipReveal from "./ClipReveal";

export default function IndustryRow({
  industry,
  reverse,
}: {
  industry: Industry;
  reverse: boolean;
}) {
  const { index, kicker, title, description, Icon, clipVariant, image } =
    industry;

  const rowRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: rowProgress } = useScroll({
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
      <ClipReveal variant={clipVariant} progress={rowProgress}>
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
          progress={rowProgress}
          className="text-accent/80 font-mono text-xs tracking-[0.35em] uppercase"
        />
        <RevealLines
          lines={[title]}
          progress={rowProgress}
          start={0.05}
          className="font-display mt-3 text-3xl leading-tight md:text-4xl"
        />
        <RevealWords
          text={description}
          progress={rowProgress}
          start={0.15}
          className="mt-6 max-w-md text-base leading-relaxed text-neutral-400 md:text-lg"
        />
      </div>
    </div>
  );
}
