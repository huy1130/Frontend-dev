import React, { useEffect, useState } from 'react'
import {
  Sliders,
  Save,
  Loader2,
  Bike,
  Car,
  Calendar,
  Phone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Percent,
  ShieldCheck
} from 'lucide-react'
import {
  systemParameterService,
  SystemParameterDto,
  SystemParameterUpdateDto
} from '../../services/systemParameterService'
import { toast } from 'sonner'

export default function SystemSettings() {
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  const [formData, setFormData] = useState<SystemParameterUpdateDto>({
    bikeDepositAmount: 20000,
    carDepositPercentage: 20,
    contactPhone: '0901234567',
    cancellationRefundDays: 1
  })

  useEffect(() => {
    fetchParameters()
  }, [])

  const fetchParameters = async () => {
    try {
      setLoading(true)
      const data = await systemParameterService.getSystemParameter()
      if (data) {
        setFormData({
          bikeDepositAmount: data.bikeDepositAmount ?? 20000,
          carDepositPercentage: data.carDepositPercentage ?? 20,
          contactPhone: data.contactPhone || '0901234567',
          cancellationRefundDays: data.cancellationRefundDays ?? 1
        })
      }
    } catch (error: any) {
      console.error('Lỗi lấy cấu hình hệ thống:', error)
      toast.error('Không thể tải thông số cấu hình hệ thống')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.bikeDepositAmount < 0) {
      toast.error('Mức cọc xe máy không thể nhỏ hơn 0đ')
      return
    }

    if (formData.carDepositPercentage < 0 || formData.carDepositPercentage > 100) {
      toast.error('Phần trăm cọc ô tô phải từ 0% đến 100%')
      return
    }

    if (formData.cancellationRefundDays < 0) {
      toast.error('Số ngày hủy cọc phải từ 0 trở lên')
      return
    }

    try {
      setSaving(true)
      await systemParameterService.updateSystemParameter(formData)
      toast.success('Cập nhật cấu hình tiền cọc và hệ thống thành công!')
    } catch (error: any) {
      console.error('Lỗi lưu cấu hình:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật cấu hình hệ thống')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm font-medium">Đang tải cấu hình hệ thống...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">
            <Sliders className="w-3.5 h-3.5" />
            Quản Lý Hệ Thống
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cấu Hình Tiền Cọc & Tham Số Đặt Lịch
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Thiết lập tỷ lệ cọc giữ chỗ cho từng loại xe và chính sách hoàn tiền khi khách hủy lịch.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 shrink-0"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Lưu Cấu Hình</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                value={formData.bikeDepositAmount}
                onChange={(e) => setFormData({ ...formData, bikeDepositAmount: Number(e.target.value) })}
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
                {formData.bikeDepositAmount.toLocaleString('vi-VN')}đ
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
                value={formData.carDepositPercentage}
                onChange={(e) => setFormData({ ...formData, carDepositPercentage: Number(e.target.value) })}
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
                {((500000 * formData.carDepositPercentage) / 100).toLocaleString('vi-VN')}đ
              </strong> ({formData.carDepositPercentage}%).
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
                value={formData.cancellationRefundDays}
                onChange={(e) => setFormData({ ...formData, cancellationRefundDays: Number(e.target.value) })}
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
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-900 text-base focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              placeholder="0901234567"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Số điện thoại này sẽ xuất hiện trên trang Đặt Lịch & Hóa Đơn.
            </p>
          </div>
        </div>

        {/* Submit Bar Bottom (Mobile / Fullwidth) */}
        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Lưu & Cập Nhật Tất Cả Cấu Hình Hệ Thống</span>
          </button>
        </div>

      </form>
    </div>
  )
}
