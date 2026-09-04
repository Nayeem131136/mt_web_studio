import React from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative cursor-pointer overflow-hidden whitespace-nowrap px-6 py-4 [background:var(--bg)] [border-radius:var(--radius)]",
          "transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.1)]",
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="absolute inset-0 overflow-visible [container-type:size]">
          <div className="absolute inset-0 h-[100cqh] animate-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="absolute inset-[-100%] w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        <div className="absolute [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
        <div className="pointer-events-none relative z-10 flex items-center justify-center gap-2 text-white/90 transition-colors duration-300 group-hover:text-white">
          {children}
        </div>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
