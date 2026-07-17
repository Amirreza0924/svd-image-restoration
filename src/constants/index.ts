import { type ClipVariant } from "../types";

export const CLIP_PATHS: Record<
  ClipVariant,
  { hidden: string; visible: string }
> = {
  slit: {
    hidden: "inset(48% 0% 48% 0%)",
    visible: "inset(0% 0% 0% 0%)",
  },

  aperture: {
    hidden: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    visible:
      "polygon(134% 50%, 92% 123%, 8% 123%, -34% 50%, 8% -23%, 92% -23%)",
  },

  diagonal: {
    hidden: "polygon(0 0, 0 0, 0 100%, 0 100%)",
    visible: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
  },
};
