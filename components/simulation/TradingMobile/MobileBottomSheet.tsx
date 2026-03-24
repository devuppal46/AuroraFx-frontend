"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, GripHorizontal } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function MobileBottomSheet({
  isOpen, onClose, title, children, maxHeight = "85vh", minHeight = "40vh", showHandle = true, showCloseButton = true, className,
}: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; maxHeight?: string; minHeight?: string; showHandle?: boolean; showCloseButton?: boolean; className?: string;
}) {
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  useEffect(() => {
    if (isOpen) { setTranslateY(0); document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => { setIsDragging(true); startYRef.current = e.touches[0].clientY; }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => { if (!isDragging) return; const deltaY = e.touches[0].clientY - startYRef.current; if (deltaY > 0) setTranslateY(deltaY); }, [isDragging]);
  const handleTouchEnd = useCallback(() => { setIsDragging(false); if (translateY > 100) onClose(); else setTranslateY(0); }, [translateY, onClose]);
  const handleMouseDown = useCallback((e: React.MouseEvent) => { setIsDragging(true); startYRef.current = e.clientY; }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => { if (!isDragging) return; const deltaY = e.clientY - startYRef.current; if (deltaY > 0) setTranslateY(deltaY); }, [isDragging]);
  const handleMouseUp = useCallback(() => { setIsDragging(false); if (translateY > 100) onClose(); else setTranslateY(0); }, [translateY, onClose]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300" onClick={onClose} aria-hidden="true" />
      <div ref={sheetRef} className={cn("fixed bottom-0 left-0 right-0 z-[70] bg-[#131722] rounded-t-2xl shadow-2xl border-t border-x border-[#2a2e39] flex flex-col transition-transform duration-200 ease-out", isDragging && "transition-none", className)} style={{ maxHeight, minHeight, transform: `translateY(${translateY}px)` }} role="dialog" aria-modal="true">
        {showHandle && (
          <div className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onMouseDown={handleMouseDown}>
            <GripHorizontal className="w-6 h-6 text-[#6a6d78]" />
          </div>
        )}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-[#2a2e39]">
          <h2 className="text-lg font-semibold text-[#d1d4dc]">{title}</h2>
          {showCloseButton && <button onClick={onClose} className="p-2 hover:bg-[#2a2e39] rounded-lg transition" aria-label="Close panel"><X className="w-5 h-5 text-[#6a6d78]" /></button>}
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>
      </div>
    </>
  );
}
