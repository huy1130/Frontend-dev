import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  Car,
  Check,
  Percent,
  ChevronRight,
  ChevronLeft,
  Plus
} from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'
import { customerService, VehicleResponseDTO } from '../../services/customerService'
import { serviceService, ServiceDto } from '../../services/serviceService'
import { bookingService } from '../../services/bookingService'
import { promotionService, PromotionDTO } from '../../services/promotionService'
import { timeSlotService, AvailableSlotDto } from '../../services/timeSlotService'
import { loyaltyService } from '../../services/loyaltyService'
import { toast } from 'sonner'

interface ServiceItem {
  id: string
  name: string
  category: string
  price: number
  duration: string
  description: string
  popular?: boolean
}


interface CarItem {
  id: string
  plateNumber: string
  brand: string
  model: string
  color: string
}

export default function CustomerBooking() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Step 1 State: Date & Time
  const [selectedCarId, setSelectedCarId] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedSlotId, setSelectedSlotId] = useState<number>(0)

  const [availableSlots, setAvailableSlots] = useState<AvailableSlotDto[]>([])
  const [isSlotsLoading, setIsSlotsLoading] = useState(false)

  // Step 2 State: Selected Services
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0)

  // Step 3 State: Selected Promotion & Booking Complete
  const [appliedPromoId, setAppliedPromoId] = useState<number>(0)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [bookingRef, setBookingRef] = useState<string>('')

  // API Data
  const [myCars, setMyCars] = useState<VehicleResponseDTO[]>([])
  const [availableServices, setAvailableServices] = useState<ServiceDto[]>([])
  const [availablePromos, setAvailablePromos] = useState<PromotionDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [maxDays, setMaxDays] = useState(7) // Mặc định Member là 7 ngày

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [carsRes, servicesRes, promosRes, loyaltyRes] = await Promise.all([
          customerService.getMyVehicles(),
          serviceService.getActiveServices(),
          promotionService.getEligiblePromotions(),
          loyaltyService.getSummary().catch(() => null) // Bỏ qua lỗi nếu không gọi được loyalty
        ])
        if (carsRes.success) {
          setMyCars(carsRes.data)
          if (carsRes.data.length > 0) setSelectedCarId(carsRes.data[0].vehicleId)
        }
        if (servicesRes.length > 0) {
          setAvailableServices(servicesRes)
          setSelectedServiceId(servicesRes[0].serviceId)
        }
        if (promosRes.length > 0) {
          setAvailablePromos(promosRes)
        }
        if (loyaltyRes && loyaltyRes.currentTier) {
          switch (loyaltyRes.currentTier.toLowerCase()) {
            case 'silver': setMaxDays(10); break;
            case 'gold': setMaxDays(12); break;
            case 'platinum': setMaxDays(14); break;
            default: setMaxDays(7); break;
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Auto scroll to top when step changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep, isSuccess])

  React.useEffect(() => {
    const fetchSlots = async () => {
      setIsSlotsLoading(true)
      try {
        const slots = await timeSlotService.getAvailableSlots(selectedDate)
        // Sort time slots chronologically
        slots.sort((a, b) => a.startTime.localeCompare(b.startTime))
        setAvailableSlots(slots)
        setSelectedSlotId(0) // Reset slot when date changes
      } catch (error) {
        console.error("Lỗi lấy khung giờ:", error)
        toast.error("Không thể tải danh sách khung giờ")
      } finally {
        setIsSlotsLoading(false)
      }
    }
    fetchSlots()
  }, [selectedDate])

  const toggleService = (id: number) => {
    setSelectedServiceId(id)
  }

  // Calculate pricing
  const selectedService = availableServices.find((s) => s.serviceId === selectedServiceId)
  const subtotalPrice = selectedService ? selectedService.price : 0

  const selectedPromo = availablePromos.find((p) => p.promotionId === appliedPromoId)
  let discountValue = 0
  if (selectedPromo && selectedPromo.promoType === 'Discount') {
    if (selectedPromo.discountType === 'Fixed' && selectedPromo.discountValue) {
      discountValue = selectedPromo.discountValue
    } else if (selectedPromo.discountType === 'Percent' && selectedPromo.discountValue) {
      discountValue = subtotalPrice * selectedPromo.discountValue / 100
      if (selectedPromo.maxDiscount && discountValue > selectedPromo.maxDiscount) {
        discountValue = selectedPromo.maxDiscount
      }
    }
  }
  const finalTotal = Math.max(0, subtotalPrice - discountValue)

  const handleConfirmBooking = async () => {
    if (!selectedCarId || !selectedServiceId || !selectedSlotId) {
      toast.error('Vui lòng chọn đầy đủ Xe, Khung giờ và Dịch vụ.');
      return;
    }

    // Trích xuất CustomerId từ JWT Token đang lưu
    const getCustomerIdFromToken = (): number | undefined => {
      const token = localStorage.getItem('token')
      if (!token) return undefined
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const id = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || payload.sub
        return id ? parseInt(id, 10) : undefined
      } catch {
        return undefined
      }
    }

    try {
      const res = await bookingService.createBooking({
        customerId: getCustomerIdFromToken(),
        vehicleId: selectedCarId,
        serviceId: selectedServiceId,
        slotId: selectedSlotId,
        bookingDate: selectedDate,
        promotionId: appliedPromoId ? appliedPromoId : null
      })

      // API trả về trực tiếp cục BookingDto thay vì {success: true}
      if (res && res.bookingId) {
        setBookingRef('Mã lịch hẹn - ' + res.bookingId)
        setIsSuccess(true)
        toast.success('Đặt lịch thành công!')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch.')
    }
  }

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

        {/* Title & Progress Bar */}
        {!isSuccess && (
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Đặt Lịch Dịch Vụ Rửa Xe
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              Chỉ với 3 bước đơn giản để giữ chỗ ưu tiên và áp dụng các khuyến mãi độc quyền.
            </p>

            {/* Stepper Header */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 pt-3 max-w-2xl mx-auto flex-wrap">

              {/* Step 1 */}
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all ${currentStep === 1
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 font-extrabold text-xs'
                : currentStep > 1
                  ? 'bg-orange-50 text-orange-600 border-orange-200 text-xs font-semibold'
                  : 'bg-white text-slate-500 border-slate-200 text-xs'
                }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                <span>Thời Gian Đặt Lịch</span>
              </div>

              <div className="hidden sm:block h-0.5 w-6 bg-slate-300" />

              {/* Step 2 */}
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all ${currentStep === 2
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 font-extrabold text-xs'
                : currentStep > 2
                  ? 'bg-orange-50 text-orange-600 border-orange-200 text-xs font-semibold'
                  : 'bg-white text-slate-500 border-slate-200 text-xs'
                }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                <span>Chọn Dịch Vụ</span>
              </div>

              <div className="hidden sm:block h-0.5 w-6 bg-slate-300" />

              {/* Step 3 */}
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all ${currentStep === 3
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 font-extrabold text-xs'
                : 'bg-white text-slate-500 border-slate-200 text-xs'
                }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                <span>Xác Nhận & Ưu Đãi</span>
              </div>

            </div>
          </div>
        )}

        {/* SUCCESS CONFIRMATION SCREEN */}
        {isSuccess ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto shadow-xl shadow-slate-200/50 space-y-5">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Đặt Lịch Thành Công!</h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Mã lịch hẹn của bạn là <span className="text-orange-600 font-extrabold">{bookingRef}</span>. Nhân viên sẽ liên hệ xác nhận trong ít phút.
              </p>
            </div>

            {/* Summary Ticket */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-2.5 text-sm">

              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Xe của bạn:</span>
                <span className="font-bold text-slate-900">{myCars.find(c => c.vehicleId === selectedCarId)?.licensePlate} - {myCars.find(c => c.vehicleId === selectedCarId)?.vehicleType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Thời gian:</span>
                <span className="font-bold text-slate-900">
                  {(() => {
                    const slot = availableSlots.find(s => s.slotId === selectedSlotId)
                    return slot ? `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)} ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}` : selectedDate
                  })()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Dịch vụ đã chọn:</span>
                <span className="font-bold text-slate-900 text-right">{selectedService?.serviceName}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Tổng thanh toán:</span>
                <span className="font-extrabold text-orange-600 text-xl">{finalTotal.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                to="/customer/history"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 text-sm"
              >
                <span>Xem Lịch Sử Đặt Lịch</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => navigate('/customer')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors border border-slate-200 text-sm"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        ) : (
          /* STEP CONTENT CARD */
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 min-h-[600px] flex flex-col">

            {/* STEP 1: DATE & TIME */}
            {currentStep === 1 && (
              <div className="space-y-6">

                {/* Car Selection */}
                <div>
                  <label className="block text-sm font-extrabold text-slate-900 mb-2.5 flex items-center gap-2">
                    <Car className="w-4 h-4 text-orange-600" />
                    <span>1. Chọn Xe Của Bạn:</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isLoading ? (
                      <div className="col-span-2 text-center p-4 text-orange-600 font-bold">Đang tải danh sách xe...</div>
                    ) : myCars.map((car) => (
                      <div
                        key={car.vehicleId}
                        onClick={() => setSelectedCarId(car.vehicleId)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedCarId === car.vehicleId
                          ? 'bg-orange-50/80 border-orange-500 shadow-md'
                          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedCarId === car.vehicleId ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                            <Car className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm mb-0.5">{car.licensePlate}</h4>
                            <p className="text-xs text-slate-500">{car.vehicleType}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedCarId === car.vehicleId ? 'bg-orange-500 border-orange-500' : 'border-slate-300'
                          }`}>
                          {selectedCarId === car.vehicleId && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2.5 text-right">
                    <Link to="/customer/cars" className="text-xs text-orange-600 font-bold hover:underline inline-flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      <span>Thêm xe mới</span>
                    </Link>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-extrabold text-slate-900 mb-2.5 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-orange-600" />
                    <span>2. Chọn Ngày Đặt Lịch:</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toLocaleDateString('en-CA')}
                    max={new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-72 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-bold text-sm"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-extrabold text-slate-900 mb-2.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>3. Chọn Khung Giờ Phù Hợp:</span>
                  </label>

                  {isSlotsLoading ? (
                    <div className="text-orange-600 font-bold text-sm py-4">Đang tải khung giờ trống...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-slate-500 text-sm py-4 border border-dashed rounded-xl p-4 text-center bg-slate-50">Không có khung giờ nào trống trong ngày này. Vui lòng chọn ngày khác.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => {
                        const selectedCar = myCars.find(c => c.vehicleId === selectedCarId)
                        const isCar = selectedCar?.vehicleType.toLowerCase().includes('ô tô') || selectedCar?.vehicleType.toLowerCase().includes('car') || false
                        const remaining = isCar ? slot.remainingCarCapacity : slot.remainingBikeCapacity
                        const isAvailable = remaining > 0

                        // Check if the slot has passed today
                        const today = new Date().toLocaleDateString('en-CA')
                        const isToday = selectedDate === today
                        let isPast = false
                        if (isToday && slot.startTime) {
                          const now = new Date()
                          const currentHour = now.getHours()
                          const currentMinute = now.getMinutes()

                          const [startH, startM] = slot.startTime.split(':').map(Number)
                          if (startH < currentHour || (startH === currentHour && startM <= currentMinute)) {
                            isPast = true
                          }
                        }

                        const canBook = isAvailable && !isPast

                        return (
                          <button
                            key={slot.slotId}
                            type="button"
                            disabled={!canBook}
                            onClick={() => setSelectedSlotId(slot.slotId)}
                            className={`py-3 px-2 rounded-xl border text-sm transition-all flex flex-col items-center justify-center gap-1 ${!canBook
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                              : selectedSlotId === slot.slotId
                                ? 'bg-orange-500 text-white border-orange-500 shadow-md font-extrabold'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-200 font-bold'
                              }`}
                          >
                            <span>{slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}</span>
                            <span className={`text-[10px] ${!canBook ? 'text-slate-400' : selectedSlotId === slot.slotId ? 'text-orange-100' : 'text-slate-500'}`}>
                              {isPast ? 'Đã qua giờ' : (isAvailable ? `Còn ${remaining} chỗ` : 'Hết chỗ')}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Next Action */}
                <div className="pt-5 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 text-sm"
                  >
                    <span>Tiếp Tục: Chọn Dịch Vụ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 2: SELECT SERVICES */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-0.5">Danh Sách Dịch Vụ Hệ Thống</h3>
                  <p className="text-slate-500 text-xs sm:text-sm">Bạn có thể chọn một hoặc kết hợp nhiều dịch vụ chăm sóc cho xe của mình.</p>
                </div>

                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center p-4 text-orange-600 font-bold">Đang tải danh sách dịch vụ...</div>
                  ) : availableServices.map((svc) => {
                    const isSelected = selectedServiceId === svc.serviceId
                    return (
                      <div
                        key={svc.serviceId}
                        onClick={() => toggleService(svc.serviceId)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${isSelected
                          ? 'bg-orange-50/80 border-orange-500 shadow-sm'
                          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-300 bg-white'
                            }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{svc.serviceName}</h4>
                            </div>
                            <p className="text-xs text-slate-500 mb-1.5">{svc.description}</p>
                          </div>
                        </div>

                        <div className="text-left md:text-right pl-8 md:pl-0">
                          <p className="text-xl font-extrabold text-orange-600">{svc.price.toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Step 2 Actions */}
                <div className="pt-5 border-t border-slate-200 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 text-xs sm:text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay Lại</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 text-sm"
                  >
                    <span>Tiếp Tục: Xác Nhận & Ưu Đãi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: CONFIRM & PROMOTIONS */}
            {currentStep === 3 && (
              <div className="space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Left Column */}
                  <div className="lg:col-span-7 space-y-5">

                    {/* Booking Details Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                      <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-orange-600" />
                        <span>Thông Tin Lịch Hẹn Đã Chọn</span>
                      </h4>

                      <div className="text-xs space-y-1.5 text-slate-700">
                        <p><span className="text-slate-500">Xe của bạn:</span> <strong className="text-slate-900">{myCars.find(c => c.vehicleId === selectedCarId)?.licensePlate} - {myCars.find(c => c.vehicleId === selectedCarId)?.vehicleType}</strong></p>
                        <p><span className="text-slate-500">Thời gian:</span> <strong className="text-slate-900">
                          {(() => {
                            const slot = availableSlots.find(s => s.slotId === selectedSlotId)
                            return slot ? `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)} ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}` : selectedDate
                          })()}
                        </strong></p>
                        <div>
                          <span className="text-slate-500 block mb-0.5">Dịch vụ đã chọn:</span>
                          <ul className="pl-4 list-disc space-y-0.5 font-bold text-slate-900">
                            {selectedService && (
                              <li>{selectedService.serviceName} ({selectedService.price.toLocaleString('vi-VN')}đ)</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* System Active Promotions Selector */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm mb-2.5 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-orange-600" />
                        <span>Khuyến Mãi Đang Có Của Hệ Thống:</span>
                      </h4>

                      <div className="space-y-2.5">
                        {availablePromos.length === 0 ? (
                          <div className="text-center p-3 text-slate-500 text-sm">Hiện không có mã khuyến mãi nào khả dụng.</div>
                        ) : availablePromos.map((promo) => {
                          const isApplicable = !promo.serviceId || promo.serviceId === selectedServiceId
                          const isApplied = appliedPromoId === promo.promotionId && isApplicable

                          let badgeText = ''
                          if (promo.promoType === 'Discount') {
                            if (promo.discountType === 'Fixed') badgeText = `Giảm ${promo.discountValue?.toLocaleString('vi-VN')}đ`
                            if (promo.discountType === 'Percent') badgeText = `Giảm ${promo.discountValue}%`
                          } else {
                            badgeText = 'Quà Tặng'
                          }

                          return (
                            <button
                              key={promo.promotionId}
                              disabled={!isApplicable}
                              onClick={() => setAppliedPromoId(isApplied ? 0 : promo.promotionId)}
                              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${!isApplicable
                                ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                                : isApplied
                                  ? 'bg-orange-50 border-orange-500 shadow-sm cursor-pointer'
                                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 cursor-pointer'
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                                  <Percent className="w-4 h-4" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{promo.promoName}</h5>
                                  <p className="text-[11px] text-slate-500">
                                    {!isApplicable && <span className="text-red-500 font-bold mr-1">(Không áp dụng cho dịch vụ này)</span>}
                                    Hạn: {promo.validTo ? new Date(promo.validTo).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                                  </p>
                                </div>
                              </div>

                              <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg border shrink-0 ${isApplied
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-white text-orange-600 border-orange-200'
                                }`}>
                                {isApplied ? 'Đang chọn' : badgeText}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Pricing & Final Checkout Button */}
                  <div className="lg:col-span-5">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sticky top-20 space-y-5 shadow-md">
                      <h4 className="font-extrabold text-slate-900 text-base border-b border-slate-200 pb-3">
                        Chi Tiết Thanh Toán
                      </h4>

                      <div className="space-y-2.5 text-xs sm:text-sm">
                        <div className="flex justify-between text-slate-600">
                          <span>Tạm tính (1 dịch vụ):</span>
                          <span className="font-bold text-slate-900">{subtotalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>

                        {selectedPromo && (
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Giảm giá ({selectedPromo.promoCode}):</span>
                            <span>-{discountValue.toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}

                        <div className="border-t border-slate-200 pt-3 flex justify-between items-end">
                          <div>
                            <span className="text-[11px] text-slate-500 block font-medium">Tổng tiền thanh toán</span>
                            <span className="text-2xl font-extrabold text-orange-600">
                              {finalTotal.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleConfirmBooking}
                        className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Xác Nhận Đặt Lịch Ngay</span>
                      </button>

                      <p className="text-center text-[11px] text-slate-500 font-medium">
                        Thanh toán trực tiếp tại spa rửa xe hoặc qua ứng dụng.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Step 3 Footer Actions */}
                <div className="pt-4 border-t border-slate-200 flex justify-start">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 text-xs sm:text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay Lại Chọn Dịch Vụ</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}
