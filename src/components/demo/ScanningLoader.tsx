import { motion } from "motion/react";
import type { SvdStackState } from "@/engine";

export default function ScanningLoader({ state }: { state: SvdStackState }) {
  const loaded = state.status === "processing" ? state.loaded : 0;
  const total = state.status === "processing" ? state.total : 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative aspect-square w-64 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 md:w-80">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_28px)] opacity-[0.06]" />
        <motion.div
          className="absolute inset-x-0 h-1 bg-accent shadow-[0_0_20px_var(--color-accent)]"
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/80">
          Decomposing image
        </p>
        <p className="mt-2 font-mono text-sm text-neutral-500">
          {total > 0
            ? `${loaded} / ${total} ranks reconstructed`
            : "Computing singular values…"}
        </p>
      </div>
    </div>
  );
}
