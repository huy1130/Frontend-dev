import React from 'react'
import { Calendar, Sparkles, ChevronRight, Award, ShieldCheck, Users, CheckCircle2 } from 'lucide-react'
import { mockHeroStats } from '../../mock/homeData'

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-28 pb-20 flex items-center justify-center overflow-hidden bg-dark-900">
      {/* Background Media & Gradients */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-25 scale-105 filter blur-[1px]"
          src="https://cdn.pixabay.com/video/2023/10/12/184734-873923034_large.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/70 to-dark-900/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(12,141,228,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.15),transparent_60%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Title & CTA */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-brand-500/30 text-brand-300 text-xs sm:text-sm font-semibold shadow-lg shadow-brand-500/10">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Hệ Thống Chăm Sóc & Rửa Xe Đặt Lịch Chuẩn 5★</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
              RỬA XE THÔNG MINH <br />
              <span className="gradient-text heading-glow">TÍCH ĐIỂM THÀNH VIÊN</span>
            </h1>

            {/* Sub-description */}
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
              Đặt lịch giữ chỗ trong 30 giây, theo dõi quy trình rửa xe theo thời gian thực và tự động tích điểm nâng hạng thành viên nhận ưu đãi độc quyền.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#booking"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 text-white font-bold text-base shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all flex items-center gap-3 group"
              >
                <Calendar className="w-5 h-5" />
                Đặt Lịch Ngay Nhận 50K
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#combos"
                className="px-7 py-4 rounded-xl glass-panel text-slate-200 hover:text-white font-semibold text-base hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
              >
                Khám phá Gói Combo
              </a>
            </div>

            {/* Highlights bullet badges */}
            <div className="pt-4 flex flex-wrap gap-6 text-xs sm:text-sm text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Không mất thời gian chờ đợi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Minh bạch hình ảnh giao nhận xe</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Bảo hành hiệu ứng phủ bóng</span>
              </div>
            </div>

          </div>

          {/* Floating Stats & Feature Card */}
          <div className="lg:col-span-5 relative">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 relative space-y-6 shadow-2xl backdrop-blur-xl">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <h3 className="text-white font-bold text-lg">HYBRID WASH SYSTEM</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Thống kê hoạt động thực tế</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                  <ShieldCheck className="w-5 h-5 text-brand-400" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold">
                    <Users className="w-4 h-4" />
                    Khách Hàng
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    +{mockHeroStats.customers.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400">Tin dùng hằng tháng</p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <Award className="w-4 h-4" />
                    Lượt Đặt Lịch
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    +{mockHeroStats.bookings.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400">Hoàn thành xuất sắc</p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                    <Sparkles className="w-4 h-4" />
                    Chi Nhánh
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    {mockHeroStats.branches} Cơ Sở
                  </div>
                  <p className="text-[11px] text-slate-400">Độ phủ toàn khu vực</p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Hài Lòng
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    {mockHeroStats.satisfactionRate}%
                  </div>
                  <p className="text-[11px] text-slate-400">Đánh giá 5 sao</p>
                </div>

              </div>

              {/* Banner note inside card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-900/60 to-dark-800 border border-brand-500/20 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-xs text-slate-200">
                  Hệ thống đang mở đặt lịch cho hôm nay. <span className="text-brand-400 font-bold">Còn 8 slot khung giờ vàng!</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
