import { useEffect } from 'react';
import { signalRService } from '../services/signalrService';

export function useSignalR(onScanNotification?: (data: { message: string; plate: string }) => void) {
  useEffect(() => {
    signalRService.startConnection();

    let cleanupScan: (() => void) | undefined;
    if (onScanNotification) {
      cleanupScan = signalRService.onScanNotification(onScanNotification);
    }

    return () => {
      if (cleanupScan) {
        cleanupScan();
      }
    };
  }, [onScanNotification]);
}
