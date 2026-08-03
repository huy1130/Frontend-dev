import React from 'react'
import { Sparkles, Check, Clock, Award, ArrowRight } from 'lucide-react'
import { mockComboPackages } from '../../mock/homeData'

export default function ComboPackages() {
  return (
    <section id="combos" className="py-24 bg-dark-900 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-96 bg-brand-500/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            Tiết Kiệm Lên Đến 30%
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            GÓI COMBO <span className="gradient-text">CHĂM SÓC TOÀN DIỆN</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Được thiết kế tối ưu giữa chi phí và hiệu quả bảo vệ xe. Lựa chọn hàng đầu của hơn 15,000+ chủ xe.
          </p>
        </div>

        {/* Combo Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {mockComboPackages.map((combo) => (
            <div
              key={combo.id}
              className={`glass-panel rounded-3xl p-8 border flex flex-col justify-between relative transition-all duration-300 ${
                combo.isBestSeller
                  ? 'border-brand-500/60 shadow-2xl shadow-brand-500/20 bg-dark-800/90 scale-105 z-20'
                  : 'border-white/10 glass-panel-hover'
              }`}
            >
              {/* Badges */}
              <div className="flex items-center justify-between gap-2 mb-6">
                {combo.isBestSeller ? (
                  <span className="bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg shadow-brand-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    BÁN CHẠY NHẤT
                  </span>
                ) : (
                  <span className="bg-white/10 text-slate-300 font-semibold text-xs px-3 py-1 rounded-full">
                    Gói Tiêu Chuẩn
                  </span>
                )}

                {combo.saveBadge && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs px-3 py-1 rounded-full">
                    {combo.saveBadge}
                  </span>
                )}
              </div>

              {/* Title & Tagline */}
              <div className="space-y-3 mb-6">
                <h3 className="text-2xl font-black text-white">{combo.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{combo.tagline}</p>
              </div>

              {/* Pricing Block */}
              <div className="py-5 border-y border-white/10 mb-6 space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {combo.discountedPrice.toLocaleString()}đ
                  </span>
                  <span className="text-base text-slate-500 line-through font-medium">
                    {combo.originalPrice.toLocaleString()}đ
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {combo.durationMinutes} phút
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    +{combo.bonusPoints} điểm thưởng
                  </span>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-3 mb-8 flex-1">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Dịch vụ bao gồm:
                </p>
                <ul className="space-y-2.5">
                  {combo.servicesIncluded.map((serviceStr, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-brand-400" />
                      </div>
                      <span>{serviceStr}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <a
                href="#booking"
                className={`w-full py-4 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 group ${
                  combo.isBestSeller
                    ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                Đặt Gói Này Ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
