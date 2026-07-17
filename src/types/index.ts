import { type ComponentType } from "react";
import { type LucideProps } from "lucide-react";

export type ClipVariant = "slit" | "aperture" | "diagonal";

export type Industry = {
  index: string;
  title: string;
  kicker: string;
  description: string;
  Icon: ComponentType<LucideProps>;
  clipVariant: ClipVariant;
  image?: string;
};
