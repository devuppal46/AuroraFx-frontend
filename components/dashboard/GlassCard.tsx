import React from "react";
import { cn } from "@/lib/utils";

export default function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4",
        "bg-white/5 backdrop-blur-md",
        "border border-white/10",
        "shadow-lg shadow-black/20",
        className
      )}
    >
      {children}
    </div>
  );
}
