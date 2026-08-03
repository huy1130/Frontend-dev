import React from 'react'
import { Car, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-brand-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5 shadow-lg shadow-brand-500/30">
                <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                  <Car className="w-5 h-5 text-brand-400" />
                </div>
              </div>
              <span className="text-2xl font-black text-white">
                HYBRID<span className="gradient-text">WASH</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Hệ thống quản lý và chăm sóc xe thông minh hàng đầu. Trải nghiệm dịch vụ rửa xe sinh thái, dọn nội thất chuyên sâu và phủ Ceramic bảo vệ bề mặt sơn đạt tiêu chuẩn 5 sao.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-brand-400 font-semibold bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20">
                <ShieldCheck className="w-4 h-4" />
                Chuẩn quy trình Châu Âu
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide">Dịch Vụ Nổi Bật</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#combos" className="hover:text-brand-400 transition-colors">Combo Rửa Xe Sinh Thái</a></li>
              <li><a href="#combos" className="hover:text-brand-400 transition-colors">Hybrid Ultimate Detailing</a></li>
              <li><a href="#services" className="hover:text-brand-400 transition-colors">Dọn Nội Thất Hơi Nước</a></li>
              <li><a href="#services" className="hover:text-brand-400 transition-colors">Tẩy Khoang Máy Chuyên Sâu</a></li>
              <li><a href="#services" className="hover:text-brand-400 transition-colors">Phủ Ceramic Sơn & Kính</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide">Khách Hàng & Thành Viên</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#tiers" className="hover:text-brand-400 transition-colors">Chính Sách Tích Điểm</a></li>
              <li><a href="#tiers" className="hover:text-brand-400 transition-colors">Hạng Thẻ & Đặc Quyền</a></li>
              <li><a href="#promotions" className="hover:text-brand-400 transition-colors">Voucher Khuyến Mãi</a></li>
              <li><a href="#how-it-works" className="hover:text-brand-400 transition-colors">Hướng Dẫn Đặt Lịch</a></li>
              <li><a href="#faq" className="hover:text-brand-400 transition-colors">Câu Hỏi Thường Gặp</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide">Liên Hệ Hotline</h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="font-semibold text-white">1900 888 999</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@hybridwash.vn</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>07:00 - 21:00 (Thứ 2 - Chủ Nhật)</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>124 Nguyễn Trãi, P. Bến Thành, Q.1, TP.HCM</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 HYBRID WASH. All rights reserved. Hệ Thống Chăm Sóc Xe Đẳng Cấp.</p>
          <div className="flex items-center gap-1">
            <span>Thiết kế với</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" />
            <span>cho trải nghiệm khách hàng tối ưu</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
