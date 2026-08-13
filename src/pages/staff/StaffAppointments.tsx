import React, { useState, useEffect } from 'react'
import { CalendarDays, CarFront, Phone, Clock, User, CheckCircle2, PlayCircle, LogOut, Eye, X, QrCode, Search } from 'lucide-react'
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
  const [searchType, setSearchType] = useState<'phone' | 'plate'>('phone')
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      if (searchPhone.trim()) {
        const queryStr = searchPhone.trim()
        let response
        if (searchType === 'phone') {
          response = await bookingService.getBookingHistory(queryStr)
        } else {
          response = await bookingService.getBookingByLicensePlate(queryStr)
        }

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
          setBookings(mapped.sort((a, b) => b.bookingId - a.bookingId))
        }
      } else {
        const response = await staffService.getTodayBookings()
        if (response && Array.isArray(response)) {
          setBookings([...response].sort((a, b) => b.bookingId - a.bookingId))
        } else if (response && (response as any).data && Array.isArray((response as any).data)) {
          // Fallback in case the interceptor doesn't unwrap the nested data
          setBookings([...(response as any).data].sort((a: any, b: any) => b.bookingId - a.bookingId))
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

  const handleScanSuccess = async (qrCode: string) => {
    setIsScannerOpen(false)
    setIsLoading(true)
    try {
      const res = await bookingService.getBookingByQrCode(qrCode)
      if (res.success && res.data) {
        setBookingDetail(res.data)
        setSelectedBookingId(res.data.bookingId)
        setIsModalOpen(true)
        toast.success('Quét mã thành công!')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.Message || 'Mã QR không hợp lệ hoặc lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  // Effect to initialize QR Scanner when modal opens
  useEffect(() => {
    if (isScannerOpen) {
      let scanner: any = null;
      // dynamic import to avoid SSR issues if any, and only load when needed
      import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
        scanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        )
        scanner.render(
          (decodedText: string) => {
            if (scanner) {
              scanner.clear()
            }
            handleScanSuccess(decodedText)
          },
          (error: any) => {
            // ignore continuous scanning errors
          }
        )
      })

      return () => {
        if (scanner) {
          scanner.clear().catch((e: any) => console.error(e))
        }
      }
    }
  }, [isScannerOpen])

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
    { key: 'Confirmed', label: 'Đã xác nhận' },
    { key: 'Checkin', label: 'Đã nhận xe' },
    { key: 'Washing', label: 'Đang rửa' },
    { key: 'Washed', label: 'Đã rửa xong' },
    { key: 'Payment', label: 'Thanh toán' },
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
    if (status === 'Pending') return -1;
    if (status === 'Confirmed') return 1; // Đã nhận xe là Active, Đã xác nhận sẽ có dấu tick
    if (status === 'Washing') return 2; // Đang rửa là Active
    if (status === 'CheckedOut') return 5; // Hoàn thành
    return -1;
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
          <form onSubmit={handleSearch} className="flex gap-2 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'phone' | 'plate')}
              className="bg-transparent text-sm font-medium text-slate-600 outline-none px-2 cursor-pointer border-r border-slate-200"
            >
              <option value="phone">SĐT</option>
              <option value="plate">Biển số</option>
            </select>
            <input 
              type="text" 
              placeholder={searchType === 'phone' ? "Nhập số điện thoại..." : "Nhập biển số xe..."}
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="px-2 py-1.5 w-32 md:w-40 text-sm font-medium text-slate-700 outline-none bg-transparent"
            />
            <button 
              type="submit"
              className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition-colors flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
            {searchPhone && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors text-sm"
              >
                Xóa
              </button>
            )}
          </form>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline">Quét QR</span>
          </button>
          <button 
            onClick={() => {
              setSearchPhone('')
              fetchBookings()
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-all text-sm h-full"
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
                      <span className="text-lg font-bold text-slate-700">{booking.bookingId}</span>
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
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-slate-800 text-base">{bookingDetail.serviceName}</span>
                      {bookingDetail.originalPrice != null && (
                        <span className="font-semibold text-slate-700 text-base">
                          {bookingDetail.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                    {bookingDetail.addOns && bookingDetail.addOns.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-emerald-500">
                        <span className="text-xs text-slate-500 block mb-1">Dịch vụ tặng kèm / Add-on:</span>
                        {bookingDetail.addOns.map((addon: any) => (
                          <div key={addon.bookingAddOnId} className="font-semibold text-emerald-600 text-sm">
                            + {addon.serviceName} 
                            {addon.finalPrice === 0 ? ' (Miễn phí)' : ` (${addon.finalPrice.toLocaleString('vi-VN')} đ)`}
                          </div>
                        ))}
                      </div>
                    )}
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

      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-600" />
                Quét Mã Khách Hàng
              </h3>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 relative">
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-slate-700 bg-black"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
