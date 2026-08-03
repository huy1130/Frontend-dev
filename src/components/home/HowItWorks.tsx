import React from 'react'
import { CalendarCheck, ClipboardCheck, Sparkles, Award, ArrowRight } from 'lucide-react'
import { mockProcessSteps } from '../../mock/homeData'

const iconMap: Record<string, React.ReactNode> = {
  CalendarCheck: <CalendarCheck className="w-7 h-7 text-brand-400" />,
  ClipboardCheck: <ClipboardCheck className="w-7 h-7 text-amber-400" />,
  Sparkles: <Sparkles className="w-7 h-7 text-cyan-400" />,
  Award: <Award className="w-7 h-7 text-emerald-400" />,
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-dark-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
            Trải Nghiệm Đơn Giản & Minh Bạch
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            QUY TRÌNH DỊCH VỤ <span className="gradient-text">4 BƯỚC THÔNG MINH</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Khác biệt hoàn toàn so với tiệm rửa xe truyền thống. Trải nghiệm dịch vụ chuyên nghiệp, minh bạch và tiết kiệm thời gian tối đa.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {mockProcessSteps.map((step, index) => (
            <div
              key={step.id}
              className="glass-panel p-8 rounded-3xl relative border border-white/10 glass-panel-hover flex flex-col justify-between group"
            >
              {/* Step Badge */}
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-brand-500/40 transition-all shadow-inner">
                  {iconMap[step.iconName]}
                </div>
                <span className="text-4xl font-black text-white/20 group-hover:text-brand-500/40 transition-colors font-sans">
                  {step.stepNumber}
                </span>
              </div>

              {/* Text */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting indicator arrow for larger screens */}
              {index < mockProcessSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
