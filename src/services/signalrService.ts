import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';
import { broadcastPlateScan } from '../utils/plateNotification';
import { staffService } from './staffService';
import { bookingService } from './bookingService';

export interface ScanNotificationData {
  Message?: string;
  message?: string;
  Plate?: string;
  plate?: string;
}

type ScanNotificationHandler = (data: {
  message: string;
  plate: string;
  bookingId?: number;
  customerName?: string;
  serviceName?: string;
}) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private scanListeners: Set<ScanNotificationHandler> = new Set();
  private isConnecting: boolean = false;

  public async startConnection(): Promise<void> {
    if (this.connection && (this.connection.state === signalR.HubConnectionState.Connected || this.connection.state === signalR.HubConnectionState.Connecting)) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(import.meta.env.VITE_SIGNALR_URL || '/notificationHub', {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.on('ReceiveScanNotification', async (data: ScanNotificationData) => {
        const message = data?.Message || data?.message || 'Camera vừa quét được một biển số!';
        const plate = data?.Plate || data?.plate || '';

        if (!plate) return;

        let bookingId: number | undefined;
        let customerName: string | undefined;
        let serviceName: string | undefined;

        // Lookup matching booking on FE without modifying Backend
        try {
          const cleanPlate = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
          const todayRes = await staffService.getTodayBookings();
          const rawList = Array.isArray(todayRes) ? todayRes : (todayRes as any)?.data || [];
          
          // Filter candidate bookings matching license plate
          const candidates = rawList.filter((b: any) => {
            const bPlate = (b.licensePlate || b.plate || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
            return bPlate.length > 0 && (bPlate.includes(cleanPlate) || cleanPlate.includes(bPlate));
          });

          if (candidates.length > 0) {
            // Sort candidates descending by bookingId so newest bookings appear first
            candidates.sort((a: any, b: any) => (b.bookingId || b.id || 0) - (a.bookingId || a.id || 0));

            // Prioritize pending check-in bookings (Deposited, Confirmed, Pending) over in-progress or completed ones
            const pendingStatuses = ['Deposited', 'Confirmed', 'Pending'];
            const inProgressStatuses = ['Washing'];
            const pendingBooking = candidates.find((b: any) => pendingStatuses.includes(b.status));
            const inProgressBooking = candidates.find((b: any) => inProgressStatuses.includes(b.status));
            const selected = pendingBooking || inProgressBooking || [...candidates].sort((a: any, b: any) => (b.bookingId || b.id || 0) - (a.bookingId || a.id || 0))[0];

            bookingId = (selected as any).bookingId;
            customerName = (selected as any).customerName;
            serviceName = (selected as any).serviceName || (selected as any).vehicleType;
          } else {
            const byPlateRes = await bookingService.getBookingByLicensePlate(plate);
            const list = byPlateRes?.data || (Array.isArray(byPlateRes) ? byPlateRes : []);
            if (Array.isArray(list) && list.length > 0) {
              const pendingStatuses = ['Deposited', 'Confirmed', 'Pending'];
              const inProgressStatuses = ['Washing'];
              const pendingBooking = list.find((b: any) => pendingStatuses.includes(b.status));
              const inProgressBooking = list.find((b: any) => inProgressStatuses.includes(b.status));
              const selected = pendingBooking || inProgressBooking || [...list].sort((a: any, b: any) => (b.bookingId || b.id || 0) - (a.bookingId || a.id || 0))[0];

              bookingId = selected.bookingId;
              customerName = selected.customerName;
              serviceName = selected.serviceName || selected.vehicleType;
            }
          }
        } catch (e) {
          console.warn('Could not lookup booking for scanned plate', e);
        }

        // Broadcast to trigger Staff UI banner & cross-tab sync
        broadcastPlateScan({
          plateNumber: plate,
          bookingId,
          customerName,
          serviceName
        });

        // Check current role or route (Only show camera scan toast to Staff users)
        const userRole = (sessionStorage.getItem('userRole') || localStorage.getItem('userRole') || '').toLowerCase();
        const isStaff = userRole === 'staff' || window.location.pathname.startsWith('/staff');

        if (isStaff) {
          const details: string[] = [];
          if (bookingId) details.push(`Mã hẹn: #${bookingId}`);
          if (customerName) details.push(`Khách hàng: ${customerName}`);
          if (serviceName) details.push(`Dịch vụ: ${serviceName}`);

          const description = details.length > 0
            ? `Biển số: ${plate}\n${details.join(' • ')}`
            : `Biển số nhận diện: ${plate}`;

          toast.info(message, {
            description,
            duration: 6000,
          });
        }

        this.scanListeners.forEach(listener => {
          try {
            listener({ message, plate, bookingId, customerName, serviceName });
          } catch (e) {
            console.error('Error in scan notification listener', e);
          }
        });
      });

      this.connection.onreconnecting((error) => {
        console.warn('SignalR Reconnecting...', error);
      });

      this.connection.onreconnected((connectionId) => {
        console.log('SignalR Reconnected with ID:', connectionId);
      });

      await this.connection.start();
      console.log('SignalR NotificationHub connected successfully.');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
    } finally {
      this.isConnecting = false;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR NotificationHub disconnected.');
      } catch (err) {
        console.error('Error stopping SignalR connection', err);
      } finally {
        this.connection = null;
      }
    }
  }

  public onScanNotification(handler: ScanNotificationHandler): () => void {
    this.scanListeners.add(handler);
    return () => {
      this.scanListeners.delete(handler);
    };
  }

  public getConnectionState(): signalR.HubConnectionState | undefined {
    return this.connection?.state;
  }
}

export const signalRService = new SignalRService();
