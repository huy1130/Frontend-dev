import React from 'react'
import { Calendar, Sparkles, ChevronRight, Award, ShieldCheck, Users, CheckCircle2 } from 'lucide-react'
import { mockHeroStats } from '../../mock/homeData'

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-28 pb-20 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-dark-900 transition-colors duration-300">
      {/* Background Media & Gradients */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-10 dark:opacity-30 scale-105 filter blur-[1px]"
          src="https://cdn.pixabay.com/video/2023/10/12/184734-873923034_large.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-100/95 to-slate-100 dark:from-dark-900/90 dark:via-dark-900/80 dark:to-dark-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(12,141,228,0.12),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(12,141,228,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.15),transparent_60%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Title & CTA */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-brand-500/30 text-brand-600 dark:text-brand-300 text-xs sm:text-sm font-semibold shadow-md dark:shadow-lg shadow-brand-500/10">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
              <span>Hệ Thống Chăm Sóc & Rửa Xe Đặt Lịch Chuẩn 5★</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
              RỬA XE THÔNG MINH <br />
              <span className="gradient-text heading-glow">TÍCH ĐIỂM THÀNH VIÊN</span>
            </h1>

            {/* Sub-description */}
            <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
              Đặt lịch giữ chỗ trong 30 giây, theo dõi quy trình rửa xe theo thời gian thực và tự động tích điểm nâng hạng thành viên nhận ưu đãi độc quyền.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#booking"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 text-white font-bold text-base shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all flex items-center gap-3 group"
              >
                <Calendar className="w-5 h-5 text-white" />
                <span className="text-white">Đặt Lịch Ngay Nhận 50K</span>
                <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#combos"
                className="px-7 py-4 rounded-xl bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-white font-semibold text-base transition-all flex items-center gap-2 border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm dark:shadow-none"
              >
                Khám phá Gói Combo
              </a>
            </div>

            {/* Highlights bullet badges */}
            <div className="pt-4 flex flex-wrap gap-6 text-xs sm:text-sm text-slate-700 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Không mất thời gian chờ đợi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Minh bạch hình ảnh giao nhận xe</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Bảo hành hiệu ứng phủ bóng</span>
              </div>
            </div>

          </div>

          {/* Floating Stats & Feature Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white dark:bg-dark-800/80 p-8 rounded-3xl border border-slate-200 dark:border-white/10 relative space-y-6 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-300">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-6">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg">HYBRID WASH SYSTEM</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Thống kê hoạt động thực tế</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                  <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="bg-slate-50 dark:bg-dark-900/60 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-semibold">
                    <Users className="w-4 h-4" />
                    Khách Hàng
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    +{mockHeroStats.customers.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Tin dùng hằng tháng</p>
                </div>

                <div className="bg-slate-50 dark:bg-dark-900/60 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                    <Award className="w-4 h-4" />
                    Lượt Đặt Lịch
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    +{mockHeroStats.bookings.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Hoàn thành xuất sắc</p>
                </div>

                <div className="bg-slate-50 dark:bg-dark-900/60 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
                    <Sparkles className="w-4 h-4" />
                    Chi Nhánh
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {mockHeroStats.branches} Cơ Sở
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Độ phủ toàn khu vực</p>
                </div>

                <div className="bg-slate-50 dark:bg-dark-900/60 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Hài Lòng
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {mockHeroStats.satisfactionRate}%
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Đánh giá 5 sao</p>
                </div>

              </div>

              {/* Banner note inside card */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-brand-950/80 border border-slate-200 dark:border-brand-500/30 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <p className="text-xs text-slate-800 dark:text-slate-200">
                  Hệ thống đang mở đặt lịch cho hôm nay. <span className="text-brand-600 dark:text-brand-400 font-bold">Còn 8 slot khung giờ vàng!</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
