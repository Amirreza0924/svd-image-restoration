import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useSvdStack, type SvdStackState } from "@/engine";

export default function Playground() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [kIndex, setKIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const state = useSvdStack(file);

  const processFile = useCallback((f: File) => {
    setFile(f);
    setOriginalSrc(URL.createObjectURL(f));
    setKIndex(0);
  }, []);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
      setPendingFile(f);
      setShowMobileWarning(true);
      return;
    }
    
    processFile(f);
  }, [processFile]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const isDone = state.status === "done";
  const stops = isDone ? state.stops : [];
  const currentStop = stops[kIndex];

  return (
    <>
    
    <section className="relative bg-neutral-950 px-6 py-24 md:py-36">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-accent/70 font-mono text-xs tracking-[0.4em] uppercase">
          Interactive playground
        </p>
        <h2 className="font-display mt-4 text-4xl text-neutral-100 md:text-6xl">
          Your turn
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-neutral-500 md:text-lg">
          Upload your own image and scrub through singular values in real-time.
          Drag the divider to compare compressed vs. original.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-8 rounded-2xl border border-white/6 bg-neutral-900/50 p-6 backdrop-blur-sm">
          <div
            className={`group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragOver
                ? "border-accent/60 bg-accent/5"
                : "hover:border-accent/30 hover:bg-accent/5 border-white/10"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
          >
            <Upload
              size={28}
              className="group-hover:text-accent/80 text-neutral-500 transition-colors"
            />
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-300">
                Drop an image or click to browse
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                JPG, PNG — up to 5 MB
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleInputChange}
            />
          </div>

          {isDone && stops.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <KSlider
                index={kIndex + 1}
                totalStops={stops.length}
                currentK={currentStop?.k ?? 1}
                maxK={state.kEffectiveMax}
                onChange={(v) => setKIndex(v - 1)}
              />
            </motion.div>
          )}

          {file && (
            <p className="truncate font-mono text-xs text-neutral-600">
              {file.name}
            </p>
          )}
        </div>

        <div className="relative flex min-h-100 items-center justify-center overflow-hidden rounded-2xl border border-white/6 bg-black/40">
          <AnimatePresence mode="wait">
            {!file && (
              <motion.div
                key="empty"
                className="flex flex-col items-center gap-4 text-neutral-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ImageIcon size={64} strokeWidth={1} />
                <p className="font-mono text-sm">
                  Image preview will appear here
                </p>
              </motion.div>
            )}

            {(state.status === "idle" && file) ||
            state.status === "processing" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScanningLoader state={state} />
              </motion.div>
            ) : null}

            {state.status === "error" && (
              <motion.div
                key="error"
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="font-mono text-sm text-red-400">
                  Something went wrong
                </p>
                <p className="mt-2 max-w-sm text-xs text-neutral-600">
                  {state.message}
                </p>
              </motion.div>
            )}

            {isDone && originalSrc && currentStop && (
              <motion.div
                key="result"
                className="w-full p-4"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5 }}
              >
                <BeforeAfterSlider
                  compressedSrc={currentStop.src}
                  originalSrc={originalSrc}
                  alt={file?.name}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showMobileWarning && pendingFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl"
            >
              <h3 className="text-lg font-medium text-neutral-100">Performance Warning</h3>
              <p className="mt-2 text-sm text-neutral-400">
                SVD calculation is computationally heavy. On mobile devices, this might take a considerable amount of time. Consider using a Desktop for a smoother experience.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowMobileWarning(false);
                    setPendingFile(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-100 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowMobileWarning(false);
                    processFile(pendingFile);
                    setPendingFile(null);
                  }}
                  className="bg-accent text-neutral-950 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/90"
                >
                  Continue anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
    </>
  );
}

// #region ScanningLoader component
function ScanningLoader({ state }: { state: SvdStackState }) {
  const loaded = state.status === "processing" ? state.loaded : 0;
  const total = state.status === "processing" ? state.total : 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative aspect-square w-64 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 md:w-80">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_28px)] opacity-[0.06]" />
        <motion.div
          className="bg-accent absolute inset-x-0 h-1 shadow-[0_0_20px_var(--color-accent)]"
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="text-center">
        <p className="text-accent/80 font-mono text-xs tracking-[0.35em] uppercase">
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
// #endregion

// #region KSlider component
function KSlider({
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
// #endregion

// #region BeforeAfterSlider component
function BeforeAfterSlider({
  originalSrc,
  compressedSrc,
  alt,
}: {
  originalSrc: string;
  compressedSrc: string;
  alt?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 2));
      if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 2));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="group relative cursor-col-resize touch-none overflow-hidden rounded-2xl border border-white/8 select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      aria-label="Before/after comparison"
      aria-valuenow={Math.round(position)}
      tabIndex={0}
    >
      <img
        src={originalSrc}
        alt={alt ? `${alt} — original` : "Original image"}
        className="block w-full"
        draggable={false}
      />

      <img
        src={compressedSrc}
        alt={alt ? `${alt} — compressed` : "Compressed image"}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
        draggable={false}
      />

      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white/80 shadow-[0_0_8px_rgba(94,234,255,0.4)]"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-neutral-900/80 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 8L1 5.5V10.5L4 8Z" fill="white" fillOpacity="0.8" />
            <path d="M12 8L15 5.5V10.5L12 8Z" fill="white" fillOpacity="0.8" />
          </svg>
        </div>
      </div>

      <div className="text-accent/80 pointer-events-none absolute bottom-3 left-3 z-10 rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase backdrop-blur-sm">
        Compressed
      </div>
      <div className="pointer-events-none absolute right-3 bottom-3 z-10 rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] tracking-wider text-neutral-400 uppercase backdrop-blur-sm">
        Original
      </div>
    </div>
  );
}
// #endregion
