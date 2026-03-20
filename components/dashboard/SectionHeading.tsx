import React from "react";

/**
 * SectionHeading – uniform section title style used across all dashboard sections.
 * Matches the typography patterns from the landing page.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const align_class = align === "center" ? "items-center text-center" : "items-start";

  return (
    <div className={`flex flex-col gap-1 ${align_class}`}>
      <span className="text-primary font-semibold tracking-[0.18em] text-[11px] uppercase">
        {eyebrow}
      </span>
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white/90 leading-snug">
        {title}
      </h2>
      {subtitle && (
        <p className="text-white/40 text-sm mt-0.5 max-w-md">{subtitle}</p>
      )}
    </div>
  );
}
