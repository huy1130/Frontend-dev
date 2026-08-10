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
  ChevronRight
} from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'

interface ServiceItem {
  id: string
  name: string
  category: string
  price: number
  duration: string
  description: string
  popular?: boolean
}

interface PromotionItem {
  id: string
  code: string
  title: string
  discountText: string
  discountAmount: number
  minSpend: number
  expiry: string
}

export default function CustomerBooking() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Step 1 State: Date & Time & Branch
  const [selectedBranch, setSelectedBranch] = useState('b1')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:00')

  // Step 2 State: Selected Services
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['s1'])

  // Step 3 State: Selected Promotion & Booking Complete
  const [appliedPromoId, setAppliedPromoId] = useState<string>('promo1')
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [bookingRef, setBookingRef] = useState<string>('')

  // Mock Data
  const branches = [
    { id: 'b1', name: 'Chi nhánh Quận 1', address: '123 Nguyễn Trãi, P. Bến Thành, Q.1, TPHCM' },
    { id: 'b2', name: 'Chi nhánh Quận 7', address: '456 Nguyễn Thị Thập, P. Tân Phong, Q.7, TPHCM' },
    { id: 'b3', name: 'Chi nhánh Thủ Đức', address: '789 Võ Văn Ngân, P. Bình Thọ, TP. Thủ Đức' },
  ]

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', 
    '13:30', '14:30', '15:30', '16:30', '17:30'
  ]

  const availableServices: ServiceItem[] = [
    {
      id: 's1',
      name: 'Rửa Xe Bọt Tuyết & Hút Bụi Cao Cấp',
      category: 'Chăm sóc cơ bản',
      price: 150000,
      duration: '30-45 phút',
      description: 'Rửa sạch toàn bộ thân xe bằng dung dịch bọt tuyết chuyên dụng, sấy khô và hút bụi vệ sinh sàn xe.',
      popular: true,
    },
    {
      id: 's2',
      name: 'Combo Vệ Sinh Nội Thất Chuyên Sâu',
      category: 'Chăm sóc nội thất',
      price: 450000,
      duration: '60-90 phút',
      description: 'Giặt ghế da/nỉ, dưỡng bề mặt nhựa tablo, khử trùng khoang xe bằng máy xông Ozon diệt khuẩn 99%.',
    },
    {
      id: 's3',
      name: 'Phủ Ceramic Bảo Vệ Sơn & Tẩy Ố Kính',
      category: 'Bảo vệ sơn & kính',
      price: 850000,
      duration: '120 phút',
      description: 'Tẩy màng bám kính chiếu hậu, tẩy ố mốc kính chắn gió và phủ lớp Ceramic tăng độ bóng cho lớp sơn.',
      popular: true,
    },
    {
      id: 's4',
      name: 'Vệ Sinh Khoang Máy Bằng Hơi Nước Nóng',
      category: 'Bảo dưỡng động cơ',
      price: 300000,
      duration: '45 phút',
      description: 'Dùng công nghệ hơi nước nóng khoang máy loại bỏ dầu mỡ bám lâu ngày, xịt dung dịch dưỡng dây curoa.',
    },
  ]

  const promotions: PromotionItem[] = [
    {
      id: 'promo1',
      code: 'HYBRIDNEW',
      title: 'Giảm 10% Cho Khách Hàng Đặt Lịch Online',
      discountText: 'Giảm 10%',
      discountAmount: 0.1,
      minSpend: 100000,
      expiry: '31/12/2026',
    },
    {
      id: 'promo2',
      code: 'GOLDVIP50K',
      title: 'Ưu Đãi Hạng Thành Viên Vàng (Giảm 50.000đ)',
      discountText: 'Giảm 50.000đ',
      discountAmount: 50000,
      minSpend: 300000,
      expiry: '31/12/2026',
    },
    {
      id: 'promo3',
      code: 'SUMMER2026',
      title: 'Khuyến Mãi Chăm Sóc Hè (Giảm 15%)',
      discountText: 'Giảm 15%',
      discountAmount: 0.15,
      minSpend: 500000,
      expiry: '30/09/2026',
    },
  ]

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((item) => item !== id))
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id])
    }
  }

  // Calculate pricing
  const selectedServices = availableServices.filter((s) => selectedServiceIds.includes(s.id))
  const subtotalPrice = selectedServices.reduce((acc, curr) => acc + curr.price, 0)
  
  const selectedPromo = promotions.find((p) => p.id === appliedPromoId)
  let discountValue = 0
  if (selectedPromo) {
    if (selectedPromo.discountAmount < 1) {
      discountValue = subtotalPrice * selectedPromo.discountAmount
    } else {
      discountValue = selectedPromo.discountAmount
    }
  }
  const finalTotal = Math.max(0, subtotalPrice - discountValue)

  const handleConfirmBooking = () => {
    const randomRef = 'BK-' + Math.floor(100000 + Math.random() * 900000)
    setBookingRef(randomRef)
    setIsSuccess(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <NavBar />

      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 max-w-4xl w-full mx-auto space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to="/customer" className="hover:text-orange-600 transition-colors">Cổng Khách Hàng</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold">Đặt Lịch Dịch Vụ</span>
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
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all ${
                currentStep === 1 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 font-extrabold text-xs' 
                  : currentStep > 1 
                  ? 'bg-orange-50 text-orange-600 border-orange-200 text-xs font-semibold' 
                  : 'bg-white text-slate-500 border-slate-200 text-xs'
              }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                <span>Thời Gian & Địa Điểm</span>
              </div>

              <div className="hidden sm:block h-0.5 w-6 bg-slate-300" />

              {/* Step 2 */}
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all ${
                currentStep === 2 
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
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all ${
                currentStep === 3 
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
                <span className="text-slate-500">Chi nhánh:</span>
                <span className="font-bold text-slate-900">{branches.find(b => b.id === selectedBranch)?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Thời gian:</span>
                <span className="font-bold text-slate-900">{selectedTimeSlot} - {selectedDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Dịch vụ đã chọn:</span>
                <span className="font-bold text-slate-900 text-right">{selectedServices.map(s => s.name).join(', ')}</span>
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
                onClick={() => {
                  setIsSuccess(false)
                  setCurrentStep(1)
                }}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors border border-slate-200 text-sm"
              >
                Đặt Thêm Lịch Mới
              </button>
            </div>
          </div>
        ) : (
          /* STEP CONTENT CARD */
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl shadow-slate-200/50">
            
            {/* STEP 1: DATE & TIME & BRANCH */}
            {currentStep === 1 && (
              <div className="space-y-6">
                
                {/* Branch Selection */}
                <div>
                  <label className="block text-sm font-extrabold text-slate-900 mb-2.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>1. Chọn Chi Nhánh Phù Hợp:</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {branches.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBranch(b.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedBranch === b.id
                            ? 'bg-orange-50/80 border-orange-500 shadow-md'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <h4 className="font-extrabold text-slate-900 text-sm mb-1">{b.name}</h4>
                        <p className="text-xs text-slate-500">{b.address}</p>
                      </div>
                    ))}
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
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2.5 rounded-xl border text-xs font-extrabold transition-all ${
                          selectedTimeSlot === slot
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
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
                  {availableServices.map((svc) => {
                    const isSelected = selectedServiceIds.includes(svc.id)
                    return (
                      <div
                        key={svc.id}
                        onClick={() => toggleService(svc.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-orange-50/80 border-orange-500 shadow-sm'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{svc.name}</h4>
                              {svc.popular && (
                                <span className="text-[10px] uppercase font-extrabold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                                  Phổ Biến
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mb-1.5">{svc.description}</p>
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                              Thời gian thực hiện: {svc.duration}
                            </span>
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
                        <p><span className="text-slate-500">Địa điểm:</span> <strong className="text-slate-900">{branches.find(b => b.id === selectedBranch)?.name}</strong></p>
                        <p><span className="text-slate-500">Thời gian:</span> <strong className="text-slate-900">{selectedTimeSlot} ngày {selectedDate}</strong></p>
                        <div>
                          <span className="text-slate-500 block mb-0.5">Dịch vụ đã chọn ({selectedServices.length}):</span>
                          <ul className="pl-4 list-disc space-y-0.5 font-bold text-slate-900">
                            {selectedServices.map(s => (
                              <li key={s.id}>{s.name} ({s.price.toLocaleString('vi-VN')}đ)</li>
                            ))}
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
                        {promotions.map((promo) => {
                          const isApplied = appliedPromoId === promo.id
                          return (
                            <div
                              key={promo.id}
                              onClick={() => setAppliedPromoId(isApplied ? '' : promo.id)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                isApplied
                                  ? 'bg-orange-50 border-orange-500 shadow-sm'
                                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                                  <Percent className="w-4 h-4" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{promo.title}</h5>
                                  <p className="text-[11px] text-slate-500">Mã: <span className="text-orange-600 font-bold">{promo.code}</span> • Hạn: {promo.expiry}</p>
                                </div>
                              </div>

                              <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg border shrink-0 ${
                                isApplied 
                                  ? 'bg-orange-500 text-white border-orange-500' 
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}>
                                {isApplied ? 'Đã áp dụng' : 'Áp dụng'}
                              </span>
                            </div>
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
                          <span>Tạm tính ({selectedServices.length} dịch vụ):</span>
                          <span className="font-bold text-slate-900">{subtotalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>

                        {selectedPromo && (
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Giảm giá ({selectedPromo.code}):</span>
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
