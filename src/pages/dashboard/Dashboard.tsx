import React from 'react'
import { LayoutDashboard } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-500/10 rounded-xl">
          <LayoutDashboard className="w-6 h-6 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Tổng Quan</h2>
      </div>
      
      <div className="bg-dark-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
        <p className="text-white/40">Giao diện tổng quan hệ thống đang được cập nhật...</p>
      </div>
    </div>
  )
}
