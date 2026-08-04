import React from 'react'
import { Calendar } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative w-full bg-dark-950 text-white transition-colors duration-300">

      {/* Ảnh nền hero_banner_bg.png - Dùng thẻ img trực tiếp để lấy đúng tỷ lệ thật của ảnh, không bị cắt xén (crop) */}
      <img
        src="/hero_banner_bg.png"
        alt="HYBRIDWASH - Hệ Thống Rửa Xe & Chăm Sóc Xe Hàng Đầu"
        className="w-full h-auto max-h-[1000px] object-cover object-center brightness-105 contrast-105"
      />

      {/* Lớp màu tối phủ lên để chữ nổi bật trên nền ảnh */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
      <div className="absolute inset-0 z-0 bg-black/25" /> {/* Thêm lớp màu tối nhẹ toàn màn hình cho an toàn */}

      {/* Nội dung hiển thị nổi trên ảnh */}
      <div className="absolute inset-0 z-10 flex items-center w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl space-y-8 text-left font-['Montserrat',sans-serif]">

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-[24px] sm:text-3xl lg:text-[46px] xl:text-[52px] font-extrabold text-white tracking-normal leading-[1.4] uppercase font-['Montserrat',sans-serif] drop-shadow-lg">
              <span className="block sm:whitespace-nowrap pb-2 sm:pb-3">HYBRIDWASH - HỆ THỐNG RỬA XE</span>
              <span className="block sm:whitespace-nowrap pb-2 sm:pb-3">&amp; CHĂM SÓC XE HÀNG ĐẦU</span>
              <span className="block sm:whitespace-nowrap">VIỆT NAM</span>
            </h1>
            <p className="text-slate-100 text-base sm:text-lg lg:text-xl font-medium leading-relaxed max-w-3xl">
              Quy trình rửa xe &amp; chăm sóc xe ô tô đúng cách hàng đầu tại TPHCM. Đặt lịch giữ chỗ trong 30s và tự động tích điểm nâng hạng thành viên.
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-6 pt-4 max-w-2xl">
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md">15,400+</div>
              <div className="text-sm sm:text-base text-white font-medium drop-shadow-md">Khách Hàng</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md">8+</div>
              <div className="text-sm sm:text-base text-white font-medium drop-shadow-md">Chi Nhánh</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md">48,900+</div>
              <div className="text-sm sm:text-base text-white font-medium drop-shadow-md">Lượt Đặt Lịch</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-6 pt-8">
            <a
              href="#booking"
              className="px-8 py-3.5 bg-[#f97316] text-white font-semibold text-base sm:text-lg hover:bg-orange-600 transition-colors flex items-center gap-3 drop-shadow-lg rounded-sm"
            >
              Đặt Hẹn Online
              <Calendar className="w-5 h-5" />
            </a>

            <a
              href="tel:1900888999"
              className="px-10 py-3.5 bg-transparent border border-white text-white font-semibold text-base sm:text-lg hover:bg-white/10 transition-colors drop-shadow-lg rounded-sm"
            >
              Tư Vấn Miễn Phí
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}