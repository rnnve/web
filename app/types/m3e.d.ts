import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "m3e-linear-progress-indicator": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        max?: number;
        mode?: "determinate" | "indeterminate" | "buffer" | "query";
        value?: number;
        variant?: "flat" | "wavy";
      };
    }
  }
}
