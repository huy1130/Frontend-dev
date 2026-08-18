import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  BarChart3,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Wallet,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { revenueService, groupBookingsByDay, DailyRevenueData, BookingReportData } from '../../services/revenueService'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' đ'
}

function formatDateForInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getTodayStr(): string {
  return formatDateForInput(new Date())
}

function getDateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return formatDateForInput(d)
}

// ─── Constants ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 7 // số cột hiển thị mỗi trang trong chart

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const today = getTodayStr()

  const [startDate, setStartDate] = useState<string>(getDateNDaysAgo(6))
  const [endDate, setEndDate] = useState<string>(today)
  const [activePreset, setActivePreset] = useState<string>('7days')

  const [reportData, setReportData] = useState<BookingReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Chart pagination & tooltip
  const [chartPage, setChartPage] = useState(0)
  const [selectedBar, setSelectedBar] = useState<string | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Click outside chart → dismiss selected bar tooltip
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chartRef.current && !chartRef.current.contains(e.target as Node)) {
        setSelectedBar(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchReport = useCallback(async (start: string, end: string) => {
    if (!start || !end) return
    setLoading(true)
    setError(null)
    try {
      const res = await revenueService.getBookingReport({ startDate: start, endDate: end })
      if (res?.success && res?.data) {
        setReportData(res.data)
      } else {
        setError('Phản hồi từ server không hợp lệ.')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu báo cáo.'
      setError(msg)
      toast.error(`Lỗi tải báo cáo: ${msg}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport(startDate, endDate)
  }, [startDate, endDate, fetchReport])

  // ─── Date Handlers ────────────────────────────────────────────────────────
  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    setActivePreset('custom')
    if (endDate && new Date(val) > new Date(endDate)) {
      toast.warning('Ngày bắt đầu lớn hơn ngày kết thúc. Đã tự động điều chỉnh!')
      setEndDate(val)
    }
  }

  const handleEndDateChange = (val: string) => {
    if (startDate && new Date(val) < new Date(startDate)) {
      toast.error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!')
      return
    }
    setEndDate(val)
    setActivePreset('custom')
  }

  const applyPreset = (type: string) => {
    setActivePreset(type)
    const t = getTodayStr()
    if (type === 'today') {
      setStartDate(t); setEndDate(t)
    } else if (type === '7days') {
      setStartDate(getDateNDaysAgo(6)); setEndDate(t)
    } else if (type === '30days') {
      setStartDate(getDateNDaysAgo(29)); setEndDate(t)
    } else if (type === 'thisMonth') {
      const now = new Date()
      const startOfMonth = formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1))
      setStartDate(startOfMonth); setEndDate(t)
    }
  }

  // ─── Derived Data ─────────────────────────────────────────────────────────
  const dailyDataList: DailyRevenueData[] = useMemo(() => {
    if (!reportData?.bookings) return []
    return groupBookingsByDay(reportData.bookings)
  }, [reportData])

  // Reset về trang cuối (mới nhất) khi data thay đổi
  useEffect(() => {
    if (dailyDataList.length > 0) {
      const lastPage = Math.max(0, Math.ceil(dailyDataList.length / PAGE_SIZE) - 1)
      setChartPage(lastPage)
    }
    setSelectedBar(null)
  }, [dailyDataList])

  const totalChartPages = Math.max(1, Math.ceil(dailyDataList.length / PAGE_SIZE))
  const pagedBars = dailyDataList.slice(chartPage * PAGE_SIZE, chartPage * PAGE_SIZE + PAGE_SIZE)

  const totals = useMemo(() => {
    if (!reportData) return null
    const discountAmount = dailyDataList.reduce((acc, d) => acc + d.discountAmount, 0)
    return {
      totalRevenue: reportData.totalRevenue,
      completedRevenue: reportData.completedRevenue,
      depositRevenue: reportData.depositRevenue,
      totalBookings: reportData.totalBookings,
      completedBookings: reportData.completedBookings,
      cancelledBookings: reportData.cancelledBookings,
      inProgressOrDepositedBookings: reportData.inProgressOrDepositedBookings,
      discountAmount,
    }
  }, [reportData, dailyDataList])

  const completionRate = totals && totals.totalBookings > 0
    ? ((totals.completedBookings / totals.totalBookings) * 100).toFixed(1)
    : '0'

  const avgOrderValue = totals && totals.completedBookings > 0
    ? Math.round(totals.completedRevenue / totals.completedBookings)
    : 0

  const maxDailyRevenue = useMemo(
    () => Math.max(...dailyDataList.map((d) => d.totalRevenue), 1),
    [dailyDataList]
  )

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Báo Cáo Thống Kê &amp; Doanh Thu</h2>
            <p className="text-xs text-slate-500 font-medium">Theo dõi hiệu suất kinh doanh, số lượt rửa xe &amp; doanh thu thực tế</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'today', label: 'Hôm nay' },
            { key: '7days', label: '7 ngày qua' },
            { key: '30days', label: '30 ngày qua' },
            { key: 'thisMonth', label: 'Tháng này' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${activePreset === key
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <Filter className="w-4 h-4 text-orange-500" />
          <span>Bộ Lọc Khoảng Thời Gian:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-slate-500">Từ ngày:</span>
            <input
              type="date"
              value={startDate}
              max={today}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-800 outline-none cursor-pointer"
            />
          </div>
          <span className="text-slate-400 font-bold text-sm">➔</span>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-slate-500">Đến ngày:</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-800 outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => fetchReport(startDate, endDate)}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />
            }
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Không thể tải dữ liệu</p>
            <p className="text-xs mt-0.5 text-red-500">{error}</p>
          </div>
          <button
            onClick={() => fetchReport(startDate, endDate)}
            className="ml-auto px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-2/3 mb-3" />
              <div className="h-8 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Tổng doanh thu */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
            <div className="absolute right-3 top-3 opacity-10">
              <CreditCard className="w-24 h-24" />
            </div>
            <p className="text-xs font-extrabold text-orange-100 uppercase tracking-wider mb-2">Tổng Doanh Thu</p>
            <h3 className="text-2xl font-black mb-1">{formatVND(totals.totalRevenue)}</h3>
            <div className="flex gap-3 text-[11px] text-orange-100 font-medium flex-wrap">
              <span>✅ Hoàn thành: {formatVND(totals.completedRevenue)}</span>
              <span>💰 Tiền cọc: {formatVND(totals.depositRevenue)}</span>
            </div>
          </div>

          {/* Card 2: Tổng số lịch hẹn */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Tổng Số Lịch Hẹn</p>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-2xl font-black text-slate-900">{totals.totalBookings} lượt</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {completionRate}% xong
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {totals.completedBookings} xong
              </span>
              <span className="text-rose-500 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {totals.cancelledBookings} hủy
              </span>
              <span className="text-amber-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {totals.inProgressOrDepositedBookings} đang xử lý
              </span>
            </div>
          </div>

          {/* Card 3: Doanh thu hoàn thành */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-2">Doanh Thu Hoàn Thành</p>
            <h3 className="text-2xl font-black text-slate-900 mb-1">{formatVND(totals.completedRevenue)}</h3>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              Trung bình: {formatVND(avgOrderValue)}/lượt
            </p>
          </div>

          {/* Card 4: Chiết khấu */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-xs font-extrabold text-purple-500 uppercase tracking-wider mb-2">Chiết Khấu &amp; Khuyến Mãi</p>
            <h3 className="text-2xl font-black text-slate-900 mb-1">
              {totals.discountAmount > 0 ? `-${formatVND(totals.discountAmount)}` : formatVND(0)}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <BadgePercent className="w-3 h-3" />
              {totals.completedRevenue + totals.discountAmount > 0
                ? ((totals.discountAmount / (totals.completedRevenue + totals.discountAmount)) * 100).toFixed(1)
                : '0'}% trên giá gốc
            </p>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      {!loading && (
        <div ref={chartRef} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {/* Chart Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Biểu Đồ Doanh Thu Theo Ngày</h3>
              <p className="text-xs text-slate-500">So sánh doanh thu thực tế giữa các ngày trong khoảng thời gian đã chọn</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                {dailyDataList.length} ngày báo cáo
              </span>
              {/* Back / Next */}
              {totalChartPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setChartPage(p => Math.max(0, p - 1)); setSelectedBar(null) }}
                    disabled={chartPage === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-500 px-1">
                    {chartPage + 1}/{totalChartPages}
                  </span>
                  <button
                    onClick={() => { setChartPage(p => Math.min(totalChartPages - 1, p + 1)); setSelectedBar(null) }}
                    disabled={chartPage === totalChartPages - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Trang sau"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {dailyDataList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold text-sm">
              Không có dữ liệu trong khoảng thời gian này.
            </div>
          ) : (
            <div className="pt-4 pb-2">
              {/* Bars — overflow:visible để tooltip không bị clip */}
              <div
                className="flex items-end gap-3 pb-6 border-b border-slate-100"
                style={{ height: '200px', overflow: 'visible' }}
              >
                {pagedBars.map((item) => {
                  const heightPercent = Math.max(8, Math.round((item.totalRevenue / maxDailyRevenue) * 100))
                  const isSelected = selectedBar === item.dateStr
                  return (
                    <div
                      key={item.dateStr}
                      className="flex-1 flex flex-col items-center gap-2 cursor-pointer relative"
                      onClick={() => setSelectedBar(isSelected ? null : item.dateStr)}
                    >
                      {/* Tooltip hiện trực tiếp trên cột khi click */}
                      {isSelected && (
                        <div
                          className="absolute z-50 pointer-events-none"
                          style={{ bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }}
                        >
                          <div className="bg-slate-900 text-white text-[11px] font-bold py-2.5 px-3.5 rounded-xl shadow-2xl whitespace-nowrap flex flex-col gap-1">
                            <div className="text-slate-300 font-extrabold text-center border-b border-slate-700 pb-1 mb-0.5">
                              {item.formattedDate}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                              <span className="text-slate-400">Doanh thu:</span>
                              <span className="text-orange-300 font-black">{formatVND(item.totalRevenue)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                              <span className="text-slate-400">Hoàn thành:</span>
                              <span className="text-emerald-300 font-bold">{item.completedBookings} xe</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                              <span className="text-slate-400">Đang xử lý:</span>
                              <span className="text-amber-300 font-bold">{item.inProgressBookings} xe</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                              <span className="text-slate-400">Đã hủy:</span>
                              <span className="text-rose-300 font-bold">{item.cancelledBookings} xe</span>
                            </div>
                          </div>
                          {/* Mũi tên */}
                          <div className="flex justify-center">
                            <div className="w-3 h-3 bg-slate-900 rotate-45 -mt-1.5" />
                          </div>
                        </div>
                      )}

                      {/* Value label trên cột */}
                      <span
                        className={`text-[10px] font-extrabold transition-all duration-150 ${isSelected ? 'text-orange-600' : 'text-slate-400'
                          }`}
                      >
                        {item.totalRevenue >= 1_000_000
                          ? `${(item.totalRevenue / 1_000_000).toFixed(1)}M`
                          : `${(item.totalRevenue / 1000).toFixed(0)}k`}
                      </span>

                      {/* Bar */}
                      <div
                        className="w-full bg-slate-100 rounded-t-xl flex flex-col justify-end overflow-hidden"
                        style={{ height: '130px' }}
                      >
                        <div
                          className={`w-full rounded-t-xl transition-all duration-300 shadow-sm ${isSelected
                              ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                              : 'bg-gradient-to-t from-orange-600 to-orange-400 hover:from-orange-500 hover:to-amber-400'
                            }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Date label */}
                      <span
                        className={`text-[10px] font-extrabold tracking-tight transition-colors ${isSelected ? 'text-orange-600' : 'text-slate-500'
                          }`}
                      >
                        {item.formattedDate.slice(0, 5)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Table */}
      {!loading && reportData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 pb-0 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Bảng Chi Tiết Doanh Thu Theo Ngày</h3>
              <p className="text-xs text-slate-500">
                Từ {startDate} đến {endDate} · {reportData.bookings.length} booking
              </p>
            </div>
            <button
              onClick={() => toast.info('Tính năng xuất Excel đang được phát triển!')}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl transition-colors border border-emerald-200 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" /> Xuất Excel
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="p-4 pl-6">Ngày</th>
                  <th className="p-4">Tổng Đơn</th>
                  <th className="p-4">Hoàn Thành</th>
                  <th className="p-4">Đang Xử Lý</th>
                  <th className="p-4">Đã Hủy</th>
                  <th className="p-4">Chiết Khấu</th>
                  <th className="p-4">DT Cọc</th>
                  <th className="p-4 pr-6 text-right">Tổng Doanh Thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {dailyDataList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                      Không có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  dailyDataList.map((row) => (
                    <tr key={row.dateStr} className="hover:bg-orange-50/40 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900">{row.formattedDate}</td>
                      <td className="p-4 font-bold text-slate-800">{row.totalBookings} lượt</td>
                      <td className="p-4 font-bold text-emerald-600">{row.completedBookings} xe</td>
                      <td className="p-4 font-bold text-amber-600">{row.inProgressBookings} xe</td>
                      <td className="p-4 font-bold text-rose-500">{row.cancelledBookings} xe</td>
                      <td className="p-4 font-semibold text-rose-400">
                        {row.discountAmount > 0 ? `-${formatVND(row.discountAmount)}` : '—'}
                      </td>
                      <td className="p-4 font-semibold text-blue-600">
                        {row.depositRevenue > 0 ? formatVND(row.depositRevenue) : '—'}
                      </td>
                      <td className="p-4 pr-6 text-right font-extrabold text-orange-600 text-sm">
                        {formatVND(row.totalRevenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {dailyDataList.length > 0 && totals && (
                <tfoot>
                  <tr className="bg-slate-900 text-white font-extrabold text-xs">
                    <td className="p-4 pl-6">TỔNG CỘNG:</td>
                    <td className="p-4">{totals.totalBookings} lượt</td>
                    <td className="p-4 text-emerald-400">{totals.completedBookings} xe</td>
                    <td className="p-4 text-amber-400">{totals.inProgressOrDepositedBookings} xe</td>
                    <td className="p-4 text-rose-400">{totals.cancelledBookings} xe</td>
                    <td className="p-4 text-rose-300">
                      {totals.discountAmount > 0 ? `-${formatVND(totals.discountAmount)}` : '—'}
                    </td>
                    <td className="p-4 text-blue-300">{formatVND(totals.depositRevenue)}</td>
                    <td className="p-4 pr-6 text-right text-amber-400 text-sm">{formatVND(totals.totalRevenue)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
