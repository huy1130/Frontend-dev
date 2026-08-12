import React, { useState, useEffect } from 'react'
import { CalendarDays, CarFront, Phone, Clock, User, CheckCircle2, PlayCircle, LogOut, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import { staffService, TodayBookingDto } from '../../services/staffService'
import { bookingService } from '../../services/bookingService'

export default function StaffAppointments() {
  const [bookings, setBookings] = useState<TodayBookingDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [bookingDetail, setBookingDetail] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      if (searchPhone.trim()) {
        const response = await bookingService.getBookingHistory(searchPhone.trim())
        if (response.data) {
          const detailedBookings = await Promise.all(
            response.data.map(async (b: any) => {
              try {
                const detailResponse = await bookingService.getBookingDetail(b.bookingId);
                return { ...b, customerPhone: detailResponse.data?.customerPhone || 'N/A' };
              } catch (e) {
                return { ...b, customerPhone: 'N/A' };
              }
            })
          );
  
          const mapped: TodayBookingDto[] = detailedBookings.map((b: any) => ({
            bookingId: b.bookingId,
            customerName: b.customerName || 'Khách vãng lai',
            customerPhone: b.customerPhone, 
            licensePlate: b.licensePlate || 'N/A',
            vehicleType: b.vehicleType || 'N/A',
            status: b.status,
            slotId: b.slotId,
            serviceId: b.serviceId,
            bookingDate: b.bookingDate || b.startTime
          }))
          setBookings(mapped)
        }
      } else {
        const response = await staffService.getTodayBookings()
        if (response) {
          // Lấy thêm detail để có customerPhone
          const detailedBookings = await Promise.all(
            response.map(async (b) => {
              try {
                const detailResponse = await bookingService.getBookingDetail(b.bookingId);
                return { ...b, customerPhone: detailResponse.data?.customerPhone || 'N/A' };
              } catch (e) {
                return { ...b, customerPhone: 'N/A' };
              }
            })
          );
          setBookings(detailedBookings)
        }
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách lịch hẹn')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    if (!searchPhone) {
      fetchBookings()
    }
  }, [searchPhone])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBookings()
  }

  const handleClearSearch = () => {
    setSearchPhone('')
  }

  const handleStatusUpdate = async (bookingId: number, currentStatus: string) => {
    try {
      if (currentStatus === 'Pending') {
        await staffService.confirmBooking(bookingId)
        toast.success('Đã xác nhận lịch hẹn!')
      } else if (currentStatus === 'Confirmed') {
        await staffService.checkInBooking(bookingId)
        toast.success('Đã Check-in và bắt đầu rửa!')
      } else if (currentStatus === 'Washing') {
        await staffService.checkOutBooking(bookingId)
        toast.success('Giao xe thành công!')
      }
      fetchBookings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  // Helper cho Stepper
  const steps = [
    { key: 'Pending', label: 'Chờ xác nhận' },
    { key: 'Confirmed', label: 'Đã xác nhận' },
    { key: 'Washing', label: 'Đang rửa' },
    { key: 'CheckedOut', label: 'Hoàn thành' }
  ]

  const handleViewDetail = async (bookingId: number) => {
    try {
      const res = await bookingService.getBookingDetail(bookingId);
      if (res.success || res.data) {
        setBookingDetail(res.data);
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
      }
    } catch (error) {
      toast.error('Không thể tải chi tiết lịch hẹn');
    }
  }

  const getStepIndex = (status: string) => {
    return steps.findIndex(s => s.key === status)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Lịch Hẹn Của Bạn (Hôm Nay)</h1>
            <p className="text-sm font-medium text-slate-500">Xử lý tiến trình dịch vụ cho các xe được phân công</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nhập số ĐT khách..." 
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="px-4 py-2 w-40 md:w-48 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            {searchPhone && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors text-sm"
              >
                Xóa
              </button>
            )}
            <button 
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Tìm
            </button>
          </form>
          <button 
            onClick={() => {
              setSearchPhone('')
              fetchBookings()
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-all text-sm"
          >
            Làm mới
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 font-medium">Đang tải danh sách...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center">
          <CalendarDays className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium text-lg">Hôm nay chưa có lịch hẹn nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map(booking => {
            const currentStepIndex = getStepIndex(booking.status)
            const isCancelled = booking.status === 'Cancelled'
            const isNoShow = booking.status === 'No-Show'

            return (
              <div key={booking.bookingId} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                
                {/* Header Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                      <CarFront className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {booking.licensePlate} 
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 font-semibold uppercase">
                          {booking.vehicleType}
                        </span>
                      </h3>
                      <p className="text-slate-500 text-sm flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {booking.customerName}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {booking.customerPhone}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right flex flex-col items-end gap-2">
                    <div>
                      <p className="text-sm text-slate-500 mb-1 flex items-center gap-1 md:justify-end">
                        <Clock className="w-4 h-4" /> Thời gian
                      </p>
                      <p className="font-bold text-slate-800">
                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleViewDetail(booking.bookingId)}
                      className="px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Chi tiết
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Actions */}
                {isCancelled || isNoShow ? (
                  <div className="py-4 px-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center">
                    <p className="text-rose-600 font-bold flex items-center gap-2">
                      Đã hủy ({booking.status})
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between border-t border-slate-100 pt-6">
                    {/* Stepper */}
                    <div className="flex-1 max-w-2xl">
                      <div className="relative flex justify-between">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
                        <div 
                          className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                          style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' }}
                        ></div>
                        
                        {/* Steps */}
                        {steps.map((step, idx) => {
                          const isCompleted = idx < currentStepIndex
                          const isActive = idx === currentStepIndex
                          const isPending = idx > currentStepIndex

                          return (
                            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isCompleted ? 'bg-orange-500 border-orange-500 text-white' : 
                                isActive ? 'bg-white border-orange-500 text-orange-600 shadow-[0_0_0_4px_rgba(249,115,22,0.1)]' : 
                                'bg-white border-slate-200 text-slate-400'
                              }`}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                              </div>
                              <span className={`text-xs font-bold whitespace-nowrap ${
                                isActive ? 'text-orange-600' : 
                                isCompleted ? 'text-slate-800' : 'text-slate-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end min-w-[160px]">
                      {booking.status === 'Pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(booking.bookingId, 'Pending')}
                          className="w-full md:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                          <CheckCircle2 className="w-5 h-5" /> Xác nhận
                        </button>
                      )}
                      {booking.status === 'Confirmed' && (
                        <button 
                          onClick={() => handleStatusUpdate(booking.bookingId, 'Confirmed')}
                          className="w-full md:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        >
                          <PlayCircle className="w-5 h-5" /> Check-in Xe
                        </button>
                      )}
                      {booking.status === 'Washing' && (
                        <button 
                          onClick={() => handleStatusUpdate(booking.bookingId, 'Washing')}
                          className="w-full md:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                          <LogOut className="w-5 h-5" /> Bàn Giao Xe
                        </button>
                      )}
                      {booking.status === 'CheckedOut' && (
                        <div className="px-6 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 font-bold rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" /> Đã Hoàn Tất
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Booking Detail Modal */}
      {isModalOpen && bookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Chi Tiết Lịch Hẹn #{bookingDetail.bookingId}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Khách hàng */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-orange-500" /> Thông tin khách hàng</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Tên khách hàng:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.customerName || 'Khách vãng lai'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Số điện thoại:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.customerPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Biển số xe:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.licensePlate} ({bookingDetail.vehicleType || 'N/A'})</span>
                  </div>
                  {bookingDetail.customerTier && (
                    <div>
                      <span className="text-slate-500 block mb-1">Hạng thành viên:</span>
                      <span className="font-semibold text-orange-600">{bookingDetail.customerTier}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dịch vụ */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><CarFront className="w-4 h-4 text-blue-500" /> Dịch vụ & Thanh toán</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <span className="text-slate-500 block mb-1">Tên dịch vụ:</span>
                    <span className="font-semibold text-slate-800 text-base">{bookingDetail.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Giá gốc:</span>
                    <span className="font-semibold text-slate-600 line-through">{(bookingDetail.originalPrice || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Thành tiền:</span>
                    <span className="font-bold text-emerald-600 text-base">{(bookingDetail.finalPrice || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  {bookingDetail.promoCode && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block mb-1">Mã khuyến mãi áp dụng:</span>
                      <span className="font-semibold px-2 py-1 bg-rose-100 text-rose-600 rounded-md">{bookingDetail.promoCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lịch trình */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> Trạng thái & Lịch trình</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Ngày đặt:</span>
                    <span className="font-semibold text-slate-800">{new Date(bookingDetail.bookingDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Khung giờ:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.startTime} - {bookingDetail.endTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Trạng thái:</span>
                    <span className="font-semibold px-2 py-1 bg-slate-200 text-slate-700 rounded-md">{bookingDetail.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Nhân viên phụ trách:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.staffName || 'Chưa phân công'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
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
