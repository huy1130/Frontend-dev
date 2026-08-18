import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  CreditCard,
  History,
  Users,
  LogOut,
  Package,
  Tag,
  Award,
  CalendarPlus,
  ShieldCheck,
  Gift,
  Clock,
  ShieldAlert
} from 'lucide-react'

const menuItems = [
  { path: '/staff/appointments', name: 'Lịch Hẹn Khách', icon: CalendarDays },
  { path: '/staff/requests', name: 'Tạo Yêu Cầu', icon: CalendarPlus },
  { path: '/staff/incidents', name: 'Báo Cáo Sự Cố', icon: ShieldAlert },
]

export default function StaffSidebar() {
  const navigate = useNavigate()

  const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole') || 'Staff'
  const fullName = sessionStorage.getItem('fullName') || localStorage.getItem('fullName') || 'Staff User'
  const phoneNumber = sessionStorage.getItem('phoneNumber') || localStorage.getItem('phoneNumber') || 'staff@hybridwash.vn'
  const initial = fullName.charAt(0).toUpperCase()

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userRole')
    sessionStorage.removeItem('fullName')
    sessionStorage.removeItem('phoneNumber')
    sessionStorage.removeItem('currentTier')
    sessionStorage.removeItem('currentPoints')

    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('fullName')
    localStorage.removeItem('phoneNumber')
    localStorage.removeItem('currentTier')
    localStorage.removeItem('currentPoints')
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col font-sans relative z-20">

      {/* Logo Header */}
      <Link to="/" className="h-20 px-6 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50/50 to-white hover:bg-orange-50 transition-colors group cursor-pointer block no-underline">
        <div className="flex items-center gap-3 h-full">
          <img
            src="/logo-wash.png"
            alt="HYBRIDWASH Logo"
            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block">
              {userRole.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block">Trang chủ / Home</span>
          </div>
        </div>
      </Link>

      {/* Navigation Section */}
      <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Danh Mục Nhân Viên
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/staff'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl font-extrabold text-xs transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/80 font-bold'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </div>

      {/* Admin Profile Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-orange-500/20">
              {initial}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1">
                <span>{fullName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              </p>
              <p className="text-[10px] text-slate-400 truncate">{phoneNumber}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  )
}
