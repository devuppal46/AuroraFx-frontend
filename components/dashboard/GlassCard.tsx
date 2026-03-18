import React from "react";

export default function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
