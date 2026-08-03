import React from 'react'
import { Crown, CheckCircle2, Zap, Award, Sparkles } from 'lucide-react'
import { mockTiers } from '../../mock/homeData'

export default function Tiers() {
  return (
    <section id="tiers" className="py-24 bg-dark-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5" />
            Chương Trình Thành Viên Loyalty
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            HẠNG THẺ & <span className="gradient-gold">ĐẶC QUYỀN TÍCH ĐIỂM</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Chi tiêu tích điểm càng nhiều, đặc quyền ưu đãi giảm giá và chăm sóc riêng càng cao cấp.
          </p>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockTiers.map((tier) => (
            <div
              key={tier.id}
              className="glass-panel rounded-3xl p-6 border border-white/10 glass-panel-hover flex flex-col justify-between relative group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${tier.badgeBg}`}>
                    {tier.name}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    {tier.pointMultiplier}
                  </div>
                </div>

                {/* Points & Discount */}
                <div className="mb-6 space-y-1">
                  <div className="text-3xl font-black text-white">
                    {tier.discountPercent > 0 ? `Giảm ${tier.discountPercent}%` : 'Tích 10% Điểm'}
                  </div>
                  <p className="text-xs text-slate-400">
                    {tier.minPoints === 0 ? 'Dành cho khách hàng mới' : `Từ ${tier.minPoints.toLocaleString()} điểm tích lũy`}
                  </p>
                </div>

                {/* Benefits checklist */}
                <div className="space-y-3 mb-6">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đặc quyền bao gồm:</p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {tier.benefits.map((ben, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="pt-4 border-t border-white/10">
                <a
                  href="#booking"
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-xs font-bold transition-all text-center block border border-white/10"
                >
                  Xem điều kiện nâng hạng
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
