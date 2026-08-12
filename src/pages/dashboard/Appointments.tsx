import React, { useState, useEffect } from 'react'
import { CalendarDays, CarFront, Phone, Clock, User, CheckCircle2, PlayCircle, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { staffService, TodayBookingDto } from '../../services/staffService'

export default function Appointments() {
  const [bookings, setBookings] = useState<TodayBookingDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const data = await staffService.getTodayBookings()
      setBookings(data)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách lịch hẹn')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleAction = async (actionFn: () => Promise<any>, successMsg: string) => {
    try {
      await actionFn()
      toast.success(successMsg)
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

  const getStepIndex = (status: string) => {
    return steps.findIndex(s => s.key === status)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <CalendarDays className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Lịch Hẹn Khách (Hôm Nay)</h2>
            <p className="text-slate-500 text-sm mt-1">Xử lý tiến trình dịch vụ cho các xe đến trong ngày</p>
          </div>
        </div>
        <button 
          onClick={fetchBookings}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-all text-sm"
        >
          Làm mới
        </button>
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
                  <div className="text-left md:text-right">
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1 md:justify-end">
                      <Clock className="w-4 h-4" /> Thời gian
                    </p>
                    <p className="font-bold text-slate-800">
                      {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                    </p>
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
                          onClick={() => handleAction(() => staffService.confirmBooking(booking.bookingId), 'Đã xác nhận lịch hẹn!')}
                          className="w-full md:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                          <CheckCircle2 className="w-5 h-5" /> Xác nhận
                        </button>
                      )}
                      {booking.status === 'Confirmed' && (
                        <button 
                          onClick={() => handleAction(() => staffService.checkInBooking(booking.bookingId), 'Đã Check-in và bắt đầu rửa!')}
                          className="w-full md:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        >
                          <PlayCircle className="w-5 h-5" /> Check-in Xe
                        </button>
                      )}
                      {booking.status === 'Washing' && (
                        <button 
                          onClick={() => handleAction(() => staffService.checkOutBooking(booking.bookingId), 'Giao xe thành công!')}
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
    </div>
  )
}
