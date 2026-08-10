import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  History, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  ChevronRight, 
  AlertCircle,
  Car
} from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'

interface BookingHistoryItem {
  id: string
  services: string[]
  date: string
  time: string
  branch: string
  totalPrice: number
  status: 'completed' | 'cancelled'
}

export default function CustomerHistory() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all')

  const historyData: BookingHistoryItem[] = [
    {
      id: 'BK-98214',
      services: ['Rửa Xe Bọt Tuyết & Hút Bụi Cao Cấp'],
      date: '10/08/2026',
      time: '14:00',
      branch: 'Chi nhánh Quận 1 - 123 Nguyễn Trãi',
      totalPrice: 135000,
      status: 'completed',
    },
    {
      id: 'BK-88410',
      services: ['Combo Vệ Sinh Nội Thất Chuyên Sâu', 'Vệ Sinh Khoang Máy Bằng Hơi Nước Nóng'],
      date: '02/08/2026',
      time: '09:30',
      branch: 'Chi nhánh Quận 7 - 456 Nguyễn Thị Thập',
      totalPrice: 700000,
      status: 'completed',
    },
    {
      id: 'BK-85112',
      services: ['Phủ Ceramic Bảo Vệ Sơn & Tẩy Ố Kính'],
      date: '18/07/2026',
      time: '15:30',
      branch: 'Chi nhánh Thủ Đức - 789 Võ Văn Ngân',
      totalPrice: 850000,
      status: 'completed',
    },
    {
      id: 'BK-79901',
      services: ['Rửa Xe Bọt Tuyết & Hút Bụi Cao Cấp'],
      date: '05/07/2026',
      time: '10:00',
      branch: 'Chi nhánh Quận 1 - 123 Nguyễn Trãi',
      totalPrice: 150000,
      status: 'cancelled',
    },
  ]

  const filteredData = historyData.filter((item) => {
    if (filterStatus === 'all') return true
    return item.status === filterStatus
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <NavBar />

      <main className="flex-1 pt-28 pb-12 px-4 sm:px-6 max-w-4xl w-full mx-auto space-y-6">
        


        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2.5">
              <History className="w-6 h-6 text-orange-600" />
              <span>Lịch Sử Đặt Lịch & Dịch Vụ</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Theo dõi và quản lý tất cả các lần chăm sóc xe tại hệ thống HybridWash.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/customer/booking"
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đặt Lịch Dịch Vụ Mới</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl border border-slate-200 self-start w-fit">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'all'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Tất Cả ({historyData.length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Hoàn Thành ({historyData.filter(i => i.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'cancelled'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Đã Hủy ({historyData.filter(i => i.status === 'cancelled').length})
          </button>
        </div>

        {/* Cards List */}
        <div className="space-y-3.5">
          {filteredData.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 font-medium text-sm">Chưa có lịch sử dịch vụ nào thuộc danh mục này.</p>
            </div>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-300 transition-all shadow-md shadow-slate-200/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                      {item.id}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                      <CalendarIcon className="w-3.5 h-3.5 text-orange-600" />
                      <span>{item.date} • {item.time}</span>
                    </div>
                  </div>

                  <div>
                    {item.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã Hoàn Thành</span>
                      </span>
                    )}
                    {item.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Đã Hủy</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <Car className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-slate-500 font-medium mb-0.5">Dịch vụ đã đăng ký:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-xs sm:text-sm font-bold text-slate-900">
                          {item.services.map((svc, i) => (
                            <li key={i}>{svc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.branch}</span>
                    </div>
                  </div>

                  <div className="md:col-span-4 text-left md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                    <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">Tổng tiền thanh toán</span>
                    <span className="text-xl font-extrabold text-orange-600">
                      {item.totalPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <div className="mt-2.5 flex md:justify-end">
                      <Link 
                        to="/customer/booking" 
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                      >
                        Đặt Lại Dịch Vụ Này
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </main>

      <Footer />
    </div>
  )
}
