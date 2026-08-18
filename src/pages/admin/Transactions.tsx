import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
  History,
  Search,
  Calendar,
  DollarSign,
  CheckCircle2,
  Car,
  Bike,
  Eye,
  Tag,
  X,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Receipt
} from 'lucide-react'
import { toast } from 'sonner'
import { bookingService, BookingResponseDTO } from '../../services/bookingService'

function formatDateForInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getTodayStr(): string {
  return formatDateForInput(new Date())
}

function getDateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return formatDateForInput(d)
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

export default function Transactions() {
  const today = getTodayStr()
  const [startDate, setStartDate] = useState<string>(getDateNDaysAgo(6))
  const [endDate, setEndDate] = useState<string>(today)

  const [bookings, setBookings] = useState<BookingResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL')

  const startDateInputRef = useRef<HTMLInputElement>(null)
  const endDateInputRef = useRef<HTMLInputElement>(null)

  // Transaction Detail Modal
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDTO | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const res = await bookingService.getBookingReport(startDate, endDate)
      const rawData: any = res?.data || res
      const items: BookingResponseDTO[] = Array.isArray(rawData)
        ? rawData
        : rawData?.bookings || rawData?.Bookings || rawData?.items || rawData?.data || []

      setBookings(items)
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử giao dịch:', error)
      toast.error('Không thể tải lịch sử giao dịch')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [startDate, endDate])

  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    if (endDate && val && endDate < val) {
      setEndDate(val)
    }
  }

  const handleEndDateChange = (val: string) => {
    if (startDate && val && val < startDate) {
      setEndDate(startDate)
    } else {
      setEndDate(val)
    }
  }

  const handleOpenDetail = async (item: BookingResponseDTO) => {
    setSelectedBooking(item)
    setIsDetailModalOpen(true)
    try {
      const detailRes = await bookingService.getBookingDetail(item.bookingId)
      const detail = detailRes?.data || detailRes
      if (detail) {
        setSelectedBooking((prev) => (prev ? { ...prev, ...detail } : detail))
      }
    } catch (e) {
      console.error('Lỗi lấy chi tiết giao dịch:', e)
    }
  }

  // Filter ONLY Completed / CheckedOut bookings
  const completedBookings = useMemo(() => {
    return bookings.filter((item) => {
      const st = (item.status || '').toLowerCase()
      const isCompleted = st === 'completed' || st === 'checkedout'
      if (!isCompleted) return false

      // Search query
      const searchLower = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !searchLower ||
        item.bookingId.toString().includes(searchLower) ||
        (item.customerName || '').toLowerCase().includes(searchLower) ||
        (item.licensePlate || '').toLowerCase().includes(searchLower) ||
        (item.serviceName || '').toLowerCase().includes(searchLower)

      // Vehicle filter
      const vType = (item.vehicleType || '').toLowerCase()
      const isBike = vType.includes('bike') || vType.includes('xe máy') || vType.includes('xemay')
      const matchesVehicle =
        vehicleFilter === 'ALL' ||
        (vehicleFilter === 'BIKE' && isBike) ||
        (vehicleFilter === 'CAR' && !isBike)

      return matchesSearch && matchesVehicle
    })
  }, [bookings, searchTerm, vehicleFilter])

  // Summary Metrics
  const totalCompletedRevenue = useMemo(() => {
    return completedBookings.reduce((sum, b) => sum + (b.finalPrice ?? b.originalPrice ?? 0), 0)
  }, [completedBookings])

  const totalDiscountGiven = useMemo(() => {
    return completedBookings.reduce((sum, b) => {
      const orig = b.originalPrice ?? 0
      const fin = b.finalPrice ?? orig
      return sum + Math.max(0, orig - fin)
    }, 0)
  }, [completedBookings])

  const bikeCount = useMemo(() => {
    return completedBookings.filter((b) => {
      const v = (b.vehicleType || '').toLowerCase()
      return v.includes('bike') || v.includes('xe máy')
    }).length
  }, [completedBookings])

  const carCount = useMemo(() => {
    return completedBookings.filter((b) => {
      const v = (b.vehicleType || '').toLowerCase()
      return !v.includes('bike') && !v.includes('xe máy')
    }).length
  }, [completedBookings])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <History className="w-3.5 h-3.5" />
            Nhật Ký Giao Dịch &amp; Doanh Thu Hoàn Tất
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lịch Sử Giao Dịch Quyết Toán
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Tra cứu toàn bộ lịch hẹn đã rửa xe và thanh toán hoàn tất (Completed / CheckedOut).
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-all cursor-pointer border border-slate-200/80 self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Tải Lại Dữ Liệu</span>
        </button>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh Thu Quyết Toán</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {totalCompletedRevenue.toLocaleString('vi-VN')} <span className="text-xs font-bold text-emerald-700">đ</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Thực thu từ các đơn hoàn thành</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số Đơn Hoàn Thành</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {completedBookings.length} <span className="text-xs font-bold text-slate-400">lượt</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Đã check-out thành công</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Ưu Đãi / Chiết Khấu</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {totalDiscountGiven > 0 ? `-${totalDiscountGiven.toLocaleString('vi-VN')}` : '0'} <span className="text-xs font-bold text-rose-700">đ</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Đã giảm qua Mã KM / Đổi thưởng</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phân Loại Phương Tiện</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1">
                <Car className="w-4 h-4 text-blue-600" /> {carCount} ô tô
              </span>
              <span className="text-slate-300 font-bold">|</span>
              <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1">
                <Bike className="w-4 h-4 text-amber-600" /> {bikeCount} xe máy
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Đã rửa xong</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100">
            <Car className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách, biển số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
            />
          </div>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 bg-slate-50 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tất cả phương tiện</option>
            <option value="BIKE">Xe Máy (Bike)</option>
            <option value="CAR">Ô Tô (Car)</option>
          </select>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
          <div
            onClick={() => startDateInputRef.current?.showPicker()}
            className="relative flex items-center gap-1.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400 rounded-xl px-3 py-2 cursor-pointer transition-all shadow-xs group shrink-0"
            title="Nhấp để chọn Từ ngày"
          >
            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
            <span className="text-[11px] font-bold text-slate-400">Từ:</span>
            <span className={`text-xs font-extrabold ${startDate ? 'text-slate-900' : 'text-slate-400'}`}>
              {startDate ? formatDisplayDate(startDate) : 'dd/mm/yyyy'}
            </span>
            <input
              ref={startDateInputRef}
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <span className="text-slate-300 text-xs font-bold shrink-0">-</span>

          <div
            onClick={() => endDateInputRef.current?.showPicker()}
            className="relative flex items-center gap-1.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400 rounded-xl px-3 py-2 cursor-pointer transition-all shadow-xs group shrink-0"
            title="Nhấp để chọn Đến ngày"
          >
            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
            <span className="text-[11px] font-bold text-slate-400">Đến:</span>
            <span className={`text-xs font-extrabold ${endDate ? 'text-slate-900' : 'text-slate-400'}`}>
              {endDate ? formatDisplayDate(endDate) : 'dd/mm/yyyy'}
            </span>
            <input
              ref={endDateInputRef}
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate('')
                setEndDate('')
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
              title="Xóa lọc ngày"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider">
                <th className="p-4 pl-6">Mã Đơn &amp; Ngày Hoàn Thành</th>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">Phương Tiện</th>
                <th className="p-4">Dịch Vụ Dùng</th>
                <th className="p-4">Giá Gốc</th>
                <th className="p-4">Giảm Giá</th>
                <th className="p-4">Thực Thu (Doanh Thu)</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 pr-6 text-center">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                      <span>Đang tải lịch sử giao dịch...</span>
                    </div>
                  </td>
                </tr>
              ) : completedBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400 font-bold">
                    Không tìm thấy giao dịch hoàn thành nào trong khoảng thời gian này.
                  </td>
                </tr>
              ) : (
                completedBookings.map((item) => {
                  const origPrice = item.originalPrice ?? 0
                  const finalPrice = item.finalPrice ?? origPrice
                  const discount = Math.max(0, origPrice - finalPrice)
                  const vType = (item.vehicleType || '').toLowerCase()
                  const isBike = vType.includes('bike') || vType.includes('xe máy')

                  return (
                    <tr key={item.bookingId} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 text-emerald-600" />
                          <span>#{item.bookingId}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {new Date(item.bookingDate).toLocaleDateString('vi-VN')} {item.startTime ? `(${item.startTime.substring(0, 5)})` : ''}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{item.customerName || 'Khách vãng lai'}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{item.customerPhone || 'N/A'}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{item.licensePlate}</div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md mt-0.5 ${isBike ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {isBike ? <Bike className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                          {item.vehicleType || 'Xe'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">{item.serviceName}</div>
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                            + {item.addOns.length} dịch vụ phụ
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-bold text-slate-600">
                        {origPrice.toLocaleString('vi-VN')}đ
                      </td>

                      <td className="p-4 font-bold text-rose-500">
                        {discount > 0 ? `-${discount.toLocaleString('vi-VN')}đ` : '—'}
                      </td>

                      <td className="p-4 font-black text-emerald-600 text-sm">
                        {finalPrice.toLocaleString('vi-VN')}đ
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã Hoàn Thành</span>
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-center">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Xem chi tiết giao dịch"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Chi Tiết Giao Dịch #{selectedBooking.bookingId}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ngày rửa: {new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')} {selectedBooking.startTime ? `• Khung giờ: ${selectedBooking.startTime.substring(0, 5)} - ${selectedBooking.endTime?.substring(0, 5)}` : ''}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              {/* Customer Info */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Thông Tin Khách Hàng &amp; Phương Tiện</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên khách:</span>
                  <span className="font-extrabold text-slate-900">{selectedBooking.customerName || 'Khách vãng lai'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-extrabold text-slate-900">{selectedBooking.customerPhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Biển số xe:</span>
                  <span className="font-extrabold text-slate-900">{selectedBooking.licensePlate} ({selectedBooking.vehicleType || 'Xe'})</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-emerald-50/60 p-4 rounded-xl space-y-2.5 border border-emerald-200/80">
                <div className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">Chi Tiết Doanh Thu Quyết Toán</div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Dịch vụ chính:</span>
                  <span className="font-extrabold text-slate-900">{selectedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Giá dịch vụ gốc:</span>
                  <span className="font-extrabold text-slate-900">{(selectedBooking.originalPrice ?? 0).toLocaleString('vi-VN')}đ</span>
                </div>

                {selectedBooking.depositAmount != null && selectedBooking.depositAmount > 0 && (
                  <div className="flex justify-between text-blue-700">
                    <span className="font-semibold">Tiền cọc đã thu trước qua PayOS:</span>
                    <span className="font-extrabold">{selectedBooking.depositAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-emerald-200/80 pt-2.5 text-sm">
                  <span className="font-bold text-slate-900">Doanh Thu Quyết Toán (Thực thu):</span>
                  <span className="font-black text-emerald-600 text-base">
                    {(selectedBooking.finalPrice ?? selectedBooking.originalPrice ?? 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
