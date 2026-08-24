import React, { useState, useEffect } from 'react'
import { CalendarPlus, Save, User, Phone, CarFront, Tag, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { serviceService, ServiceDto } from '../../services/serviceService'
import { promotionService, PromotionDTO } from '../../services/promotionService'
import { timeSlotService, AvailableSlotDto } from '../../services/timeSlotService'
import { bookingService } from '../../services/bookingService'

export default function Requests() {
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    guestLicensePlate: '',
    guestVehicleType: 'Car',
    serviceId: 0,
    promotionId: 0,
    bookingDate: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    slotId: 0
  })

  const [services, setServices] = useState<ServiceDto[]>([])
  const [promotions, setPromotions] = useState<PromotionDTO[]>([])
  const [slots, setSlots] = useState<AvailableSlotDto[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingSlots, setIsFetchingSlots] = useState(false)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [servicesRes, promosRes] = await Promise.all([
          serviceService.getActiveServices(),
          promotionService.getPublicPromotions().catch(() => [])
        ])
        
        if (servicesRes && servicesRes.length > 0) {
          setServices(servicesRes)
        }
        
        if (promosRes && Array.isArray(promosRes)) {
          const guestPromos = promosRes.filter(p => p.targetTier?.toLowerCase() === 'all')
          setPromotions(guestPromos)
        }
      } catch (error) {
         console.error(error)
         toast.error("Không thể tải dữ liệu dịch vụ")
      }
    }
    fetchInitialData()
  }, [])
  
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.bookingDate) return
      setIsFetchingSlots(true)
      try {
        const slotRes = await timeSlotService.getAvailableSlots(formData.bookingDate)
        const sortedSlots = [...slotRes].sort((a, b) => {
          const [hA, mA] = a.startTime.split(':').map(Number)
          const [hB, mB] = b.startTime.split(':').map(Number)
          return (hA * 60 + mA) - (hB * 60 + mB)
        })
        setSlots(sortedSlots)
        if (sortedSlots.length > 0) {
          // Check if current selected slot is valid, else pick first valid future slot
          setFormData(prev => {
            const isSlotValid = sortedSlots.some(s => s.slotId === prev.slotId)
            if (isSlotValid) return prev

            const now = new Date()
            const validSlot = sortedSlots.find(s => {
              const [hours, minutes] = s.startTime.split(':').map(Number)
              const slotTime = new Date()
              slotTime.setHours(hours, minutes, 0, 0)
              return slotTime >= now
            })
            return { ...prev, slotId: validSlot ? validSlot.slotId : 0 }
          })
        }
      } catch {
         toast.error("Lỗi lấy khung giờ")
      } finally {
        setIsFetchingSlots(false)
      }
    }
    fetchSlots()
  }, [formData.bookingDate])

  // Caculate selected service total and automatic best promotion
  const selectedService = services.find(s => s.serviceId === formData.serviceId)
  const subtotal = selectedService ? selectedService.price : 0

  const calcPromoDiscount = (promo: PromotionDTO) => {
    const isApplicable = !promo.serviceId || promo.serviceId === formData.serviceId
    if (!isApplicable) return 0
    let val = 0
    if (promo.promoType === 'Discount') {
      if (promo.discountType === 'Fixed' && promo.discountValue) {
        val = promo.discountValue
      } else if (promo.discountType === 'Percent' && promo.discountValue) {
        val = (subtotal * promo.discountValue) / 100
        if (promo.maxDiscount && val > promo.maxDiscount) {
          val = promo.maxDiscount
        }
      }
    } else if ((promo.promoType === 'FreeWash' || promo.promoType === 'AddOn') && promo.serviceId === formData.serviceId) {
      val = subtotal
    }
    return val
  }

  const autoBestPromo = React.useMemo(() => {
    if (!formData.serviceId) return null
    let best: PromotionDTO | null = null
    let maxVal = -1
    for (const p of promotions) {
      const isApplicable = !p.serviceId || p.serviceId === formData.serviceId
      if (isApplicable) {
        const val = calcPromoDiscount(p)
        if (val > maxVal) {
          maxVal = val
          best = p
        }
      }
    }
    return best
  }, [promotions, formData.serviceId, subtotal])

  const selectedPromo = formData.promotionId === 0 ? autoBestPromo : promotions.find(p => p.promotionId === formData.promotionId)
  
  let discount = 0
  if (selectedPromo) {
    discount = calcPromoDiscount(selectedPromo)
  }
  const total = Math.max(0, subtotal - discount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.guestName || !formData.guestPhone || !formData.guestLicensePlate) {
      toast.error('Vui lòng nhập đầy đủ thông tin khách hàng')
      return
    }

    if (!formData.serviceId || !formData.slotId) {
      toast.error('Vui lòng chọn đầy đủ Dịch vụ và Khung giờ')
      return
    }

    setIsSubmitting(true)
    try {
        const targetPromoId = formData.promotionId > 0 
          ? formData.promotionId 
          : (formData.promotionId === 0 ? (autoBestPromo?.promotionId || null) : null)

        await bookingService.createBooking({
          guestName: formData.guestName,
          guestPhone: formData.guestPhone,
          guestLicensePlate: formData.guestLicensePlate,
          guestVehicleType: formData.guestVehicleType,
          serviceId: formData.serviceId,
          slotId: formData.slotId,
          bookingDate: formData.bookingDate,
          promotionId: targetPromoId
        })
       toast.success("Tạo lịch hẹn thành công!")
       // Reset form except date and static things
       setFormData(prev => ({
          ...prev,
          guestName: '',
          guestPhone: '',
          guestLicensePlate: '',
          promotionId: 0
       }))
    } catch(err: any) {
       toast.error(err.response?.data?.message || "Có lỗi xảy ra khi tạo lịch")
    } finally {
       setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-500/10 rounded-xl">
          <CalendarPlus className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tạo Yêu Cầu Cho Khách Vãng Lai</h2>
          <p className="text-slate-500 text-sm mt-1">Hỗ trợ đặt lịch nhanh trực tiếp tại cửa hàng</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Guest Info & Service */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Thông tin khách hàng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên khách hàng <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.guestName}
                  onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                  placeholder="VD: Nguyễn Văn A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="tel" 
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    placeholder="VD: 0912345678"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Biển số xe <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <CarFront className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={formData.guestLicensePlate}
                    onChange={(e) => setFormData({...formData, guestLicensePlate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all uppercase"
                    placeholder="VD: 51H-123.45"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại xe <span className="text-rose-500">*</span></label>
                <select 
                  value={formData.guestVehicleType}
                  onChange={(e) => setFormData({...formData, guestVehicleType: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                >
                  <option value="Car">Xe Ô tô (Car)</option>
                  <option value="Bike">Xe Máy (Motorbike)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" /> Dịch vụ & Khung giờ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gói dịch vụ <span className="text-rose-500">*</span></label>
                <select 
                  value={formData.serviceId}
                  onChange={(e) => setFormData({...formData, serviceId: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                >
                  <option value={0} disabled>-- Chọn dịch vụ --</option>
                  {services.map(s => (
                    <option key={s.serviceId} value={s.serviceId}>{s.serviceName} ({s.price.toLocaleString('vi-VN')}đ)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày đặt <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={formData.bookingDate}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl text-slate-500 px-4 py-2.5 outline-none cursor-not-allowed"
                  readOnly
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Khung giờ <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select 
                    value={formData.slotId}
                    onChange={(e) => setFormData({...formData, slotId: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    disabled={isFetchingSlots}
                  >
                    {isFetchingSlots && <option value={0}>Đang tải...</option>}
                    {!isFetchingSlots && slots.length === 0 && <option value={0} disabled>Hết chỗ trống</option>}
                    {!isFetchingSlots && slots.map(s => {
                      const now = new Date()
                      const [hours, minutes] = s.startTime.split(':').map(Number)
                      const slotTime = new Date()
                      slotTime.setHours(hours, minutes, 0, 0)
                      // Disable if the slot is in the past
                      const isPast = slotTime < now
                      
                      const isCar = formData.guestVehicleType === 'Car'
                      const remaining = isCar ? s.remainingCarCapacity : s.remainingBikeCapacity
                      const isAvailable = remaining > 0
                      const canBook = isAvailable && !isPast

                      return (
                        <option key={s.slotId} value={s.slotId} disabled={!canBook}>
                          {s.startTime.slice(0,5)} - {s.endTime.slice(0,5)} {isPast ? '(Đã qua)' : (isAvailable ? `(Còn ${remaining} chỗ)` : '(Hết chỗ)')}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mã khuyến mãi (Ưu đãi)</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select 
                    value={formData.promotionId}
                    onChange={(e) => setFormData({...formData, promotionId: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                  >
                    <option value={0}>
                      ✨ Tự động chọn ưu đãi tốt nhất {autoBestPromo ? `(${autoBestPromo.promoName})` : ''}
                    </option>
                    <option value={-1}>-- Không áp dụng mã khuyến mãi --</option>
                    {promotions.map(p => {
                      const isApplicable = !p.serviceId || p.serviceId === formData.serviceId
                      const isBest = autoBestPromo?.promotionId === p.promotionId && isApplicable
                      return (
                        <option key={p.promotionId} value={p.promotionId} disabled={!isApplicable}>
                          {p.promoName} {isBest ? '🔥 (Tốt nhất)' : ''} {!isApplicable ? '(Không áp dụng cho gói này)' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Summary & Submit */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Chi tiết thanh toán</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-sm">Tạm tính</span>
                <span className="font-semibold">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              {selectedPromo && discount > 0 && (
                <div className="flex justify-between items-start text-emerald-600">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Khuyến mãi</span>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      🏷️ {selectedPromo.promoName} {formData.promotionId === 0 ? '(Tự động)' : ''}
                    </span>
                  </div>
                  <span className="font-semibold">-{discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-slate-900">
                <span className="font-bold">Tổng thanh toán</span>
                <span className="text-xl font-bold text-orange-600">{total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || slots.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl transition-all"
            >
              {isSubmitting ? 'Đang xử lý...' : (
                <>
                  <Save className="w-5 h-5" />
                  Xác nhận Tạo Yêu Cầu
                </>
              )}
            </button>
            {slots.length === 0 && !isFetchingSlots && (
               <p className="text-center text-rose-500 text-sm mt-3 font-medium flex items-center justify-center gap-1">
                 <AlertCircle className="w-4 h-4" /> Ngày này đã hết khung giờ trống
               </p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
