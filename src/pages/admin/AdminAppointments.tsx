import React, { useState, useEffect } from 'react'
import { CalendarDays, CarFront, Phone, Clock, User, CheckCircle2, PlayCircle, LogOut, Eye, X, QrCode, Check } from 'lucide-react'
import { toast } from 'sonner'
import { staffService, TodayBookingDto } from '../../services/staffService'

import { bookingService } from '../../services/bookingService'
import { getLocalDateString } from '../../utils/date'

export default function AdminAppointments() {
  const [bookings, setBookings] = useState<TodayBookingDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [bookingDetail, setBookingDetail] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [checkInBookingId, setCheckInBookingId] = useState<number | null>(null)
  const [incidentImage1, setIncidentImage1] = useState<File | null>(null)
  const [incidentImage2, setIncidentImage2] = useState<File | null>(null)
  const [staffNote, setStaffNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchPhone, setSearchPhone] = useState('')
  const [isScannerOpen, setIsScannerOpen] = useState(false)

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
            bookingDate: b.bookingDate,
            startTime: b.startTime,
            endTime: b.endTime
          }))
          setBookings(mapped.sort((a, b) => b.bookingId - a.bookingId))
        }
      } else {
        const dateStr = getLocalDateString(selectedDate)

        const response = await bookingService.getAdminBookings(dateStr)
        // Map Admin BookingDto to TodayBookingDto expected by the UI
        if (response.data && response.data.items) {
          // Lấy thêm detail để có customerPhone
          const detailedBookings = await Promise.all(
            response.data.items.map(async (b: any) => {
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
            bookingDate: b.bookingDate,
            startTime: b.startTime,
            endTime: b.endTime
          }))
          setBookings(mapped.sort((a, b) => b.bookingId - a.bookingId))
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
  }, [selectedDate])

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
    // fetchBookings will be called manually or we can just fetch here
    // But since state update is async, better to do it via useEffect or just call it directly after resetting
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
      import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
        scanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
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

  const handleAction = async (bookingId: number, adminStatus: string, successMsg: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, adminStatus)
      toast.success(successMsg)
      fetchBookings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkInBookingId) return
    if (!incidentImage1 || !incidentImage2) {
      toast.error('Vui lòng chụp đủ 2 ảnh tình trạng xe')
      return
    }
    if (!staffNote.trim()) {
      toast.error('Vui lòng nhập ghi chú tình trạng xe')
      return
    }
    
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('BookingId', checkInBookingId.toString())
      formData.append('IncidentImage1', incidentImage1)
      formData.append('IncidentImage2', incidentImage2)
      formData.append('StaffNote', staffNote)

      await staffService.checkInBooking(formData)
      toast.success('Đã Check-in và lưu ảnh kiểm tra xe!')
      setIsCheckInModalOpen(false)
      
      // Reset form
      setIncidentImage1(null)
      setIncidentImage2(null)
      setStaffNote('')
      setCheckInBookingId(null)
      
      fetchBookings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi Check-in')
    } finally {
      setIsSubmitting(false)
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
    switch (status) {
      case 'Pending': return -1;
      case 'Confirmed': return 0; // Chỉ kích hoạt bước "Đã xác nhận"
      case 'Checkin': return 1;
      case 'Washing': return 2;
      case 'Completed': return 3;
      case 'Payment': return 4;
      case 'CheckedOut': return 5;
      default: return -1;
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <CalendarDays className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Lịch Hẹn Khách Hàng</h2>
            <p className="text-slate-500 text-sm mt-1">Các lịch hẹn cần xử lý</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập số ĐT khách..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className={`px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 ${searchPhone ? 'w-56 md:w-64' : 'w-40 md:w-48'}`}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Tìm
            </button>
          </form>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline">Quét QR</span>
          </button>
          <input
            type="date"
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            value={getLocalDateString(selectedDate)}
            onChange={(e) => {
              setSearchPhone('')
              setSelectedDate(new Date(e.target.value))
            }}
          />
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
              <div key={booking.bookingId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">

                {/* Header Info & Actions */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">

                  {/* Info Left */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
                        <span className="text-sm font-bold text-slate-700">{booking.bookingId}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">
                        {booking.licensePlate}
                      </h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase">
                        {booking.vehicleType}
                      </span>
                      {booking.startTime && (
                        <span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.startTime.slice(0, 5)} {booking.endTime ? `- ${booking.endTime.slice(0, 5)}` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 ml-[52px]">
                      <div className="flex items-center gap-1.5 text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        <Clock className="w-4 h-4 text-orange-500" />
                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        {booking.customerName}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {booking.customerPhone}
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 ml-[52px] md:ml-0">
                    <button
                      onClick={() => handleViewDetail(booking.bookingId)}
                      className="flex-1 md:flex-none px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Chi tiết
                    </button>

                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => handleAction(booking.bookingId, 'Confirmed', 'Đã xác nhận lịch hẹn!')}
                        className="flex-1 md:flex-none px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Xác nhận
                      </button>
                    )}
                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => {
                          setCheckInBookingId(booking.bookingId)
                          setIsCheckInModalOpen(true)
                        }}
                        className="flex-1 md:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                      >
                        <PlayCircle className="w-4 h-4" /> Check-in Xe
                      </button>
                    )}
                    {booking.status === 'Washing' && (
                      <button
                        onClick={() => handleAction(booking.bookingId, 'CheckedOut', 'Giao xe thành công!')}
                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <LogOut className="w-4 h-4" /> Bàn Giao Xe
                      </button>
                    )}
                    {booking.status === 'CheckedOut' && (
                      <div className="flex-1 md:flex-none px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 font-bold text-sm rounded-lg flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Đã xong
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {isCancelled || isNoShow ? (
                  <div className="py-4 px-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center mt-2">
                    <p className="text-rose-600 font-bold flex items-center gap-2">
                      Đã hủy ({booking.status})
                    </p>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 pt-5">
                    {/* Stepper */}
                    <div className="w-full overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <div className="flex items-center justify-between w-full min-w-[768px] px-1">
                        {steps.map((step, idx) => {
                          const isCompleted = idx < currentStepIndex
                          const isActive = idx === currentStepIndex
                          const isLast = idx === steps.length - 1

                          return (
                            <React.Fragment key={step.key}>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted || isActive ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                </div>
                                <span className={`text-sm font-semibold whitespace-nowrap ${isCompleted || isActive ? 'text-slate-800' : 'text-slate-400'
                                  }`}>
                                  {step.label}
                                </span>
                              </div>

                              {!isLast && (
                                <div className="flex-1 mx-2 sm:mx-4 h-[3px] rounded-full bg-slate-100 overflow-hidden">
                                  <div className={`h-full transition-all duration-500 ${isCompleted ? 'bg-teal-600 w-full' : 'w-0'}`}></div>
                                </div>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
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
                        <span className="text-xs text-slate-500 block mb-1">Dịch vụ tặng kèm</span>
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
                  {bookingDetail.rewardName && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block mb-1">Phần thưởng áp dụng:</span>
                      <span className="font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md inline-flex items-center gap-1.5 text-xs sm:text-sm border border-amber-200">
                        🎁 {bookingDetail.rewardName}
                      </span>
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

              {/* Thông tin kiểm tra xe (Nếu có) */}
              {(bookingDetail.staffNote || bookingDetail.incidentImage1 || bookingDetail.incidentImage2) && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> Tình trạng xe lúc nhận
                  </h4>
                  
                  {bookingDetail.staffNote && (
                    <div className="mb-4">
                      <span className="text-slate-500 block mb-1 text-sm">Ghi chú của nhân viên:</span>
                      <p className="font-semibold text-slate-800 text-sm whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
                        {bookingDetail.staffNote}
                      </p>
                    </div>
                  )}

                  {(bookingDetail.incidentImage1 || bookingDetail.incidentImage2) && (
                    <div>
                      <span className="text-slate-500 block mb-2 text-sm">Ảnh chụp thực trạng: (Bấm vào để xem lớn)</span>
                      <div className="grid grid-cols-2 gap-3">
                        {bookingDetail.incidentImage1 && (
                          <a href={bookingDetail.incidentImage1} target="_blank" rel="noopener noreferrer" className="block group relative overflow-hidden rounded-lg border border-slate-200 aspect-video bg-slate-100">
                            <img src={bookingDetail.incidentImage1} alt="Tình trạng xe 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </a>
                        )}
                        {bookingDetail.incidentImage2 && (
                          <a href={bookingDetail.incidentImage2} target="_blank" rel="noopener noreferrer" className="block group relative overflow-hidden rounded-lg border border-slate-200 aspect-video bg-slate-100">
                            <img src={bookingDetail.incidentImage2} alt="Tình trạng xe 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              {bookingDetail.status === 'Confirmed' && (
                <button 
                  onClick={() => {
                    setIsModalOpen(false)
                    setCheckInBookingId(bookingDetail.bookingId)
                    setIsCheckInModalOpen(true)
                  }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  <PlayCircle className="w-5 h-5" /> Tiến hành Check-in
                </button>
              )}
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
      {/* Check-in Form Modal */}
      {isCheckInModalOpen && checkInBookingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Kiểm Tra Nhận Xe #{checkInBookingId}</h3>
              <button 
                onClick={() => setIsCheckInModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCheckInSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh tình trạng 1 <span className="text-rose-500">*</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  required
                  onChange={(e) => setIncidentImage1(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh tình trạng 2 <span className="text-rose-500">*</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  required
                  onChange={(e) => setIncidentImage2(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú tình trạng xe <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  placeholder="Vd: Xe có vết xước nhỏ ở cánh cửa phải..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none h-24 text-slate-700 font-medium text-sm"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Xác Nhận Check-in</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
