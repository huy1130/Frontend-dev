import React, { useEffect, useState } from 'react'
import { CalendarCheck, ClipboardCheck, Sparkles, Award, ArrowRight, Bike, Car, RotateCcw, PhoneCall, ShieldCheck } from 'lucide-react'
import { mockProcessSteps } from '../../mock/homeData'
import { systemParameterService, SystemParameterDto } from '../../services/systemParameterService'

const iconMap: Record<string, React.ReactNode> = {
  CalendarCheck: <CalendarCheck className="w-7 h-7 text-brand-600 dark:text-brand-400" />,
  ClipboardCheck: <ClipboardCheck className="w-7 h-7 text-amber-600 dark:text-amber-400" />,
  Sparkles: <Sparkles className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />,
  Award: <Award className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
}

export default function HowItWorks() {
  const [params, setParams] = useState<SystemParameterDto | null>(null)

  useEffect(() => {
    systemParameterService
      .getSystemParameter()
      .then((data) => {
        if (data) setParams(data)
      })
      .catch((err) => {
        console.warn('Lỗi khi lấy thông số hệ thống ở HowItWorks:', err)
      })
  }, [])

  // Default fallback values if backend is initializing
  const bikeDeposit = params?.bikeDepositAmount ?? 20000
  const carPercentage = params?.carDepositPercentage ?? 20
  const refundDays = params?.cancellationRefundDays ?? 1
  const phone = params?.contactPhone || '0901234567'

  return (
    <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-dark-900 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            Trải Nghiệm Đơn Giản & Minh Bạch
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            QUY TRÌNH DỊCH VỤ <span className="gradient-text">4 BƯỚC THÔNG MINH</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Khác biệt hoàn toàn so với tiệm rửa xe truyền thống. Trải nghiệm dịch vụ chuyên nghiệp, minh bạch và tiết kiệm thời gian tối đa.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative mb-16">
          {mockProcessSteps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white dark:bg-dark-800/80 p-8 rounded-3xl relative border border-slate-200 dark:border-white/10 glass-panel-hover flex flex-col justify-between group shadow-sm dark:shadow-none"
            >
              {/* Step Badge */}
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-brand-500/40 transition-all shadow-inner">
                  {iconMap[step.iconName]}
                </div>
                <span className="text-4xl font-black text-slate-300 dark:text-white/20 group-hover:text-brand-500/40 transition-colors font-sans">
                  {step.stepNumber}
                </span>
              </div>

              {/* Text */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors min-h-[56px]">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting indicator arrow for larger screens */}
              {index < mockProcessSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Public System Parameters / Policy Banner */}
        <div className="bg-gradient-to-r from-brand-600/10 via-cyan-500/10 to-brand-600/10 dark:from-brand-900/30 dark:via-dark-800 dark:to-brand-900/30 border border-brand-500/30 rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Chính Sách Đặt Cọc & Hoàn Hủy Linh Hoạt
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Thông tin được niêm yết công khai và tự động đồng bộ từ hệ thống cửa hàng HybridWash
                </p>
              </div>
            </div>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all shadow-md hover:shadow-brand-500/30 shrink-0"
            >
              <PhoneCall className="w-4 h-4" />
              Hotline: {phone}
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Card 1: Deposit Bike */}
            <div className="bg-white/80 dark:bg-dark-800/80 p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-start gap-4 shadow-sm">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Cọc Xe Máy
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {bikeDeposit.toLocaleString('vi-VN')} <span className="text-xs font-medium text-slate-500">VNĐ/lượt</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Mức phí cọc cố định giúp giữ chỗ giữ khung giờ đẹp
                </p>
              </div>
            </div>

            {/* Card 2: Deposit Car */}
            <div className="bg-white/80 dark:bg-dark-800/80 p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-start gap-4 shadow-sm">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Cọc Ô Tô
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {carPercentage}% <span className="text-xs font-medium text-slate-500">giá trị dịch vụ</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Tự động tính theo gói rửa & chăm sóc xe đã chọn
                </p>
              </div>
            </div>

            {/* Card 3: Refund Policy */}
            <div className="bg-white/80 dark:bg-dark-800/80 p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-start gap-4 shadow-sm">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Chính Sách Hoàn Cọc
                </span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  Hoàn 100% Cọc
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Khi thực hiện hủy trước <strong className="text-slate-900 dark:text-white">{refundDays} ngày</strong> so với giờ hẹn
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

