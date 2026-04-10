"use client";

import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { WaitingRoom } from "./WaitingRoom";

export default function QueueManager({ children }: { children: React.ReactNode }) {
  const { isQueued, queueData, checkQueueStatus } = useUser();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isQueued) {
      // Auto-refresh queue status every 10 seconds
      interval = setInterval(() => {
        checkQueueStatus();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isQueued, checkQueueStatus]);

  if (isQueued) {
    return (
      <WaitingRoom 
        position={queueData?.activeSessions ? Math.max(1, queueData.activeSessions - queueData.maxSessions + 1) : 1}
        estimatedWait={queueData?.retryAfter || 30}
        onRetry={checkQueueStatus}
      />
    );
  }

  return <>{children}</>;
}
