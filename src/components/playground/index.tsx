import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useSvdStack } from "@/engine";
import ScanningLoader from "../demo/ScanningLoader";
import BeforeAfterSlider from "./BeforeAfterSlider";
import KSlider from "./KSlider";

export default function Playground() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [kIndex, setKIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const state = useSvdStack(file, { maxDimension: 256 });

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setOriginalSrc(URL.createObjectURL(f));
    setKIndex(0);
  }, []);

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
    </section>
  );
}
