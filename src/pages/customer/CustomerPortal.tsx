import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, CalendarDays, History, LogOut, ChevronRight, Award, ShieldCheck } from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'

export default function CustomerPortal() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <NavBar />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto space-y-8">
        
        {/* User Welcome Banner */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Xin chào, Nguyễn Văn A</h1>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Thành viên Vàng</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm">Quản lý các dịch vụ rửa xe & tích điểm ưu đãi thành viên</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 w-full md:w-auto justify-between md:justify-start">
            <div className="text-left">
              <span className="text-xs text-slate-400 block font-medium">Điểm thưởng tích lũy</span>
              <span className="text-xl font-extrabold text-orange-400">1,250 điểm</span>
            </div>
          </div>
        </div>

        {/* Feature Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Action Card: Booking */}
          <div 
            onClick={() => navigate('/customer/booking')}
            className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 hover:border-orange-500/50 transition-all cursor-pointer group shadow-xl"
          >
            <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2">Đặt Lịch Hẹn Mới</h3>
            <p className="text-slate-400 mb-6 text-sm">Chọn dịch vụ rửa xe, thời gian slot và áp dụng mã giảm giá độc quyền.</p>
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-colors shadow-lg shadow-orange-500/20 text-sm">
              <span>Đặt Ngay</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          {/* Action Card: History */}
          <div 
            onClick={() => navigate('/customer/history')}
            className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 hover:border-slate-600 transition-all cursor-pointer group shadow-xl"
          >
            <div className="w-14 h-14 bg-slate-700/60 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <History className="w-7 h-7 text-slate-200" />
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2">Lịch Sử Dịch Vụ</h3>
            <p className="text-slate-400 mb-6 text-sm">Xem lại danh sách và trạng thái các lần rửa xe và bảo dưỡng trước đây.</p>
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-extrabold rounded-xl transition-colors border border-slate-600 text-sm">
              <span>Xem Lịch Sử</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          
        </div>

      </main>

      <Footer />
    </div>
  )
}
