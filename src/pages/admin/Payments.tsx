import React, { useEffect, useState } from 'react'
import {
  CreditCard,
  Sliders,
  Save,
  Loader2,
  Bike,
  Car,
  Clock,
  Phone,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import {
  systemParameterService,
  SystemParameterDto,
  SystemParameterUpdateDto
} from '../../services/systemParameterService'

export default function Payments() {
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true)
  const [savingSettings, setSavingSettings] = useState<boolean>(false)
  const [systemParams, setSystemParams] = useState<SystemParameterDto | null>(null)
  
  const [settingsFormData, setSettingsFormData] = useState<SystemParameterUpdateDto>({
    bikeDepositAmount: 20000,
    carDepositPercentage: 20,
    contactPhone: '0901234567',
    cancellationRefundDays: 1
  })

  // Load System Settings
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">
            <Sliders className="w-3.5 h-3.5" />
            Cấu Hình Đặt Cọc Hệ Thống
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý &amp; Cấu Hình Thanh Toán Đặt Cọc
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Thiết lập hạn mức tiền cọc xe máy, tỷ lệ cọc ô tô, chính sách hoàn cọc và thông tin hotline.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loadingSettings}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-all cursor-pointer border border-slate-200/80 self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-orange-600 ${loadingSettings ? 'animate-spin' : ''}`} />
          <span>Tải Lại Cấu Hình</span>
        </button>
      </div>

      {/* Current Settings Status Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mức Cọc Xe Máy</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {(systemParams?.bikeDepositAmount ?? 20000).toLocaleString('vi-VN')} <span className="text-xs font-bold text-amber-700">đ</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Giá cọc cố định/lượt</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
            <Bike className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mức Cọc Ô Tô</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">
              {systemParams?.carDepositPercentage ?? 20}%
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Theo tổng giá trị đơn</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
            <Car className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời Hạn Hủy Hoàn Cọc</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {systemParams?.cancellationRefundDays ?? 1} <span className="text-xs font-bold text-emerald-700">ngày</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Trước giờ hẹn đặt</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hotline Hệ Thống</p>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              {systemParams?.contactPhone || '0901234567'}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Hiển thị trên hóa đơn</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100">
            <Phone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Settings Form Card */}
      {loadingSettings ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-slate-500 text-xs font-bold">Đang tải thông số cấu hình đặt cọc...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Cọc Xe Máy */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-orange-200 transition-colors">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Cấu Hình Đặt Cọc Xe Máy</h3>
                <p className="text-slate-400 text-xs">Số tiền cố định áp dụng cho tất cả dịch vụ rửa xe máy</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mức Cọc Cố Định (VNĐ)
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
              <p className="text-[11px] text-slate-500 font-medium">
                Mặc định: 20.000đ per booking xe máy.
              </p>
            </div>
          </div>

          {/* Card 2: Cọc Ô Tô */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-orange-200 transition-colors">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Cấu Hình Đặt Cọc Ô Tô</h3>
                <p className="text-slate-400 text-xs">Tỷ lệ phần trăm tính trên tổng giá trị hóa đơn gói rửa ô tô</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tỷ Lệ Tiền Cọc (%)
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
              <p className="text-[11px] text-slate-500 font-medium">
                Mặc định: 20% tổng giá trị dịch vụ rửa xe ô tô.
              </p>
            </div>
          </div>

          {/* Card 3: Chính Sách Hủy Hoàn Cọc */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-orange-200 transition-colors">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Chính Sách Hủy &amp; Hoàn Cọc</h3>
                <p className="text-slate-400 text-xs">Thời gian tối thiểu khách được phép hủy lịch và nhận lại tiền cọc</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Số Ngày Báo Trước (Ngày)
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
                Ví dụ: Nhập 1 ngày nghĩa là hủy trước 24h sẽ được hỗ trợ hoàn tiền cọc.
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
                Số điện thoại này sẽ xuất hiện trên ứng dụng Mobile &amp; Web khi khách cần liên hệ.
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
              <span>Lưu &amp; Cập Nhật Tất Cả Cấu Hình Đặt Cọc</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
