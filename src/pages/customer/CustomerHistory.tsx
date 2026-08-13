import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  History,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Car,
  Tag,
  QrCode
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'

import { bookingService, BookingResponseDTO } from '../../services/bookingService'
import { promotionService } from '../../services/promotionService'
import { loyaltyService } from '../../services/loyaltyService'
import { toast } from 'sonner'

export default function CustomerHistory() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Completed' | 'Cancelled'>('all')
  const [historyData, setHistoryData] = useState<BookingResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDTO | null>(null)
  const [promotionsMap, setPromotionsMap] = useState<Record<number, string>>({})
  const [redemptionsMap, setRedemptionsMap] = useState<Record<number, string>>({})

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const phoneNumber = localStorage.getItem('phoneNumber')

        if (phoneNumber) {
          try {
            const [historyRes, publicPromosRes, eligiblePromosRes, redemptionsRes] = await Promise.all([
              bookingService.getBookingHistory(phoneNumber),
              promotionService.getPublicPromotions().catch(() => []),
              promotionService.getEligiblePromotions().catch(() => []),
              loyaltyService.getMyRedemptions().catch(() => [])
            ])

            if (historyRes && historyRes.data) {
              const sorted = historyRes.data.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
              setHistoryData(sorted)
            }

            const promoMap: Record<number, string> = {}
            if (Array.isArray(publicPromosRes)) {
              publicPromosRes.forEach(p => promoMap[p.promotionId] = p.promoName)
            }
            if (Array.isArray(eligiblePromosRes)) {
              eligiblePromosRes.forEach(p => promoMap[p.promotionId] = p.promoName)
            }
            setPromotionsMap(promoMap)

            const redemptionMap: Record<number, string> = {}
            if (Array.isArray(redemptionsRes)) {
              redemptionsRes.forEach((r: any) => redemptionMap[r.redemptionId] = r.rewardName)
            }
            setRedemptionsMap(redemptionMap)
          } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Có lỗi xảy ra khi lấy dữ liệu.')
          }
        }
      } catch (error) {
        console.error('Error fetching history:', error)
        toast.error('Có lỗi xảy ra khi lấy lịch sử đặt lịch.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const filteredData = historyData.filter((item) => {
    if (filterStatus === 'all') return true
    return item.status === filterStatus
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <NavBar />

      <main className="flex-1 pt-28 pb-32 px-4 sm:px-6 max-w-4xl w-full mx-auto space-y-6">



        {/* Back Link */}
        <div className="mb-4">
          <Link to="/customer" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 font-semibold transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại trang chính</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2.5">
              <History className="w-6 h-6 text-orange-600" />
              <span>Lịch Sử Đặt Lịch & Dịch Vụ</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Theo dõi và quản lý tất cả các lần chăm sóc xe tại hệ thống HybridWash.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/customer/booking"
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đặt Lịch Dịch Vụ Mới</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl border border-slate-200 self-start w-fit">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'all'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            Tất Cả ({historyData.length})
          </button>
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'Pending'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            Chờ Xử Lý ({historyData.filter(i => i.status === 'Pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('Completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'Completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            Hoàn Thành ({historyData.filter(i => i.status === 'Completed').length})
          </button>
          <button
            onClick={() => setFilterStatus('Cancelled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'Cancelled'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            Đã Hủy ({historyData.filter(i => i.status === 'Cancelled').length})
          </button>
        </div>

        {/* Cards List */}
        <div className="space-y-3.5">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 font-medium">Đang tải dữ liệu...</div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 font-medium text-sm">Chưa có lịch sử dịch vụ nào thuộc danh mục này.</p>
            </div>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.bookingId}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-300 transition-all shadow-md shadow-slate-200/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                      Mã lịch hẹn -{item.bookingId}
                    </span>
                    {item.redemptionId && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Đổi thưởng
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                      <CalendarIcon className="w-3.5 h-3.5 text-orange-600" />
                      <span>{item.bookingDate ? new Date(item.bookingDate).toLocaleDateString('vi-VN') : ''} • {item.startTime?.substring(0, 5)}</span>
                    </div>
                  </div>

                  <div>
                    {item.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Chờ Xử Lý</span>
                      </span>
                    )}
                    {item.status === 'Confirmed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Đã Xác Nhận</span>
                      </span>
                    )}
                    {item.status === 'Washing' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold">
                        <History className="w-3.5 h-3.5 text-orange-600" />
                        <span>Đang Rửa</span>
                      </span>
                    )}
                    {(item.status === 'Completed' || item.status === 'CheckedOut') && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã Hoàn Thành</span>
                      </span>
                    )}
                    {item.status === 'Cancelled' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Đã Hủy</span>
                      </span>
                    )}
                    {item.status === 'NoShow' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                        <span>Không Đến</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <Car className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-slate-500 font-medium mb-0.5">Dịch vụ đã đăng ký:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-xs sm:text-sm font-bold text-slate-900">
                          <li>{item.serviceName}</li>
                          {item.addOns && item.addOns.length > 0 && item.addOns.map(addon => (
                            <li key={addon.bookingAddOnId} className="text-orange-600 flex items-center gap-1">
                              <span>+ {addon.serviceName}</span>
                              {addon.finalPrice === 0 && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded-sm">Miễn phí</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.licensePlate} - {item.vehicleType}</span>
                    </div>
                  </div>

                  <div className="md:col-span-4 text-left md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                    <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">Tổng tiền thanh toán</span>
                    <span className="text-xl font-extrabold text-orange-600">
                      {item.finalPrice?.toLocaleString('vi-VN')}đ
                    </span>
                    <div className="mt-2.5 flex md:justify-end">
                      <button
                        onClick={() => setSelectedBooking(item)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                      >
                        Xem Chi Tiết
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </main>

      {/* Modal Xem Chi Tiết */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-orange-600" />
                Chi Tiết Lịch Đặt
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              
              {selectedBooking.qrCode && (
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border-2 border-dashed border-orange-200 mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-orange-600" />
                    Mã QR Check-in
                  </p>
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                    <QRCodeSVG 
                      value={selectedBooking.qrCode} 
                      size={140}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    Đưa mã này cho nhân viên để check-in nhanh
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mã Đặt Lịch</p>
                  <p className="text-sm font-bold text-slate-900">{selectedBooking.bookingId}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Trạng Thái</p>
                  <p className={`text-sm font-bold ${
                    ['Completed', 'CheckedOut'].includes(selectedBooking.status) ? 'text-emerald-600' 
                    : ['Pending', 'Confirmed', 'Washing'].includes(selectedBooking.status) ? 'text-blue-600' 
                    : 'text-rose-600'
                  }`}>
                    {selectedBooking.status === 'Completed' || selectedBooking.status === 'CheckedOut' ? 'Đã Hoàn Thành' 
                    : selectedBooking.status === 'Pending' ? 'Chờ Xử Lý' 
                    : selectedBooking.status === 'Confirmed' ? 'Đã Xác Nhận'
                    : selectedBooking.status === 'Washing' ? 'Đang Rửa'
                    : selectedBooking.status === 'NoShow' ? 'Không Đến'
                    : 'Đã Hủy'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ngày Đặt</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN') : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thời Gian</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedBooking.startTime?.substring(0, 5)} - {selectedBooking.endTime?.substring(0, 5)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phương Tiện</p>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedBooking.licensePlate} ({selectedBooking.vehicleType})
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dịch Vụ & Tặng Kèm</p>
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-slate-900">{selectedBooking.serviceName}</p>
                  {selectedBooking.originalPrice != null && (
                    <p className="text-sm font-bold text-slate-700">
                      {selectedBooking.originalPrice.toLocaleString('vi-VN')}đ
                    </p>
                  )}
                </div>
                {selectedBooking.addOns && selectedBooking.addOns.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedBooking.addOns.map(addon => (
                      <div key={addon.bookingAddOnId} className="flex justify-between items-center bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                        <span className="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
                          <PlusCircle className="w-3 h-3" />
                          {addon.serviceName}
                        </span>
                        <div className="text-right">
                          {addon.finalPrice === 0 ? (
                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Miễn phí</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-700">{addon.finalPrice.toLocaleString('vi-VN')}đ</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-start">
                <p className="text-sm font-bold text-slate-600 pt-1">Tổng Tiền</p>
                <div className="text-right">
                  {selectedBooking.originalPrice != null && selectedBooking.finalPrice != null && selectedBooking.originalPrice > selectedBooking.finalPrice ? (
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-slate-400 line-through mb-0.5">{selectedBooking.originalPrice.toLocaleString('vi-VN')}đ</p>
                      <p className="text-xl font-extrabold text-orange-600">{selectedBooking.finalPrice.toLocaleString('vi-VN')}đ</p>
                      <div className="mt-1.5 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-100">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">
                          {selectedBooking.redemptionId && redemptionsMap[selectedBooking.redemptionId]
                            ? redemptionsMap[selectedBooking.redemptionId]
                            : selectedBooking.promotionId && promotionsMap[selectedBooking.promotionId]
                              ? promotionsMap[selectedBooking.promotionId]
                              : ((selectedBooking as any).promotionName ? (selectedBooking as any).promotionName : 'Ưu đãi áp dụng')} 
                          (-{(selectedBooking.originalPrice - selectedBooking.finalPrice).toLocaleString('vi-VN')}đ)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xl font-extrabold text-orange-600">{selectedBooking.finalPrice?.toLocaleString('vi-VN')}đ</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
