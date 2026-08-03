import React from 'react'
import { Eye, ShieldCheck, Gift, MapPin, Sparkles } from 'lucide-react'
import { mockFeatures } from '../../mock/homeData'

const iconMap: Record<string, React.ReactNode> = {
  Eye: <Eye className="w-8 h-8 text-cyan-400" />,
  ShieldCheck: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
  Gift: <Gift className="w-8 h-8 text-amber-400" />,
  MapPin: <MapPin className="w-8 h-8 text-brand-400" />,
}

export default function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            Công Nghệ Đột Phá
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            TẠI SAO CHỌN <span className="gradient-text">HYBRID WASH?</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Hệ sinh thái công nghệ chăm sóc xe tiên phong giúp bạn an tâm gửi gắm xế yêu.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockFeatures.map((feat) => (
            <div
              key={feat.id}
              className="glass-panel p-8 rounded-3xl border border-white/10 glass-panel-hover flex gap-6 items-start relative overflow-hidden group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-brand-500/10 transition-all">
                {iconMap[feat.iconName]}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                    {feat.title}
                  </h3>
                  {feat.highlightText && (
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {feat.highlightText}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/15 transition-all pointer-events-none" />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
