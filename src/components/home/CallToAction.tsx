import React, { useEffect, useState } from 'react'
import { Calendar, Sparkles, Star, Quote, ArrowRight } from 'lucide-react'
import { mockCustomerReviews } from '../../mock/homeData'
import { systemParameterService } from '../../services/systemParameterService'

export default function CallToAction() {
  const [hotline, setHotline] = useState<string>('0901234567')

  useEffect(() => {
    systemParameterService
      .getSystemParameter()
      .then((data) => {
        if (data?.contactPhone) setHotline(data.contactPhone)
      })
      .catch((err) => {
        console.warn('Lỗi khi lấy thông số hotline ở CallToAction:', err)
      })
  }, [])

  const cleanTel = hotline.replace(/\s+/g, '')
  return (
    <section id="booking" className="py-24 bg-slate-100 dark:bg-gradient-to-b dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">

        {/* Customer Reviews Carousel / Cards */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Đánh Giá Từ Khách Hàng
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              KHÁCH HÀNG NÓI GÌ VỀ <span className="gradient-text">HYBRID WASH?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockCustomerReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white dark:bg-dark-800/80 p-6 rounded-3xl border border-slate-200 dark:border-white/10 glass-panel-hover flex flex-col justify-between space-y-4 relative shadow-sm dark:shadow-none"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-slate-300 dark:text-white/10" />
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <img
                    src={rev.avatarUrl}
                    alt={rev.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-brand-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rev.customerName}</h4>
                    <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">{rev.carModel} • {rev.branchName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Big Banner CTA Box */}
        <div className="p-10 sm:p-14 rounded-3xl border border-brand-500/30 relative overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-600 dark:from-brand-950 dark:via-dark-800 dark:to-dark-900 shadow-2xl shadow-brand-500/20 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 dark:bg-brand-500/20 text-white dark:text-brand-300 border border-white/30 dark:border-brand-500/30 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-400" />
                Ưu Đãi Đặc Biệt Hôm Nay
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                SẴN SÀNG TRẢI NGHIỆM <br />
                <span className="text-cyan-200 dark:gradient-text">DỊCH VỤ RỬA XE ĐẲNG CẤP?</span>
              </h2>


            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
              <a
                href="#booking-modal"
                className="w-full py-4 px-8 rounded-2xl bg-white text-brand-700 dark:bg-gradient-to-r dark:from-brand-600 dark:via-brand-500 dark:to-cyan-500 dark:text-white font-extrabold text-base shadow-xl hover:scale-105 transition-all text-center flex items-center justify-center gap-2 group"
              >
                <Calendar className="w-5 h-5 text-brand-700 dark:text-white" />
                <span>Đặt Lịch Ngay Trong 30s</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href={`tel:${cleanTel}`}
                className="w-full py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm text-center border border-white/20 transition-all"
              >
                Gọi Hotline: {hotline}
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
