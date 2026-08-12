import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, CalendarDays, History, ChevronRight, Award, Car, Loader2 } from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'
import { loyaltyService } from '../../services/loyaltyService'

export default function CustomerPortal() {
  const navigate = useNavigate()
  const fullName = localStorage.getItem('fullName') || 'Khách hàng';
  const [currentTier, setCurrentTier] = useState<string | null>(localStorage.getItem('currentTier'));
  const [currentPoints, setCurrentPoints] = useState<string | null>(localStorage.getItem('currentPoints'));
  const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(false);

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        setIsLoadingLoyalty(true);
        const data = await loyaltyService.getSummary();
        const pointsStr = data.currentPoints.toString();
        
        setCurrentTier(data.currentTier);
        setCurrentPoints(pointsStr);
        
        localStorage.setItem('currentTier', data.currentTier);
        localStorage.setItem('currentPoints', pointsStr);
      } catch (error) {
        console.error('Failed to fetch loyalty summary:', error);
      } finally {
        setIsLoadingLoyalty(false);
      }
    };

    // If token exists, we can fetch
    if (localStorage.getItem('token')) {
      fetchLoyalty();
    }
  }, []);

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
                  {isLoadingLoyalty ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{currentTier}</span>
                  )}
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
              {isLoadingLoyalty ? (
                <div className="flex items-center gap-2 text-orange-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-lg font-extrabold">Đang tải...</span>
                </div>
              ) : (
                <span className="text-lg font-extrabold text-orange-600">{currentPoints} điểm</span>
              )}
            </div>
          </div>
        </div>

        {/* Feature Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Action Card: Booking */}
          <div 
            onClick={() => navigate('/customer/booking')}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-400 transition-all cursor-pointer group shadow-md shadow-slate-200/50 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform border border-orange-100 shrink-0">
              <CalendarDays className="w-7 h-7 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">Đặt Lịch Hẹn Mới</h3>
              <p className="text-slate-500 text-xs sm:text-sm line-clamp-2">Chọn dịch vụ rửa xe, thời gian slot và áp dụng mã giảm giá.</p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-orange-50 group-hover:bg-orange-500 text-orange-600 group-hover:text-white rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* Action Card: History */}
          <div 
            onClick={() => navigate('/customer/history')}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-400 transition-all cursor-pointer group shadow-md shadow-slate-200/50 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-200 shrink-0">
              <History className="w-7 h-7 text-slate-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">Lịch Sử Dịch Vụ</h3>
              <p className="text-slate-500 text-xs sm:text-sm line-clamp-2">Xem lại các lần rửa xe và bảo dưỡng trước đây của bạn.</p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 group-hover:bg-slate-700 text-slate-700 group-hover:text-white rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* Action Card: Cars */}
          <div 
            onClick={() => navigate('/customer/cars')}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-400 transition-all cursor-pointer group shadow-md shadow-slate-200/50 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100 shrink-0">
              <Car className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">Quản Lý Xe</h3>
              <p className="text-slate-500 text-xs sm:text-sm line-clamp-2">Thêm và quản lý danh sách xe để tiện lợi khi đặt lịch.</p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-emerald-50 group-hover:bg-emerald-500 text-emerald-600 group-hover:text-white rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5" />
              </span>
            </div>
          </div>
          
          {/* Action Card: Rewards */}
          <div 
            onClick={() => navigate('/customer/rewards')}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-amber-400 transition-all cursor-pointer group shadow-md shadow-slate-200/50 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform border border-amber-100 shrink-0">
              <Award className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">Đổi Thưởng</h3>
              <p className="text-slate-500 text-xs sm:text-sm line-clamp-2">Dùng điểm tích lũy để đổi dịch vụ miễn phí, voucher.</p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-amber-50 group-hover:bg-amber-500 text-amber-600 group-hover:text-white rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5" />
              </span>
            </div>
          </div>
          
        </div>

      </main>

      <Footer />
    </div>
  )
}
