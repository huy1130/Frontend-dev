import React, { useState, useEffect } from 'react'
import {
  Award,
  Edit3,
  Crown,
  CheckCircle2,
  RefreshCw,
  Zap,
  Clock,
  ShieldCheck,
  Sliders,
  X,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { tierService, TierRuleDTO, UpdateTierRuleDTO, TierReviewResultDTO } from '../../services/tierService'

interface TierUI extends TierRuleDTO {
  displayName: string
  color: string
  badgeBg: string
  borderColor: string
  crownColor: string
}

const TIER_METADATA: Record<string, { displayName: string; color: string; badgeBg: string; borderColor: string; crownColor: string }> = {
  Member: {
    displayName: 'Hạng Thành Viên (Member)',
    color: 'text-amber-800',
    badgeBg: 'bg-amber-100/80',
    borderColor: 'border-amber-200',
    crownColor: 'text-amber-600',
  },
  Silver: {
    displayName: 'Thành Viên Bạc (Silver)',
    color: 'text-slate-800',
    badgeBg: 'bg-slate-100',
    borderColor: 'border-slate-300',
    crownColor: 'text-slate-500',
  },
  Gold: {
    displayName: 'Thành Viên Vàng (Gold)',
    color: 'text-amber-900',
    badgeBg: 'bg-amber-100',
    borderColor: 'border-amber-300',
    crownColor: 'text-amber-500',
  },
  Platinum: {
    displayName: 'Thành Viên Bạch Kim (Platinum)',
    color: 'text-cyan-900',
    badgeBg: 'bg-cyan-100',
    borderColor: 'border-cyan-300',
    crownColor: 'text-cyan-600',
  },
}

export default function TierManagement() {
  const [tiers, setTiers] = useState<TierUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReviewConfirmOpen, setIsReviewConfirmOpen] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<TierUI | null>(null)

  const [formData, setFormData] = useState<UpdateTierRuleDTO>({
    minimumSpend: 0,
    minimumVisits: 0,
    qualificationMode: 'OR',
    evaluationPeriodMonths: 12,
    bookingWindowDays: 7,
    pointMultiplier: 1.0,
    benefitDescription: '',
    isActive: true,
  })

  // Load rules directly from live API
  const fetchTierRules = async () => {
    setIsLoading(true)
    try {
      const resData = await tierService.getAllRules()
      const rulesList: any[] = Array.isArray(resData)
        ? resData
        : (resData as any)?.data || (resData as any)?.items || []

      if (Array.isArray(rulesList)) {
        const mappedTiers: TierUI[] = rulesList.map((rule) => {
          const rawName = rule.tierName || rule.TierName || 'Member'
          const meta = TIER_METADATA[rawName] || {
            displayName: `Hạng Thẻ ${rawName}`,
            color: 'text-slate-900',
            badgeBg: 'bg-orange-50',
            borderColor: 'border-orange-200',
            crownColor: 'text-orange-500',
          }
          return {
            tierRuleId: rule.tierRuleId ?? rule.TierRuleID,
            tierName: rawName,
            rank: rule.rank ?? rule.Rank ?? 1,
            minimumSpend: rule.minimumSpend ?? rule.MinimumSpend ?? 0,
            minimumVisits: rule.minimumVisits ?? rule.MinimumVisits ?? 0,
            qualificationMode: rule.qualificationMode || rule.QualificationMode || 'OR',
            evaluationPeriodMonths: rule.evaluationPeriodMonths ?? rule.EvaluationPeriodMonths ?? 12,
            bookingWindowDays: rule.bookingWindowDays ?? rule.BookingWindowDays ?? 7,
            pointMultiplier: rule.pointMultiplier ?? rule.PointMultiplier ?? 1.0,
            benefitDescription: rule.benefitDescription ?? rule.BenefitDescription ?? '',
            isActive: rule.isActive ?? rule.IsActive ?? true,
            updatedAt: rule.updatedAt || rule.UpdatedAt,
            displayName: meta.displayName,
            color: meta.color,
            badgeBg: meta.badgeBg,
            borderColor: meta.borderColor,
            crownColor: meta.crownColor,
          }
        })
        // Sort by rank ascending
        mappedTiers.sort((a, b) => (a.rank || 0) - (b.rank || 0))
        setTiers(mappedTiers)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.Message || 'Không thể tải danh sách quy tắc hạng thẻ từ Server')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTierRules()
  }, [])

  // Open Edit Modal
  const handleOpenEdit = (tier: TierUI) => {
    setEditingTier(tier)
    setFormData({
      minimumSpend: tier.minimumSpend ?? 0,
      minimumVisits: tier.minimumVisits ?? 0,
      qualificationMode: tier.qualificationMode || 'OR',
      evaluationPeriodMonths: tier.evaluationPeriodMonths ?? 12,
      bookingWindowDays: tier.bookingWindowDays ?? 7,
      pointMultiplier: tier.pointMultiplier ?? 1.0,
      benefitDescription: tier.benefitDescription ?? '',
      isActive: tier.isActive ?? true,
    })
    setIsModalOpen(true)
  }

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTier) return

    setIsSubmitting(true)
    try {
      await tierService.updateRule(editingTier.tierName, formData)
      toast.success(`Đã cập nhật quy tắc Hạng ${editingTier.displayName} thành công!`)
      setIsModalOpen(false)
      fetchTierRules()
    } catch (error: any) {
      toast.error(error.response?.data?.Message || 'Cập nhật quy tắc thất bại, vui lòng thử lại!')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Confirmation Modal
  const handleRunMonthlyReview = () => {
    setIsReviewConfirmOpen(true)
  }

  // Execute Monthly Review API
  const confirmMonthlyReview = async () => {
    setIsReviewing(true)
    try {
      const result: any = await tierService.runMonthlyReview()
      const reviewed = result?.reviewedCustomers ?? result?.ReviewedCustomers ?? 0
      const upgraded = result?.upgradedCustomers ?? result?.UpgradedCustomers ?? 0
      const downgraded = result?.downgradedCustomers ?? result?.DowngradedCustomers ?? 0
      const unchanged = result?.unchangedCustomers ?? result?.UnchangedCustomers ?? 0

      toast.success(
        `Xét duyệt hoàn tất! Đã kiểm tra ${reviewed} khách hàng (Nâng hạng: ${upgraded}, Hạ hạng: ${downgraded}, Giữ nguyên: ${unchanged}).`,
        { duration: 6000 }
      )
      setIsReviewConfirmOpen(false)
      fetchTierRules()
    } catch (error: any) {
      toast.error(error.response?.data?.Message || 'Xét duyệt hạng thất bại, vui lòng thử lại!')
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Award className="w-7 h-7 text-orange-500" />
            <span>Quản Lý Quy Tắc Hạng Thẻ & Tích Điểm VIP</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Cấu hình chi tiêu tối thiểu, số lượt rửa xe, hệ số tích điểm và mô tả đặc quyền
          </p>
        </div>

        {/* Action Button: Trigger Manual Review */}
        <button
          onClick={handleRunMonthlyReview}
          disabled={isReviewing}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-xs shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isReviewing ? 'animate-spin' : ''}`} />
          <span>{isReviewing ? 'Đang xét duyệt...' : 'Rà Soát Nâng/Hạ Hạng KH'}</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold">Đang tải quy tắc hạng thẻ từ Server Database...</p>
        </div>
      ) : (
        /* Tiers Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.tierName}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top Tag & Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${tier.badgeBg} border ${tier.borderColor}`}>
                      <Crown className={`w-6 h-6 ${tier.crownColor}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-extrabold ${tier.color}`}>{tier.displayName}</h3>
                      <span className="text-xs text-slate-500">
                        Chi tiêu: <strong className="text-slate-800 font-extrabold">{(tier.minimumSpend ?? 0).toLocaleString('vi-VN')}đ</strong>
                        {' • '}Lượt rửa: <strong className="text-slate-800 font-extrabold">{tier.minimumVisits ?? 0} lượt</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(tier)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200/80 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-orange-500" />
                    <span>Sửa Quy Tắc</span>
                  </button>
                </div>

                {/* Stat Highlights from DB */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 mb-6 text-center">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block flex items-center justify-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Hệ Số Điểm
                    </span>
                    <span className="text-lg font-extrabold text-amber-600">x{tier.pointMultiplier ?? 1.0}</span>
                  </div>
                  <div className="border-x border-slate-200/60">
                    <span className="text-[11px] font-semibold text-slate-500 block flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-600" /> Đặt Trước
                    </span>
                    <span className="text-lg font-extrabold text-slate-800">{tier.bookingWindowDays ?? 7} ngày</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block flex items-center justify-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Điều Kiện
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 mt-1 block uppercase">
                      {tier.qualificationMode === 'AND' ? 'Cả Chi Tiêu & Lượt' : 'Chi tiêu Hoặc Lượt'}
                    </span>
                  </div>
                </div>

                {/* Real Benefit Description from DB */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Mô Tả Đặc Quyền Hạng Thẻ:</h4>
                  {tier.benefitDescription ? (
                    tier.benefitDescription.split('\n').filter(b => b.trim() !== '').map((perk, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs font-medium text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-2.5 text-xs text-slate-400 italic">
                      <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      <span>Theo chính sách ưu đãi tiêu chuẩn của hệ thống.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Chu kỳ {tier.evaluationPeriodMonths ?? 12} tháng
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Tier Modal */}
      {isModalOpen && editingTier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Crown className={`w-6 h-6 ${editingTier.crownColor}`} />
                <span>Cấu Hình Hạng Thẻ: <span className={editingTier.color}>{editingTier.tierName}</span></span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Chi tiêu tối thiểu (VNĐ):</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    required
                    value={formData.minimumSpend}
                    onChange={(e) => setFormData({ ...formData, minimumSpend: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-emerald-700 font-extrabold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Lượt xe rửa tối thiểu (lượt):</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minimumVisits}
                    onChange={(e) => setFormData({ ...formData, minimumVisits: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Hệ số điểm (x):</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="10"
                    required
                    value={formData.pointMultiplier}
                    onChange={(e) => setFormData({ ...formData, pointMultiplier: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-amber-600 font-extrabold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Đặt trước (ngày):</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={formData.bookingWindowDays}
                    onChange={(e) => setFormData({ ...formData, bookingWindowDays: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Chu kỳ (tháng):</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={formData.evaluationPeriodMonths}
                    onChange={(e) => setFormData({ ...formData, evaluationPeriodMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Điều kiện xét duyệt hạng:</label>
                <select
                  value={formData.qualificationMode}
                  onChange={(e) => setFormData({ ...formData, qualificationMode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-extrabold focus:outline-none focus:border-orange-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="OR">Đạt Chi Tiêu HOẶC Đạt Số Lượt Rửa Xe (OR)</option>
                  <option value="AND">Cần Đạt Cả Chi Tiêu VÀ Số Lượt Rửa Xe (AND)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Mô tả đặc quyền thực tế (BenefitDescription):</label>
                <textarea
                  rows={3}
                  value={formData.benefitDescription || ''}
                  onChange={(e) => setFormData({ ...formData, benefitDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all leading-relaxed"
                  placeholder="Nhập mô tả ưu đãi của hạng..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-colors shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Reviewing Tiers */}
      {isReviewConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fade-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl text-orange-600">
                  <RefreshCw className={`w-6 h-6 ${isReviewing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Rà Soát Nâng / Hạ Hạng KH</h3>
                  <p className="text-xs text-slate-500 font-medium">Xác nhận duyệt hạng toàn bộ hệ thống</p>
                </div>
              </div>
              <button
                onClick={() => setIsReviewConfirmOpen(false)}
                disabled={isReviewing}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="font-semibold text-slate-800">
                Hệ thống sẽ tiến hành rà soát dữ liệu tích lũy (Tổng chi tiêu & Lượt rửa xe) trong 12 tháng qua của toàn bộ Khách hàng.
              </p>
              <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-[11px] font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Khách hàng đủ điều kiện mới sẽ được tự động nâng hạng / hạ hạng</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewConfirmOpen(false)}
                disabled={isReviewing}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={confirmMonthlyReview}
                disabled={isReviewing}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isReviewing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Rà Soát...</span>
                  </>
                ) : (
                  <span>Xác Nhận Rà Soát Ngay</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
