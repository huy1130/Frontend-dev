import React, { useState, useEffect } from 'react'
import { Menu, X, Calendar, ChevronRight } from 'lucide-react'

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-r from-white via-orange-500 via-30% to-orange-600 shadow-xl border-b border-orange-500/30 opacity-100 ${isScrolled ? 'py-3.5' : 'py-5'
        }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">

          <a href="#" className="group shrink-0 flex items-center select-none ml-2 lg:ml-6">
            <div className="relative h-16 md:h-20 shrink-0 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
              <img
                src="/LOGO-HYBRID-transparent.png"
                alt="HYBRIDWASH Logo"
                className="w-auto h-full object-contain scale-125"
              />
            </div>
          </a>

          {/* Desktop Navigation ở chính giữa (Chữ màu trắng đục 100%) */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-9 flex-1 mx-6">
            <a
              href="#how-it-works"
              className="text-base lg:text-lg font-bold text-white hover:text-amber-200 hover:scale-105 transition-all drop-shadow-sm"
            >
              Quy trình
            </a>
            <a
              href="#combos"
              className="text-base lg:text-lg font-bold text-white hover:text-amber-200 hover:scale-105 transition-all flex items-center gap-1.5 drop-shadow-sm"
            >
              Gói Combo
              <span className="bg-white/25 text-white border border-white/40 text-xs font-bold px-2 py-0.5 rounded-full">
                Hot
              </span>
            </a>
            <a
              href="#promotions"
              className="text-base lg:text-lg font-bold text-white hover:text-amber-200 hover:scale-105 transition-all drop-shadow-sm"
            >
              Khuyến mãi
            </a>
            <a
              href="#services"
              className="text-base lg:text-lg font-bold text-white hover:text-amber-200 hover:scale-105 transition-all drop-shadow-sm"
            >
              Dịch vụ lẻ
            </a>
            <a
              href="#branches"
              className="text-base lg:text-lg font-bold text-white hover:text-amber-200 hover:scale-105 transition-all drop-shadow-sm"
            >
              Chi nhánh
            </a>
            <a
              href="#tiers"
              className="text-base lg:text-lg font-bold text-white hover:text-amber-200 hover:scale-105 transition-all drop-shadow-sm"
            >
              Hạng thẻ
            </a>
          </nav>

          {/* Right Action: Nút "Đặt lịch ngay" màu trắng đục nổi bật sát bên phải */}
          <div className="hidden md:flex items-center gap-3 shrink-0">

            <a
              href="#booking"
              className="px-7 py-3 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-base shadow-xl transition-all hover:scale-105 flex items-center gap-2 group border border-orange-100"
            >
              <Calendar className="w-5 h-5 text-orange-600" />
              <span>Đặt lịch ngay</span>
              <ChevronRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Mobile Right Bar (Menu trigger) */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-orange-600 border-b border-orange-500/40 px-4 pt-4 pb-6 space-y-4 animate-fade-up text-white shadow-2xl">
          <nav className="flex flex-col space-y-3">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Quy trình chăm sóc xe
            </a>
            <a
              href="#combos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Gói Combo rửa xe
            </a>
            <a
              href="#promotions"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Chương trình khuyến mãi
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Danh mục dịch vụ lẻ
            </a>
            <a
              href="#branches"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Hệ thống chi nhánh
            </a>
            <a
              href="#tiers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Hạng thẻ thành viên
            </a>
          </nav>

          <div className="pt-4 border-t border-white/20 flex flex-col gap-3">
            <a
              href="#booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 bg-white text-orange-600 font-extrabold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-orange-600" />
              <span>Đặt lịch ngay</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
