import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, CalendarDays, ArrowLeft, History, LogOut } from 'lucide-react'

export default function CustomerPortal() {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col font-['Montserrat',sans-serif] relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center w-full max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>Trang chủ</span>
          </Link>
          <div className="h-6 w-px bg-white/20"></div>
          <h1 className="text-xl font-bold text-white tracking-tight">Cổng Khách Hàng</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">Xin chào, Nguyễn Văn A</p>
            <p className="text-xs text-orange-400">Thành viên Vàng</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold">
            <User className="w-5 h-5" />
          </div>
          <button 
            onClick={handleLogout}
            title="Đăng xuất"
            className="ml-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-orange-400 transition-colors border border-white/10"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-6 md:p-12">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Action Card */}
            <div className="bg-dark-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-orange-500/30 transition-colors group cursor-pointer">
              <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Đặt lịch hẹn mới</h3>
              <p className="text-white/60 mb-6">Chọn dịch vụ, thời gian và địa điểm mong muốn của bạn.</p>
              <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
                Đặt Ngay
              </button>
            </div>

            {/* Action Card */}
            <div className="bg-dark-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-colors group cursor-pointer">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <History className="w-7 h-7 text-white/80" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Lịch sử dịch vụ</h3>
              <p className="text-white/60 mb-6">Xem lại các lần rửa xe và bảo dưỡng trước đây của bạn.</p>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">
                Xem Lịch Sử
              </button>
            </div>
            
          </div>
        </div>
      </main>

    </div>
  )
}
