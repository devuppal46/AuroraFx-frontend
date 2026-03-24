"use client";

/**
 * LEGACY FILE - Backward Compatibility Wrapper
 * Re-exports from useDualPipe.tsx
 */
export {
  DualPipeProvider as AWSWebSocketProvider,
  useAWSWebSocket,
  useLivePrice,
  useSimBars,
} from './useDualPipe';

export { useAWSWebSocket as default } from './useDualPipe';
