import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BarChart3, 
  CalendarDays, 
  CreditCard, 
  History, 
  Users,
  LogOut 
} from 'lucide-react'
import Logo from '../common/Logo'

const menuItems = [
  { path: '/dashboard', name: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/reports', name: 'Báo cáo', icon: BarChart3 },
  { path: '/dashboard/appointments', name: 'Lịch hẹn', icon: CalendarDays },
  { path: '/dashboard/payments', name: 'Quản lý thanh toán', icon: CreditCard },
  { path: '/dashboard/transactions', name: 'Lịch sử giao dịch', icon: History },
  { path: '/dashboard/employees', name: 'Nhân viên', icon: Users },
]

export default function Sidebar() {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="w-64 min-h-screen bg-dark-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col font-['Montserrat',sans-serif]">
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-white/5">
        <Logo size="sm" />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-orange-400 border border-orange-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </div>

      {/* User Info / Logout (Optional placeholder) */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-black/40 border border-white/5 group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-white/40 truncate">admin@hybridwash.vn</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 shrink-0 text-white/40 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
