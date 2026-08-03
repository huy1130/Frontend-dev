import React from 'react'
import { Calendar, Sparkles, Star, Quote, ArrowRight } from 'lucide-react'
import { mockCustomerReviews } from '../../mock/homeData'

export default function CallToAction() {
  return (
    <section id="booking" className="py-24 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
        
        {/* Customer Reviews Carousel / Cards */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              Đánh Giá Từ Khách Hàng
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              KHÁCH HÀNG NÓI GÌ VỀ <span className="gradient-text">HYBRID WASH?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockCustomerReviews.map((rev) => (
              <div
                key={rev.id}
                className="glass-panel p-6 rounded-3xl border border-white/10 glass-panel-hover flex flex-col justify-between space-y-4 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-white/10" />
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <img
                    src={rev.avatarUrl}
                    alt={rev.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-brand-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{rev.customerName}</h4>
                    <p className="text-[11px] text-brand-400 font-medium">{rev.carModel} • {rev.branchName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Big Banner CTA Box */}
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-brand-500/30 relative overflow-hidden bg-gradient-to-r from-brand-950 via-dark-800 to-dark-900 shadow-2xl shadow-brand-500/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Ưu Đãi Đặc Biệt Hôm Nay
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                SẴN SÀNG TRẢI NGHIỆM <br />
                <span className="gradient-text">DỊCH VỤ RỬA XE ĐẲNG CẤP?</span>
              </h2>

              <p className="text-slate-300 text-base max-w-xl">
                Đặt lịch giữ chỗ ngay hôm nay để nhận ngay voucher <span className="text-amber-400 font-bold">50.000đ</span> cho khách hàng mới và tích điểm thành viên x2.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
              <a
                href="#booking-modal"
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 text-white font-extrabold text-base shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all text-center flex items-center justify-center gap-2 group"
              >
                <Calendar className="w-5 h-5" />
                Đặt Lịch Ngay Trong 30s
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="tel:1900888999"
                className="w-full py-4 px-6 rounded-2xl glass-panel text-slate-200 hover:text-white font-bold text-sm text-center border border-white/10 hover:bg-white/10 transition-all"
              >
                Gọi Hotline: 1900 888 999
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
