"use client";

import { motion } from "framer-motion";
import { Zap, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface WaitingRoomProps {
  position?: number;
  estimatedWait?: number; // in seconds
  onRetry?: () => void;
}

export function WaitingRoom({ position = 12, estimatedWait = 30, onRetry }: WaitingRoomProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full mx-4 p-8 rounded-3xl border border-primary/20 bg-card shadow-2xl shadow-primary/10 text-center relative overflow-hidden"
      >
        {/* Decorative background pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse -z-10" />

        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 relative">
            <Zap className="w-8 h-8 text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 tracking-tight">Aurora Server is Busy</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          We've reached our temporary capacity limit (80%+ load). To ensure stability, we've added you to the virtual queue.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-foreground/5 border border-border/50 text-left">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Position</span>
            </div>
            <div className="text-2xl font-bold font-mono">#{position}</div>
          </div>
          <div className="p-4 rounded-2xl bg-foreground/5 border border-border/50 text-left">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Wait</span>
            </div>
            <div className="text-2xl font-bold font-mono">~{estimatedWait}s</div>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full py-6 text-base group" 
            rounded="xl"
            onClick={onRetry}
          >
            Check Status
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            Auto-refreshing in 10 seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
