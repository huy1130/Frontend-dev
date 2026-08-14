export interface PlateScanEventPayload {
  plateNumber: string;
  bookingId?: number;
  customerName?: string;
  serviceName?: string;
  timestamp: number;
}

const CHANNEL_NAME = 'hybridwash_plate_scan_channel';
const LOCAL_STORAGE_KEY = 'hybridwash_latest_plate_scan';
const DISMISSED_KEY = 'hybridwash_dismissed_plate_scan_ts';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported or disabled', e);
  }
}

export const dismissPlateScan = (timestamp?: number) => {
  if (typeof window === 'undefined') return;
  try {
    if (timestamp) {
      localStorage.setItem(DISMISSED_KEY, timestamp.toString());
    } else {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed: PlateScanEventPayload = JSON.parse(raw);
        if (parsed?.timestamp) {
          localStorage.setItem(DISMISSED_KEY, parsed.timestamp.toString());
        }
      }
    }
  } catch (e) {
    console.warn('Failed to dismiss plate scan', e);
  }
};

export const broadcastPlateScan = (payload: Omit<PlateScanEventPayload, 'timestamp'>) => {
  const fullPayload: PlateScanEventPayload = {
    ...payload,
    timestamp: Date.now(),
  };

  // Always clear any previous dismissal state when a new plate scan is broadcast
  try {
    localStorage.removeItem(DISMISSED_KEY);
  } catch (e) {
    console.warn('Failed to remove DISMISSED_KEY', e);
  }

  // 1. Broadcast via BroadcastChannel (Same Browser, Cross-Tab instant)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(fullPayload);
    } catch (e) {
      console.warn('Failed to postMessage via BroadcastChannel', e);
    }
  }

  // 2. Broadcast via LocalStorage event (Fallback & Cross-tab compatibility)
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullPayload));
  } catch (e) {
    console.warn('Failed to set localStorage item', e);
  }
};

export const getLatestPlateScan = (maxAgeMs: number = 30 * 60 * 1000): PlateScanEventPayload | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed: PlateScanEventPayload = JSON.parse(raw);
    const dismissedTs = localStorage.getItem(DISMISSED_KEY);

    if (dismissedTs && parsed?.timestamp && parsed.timestamp.toString() === dismissedTs) {
      return null; // Notification was already dismissed by user
    }

    if (parsed && parsed.plateNumber && (Date.now() - parsed.timestamp) < maxAgeMs) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to get latest plate scan', e);
  }
  return null;
};

let lastProcessedTimestamp = 0;

export const subscribePlateScan = (onPlateScanned: (event: PlateScanEventPayload) => void) => {
  if (typeof window === 'undefined') return () => {};

  const processEvent = (event: PlateScanEventPayload) => {
    if (!event || !event.plateNumber || !event.timestamp) return;
    if (event.timestamp === lastProcessedTimestamp) return; // Deduplicate dual triggers (BroadcastChannel + LocalStorage)
    lastProcessedTimestamp = event.timestamp;
    onPlateScanned(event);
  };

  // Listener 1: BroadcastChannel
  const handleMessage = (e: MessageEvent) => {
    if (e.data) {
      processEvent(e.data as PlateScanEventPayload);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleMessage);
  }

  // Listener 2: LocalStorage Event Listener
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed) {
          processEvent(parsed as PlateScanEventPayload);
        }
      } catch (err) {
        console.error('Error parsing storage event', err);
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  // Return unsubscribe function
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
  };
};
