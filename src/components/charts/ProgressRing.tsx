import * as React from "react";
import { cn } from "@/lib/utils";

type ProgressColor = "primary" | "secondary" | "warning" | "danger";

export interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: ProgressColor;
  showLabel?: boolean;
  label?: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  trackClassName?: string;
  animate?: boolean;
}

const colorMap: Record<ProgressColor, string> = {
  primary: "url(#primaryGradient)",
  secondary: "url(#secondaryGradient)",
  warning: "url(#warningGradient)",
  danger: "url(#dangerGradient)",
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 140,
  strokeWidth = 12,
  color = "primary",
  showLabel = true,
  label,
  subtitle,
  className,
  trackClassName,
  animate = true,
}) => {
  const [animatedProgress, setAnimatedProgress] = React.useState(animate ? 0 : progress);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, animatedProgress));
  const dashOffset = circumference - (clampedProgress / 100) * circumference;

  React.useEffect(() => {
    if (!animate) {
      setAnimatedProgress(progress);
      return;
    }
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 50);
    return () => clearTimeout(timer);
  }, [progress, animate]);

  const center = size / 2;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c57a" />
            <stop offset="100%" stopColor="#16a361" />
          </linearGradient>
          <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#30bcff" />
            <stop offset="100%" stopColor="#06a0ef" />
          </linearGradient>
          <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffc020" />
            <stop offset="100%" stopColor="#f9a007" />
          </linearGradient>
          <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87174" />
            <stop offset="100%" stopColor="#ef4448" />
          </linearGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={cn("text-slate-100", trackClassName)}
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn(animate && "ring-progress")}
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {label ?? `${Math.round(clampedProgress)}%`}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div>
          )}
        </div>
      )}
    </div>
  );
};

ProgressRing.displayName = "ProgressRing";
