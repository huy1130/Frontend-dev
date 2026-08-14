import React, { useState, useEffect } from 'react'
import { Menu, X, Calendar, ChevronRight, User, LogOut, History, CalendarDays, Car, LayoutDashboard } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function NavBar() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('userRole'))

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('fullName')
    localStorage.removeItem('phoneNumber')
    localStorage.removeItem('currentTier')
    localStorage.removeItem('currentPoints')
    setUserRole(null)
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-2.5 bg-gradient-to-r from-white via-orange-500 via-30% to-orange-600 shadow-lg border-b border-orange-500/30">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          <Link to="/" className="group shrink-0 flex items-center select-none ml-2 lg:ml-4">
            <div className="relative h-14 md:h-16 shrink-0 flex items-center justify-center py-1">
              <img
                src="/logo-wash.png"
                alt="HYBRIDWASH Logo"
                className="w-auto h-full object-contain scale-110"
              />
            </div>
          </Link>

          {/* Desktop Navigation ở chính giữa */}
          <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-7 flex-1 mx-4">
            <Link
              to="/"
              className="text-sm lg:text-base font-bold text-white hover:text-amber-200 transition-colors drop-shadow-sm"
            >
              Trang chủ
            </Link>
            <a
              href="/#how-it-works"
              className="text-sm lg:text-base font-bold text-white hover:text-amber-200 transition-colors drop-shadow-sm"
            >
              Quy trình
            </a>
            <a
              href="/#promotions"
              className="text-sm lg:text-base font-bold text-white hover:text-amber-200 transition-colors drop-shadow-sm"
            >
              Khuyến mãi
            </a>
            <a
              href="/#services"
              className="text-sm lg:text-base font-bold text-white hover:text-amber-200 transition-colors drop-shadow-sm"
            >
              Dịch vụ lẻ
            </a>

            <a
              href="/#tiers"
              className="text-sm lg:text-base font-bold text-white hover:text-amber-200 transition-colors drop-shadow-sm"
            >
              Hạng thẻ
            </a>
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0 relative">
            {userRole === 'customer' ? (
              <>
                <Link
                  to="/customer"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                  className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs lg:text-sm transition-colors flex items-center gap-1.5 backdrop-blur-sm border border-white/20 shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Quản lý tài khoản</span>
                </Link>

                <Link
                  to="/customer/booking"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                  className="px-4 py-2 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-xs lg:text-sm transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <CalendarDays className="w-4 h-4 text-orange-600" />
                  <span>Đặt lịch ngay</span>
                </Link>

                <div className="relative ml-1">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-10 h-10 rounded-full bg-white/90 text-orange-600 flex items-center justify-center font-bold shadow-md hover:bg-white transition-colors border border-orange-100"
                    title="Thông tin tài khoản"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-up">
                      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="font-bold text-gray-800">Xin chào, {localStorage.getItem('fullName') || 'Khách Hàng'}</p>
                        <p className="text-xs text-orange-600 font-medium mt-0.5">{localStorage.getItem('currentTier') || 'Thành viên'}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to="/customer/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>
                        <Link
                          to="/customer/history"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        >
                          <History className="w-4 h-4" />
                          <span>Lịch sử đặt lịch</span>
                        </Link>
                        <Link
                          to="/customer/cars"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        >
                          <Car className="w-4 h-4" />
                          <span>Quản lý xe</span>
                        </Link>
                        <Link
                          to="/customer/booking"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        >
                          <CalendarDays className="w-4 h-4" />
                          <span>Đặt lịch mới</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-gray-50">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : userRole && ['admin', 'manager', 'staff'].includes(userRole.toLowerCase()) ? (
              <Link
                to={userRole.toLowerCase() === 'staff' ? '/staff/appointments' : '/admin'}
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                className="px-6 py-2.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-sm shadow-xl transition-all hover:scale-105 flex items-center gap-2 group border border-orange-100"
              >
                <LayoutDashboard className="w-4 h-4 text-orange-600" />
                <span>Vào trang {userRole.toLowerCase() === 'staff' ? 'Nhân viên' : 'Quản trị'}</span>
                <ChevronRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-7 py-3 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-base shadow-xl transition-all hover:scale-105 flex items-center gap-2 group border border-orange-100"
              >
                <Calendar className="w-5 h-5 text-orange-600" />
                <span>Đăng ký ngay</span>
                <ChevronRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
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
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Trang chủ
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Quy trình chăm sóc xe
            </a>
            <a
              href="/#promotions"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Chương trình khuyến mãi
            </a>
            <a
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Danh mục dịch vụ lẻ
            </a>

            <a
              href="/#tiers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Hạng thẻ thành viên
            </a>
          </nav>

          <div className="pt-4 border-t border-white/20 flex flex-col gap-3">
            {userRole === 'customer' ? (
              <>
                <Link
                  to="/customer/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-white/10 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link
                  to="/customer/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-white/10 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <History className="w-5 h-5" />
                  <span>Lịch sử đặt lịch</span>
                </Link>
                <Link
                  to="/customer/cars"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-white/10 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <Car className="w-5 h-5" />
                  <span>Quản lý xe</span>
                </Link>
                <Link
                  to="/customer/booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3.5 bg-white text-orange-600 font-extrabold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
                >
                  <CalendarDays className="w-5 h-5 text-orange-600" />
                  <span>Đặt lịch mới</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="w-full text-center py-3 bg-red-500/20 text-red-100 font-semibold text-base rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : userRole && ['admin', 'manager', 'staff'].includes(userRole.toLowerCase()) ? (
              <Link
                to={userRole.toLowerCase() === 'staff' ? '/staff/appointments' : '/admin'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3.5 bg-white text-orange-600 font-extrabold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5 text-orange-600" />
                <span>Vào trang {userRole.toLowerCase() === 'staff' ? 'Nhân viên' : 'Quản trị'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3.5 bg-white text-orange-600 font-extrabold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5 text-orange-600" />
                <span>Đăng ký ngay</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
