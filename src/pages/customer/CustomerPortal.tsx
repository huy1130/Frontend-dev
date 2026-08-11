import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User, CalendarDays, History, ChevronRight, Award, Car } from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'

export default function CustomerPortal() {
  const navigate = useNavigate()
  const fullName = localStorage.getItem('fullName') || 'Khách hàng';
  const currentTier = localStorage.getItem('currentTier') || 'Thành viên';
  const currentPoints = localStorage.getItem('currentPoints') || '0';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <NavBar />

      {/* Main Content */}
      <main className="flex-1 pt-28 pb-32 px-4 sm:px-6 max-w-4xl w-full mx-auto space-y-6">
        
        {/* User Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md shadow-slate-200/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Xin chào, {fullName}</h1>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{currentTier}</span>
                </span>
              </div>
              <button 
                onClick={() => navigate('/customer/profile')}
                className="mt-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 w-fit flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Xem hồ sơ cá nhân</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 w-full md:w-auto justify-between md:justify-start">
            <div className="text-left">
              <span className="text-xs text-slate-500 block font-medium">Điểm thưởng tích lũy</span>
              <span className="text-lg font-extrabold text-orange-600">{currentPoints} điểm</span>
            </div>
          </div>
        </div>

        {/* Feature Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Action Card: Booking */}
          <div 
            onClick={() => navigate('/customer/booking')}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-400 transition-all cursor-pointer group shadow-md shadow-slate-200/50"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-orange-100">
              <CalendarDays className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1.5">Đặt Lịch Hẹn Mới</h3>
            <p className="text-slate-500 mb-5 text-xs sm:text-sm">Chọn dịch vụ rửa xe, thời gian slot và áp dụng mã giảm giá độc quyền.</p>
            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-orange-500/20 text-xs sm:text-sm">
              <span>Đặt Ngay</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          {/* Action Card: History */}
          <div 
            onClick={() => navigate('/customer/history')}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 transition-all cursor-pointer group shadow-md shadow-slate-200/50"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-slate-200">
              <History className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1.5">Lịch Sử Dịch Vụ</h3>
            <p className="text-slate-500 mb-5 text-xs sm:text-sm">Xem lại danh sách và trạng thái các lần rửa xe và bảo dưỡng trước đây.</p>
            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors border border-slate-200 text-xs sm:text-sm">
              <span>Xem Lịch Sử</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          {/* Action Card: Cars */}
          <div 
            onClick={() => navigate('/customer/cars')}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-400 transition-all cursor-pointer group shadow-md shadow-slate-200/50"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-emerald-100">
              <Car className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1.5">Quản Lý Xe</h3>
            <p className="text-slate-500 mb-5 text-xs sm:text-sm">Thêm và quản lý danh sách xe của bạn để tiện lợi hơn khi đặt lịch.</p>
            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-emerald-500/20 text-xs sm:text-sm">
              <span>Quản Lý Xe</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          
        </div>

      </main>

      <Footer />
    </div>
  )
}
