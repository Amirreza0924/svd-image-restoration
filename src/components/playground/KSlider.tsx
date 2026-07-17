export default function KSlider({
  index,
  totalStops,
  currentK,
  maxK,
  onChange,
}: {
  index: number;
  totalStops: number;
  currentK: number;
  maxK: number;
  onChange: (index: number) => void;
}) {
  const progress = totalStops > 1 ? (index - 1) / (totalStops - 1) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-accent/70 font-mono text-xs tracking-[0.35em] uppercase">
          Singular values (k)
        </span>
        <span className="border-accent/20 bg-accent/5 text-accent inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-sm tabular-nums shadow-[0_0_12px_var(--color-accent-soft)]">
          {currentK}
          <span className="text-accent/40">/ {maxK}</span>
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={1}
          max={totalStops}
          value={index}
          onChange={(e) => onChange(Number(e.target.value))}
          className="k-slider-input peer relative z-10 h-8 w-full cursor-pointer touch-none appearance-none bg-transparent"
        />

        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-neutral-800 shadow-inner">
          <div
            className="from-accent/60 to-accent h-full rounded-full bg-linear-to-r shadow-[0_0_10px_var(--color-accent-soft)] transition-[width] duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-[10px] tracking-wider text-neutral-600 uppercase">
        <span>High compression</span>
        <span>Original quality</span>
      </div>
    </div>
  );
}
