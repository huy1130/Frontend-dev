import React from 'react'
import { MapPin, Phone, Star, Clock, Navigation } from 'lucide-react'
import { mockBranches } from '../../mock/homeData'

export default function Branches() {
  return (
    <section id="branches" className="py-24 bg-slate-100 dark:bg-dark-800/40 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            Phủ Rộng Khắp Thành Phố
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            HỆ THỐNG <span className="gradient-text">CHI NHÁNH HYBRID WASH</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Hạ tầng hiện đại, vị trí thuận tiện với đầy đủ tiện ích cao cấp dành riêng cho bạn.
          </p>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockBranches.map((br) => (
            <div
              key={br.id}
              className="bg-white dark:bg-dark-800/80 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 glass-panel-hover flex flex-col justify-between group shadow-sm dark:shadow-none"
            >
              <div>
                {/* Image & Status Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={br.imageUrl}
                    alt={br.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 right-4 bg-dark-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{br.rating} ({br.reviewsCount})</span>
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-300 uppercase">Đang mở cửa</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                    {br.name}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{br.address}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">{br.phone}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                      <span>{br.operatingHours}</span>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiện ích cơ sở:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {br.facilities.map((fac, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Card Action */}
              <div className="p-6 pt-0">
                <a
                  href="#booking"
                  className="w-full py-3 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-500 text-brand-700 dark:text-brand-300 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-brand-500/30"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Chọn Chi Nhánh Này Đặt Lịch
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
