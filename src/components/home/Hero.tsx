import React, { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Hero() {
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('userRole'))

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'))
  }, [])

  return (
    <section className="relative w-full bg-dark-950 text-white transition-colors duration-300 overflow-hidden">

      {/* Ảnh nền hero_banner_bg.png - Dùng thẻ img trực tiếp để hiển thị đầy đủ cả xe, thợ rửa và logo theo tỉ lệ gốc ban đầu */}
      <img
        src="/hero_banner_bg.png"
        alt="HYBRIDWASH - Hệ Thống Rửa Xe & Chăm Sóc Xe Hàng Đầu"
        className="w-full h-[400px] md:h-[800px] lg:h-[1000px] object-cover object-center brightness-105 contrast-105"
      />

      {/* Lớp màu tối phủ lên để chữ nổi bật trên nền ảnh */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
      <div className="absolute inset-0 z-0 bg-black/25" /> {/* Thêm lớp màu tối nhẹ toàn màn hình cho an toàn */}

      {/* Nội dung hiển thị nổi trên ảnh */}
      <div className="absolute inset-0 z-10 flex items-center w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl space-y-6 text-left font-['Montserrat',sans-serif]">

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[38px] font-extrabold text-white tracking-tight leading-[1.3] uppercase font-['Montserrat',sans-serif] drop-shadow-lg">
              HYBRID WASH - HỆ THỐNG RỬA XE<br />
              &amp; CHĂM SÓC XE<br />
              HÀNG ĐẦU VIỆT NAM
            </h1>
            <p className="text-slate-100 text-sm sm:text-base font-medium leading-relaxed max-w-xl pt-1">
              Quy trình rửa xe &amp; chăm sóc xe ô tô đúng cách hàng đầu tại TPHCM.<br />
              Đặt lịch giữ chỗ trong 30s<br />
              và tự động tích điểm nâng hạng thành viên.
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-2 max-w-lg">
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">15,400+</div>
              <div className="text-xs sm:text-sm text-white font-medium drop-shadow-md">Khách Hàng</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">8+</div>
              <div className="text-xs sm:text-sm text-white font-medium drop-shadow-md">Chi Nhánh</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">48,900+</div>
              <div className="text-xs sm:text-sm text-white font-medium drop-shadow-md">Lượt Đặt Lịch</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to={userRole === 'customer' ? '/customer/booking' : '/login'}
              className="px-6 py-2.5 bg-[#f97316] text-white font-semibold text-sm sm:text-base hover:bg-orange-600 transition-colors flex items-center gap-2 drop-shadow-lg rounded-sm"
            >
              Đặt Hẹn Online
              <Calendar className="w-4 h-4" />
            </Link>

            <a
              href="tel:1900888999"
              className="px-7 py-2.5 bg-transparent border border-white text-white font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors drop-shadow-lg rounded-sm"
            >
              Tư Vấn Miễn Phí
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}