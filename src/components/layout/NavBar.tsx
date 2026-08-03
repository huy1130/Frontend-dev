import React, { useState, useEffect } from 'react'
import { Menu, X, Calendar, User, Sparkles } from 'lucide-react'
import ThemeToggleButton from '../common/ThemeToggleButton'
import Logo from '../common/Logo'

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/90 dark:bg-dark-900/85 backdrop-blur-md border-b border-slate-200 dark:border-white/10 py-3 shadow-md dark:shadow-2xl shadow-brand-500/5'
          : 'bg-gradient-to-b from-slate-100/90 via-slate-100/50 to-transparent dark:from-dark-900/90 dark:via-dark-900/40 dark:to-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Brand */}
          <a href="#" className="group">
            <Logo size="md" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:scale-105 transition-all"
            >
              Quy trình
            </a>
            <a
              href="#combos"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:scale-105 transition-all flex items-center gap-1.5"
            >
              Gói Combo
              <span className="bg-brand-500/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-brand-500/30">
                Hot
              </span>
            </a>
            <a
              href="#promotions"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:scale-105 transition-all"
            >
              Khuyến mãi
            </a>
            <a
              href="#services"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:scale-105 transition-all"
            >
              Dịch vụ lẻ
            </a>
            <a
              href="#branches"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:scale-105 transition-all"
            >
              Chi nhánh
            </a>
            <a
              href="#tiers"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:scale-105 transition-all"
            >
              Hạng thẻ
            </a>
          </nav>

          {/* Right Action Buttons & Dark Mode Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button Component */}
            <ThemeToggleButton />

            <a
              href="#login"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Đăng nhập
            </a>

            <a
              href="#booking"
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 p-px font-semibold text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all"
            >
              <div className="relative px-5 py-2.5 rounded-[11px] bg-white dark:bg-dark-900 group-hover:bg-transparent transition-all flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors">Đặt lịch ngay</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
              </div>
            </a>
          </div>

          {/* Mobile Right Bar (Theme toggle + Menu trigger) */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggleButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-white/5"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-dark-900/95 border-b border-slate-200 dark:border-white/10 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4 animate-fade-up">
          <nav className="flex flex-col space-y-3">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Quy trình chăm sóc xe
            </a>
            <a
              href="#combos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Gói Combo rửa xe
            </a>
            <a
              href="#promotions"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Chương trình khuyến mãi
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Danh mục dịch vụ lẻ
            </a>
            <a
              href="#branches"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Hệ thống chi nhánh
            </a>
            <a
              href="#tiers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Hạng thẻ thành viên
            </a>
          </nav>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-3">
            <a
              href="#booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-white">Đặt lịch ngay</span>
            </a>
            <a
              href="#login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Đăng nhập / Đăng ký
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
