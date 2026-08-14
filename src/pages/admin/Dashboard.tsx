import React, { useState, useMemo } from 'react'
import {
  BarChart3,
  Calendar,
  TrendingUp,
  CreditCard,
  Users,
  UserCheck,
  UserX,
  Sparkles,
  ArrowUpRight,
  Filter,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

interface DailyRevenueData {
  dateStr: string
  formattedDate: string
  originalRevenue: number
  discountAmount: number
  netRevenue: number
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  systemCustomerRevenue: number
  guestCustomerRevenue: number
}

// Seeded pseudo-random generator for realistic past date mock data
function generateDailyMock(date: Date): DailyRevenueData {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  const formattedDate = `${day}/${month}/${year}`

  // Pseudo-random based on day timestamp
  const seed = (date.getTime() / 86400000) % 100
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const baseBookings = isWeekend ? 22 + Math.floor(seed % 12) : 12 + Math.floor(seed % 10)
  
  const totalBookings = baseBookings
  const cancelledBookings = Math.floor(totalBookings * 0.08)
  const completedBookings = totalBookings - cancelledBookings

  const avgPrice = 80000 + (seed % 5) * 20000
  const originalRevenue = completedBookings * avgPrice
  const discountAmount = Math.round(originalRevenue * (0.1 + (seed % 8) * 0.015))
  const netRevenue = Math.max(0, originalRevenue - discountAmount)

  const systemRatio = 0.65 + (seed % 15) * 0.01
  const systemCustomerRevenue = Math.round(netRevenue * systemRatio)
  const guestCustomerRevenue = netRevenue - systemCustomerRevenue

  return {
    dateStr,
    formattedDate,
    originalRevenue,
    discountAmount,
    netRevenue,
    totalBookings,
    completedBookings,
    cancelledBookings,
    systemCustomerRevenue,
    guestCustomerRevenue
  }
}

export default function Dashboard() {
  // Default range: Past 7 days up to today (2026-08-14)
  const today = new Date(2026, 7, 14) // 14 Aug 2026
  const sevenDaysAgo = new Date(2026, 7, 7) // 7 Aug 2026

  const formatDateForInput = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const [startDate, setStartDate] = useState<string>(formatDateForInput(sevenDaysAgo))
  const [endDate, setEndDate] = useState<string>(formatDateForInput(today))
  const [activePreset, setActivePreset] = useState<string>('7days')

  // Validation logic: date2 >= date1
  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    setActivePreset('custom')
    if (endDate && new Date(val) > new Date(endDate)) {
      toast.warning('Ngày bắt đầu lớn hơn ngày kết thúc. Đã tự động điều chỉnh ngày kết thúc!')
      setEndDate(val)
    }
  }

  const handleEndDateChange = (val: string) => {
    if (startDate && new Date(val) < new Date(startDate)) {
      toast.error('Lỗi: Ngày kết thúc (Date 2) phải lớn hơn hoặc bằng Ngày bắt đầu (Date 1)!')
      return
    }
    setEndDate(val)
    setActivePreset('custom')
  }

  // Quick Preset Handlers
  const applyPreset = (type: string) => {
    setActivePreset(type)
    const currentToday = new Date(2026, 7, 14)

    if (type === 'today') {
      const todayStr = formatDateForInput(currentToday)
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (type === '7days') {
      const d = new Date(currentToday)
      d.setDate(d.getDate() - 6)
      setStartDate(formatDateForInput(d))
      setEndDate(formatDateForInput(currentToday))
    } else if (type === '30days') {
      const d = new Date(currentToday)
      d.setDate(d.getDate() - 29)
      setStartDate(formatDateForInput(d))
      setEndDate(formatDateForInput(currentToday))
    } else if (type === 'thisMonth') {
      const startOfMonth = new Date(2026, 7, 1)
      setStartDate(formatDateForInput(startOfMonth))
      setEndDate(formatDateForInput(currentToday))
    }
    toast.success('Đã cập nhật khoảng thời gian báo cáo!')
  }

  // Generate Daily Data List in Range
  const dailyDataList = useMemo(() => {
    if (!startDate || !endDate) return []
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) return []

    const list: DailyRevenueData[] = []
    const curr = new Date(start)
    while (curr <= end) {
      list.push(generateDailyMock(curr))
      curr.setDate(curr.getDate() + 1)
    }
    return list
  }, [startDate, endDate])

  // Summary Totals
  const totals = useMemo(() => {
    return dailyDataList.reduce(
      (acc, item) => {
        acc.netRevenue += item.netRevenue
        acc.originalRevenue += item.originalRevenue
        acc.discountAmount += item.discountAmount
        acc.totalBookings += item.totalBookings
        acc.completedBookings += item.completedBookings
        acc.cancelledBookings += item.cancelledBookings
        acc.systemCustomerRevenue += item.systemCustomerRevenue
        acc.guestCustomerRevenue += item.guestCustomerRevenue
        return acc
      },
      {
        netRevenue: 0,
        originalRevenue: 0,
        discountAmount: 0,
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        systemCustomerRevenue: 0,
        guestCustomerRevenue: 0
      }
    )
  }, [dailyDataList])

  const completionRate = totals.totalBookings > 0
    ? ((totals.completedBookings / totals.totalBookings) * 100).toFixed(1)
    : '0'

  const avgOrderValue = totals.completedBookings > 0
    ? Math.round(totals.netRevenue / totals.completedBookings)
    : 0

  const maxDailyRevenue = useMemo(() => {
    return Math.max(...dailyDataList.map((d) => d.netRevenue), 1)
  }, [dailyDataList])

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Báo Cáo Thống Kê & Doanh Thu</h2>
            <p className="text-xs text-slate-500 font-medium">Theo dõi hiệu suất kinh doanh, số lượt rửa xe & doanh thu thực tế</p>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activePreset === 'today' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => applyPreset('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activePreset === '7days' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            7 ngày qua
          </button>
          <button
            onClick={() => applyPreset('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activePreset === '30days' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            30 ngày qua
          </button>
          <button
            onClick={() => applyPreset('thisMonth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activePreset === 'thisMonth' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tháng này
          </button>
        </div>
      </div>

      {/* Date Range Picker Filter Box (Date 2 >= Date 1 Logic) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <Filter className="w-4 h-4 text-orange-500" />
          <span>Bộ Lọc Khoảng Thời Gian Báo Cáo:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Start Date (Date 1) */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-slate-500">Từ ngày (Date 1):</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-800 outline-none cursor-pointer"
            />
          </div>

          <span className="text-slate-400 font-bold text-sm">➔</span>

          {/* End Date (Date 2) */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-slate-500">Đến ngày (Date 2):</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-800 outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => toast.info(`Báo cáo từ ${startDate} đến ${endDate}`)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Net Revenue */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <CreditCard className="w-24 h-24 text-white" />
          </div>
          <p className="text-xs font-extrabold text-orange-100 uppercase tracking-wider mb-2">Doanh Thu Thực Nhận</p>
          <h3 className="text-2xl font-black mb-1">{totals.netRevenue.toLocaleString('vi-VN')} đ</h3>
          <p className="text-[11px] text-orange-100 font-medium">
            Giá gốc: {totals.originalRevenue.toLocaleString('vi-VN')}đ (-{totals.discountAmount.toLocaleString('vi-VN')}đ ưu đãi)
          </p>
        </div>

        {/* Card 2: Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Tổng Số Lịch Hẹn</p>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-2xl font-black text-slate-900">{totals.totalBookings} lượt</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {completionRate}% xong
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 mt-2">
            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {totals.completedBookings} xong</span>
            <span className="text-rose-500 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> {totals.cancelledBookings} hủy</span>
          </div>
        </div>

        {/* Card 3: System Customer Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-extrabold text-blue-500 uppercase tracking-wider mb-2">Khách Hệ Thống (Thành viên)</p>
          <h3 className="text-2xl font-black text-slate-900 mb-1">{totals.systemCustomerRevenue.toLocaleString('vi-VN')} đ</h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Chiếm {totals.netRevenue > 0 ? ((totals.systemCustomerRevenue / totals.netRevenue) * 100).toFixed(1) : 0}% tổng doanh thu
          </p>
        </div>

        {/* Card 4: Guest Customer Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-extrabold text-purple-500 uppercase tracking-wider mb-2">Khách Vãng Lai</p>
          <h3 className="text-2xl font-black text-slate-900 mb-1">{totals.guestCustomerRevenue.toLocaleString('vi-VN')} đ</h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Trung bình đơn: {avgOrderValue.toLocaleString('vi-VN')} đ/lượt
          </p>
        </div>
      </div>

      {/* Visual Revenue Progression Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Biểu Đồ Doanh Thu Theo Ngày</h3>
            <p className="text-xs text-slate-500">So sánh doanh thu thực nhận giữa các ngày trong khoảng thời gian đã chọn</p>
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
            {dailyDataList.length} ngày báo cáo
          </span>
        </div>

        {dailyDataList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            Không có dữ liệu trong khoảng thời gian này. Vui lòng chọn lại khoảng ngày!
          </div>
        ) : (
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end gap-2 sm:gap-3 overflow-x-auto pb-6 border-b border-slate-100 custom-scrollbar">
              {dailyDataList.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.netRevenue / maxDailyRevenue) * 100))
                return (
                  <div key={item.dateStr} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
                        {item.formattedDate}: {item.netRevenue.toLocaleString('vi-VN')}đ ({item.completedBookings} xe)
                      </div>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                    </div>

                    {/* Value Badge Above Bar */}
                    <span className="text-[10px] font-extrabold text-slate-500 opacity-80 group-hover:opacity-100 group-hover:text-orange-600 transition-all">
                      {(item.netRevenue / 1000000).toFixed(1)}M
                    </span>

                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden flex flex-col justify-end" style={{ height: '140px' }}>
                      <div
                        className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg transition-all duration-500 group-hover:from-orange-500 group-hover:to-amber-400 shadow-sm"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Date Label */}
                    <span className="text-[10px] font-extrabold text-slate-500 tracking-tight group-hover:text-slate-900">
                      {item.formattedDate.slice(0, 5)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Revenue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 pb-0 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Bảng Báo Cáo Chi Tiết Doanh Thu Các Ngày Quá Khứ</h3>
            <p className="text-xs text-slate-500">Danh sách thống kê doanh thu chi tiết từng ngày từ {startDate} đến {endDate}</p>
          </div>
          <button
            onClick={() => toast.success('Đã xuất báo cáo doanh thu ra file Excel!')}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl transition-colors border border-emerald-200 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Xuất Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider">
                <th className="p-4 pl-6">Ngày</th>
                <th className="p-4">Tổng Số Đơn</th>
                <th className="p-4">Hoàn Thành</th>
                <th className="p-4">Đã Hủy</th>
                <th className="p-4">Doanh Thu Gốc</th>
                <th className="p-4">Khuyến Mãi / Giảm Giá</th>
                <th className="p-4">Doanh Thu Thực Nhận</th>
                <th className="p-4 pr-6 text-right">Khách HT / Vãng Lai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {dailyDataList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                    Không tìm thấy dữ liệu.
                  </td>
                </tr>
              ) : (
                dailyDataList.map((row) => (
                  <tr key={row.dateStr} className="hover:bg-orange-50/40 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900">{row.formattedDate}</td>
                    <td className="p-4 font-bold text-slate-800">{row.totalBookings} lượt</td>
                    <td className="p-4 font-bold text-emerald-600">{row.completedBookings} xe</td>
                    <td className="p-4 font-bold text-rose-500">{row.cancelledBookings} xe</td>
                    <td className="p-4 font-semibold text-slate-600">{row.originalRevenue.toLocaleString('vi-VN')} đ</td>
                    <td className="p-4 font-semibold text-rose-500">-{row.discountAmount.toLocaleString('vi-VN')} đ</td>
                    <td className="p-4 font-extrabold text-orange-600 text-sm">
                      {row.netRevenue.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 mr-1.5">
                        {(row.systemCustomerRevenue / 1000).toFixed(0)}k HT
                      </span>
                      <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        {(row.guestCustomerRevenue / 1000).toFixed(0)}k VL
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {dailyDataList.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-extrabold text-xs">
                  <td className="p-4 pl-6">TỔNG CỘNG:</td>
                  <td className="p-4">{totals.totalBookings} lượt</td>
                  <td className="p-4 text-emerald-400">{totals.completedBookings} xe</td>
                  <td className="p-4 text-rose-400">{totals.cancelledBookings} xe</td>
                  <td className="p-4">{totals.originalRevenue.toLocaleString('vi-VN')} đ</td>
                  <td className="p-4 text-rose-400">-{totals.discountAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="p-4 text-amber-400 text-sm">{totals.netRevenue.toLocaleString('vi-VN')} đ</td>
                  <td className="p-4 pr-6 text-right text-slate-300">
                    HT: {totals.systemCustomerRevenue.toLocaleString('vi-VN')}đ
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
