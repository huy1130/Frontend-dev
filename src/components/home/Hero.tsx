import React from 'react'
import { Calendar, Sparkles, ChevronRight, CheckCircle2, PhoneCall, Users, Award, MapPin } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[640px] flex items-center overflow-hidden border-t-4 border-amber-500 bg-dark-950 text-white transition-colors duration-300">

      {/* Ảnh nền hero_banner_bg.png phủ TOÀN BỘ 100% chiều rộng & chiều cao section */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/hero_banner_bg.png"
          alt="HYBRIDWASH - Hệ Thống Rửa Xe & Chăm Sóc Xe Hàng Đầu"
          className="w-full h-full object-cover object-right lg:object-center"
        />
        
        {/* Lớp gradient overlay CHỈ làm mờ phần bên trái nơi hiển thị nội dung, nửa bên phải (xe ô tô, người thợ & logo tường 3D) giữ nguyên độ rực rỡ sắc nét 100% */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 via-[45%] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      {/* Nội dung chữ đè trực tiếp lên nửa bên trái */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
        <div className="max-w-xl lg:max-w-2xl space-y-6 text-left">

          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Chăm Sóc Ô Tô Toàn Diện</span>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">Rửa Xe Ô Tô</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Quy Trình Rửa Xe Chuẩn 5★ Quốc Tế</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              HYBRIDWASH – HỆ THỐNG RỬA XE & CHĂM SÓC XE HÀNG ĐẦU VIỆT NAM
            </h1>
          </div>

          {/* Sub-description */}
          <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-medium drop-shadow">
            Quy trình rửa xe & chăm sóc xe ô tô đúng cách hàng đầu tại TPHCM. Đặt lịch giữ chỗ trong 30s và tự động tích điểm nâng hạng thành viên.
          </p>

          {/* Quick Stats Bar chuẩn phong cách VinaWash */}
          <div className="py-3 grid grid-cols-3 gap-4 border-y border-white/20 max-w-lg">
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">15,400+</div>
              <div className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Khách Hàng
              </div>
            </div>
            <div className="space-y-0.5 border-x border-white/20 px-3">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">8+</div>
              <div className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Chi Nhánh
              </div>
            </div>
            <div className="space-y-0.5 pl-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">48,900+</div>
              <div className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> Lượt Đặt Lịch
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <a
              href="#booking"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-base shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all flex items-center gap-2.5 group"
            >
              <Calendar className="w-5 h-5 text-white" />
              <span className="text-white">Đặt Hẹn Online</span>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="tel:1900888999"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition-all flex items-center gap-2 border border-white/20 shadow-lg backdrop-blur-md"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              Tư Vấn Miễn Phí
            </a>
          </div>

          {/* Feature Pills Row */}
          <div className="pt-3 flex flex-wrap gap-3 text-xs sm:text-sm text-white font-semibold">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20 shadow-lg backdrop-blur-md hover:bg-white/20 transition-all">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Rửa Sạch Chuyên Sâu</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20 shadow-lg backdrop-blur-md hover:bg-white/20 transition-all">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Quy Trình Đúng Cách</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20 shadow-lg backdrop-blur-md hover:bg-white/20 transition-all">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Nhanh Chóng - Đúng Hẹn</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}