import React from 'react'
import { CalendarPlus } from 'lucide-react'

export default function Requests() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-500/10 rounded-xl">
          <CalendarPlus className="w-6 h-6 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tạo Yêu Cầu Đặt Lịch</h2>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <CalendarPlus className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium text-lg">Tính năng đang được phát triển</p>
        <p className="text-slate-400 mt-2 text-center max-w-md">
          Chức năng tạo mới lịch hẹn (booking) trực tiếp cho khách vãng lai tới cửa hàng sẽ sớm được cập nhật.
        </p>
      </div>
    </div>
  )
}
