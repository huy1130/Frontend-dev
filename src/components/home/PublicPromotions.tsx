import React from 'react'
import { Ticket, Copy, Check, Sparkles, Clock } from 'lucide-react'
import { mockPromotions } from '../../mock/homeData'

export default function PublicPromotions() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  return (
    <section id="promotions" className="py-20 bg-dark-800/60 border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Ticket className="w-3.5 h-3.5" />
              Ưu Đãi Độc Quyền
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              VOUCHER & <span className="gradient-text">MÃ GIẢM GIÁ</span>
            </h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Sao chép mã voucher bên dưới và nhập ở bước thanh toán hoặc đặt lịch trực tuyến để áp dụng ưu đãi tức thì.
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPromotions.map((promo) => (
            <div
              key={promo.id}
              className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between group hover:border-brand-500/40 transition-all"
            >
              {/* Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-sm px-3 py-1 rounded-lg shadow-md">
                  {promo.discountBadge}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  Hạn: {promo.validUntil}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                  {promo.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {promo.description}
                </p>
              </div>

              {/* Code Box & Copy Trigger */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                <div className="font-mono font-bold text-brand-300 text-sm tracking-wider">
                  {promo.code}
                </div>

                <button
                  onClick={() => handleCopy(promo.code, promo.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copiedId === promo.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Đã chép!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Sao chép
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
