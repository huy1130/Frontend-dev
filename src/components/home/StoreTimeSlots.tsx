import React, { useState, useEffect } from 'react'
import { Clock, Calendar, Car, Bike, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { timeSlotService, AvailableSlotDto } from '../../services/timeSlotService'
import { getLocalDateString } from '../../utils/date'

export default function StoreTimeSlots() {
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()))
  const [slots, setSlots] = useState<AvailableSlotDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSlots()
  }, [selectedDate])

  const fetchSlots = async () => {
    try {
      setIsLoading(true)
      const data = await timeSlotService.getAvailableSlots(selectedDate)
      // Sort time slots chronologically
      data.sort((a, b) => a.startTime.localeCompare(b.startTime))
      setSlots(data)
    } catch (err) {
      console.error('Lỗi khi lấy khung giờ:', err)
      setSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5)
  }

  // Generate quick date options (Today, Tomorrow, Day after)
  const today = new Date()
  const dateOptions = [0, 1, 2, 3, 4].map(offset => {
    const d = new Date()
    d.setDate(today.getDate() + offset)
    const dateStr = getLocalDateString(d)
    let label = ''
    if (offset === 0) label = 'Hôm nay'
    else if (offset === 1) label = 'Ngày mai'
    else {
      label = d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
    }
    return { dateStr, label }
  })

  return (
    <section id="timeslots" className="py-24 bg-slate-50 dark:bg-dark-900 relative transition-colors duration-300 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>Lịch Phục Vụ & Chỗ Trống Thời Gian Thực</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            KHUNG GIỜ <span className="gradient-text">PHỤC VỤ CỦA CỬA HÀNG</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Theo dõi tình trạng các ca hoạt động và giữ chỗ trước để tiết kiệm thời gian chờ đợi.
          </p>
        </motion.div>

        {/* Date Selector Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {dateOptions.map((opt) => (
            <button
              key={opt.dateStr}
              onClick={() => setSelectedDate(opt.dateStr)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedDate === opt.dateStr
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 scale-105'
                  : 'bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-brand-500/40 shadow-sm'
              }`}
            >
              <Calendar className="w-4 h-4 opacity-80" />
              <span>{opt.label}</span>
              <span className="text-[11px] opacity-75 font-normal">({opt.dateStr.split('-').reverse().slice(0, 2).join('/')})</span>
            </button>
          ))}
        </motion.div>

        {/* Slots Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-brand-600 dark:text-brand-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-semibold">Đang tải tình trạng chỗ trống...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-dark-800/80 rounded-3xl border border-slate-200 dark:border-white/10 border-dashed max-w-xl mx-auto shadow-sm">
            <Clock className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3 opacity-60" />
            <p className="text-slate-800 dark:text-slate-200 font-bold text-base mb-1">Không có khung giờ nào phục vụ trong ngày này</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Vui lòng chọn ngày làm việc khác để kiểm tra chỗ trống.</p>
          </div>
        ) : (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {slots.map((slot) => {
              const hasCarSpace = slot.remainingCarCapacity > 0
              const hasBikeSpace = slot.remainingBikeCapacity > 0
              const isAvailable = hasCarSpace || hasBikeSpace

              return (
                <div
                  key={slot.slotId}
                  className={`bg-white dark:bg-dark-800/80 rounded-3xl p-5 border transition-all duration-300 relative flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                    isAvailable
                      ? 'border-slate-200 dark:border-white/10 hover:border-brand-500/50'
                      : 'border-slate-200/60 dark:border-white/5 opacity-60 bg-slate-50/50 dark:bg-dark-900/40'
                  }`}
                >
                  <div>
                    {/* Time Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-lg">
                        <Clock className="w-4 h-4 text-brand-500" />
                        <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}
                      >
                        {isAvailable ? 'Còn chỗ' : 'Hết chỗ'}
                      </span>
                    </div>
                  </div>

                  {/* Capacities */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                        <Car className="w-3.5 h-3.5 text-sky-500" /> Ô tô còn:
                      </span>
                      <span className={`font-extrabold ${hasCarSpace ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {slot.remainingCarCapacity} / {slot.carCapacity} vị trí
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                        <Bike className="w-3.5 h-3.5 text-amber-500" /> Xe máy còn:
                      </span>
                      <span className={`font-extrabold ${hasBikeSpace ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {slot.remainingBikeCapacity} / {slot.bikeCapacity} vị trí
                      </span>
                    </div>
                  </div>

                  {/* CTA Link */}
                  <div className="pt-2">
                    <Link
                      to="/customer/booking"
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isAvailable
                          ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <span>Giữ Chỗ Khung Giờ Này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 text-center bg-gradient-to-r from-brand-50 via-white to-amber-50 dark:from-dark-800 dark:via-dark-800/80 dark:to-dark-800 border border-brand-200 dark:border-white/10 p-8 rounded-3xl max-w-4xl mx-auto shadow-md"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                <span>Đặt lịch trước để không phải chờ đợi tại cửa hàng!</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                Hệ thống tự động sắp xếp xe của bạn vào hàng rửa ưu tiên ngay khi bạn tới.
              </p>
            </div>
            <Link
              to="/customer/booking"
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 hover:scale-105 whitespace-nowrap"
            >
              Đặt Lịch Rửa Xe Ngay
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
