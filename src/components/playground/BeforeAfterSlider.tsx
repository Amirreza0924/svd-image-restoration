import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Before/after image comparison using CSS clip-path.
 * The compressed image is stacked on top of the original — an HTML range
 * input controls a `clip-path: inset(...)` on the top layer so the user
 * can drag a vertical divider back and forth.
 */
export default function BeforeAfterSlider({
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
      className="group relative cursor-col-resize overflow-hidden rounded-2xl border border-white/8 select-none touch-none"
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
