import axiosClient from '../api/axiosClient';
import { BookingResponseDTO } from './bookingService';

// ─── Query Params ────────────────────────────────────────────────────────────
export interface BookingReportQuery {
  /** Lọc theo 1 ngày duy nhất (YYYY-MM-DD). Nếu dùng thì startDate/endDate bị bỏ qua */
  date?: string;
  /** Từ ngày (YYYY-MM-DD) */
  startDate?: string;
  /** Đến ngày (YYYY-MM-DD) */
  endDate?: string;
  /** Lọc theo trạng thái: Pending | Confirmed | Deposited | Washing | Completed | CheckedOut | Cancelled | NoShow */
  status?: string;
  /** Lọc theo loại xe: Car | Motorcycle | Truck | ... */
  vehicleType?: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────
export interface BookingReportData {
  startDate: string;                        // YYYY-MM-DD
  endDate: string;                          // YYYY-MM-DD
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  inProgressOrDepositedBookings: number;
  totalRevenue: number;                     // completedRevenue + depositRevenue
  completedRevenue: number;                 // từ booking Completed / CheckedOut
  depositRevenue: number;                   // từ tiền cọc booking chưa hoàn thành
  bookings: BookingResponseDTO[];           // danh sách chi tiết
}

export interface BookingReportResponse {
  success: boolean;
  data: BookingReportData;
}

// ─── Daily Breakdown (tính ở FE từ bookings[]) ───────────────────────────────
export interface DailyRevenueData {
  dateStr: string;          // YYYY-MM-DD
  formattedDate: string;    // DD/MM/YYYY
  completedRevenue: number;
  depositRevenue: number;
  totalRevenue: number;
  discountAmount: number;   // originalPrice - finalPrice của các booking hoàn thành
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  inProgressBookings: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export const revenueService = {
  /**
   * Lấy báo cáo doanh thu theo khoảng thời gian.
   * Yêu cầu role Admin hoặc Staff.
   */
  getBookingReport: (query: BookingReportQuery): Promise<BookingReportResponse> => {
    const params: Record<string, string> = {};
    if (query.date) params['date'] = query.date;
    if (query.startDate) params['startDate'] = query.startDate;
    if (query.endDate) params['endDate'] = query.endDate;
    if (query.status) params['status'] = query.status;
    if (query.vehicleType) params['vehicleType'] = query.vehicleType;
    return axiosClient.get('/Booking/report', { params });
  },
};

// ─── Utility: group bookings[] theo ngày để vẽ chart ────────────────────────
export function groupBookingsByDay(bookings: BookingResponseDTO[]): DailyRevenueData[] {
  const map = new Map<string, DailyRevenueData>();

  for (const b of bookings) {
    const dateStr = b.bookingDate?.slice(0, 10) ?? '';
    if (!dateStr) continue;

    if (!map.has(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      map.set(dateStr, {
        dateStr,
        formattedDate: `${d}/${m}/${y}`,
        completedRevenue: 0,
        depositRevenue: 0,
        totalRevenue: 0,
        discountAmount: 0,
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        inProgressBookings: 0,
      });
    }

    const day = map.get(dateStr)!;
    const isCompleted = b.status === 'Completed' || b.status === 'CheckedOut';
    const isCancelled = b.status === 'Cancelled' || b.status === 'NoShow';

    day.totalBookings++;

    if (isCompleted) {
      const revenue = b.finalPrice ?? b.originalPrice ?? 0;
      const discount = Math.max(0, (b.originalPrice ?? 0) - (b.finalPrice ?? b.originalPrice ?? 0));
      day.completedRevenue += revenue;
      day.discountAmount += discount;
      day.completedBookings++;
    } else if (isCancelled) {
      day.cancelledBookings++;
    } else {
      // Pending | Confirmed | Deposited | Washing
      day.depositRevenue += b.depositAmount ?? 0;
      day.inProgressBookings++;
    }

    day.totalRevenue = day.completedRevenue + day.depositRevenue;
  }

  // Sắp xếp theo ngày tăng dần
  return Array.from(map.values()).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
}
