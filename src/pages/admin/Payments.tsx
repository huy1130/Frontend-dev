import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  CreditCard,
  Sliders,
  Search,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Phone,
  Bike,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Save,
  Loader2,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'
import { bookingService, BookingResponseDTO } from '../../services/bookingService'
import {
  systemParameterService,
  SystemParameterDto,
  SystemParameterUpdateDto
} from '../../services/systemParameterService'

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'settings' ? 'settings' : 'deposits'

  // Tab 1: Deposits State
  const [bookings, setBookings] = useState<BookingResponseDTO[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('DEPOSITED')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Date input refs for easy clicking
  const startDateInputRef = useRef<HTMLInputElement>(null)
  const endDateInputRef = useRef<HTMLInputElement>(null)

  // Booking Detail Modal
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDTO | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)

  // Tab 2: Settings State
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true)
  const [savingSettings, setSavingSettings] = useState<boolean>(false)
  const [systemParams, setSystemParams] = useState<SystemParameterDto | null>(null)
  const [settingsFormData, setSettingsFormData] = useState<SystemParameterUpdateDto>({
    bikeDepositAmount: 20000,
    carDepositPercentage: 20,
    contactPhone: '0901234567',
    cancellationRefundDays: 1
  })

  // Load Bookings Data for Tab 1
  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true)
      const res = await bookingService.getAdminBookings()
      const rawData: any = res?.data || res
      const items: BookingResponseDTO[] = Array.isArray(rawData)
        ? rawData
        : rawData?.items || rawData?.data || []

      setBookings(items)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt cọc:', error)
      toast.error('Không thể tải danh sách lịch cọc')
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const handleOpenDetail = async (item: BookingResponseDTO) => {
    setSelectedBooking(item)
    setIsDetailModalOpen(true)
    try {
      const detailRes = await bookingService.getBookingDetail(item.bookingId)
      const detail = detailRes?.data || detailRes
      if (detail) {
        setSelectedBooking((prev) => (prev ? { ...prev, ...detail } : detail))
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === item.bookingId ? { ...b, ...detail } : b))
        )
      }
    } catch (e) {
      console.error('Lỗi khi lấy chi tiết đặt cọc:', e)
    }
  }

  // Load System Settings for Tab 2
  const fetchSettings = async () => {
    try {
      setLoadingSettings(true)
      const data = await systemParameterService.getSystemParameter()
      if (data) {
        setSystemParams(data)
        setSettingsFormData({
          bikeDepositAmount: data.bikeDepositAmount ?? 20000,
          carDepositPercentage: data.carDepositPercentage ?? 20,
          contactPhone: data.contactPhone || '0901234567',
          cancellationRefundDays: data.cancellationRefundDays ?? 1
        })
      }
    } catch (error) {
      console.error('Lỗi khi lấy cấu hình đặt cọc:', error)
      toast.error('Không thể tải cấu hình đặt cọc')
    } finally {
      setLoadingSettings(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchSettings()
  }, [])

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()

    if (settingsFormData.bikeDepositAmount < 0) {
      toast.error('Mức cọc xe máy không thể nhỏ hơn 0đ')
      return
    }
    if (settingsFormData.carDepositPercentage < 0 || settingsFormData.carDepositPercentage > 100) {
      toast.error('Phần trăm cọc ô tô phải từ 0% đến 100%')
      return
    }
    if (settingsFormData.cancellationRefundDays < 0) {
      toast.error('Số ngày hủy cọc phải từ 0 trở lên')
      return
    }

    try {
      setSavingSettings(true)
      const updated = await systemParameterService.updateSystemParameter(settingsFormData)
      setSystemParams(updated)
      toast.success('Cập nhật cấu hình đặt cọc hệ thống thành công!')
    } catch (error: any) {
      console.error('Lỗi lưu cấu hình:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật cấu hình đặt cọc')
    } finally {
      setSavingSettings(false)
    }
  }

  // Calculate Deposit Amount Helper
  const getCalculatedDeposit = (booking: BookingResponseDTO): number => {
    if (booking.depositAmount && booking.depositAmount > 0) {
      return booking.depositAmount
    }
    const bikeRate = systemParams?.bikeDepositAmount ?? 20000
    const carPercent = systemParams?.carDepositPercentage ?? 20
    const vehicleType = (booking.vehicleType || '').toLowerCase()

    if (vehicleType.includes('bike') || vehicleType.includes('xe máy') || vehicleType.includes('xemay')) {
      return bikeRate
    } else {
      const price = booking.finalPrice || booking.originalPrice || 0
      return Math.round((price * carPercent) / 100)
    }
  }

  // Format Date string 'YYYY-MM-DD' to Vietnamese 'DD/MM/YYYY'
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    if (endDate && val && endDate < val) {
      setEndDate(val)
    }
  }

  const handleEndDateChange = (val: string) => {
    if (startDate && val && val < startDate) {
      setEndDate(startDate)
    } else {
      setEndDate(val)
    }
  }

  // Filtered Bookings
  const filteredBookings = bookings.filter((item) => {
    // Search query
    const searchLower = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !searchLower ||
      item.bookingId.toString().includes(searchLower) ||
      (item.customerName || '').toLowerCase().includes(searchLower) ||
      (item.licensePlate || '').toLowerCase().includes(searchLower) ||
      (item.serviceName || '').toLowerCase().includes(searchLower)

    // Vehicle filter
    const vType = (item.vehicleType || '').toLowerCase()
    const isBike = vType.includes('bike') || vType.includes('xe máy') || vType.includes('xemay')
    const matchesVehicle =
      vehicleFilter === 'ALL' ||
      (vehicleFilter === 'BIKE' && isBike) ||
      (vehicleFilter === 'CAR' && !isBike)

    // Status filter - STRICTLY Deposited bookings only
    const matchesStatus = item.status === 'Deposited'

    // Date Range Filter (handles reverse min/max bounds)
    let matchesDate = true
    if (item.bookingDate) {
      const bDate = item.bookingDate.split('T')[0]
      const minDate = startDate && endDate && startDate > endDate ? endDate : startDate
      const maxDate = startDate && endDate && startDate > endDate ? startDate : endDate
      if (minDate && bDate < minDate) matchesDate = false
      if (maxDate && bDate > maxDate) matchesDate = false
    }

    return matchesSearch && matchesVehicle && matchesStatus && matchesDate
  })

  // Statistics Calculation for Deposited Bookings
  const actualDepositedBookings = bookings.filter(
    (b) => b.status === 'Deposited'
  )

  // Use actual deposited bookings for metrics if filtering by DEPOSITED, else use displayed set
  const displayedMetricsBookings = statusFilter === 'DEPOSITED' ? actualDepositedBookings : filteredBookings
  const totalDepositedCount = actualDepositedBookings.length
  const totalDepositAmount = displayedMetricsBookings.reduce((sum, item) => sum + getCalculatedDeposit(item), 0)

  const bikeBookings = displayedMetricsBookings.filter((b) => {
    const v = (b.vehicleType || '').toLowerCase()
    return v.includes('bike') || v.includes('xe máy')
  })
  const carBookings = displayedMetricsBookings.filter((b) => {
    const v = (b.vehicleType || '').toLowerCase()
    return !v.includes('bike') && !v.includes('xe máy')
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">

      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">
            <CreditCard className="w-3.5 h-3.5" />
            Quản Lý Thanh Toán & Tiền Cọc
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cổng Thanh Toán & Quản Lý Đặt Cọc
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Theo dõi danh sách khách hàng đặt cọc giữ chỗ và thiết lập hạn mức cọc cho hệ thống.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 self-start md:self-auto">
          <button
            onClick={() => setSearchParams({ tab: 'deposits' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'deposits'
              ? 'bg-white text-orange-600 shadow-sm shadow-slate-200'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Khách Đã Cọc</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black">
              {totalDepositedCount}
            </span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'settings' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${activeTab === 'settings'
              ? 'bg-white text-orange-600 shadow-sm shadow-slate-200'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Cấu Hình Đặt Cọc</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KHÁCH ĐÃ CỌC */}
      {activeTab === 'deposits' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn Đã Cọc Thành Công</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalDepositedCount} <span className="text-xs font-bold text-slate-400">đơn</span></h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Trạng thái Deposited</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Tiền Cọc Đã Thu</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalDepositAmount.toLocaleString('vi-VN')} <span className="text-xs font-bold text-emerald-700">đ</span></h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Tiền cọc thực tế trong DB</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cọc Xe Máy</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{bikeBookings.length} <span className="text-xs font-bold text-slate-400">xe</span></h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Mức cọc {(systemParams?.bikeDepositAmount ?? 20000).toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                <Bike className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cọc Ô Tô</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{carBookings.length} <span className="text-xs font-bold text-slate-400">xe</span></h3>
                <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Mức cọc {systemParams?.carDepositPercentage ?? 20}% hóa đơn</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                <Car className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-3">
            {/* Search Input & Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên khách, biển số..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-slate-50/50"
                />
              </div>

              <div className="px-3.5 py-2 rounded-xl border border-emerald-300 text-xs font-black text-emerald-800 bg-emerald-50 flex items-center gap-1.5 shadow-xs shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Danh Sách Đơn Đã Đặt Cọc</span>
              </div>

              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 bg-slate-50 outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="ALL">Tất cả phương tiện</option>
                <option value="BIKE">Xe Máy (Bike)</option>
                <option value="CAR">Ô Tô (Car)</option>
              </select>
            </div>

            {/* Easy-to-click Date Range Controls */}
            <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
              {/* Start Date Pill */}
              <div
                onClick={() => startDateInputRef.current?.showPicker()}
                className="relative flex items-center gap-1.5 bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-400 rounded-xl px-3 py-2 cursor-pointer transition-all shadow-xs group shrink-0"
                title="Nhấp để chọn Từ ngày"
              >
                <Calendar className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
                <span className="text-[11px] font-bold text-slate-400">Từ:</span>
                <span className={`text-xs font-extrabold ${startDate ? 'text-slate-900' : 'text-slate-400'}`}>
                  {startDate ? formatDisplayDate(startDate) : 'dd/mm/yyyy'}
                </span>
                <input
                  ref={startDateInputRef}
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              <span className="text-slate-300 text-xs font-bold shrink-0">-</span>

              {/* End Date Pill */}
              <div
                onClick={() => endDateInputRef.current?.showPicker()}
                className="relative flex items-center gap-1.5 bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-400 rounded-xl px-3 py-2 cursor-pointer transition-all shadow-xs group shrink-0"
                title="Nhấp để chọn Đến ngày"
              >
                <Calendar className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
                <span className="text-[11px] font-bold text-slate-400">Đến:</span>
                <span className={`text-xs font-extrabold ${endDate ? 'text-slate-900' : 'text-slate-400'}`}>
                  {endDate ? formatDisplayDate(endDate) : 'dd/mm/yyyy'}
                </span>
                <input
                  ref={endDateInputRef}
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                  title="Xóa lọc ngày"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={fetchBookings}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shrink-0"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBookings ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Deposit List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoadingBookings ? (
              <div className="p-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Đang tải danh sách cọc...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">Không tìm thấy đơn cọc nào khớp với yêu cầu</p>
                <p className="text-xs text-slate-400">Thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Mã Đơn & Ngày Đặt</th>
                      <th className="py-4 px-6">Khách Hàng</th>
                      <th className="py-4 px-6">Phương Tiện</th>
                      <th className="py-4 px-6">Gói Dịch Vụ</th>
                      <th className="py-4 px-6 text-right">Số Tiền Cọc</th>
                      <th className="py-4 px-6 text-center">Trạng Thái</th>
                      <th className="py-4 px-6 text-center">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredBookings.map((item) => {
                      const depositAmt = getCalculatedDeposit(item)
                      const isBike = (item.vehicleType || '').toLowerCase().includes('bike') || (item.vehicleType || '').toLowerCase().includes('xe máy')

                      return (
                        <tr key={item.bookingId} className="hover:bg-slate-50/80 transition-colors">
                          {/* Booking ID & Date */}
                          <td className="py-4 px-6">
                            <div className="font-extrabold text-slate-900 text-sm">#{item.bookingId}</div>
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-orange-500" />
                              {new Date(item.bookingDate).toLocaleDateString('vi-VN')} {item.startTime ? `(${item.startTime.slice(0, 5)})` : ''}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {item.customerName || 'Khách vãng lai'}
                            </div>
                          </td>

                          {/* Vehicle */}
                          <td className="py-4 px-6">
                            <div className="font-extrabold text-slate-900">{item.licensePlate}</div>
                            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isBike ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                              {isBike ? <Bike className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                              {item.vehicleType || (isBike ? 'Xe Máy' : 'Ô Tô')}
                            </span>
                          </td>

                          {/* Service & Price */}
                          <td className="py-4 px-6">
                            <div className="font-extrabold text-slate-900">{item.serviceName}</div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                              Tổng: <strong className="text-slate-700">{(item.finalPrice || item.originalPrice || 0).toLocaleString('vi-VN')}đ</strong>
                            </div>
                          </td>

                          {/* Deposit Amount */}
                          <td className="py-4 px-6 text-right">
                            <div className="font-black text-emerald-600 text-sm">
                              {depositAmt.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {isBike ? 'Cọc cố định' : `${systemParams?.carDepositPercentage ?? 20}% hóa đơn`}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-extrabold ${item.status === 'Deposited'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'Confirmed'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.status === 'CheckedOut' || item.status === 'Completed'
                                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                  : item.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                              }`}>
                              {item.status === 'Deposited' && 'Đã Cọc'}
                              {item.status === 'Confirmed' && 'Đã Xác Nhận'}
                              {(item.status === 'CheckedOut' || item.status === 'Completed') && 'Đã Xong'}
                              {item.status === 'Cancelled' && 'Đã Hủy'}
                              {item.status === 'Pending' && 'Chờ Duyệt'}
                              {!['Deposited', 'Confirmed', 'CheckedOut', 'Completed', 'Cancelled', 'Pending'].includes(item.status) && item.status}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleOpenDetail(item)}
                              className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                              title="Xem chi tiết đơn"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CẤU HÌNH ĐẶT CỌC */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {loadingSettings ? (
            <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
              <p className="text-xs font-bold text-slate-400">Đang tải thông số cấu hình hệ thống...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card 1: Xe Máy (Bike Deposit) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-orange-200 transition-colors">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Tiền Cọc Xe Máy (Bike)</h3>
                    <p className="text-slate-400 text-xs">Mức tiền cọc cố định áp dụng cho tất cả dịch vụ xe máy</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Số tiền cọc cố định (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={settingsFormData.bikeDepositAmount}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, bikeDepositAmount: Number(e.target.value) })}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 font-bold text-slate-900 text-base focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      placeholder="20000"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                      VNĐ
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    Khách đặt dịch vụ xe máy sẽ chuyển cọc chính xác{' '}
                    <strong className="text-slate-900 font-black">
                      {settingsFormData.bikeDepositAmount.toLocaleString('vi-VN')}đ
                    </strong>.
                  </p>
                </div>
              </div>

              {/* Card 2: Ô Tô (Car Deposit Percentage) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-orange-200 transition-colors">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Phần Trăm Cọc Ô Tô (Car)</h3>
                    <p className="text-slate-400 text-xs">Tính theo tỷ lệ % trên tổng hóa đơn dịch vụ ô tô</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tỷ lệ cọc theo hóa đơn (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={settingsFormData.carDepositPercentage}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, carDepositPercentage: Number(e.target.value) })}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 font-bold text-slate-900 text-base focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      placeholder="20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                      %
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    Khách đặt ô tô dịch vụ 500.000đ sẽ cọc trước{' '}
                    <strong className="text-slate-900 font-black">
                      {((500000 * settingsFormData.carDepositPercentage) / 100).toLocaleString('vi-VN')}đ
                    </strong> ({settingsFormData.carDepositPercentage}%).
                  </p>
                </div>
              </div>

              {/* Card 3: Chính Sách Hủy Đơn */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-orange-200 transition-colors">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Hạn Hủy Đơn Hoàn Cọc</h3>
                    <p className="text-slate-400 text-xs">Số ngày tối thiểu trước giờ hẹn để được hoàn 100% cọc</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Số ngày báo trước (Ngày)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={settingsFormData.cancellationRefundDays}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, cancellationRefundDays: Number(e.target.value) })}
                      className="w-full pl-4 pr-16 py-3 rounded-xl border border-slate-200 font-bold text-slate-900 text-base focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      placeholder="1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                      Ngày
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Ví dụ: Nhập 1 ngày nghĩa là hủy trước 24h sẽ được hoàn tiền cọc tự động.
                  </p>
                </div>
              </div>

              {/* Card 4: Hotline Liên Hệ */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-orange-200 transition-colors">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Hotline Hỗ Trợ Khách Hàng</h3>
                    <p className="text-slate-400 text-xs">Số điện thoại hiển thị trên phiếu cọc và phiếu dịch vụ</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Số Điện Thoại Hotline
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.contactPhone}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-900 text-base focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    placeholder="0901234567"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Số điện thoại này sẽ xuất hiện trên trang Đặt Lịch & Hóa Đơn.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {savingSettings ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>Lưu & Cập Nhật Tất Cả Cấu Hình Đặt Cọc</span>
                </button>
              </div>

            </form>
          )}
        </div>
      )}

      {/* Booking Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Chi Tiết Đơn Cọc #{selectedBooking.bookingId}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Ngày tạo: {new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              {/* Customer Info */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Thông Tin Khách Hàng</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên khách:</span>
                  <span className="font-extrabold text-slate-900">{selectedBooking.customerName || 'Khách vãng lai'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-extrabold text-slate-900">{selectedBooking.customerPhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Biển số xe:</span>
                  <span className="font-extrabold text-slate-900">{selectedBooking.licensePlate} ({selectedBooking.vehicleType || 'Xe'})</span>
                </div>
              </div>

              {/* Deposit Financial Breakdown */}
              <div className="bg-orange-50/60 p-4 rounded-xl space-y-2 border border-orange-200/80">
                <div className="text-[11px] font-extrabold text-orange-700 uppercase tracking-wider">Chi Tiết Thanh Toán Cọc</div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Gói dịch vụ:</span>
                  <span className="font-extrabold text-slate-900">{selectedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tổng giá trị đơn:</span>
                  <span className="font-extrabold text-slate-900">{(selectedBooking.finalPrice || selectedBooking.originalPrice || 0).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between border-t border-orange-200/60 pt-2 text-sm">
                  <span className="font-bold text-orange-800">Số tiền cọc đã thu:</span>
                  <span className="font-black text-emerald-600">{getCalculatedDeposit(selectedBooking).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-600">Còn lại thanh toán tại tiệm:</span>
                  <span className="font-extrabold text-slate-900">
                    {Math.max(0, (selectedBooking.finalPrice || selectedBooking.originalPrice || 0) - getCalculatedDeposit(selectedBooking)).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
