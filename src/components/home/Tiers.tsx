import React, { useEffect, useState } from 'react'
import { Crown, CheckCircle2, Zap, Calendar, ShieldCheck, Loader2 } from 'lucide-react'
import { tierService, PublicTierRuleDTO } from '../../services/tierService'

const formatTierName = (tierName: string): string => {
  if (!tierName) return 'Hạng Thành Viên'
  const lower = tierName.toLowerCase().trim()
  if (lower === 'member') return 'Hạng Thành Viên'
  if (lower === 'silver') return 'Hạng Bạc'
  if (lower === 'gold') return 'Hạng Vàng'
  if (lower === 'platinum') return 'Hạng Bạch Kim'
  if (lower === 'diamond') return 'Hạng Kim Cương'
  return tierName
}

const translateBenefit = (text: string): string => {
  if (!text) return ''
  const trimmed = text.trim()

  // Match pattern: "Book up to X days in advance and earn Y% bonus points."
  const matchBonus = trimmed.match(/Book up to (\d+) days in advance and earn (\d+)% bonus points/i)
  if (matchBonus) {
    return `Tích thêm +${matchBonus[2]}% điểm thưởng`
  }

  // Match pattern: "Book up to X days in advance."
  const matchAdvance = trimmed.match(/Book up to (\d+) days in advance/i)
  if (matchAdvance) {
    return `Ưu tiên đặt trước ${matchAdvance[1]} ngày`
  }

  return trimmed
}

const getTierStyle = (tierName: string, rank?: number) => {
  const nameLower = (tierName || '').toLowerCase()
  if (nameLower.includes('kim cương') || nameLower.includes('diamond') || nameLower.includes('platinum') || rank === 4) {
    return {
      badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30',
      crownColor: 'text-cyan-500',
      borderColor: 'border-cyan-200 dark:border-cyan-500/20',
      hoverGlow: 'hover:border-cyan-400 dark:hover:border-cyan-500/50',
    }
  }
  if (nameLower.includes('vàng') || nameLower.includes('gold') || rank === 3) {
    return {
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
      crownColor: 'text-amber-500',
      borderColor: 'border-amber-200 dark:border-amber-500/20',
      hoverGlow: 'hover:border-amber-400 dark:hover:border-amber-500/50',
    }
  }
  if (nameLower.includes('bạc') || nameLower.includes('silver') || rank === 2) {
    return {
      badgeBg: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
      crownColor: 'text-slate-400',
      borderColor: 'border-slate-200 dark:border-slate-500/20',
      hoverGlow: 'hover:border-slate-400 dark:hover:border-slate-500/50',
    }
  }
  return {
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
    crownColor: 'text-orange-500',
    borderColor: 'border-orange-200 dark:border-orange-500/20',
    hoverGlow: 'hover:border-orange-400 dark:hover:border-orange-500/50',
  }
}

export default function Tiers() {
  const [tiers, setTiers] = useState<PublicTierRuleDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setLoading(true)
        const data = await tierService.getPublicRules()
        // Sort tiers by rank ascending
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
        setTiers(sorted)
        setError(null)
      } catch (err: any) {
        console.error('Failed to load tier rules:', err)
        setError('Không thể tải thông tin hạng thành viên')
      } finally {
        setLoading(false)
      }
    }

    fetchTiers()
  }, [])

  return (
    <section id="tiers" className="py-24 bg-slate-50 dark:bg-dark-900 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5" />
            Chương Trình Thành Viên Loyalty
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            HẠNG THẺ & <span className="gradient-gold">ĐẶC QUYỀN TÍCH ĐIỂM</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Chi tiêu tích điểm càng nhiều, đặc quyền ưu đãi giảm giá và chăm sóc riêng càng cao cấp.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium">Đang tải danh sách hạng thành viên...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12 text-rose-500 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Tier Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {tiers.map((tier) => {
              const style = getTierStyle(tier.tierName, tier.rank)
              const displayName = formatTierName(tier.tierName)

              // Parse benefits and remove duplicates matching the booking window text
              const rawBenefits = tier.benefitDescription
                ? tier.benefitDescription.split('\n').map((b) => translateBenefit(b)).filter(Boolean)
                : []

              const benefitsList = rawBenefits.filter(
                (b) => !b.startsWith('Ưu tiên đặt trước')
              )

              return (
                <div
                  key={tier.tierName}
                  className={`bg-white dark:bg-dark-800/80 rounded-3xl p-5 border ${style.borderColor} ${style.hoverGlow} flex flex-col justify-between relative group shadow-sm dark:shadow-none transition-all duration-300 h-full`}
                >
                  <div className="flex flex-col flex-1">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-1.5 mb-5 min-h-[32px]">
                      <span className={`text-[11px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full border ${style.badgeBg} inline-flex items-center gap-1 whitespace-nowrap shrink-0`}>
                        <Crown className={`w-3.5 h-3.5 ${style.crownColor} shrink-0`} />
                        {displayName}
                      </span>
                      <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 whitespace-nowrap shrink-0">
                        <Zap className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                        x{tier.pointMultiplier ?? 1.0} điểm
                      </div>
                    </div>

                    {/* Minimum requirements (Fixed Height Box) */}
                    <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 h-[84px] flex flex-col justify-center space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Điều kiện nâng hạng
                      </p>
                      {tier.minimumSpend === 0 && tier.minimumVisits === 0 ? (
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 space-y-0.5">
                          <p className="whitespace-nowrap">Mức chi tiêu: <span className="font-black text-slate-900 dark:text-white">0đ</span></p>
                          <p className="text-amber-600 dark:text-amber-400 font-extrabold whitespace-nowrap">Mặc định cho tài khoản mới</p>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 space-y-0.5">
                          <p className="whitespace-nowrap">
                            Chi tiêu từ:{' '}
                            <span className="font-black text-slate-900 dark:text-white">
                              {(tier.minimumSpend ?? 0).toLocaleString('vi-VN')}đ
                            </span>
                          </p>
                          <p className="whitespace-nowrap">
                            {tier.qualificationMode === 'AND' ? 'Và' : 'Hoặc'} rửa tối thiểu:{' '}
                            <span className="font-black text-slate-900 dark:text-white">
                              {tier.minimumVisits ?? 0} lượt
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Booking Window Row (Fixed Height Box) */}
                    <div className="mb-5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 h-[42px] whitespace-nowrap">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Đặt lịch trước tối đa <strong className="text-slate-900 dark:text-white font-extrabold">{tier.bookingWindowDays ?? 7} ngày</strong></span>
                    </div>

                    {/* Benefits Checklist */}
                    <div className="flex-1 space-y-2.5 mb-5 min-h-[100px] flex flex-col justify-start">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Đặc quyền bao gồm:
                      </p>
                      <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        <li className="flex items-center gap-2 whitespace-nowrap">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="leading-tight truncate">Tích lũy x{tier.pointMultiplier ?? 1.0} điểm cho mỗi đơn</span>
                        </li>
                        {benefitsList.length > 0 ? (
                          benefitsList.map((benefit, idx) => (
                            <li key={idx} className="flex items-center gap-2 whitespace-nowrap">
                              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="leading-tight truncate">{benefit}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-center gap-2 whitespace-nowrap">
                            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="leading-tight truncate">Quyền lợi thành viên cơ bản</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Footer evaluation period */}
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-auto">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      Chu kỳ đánh giá {tier.evaluationPeriodMonths ?? 12} tháng
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}
