import React, { useState } from 'react'
import { 
  Award, 
  Plus, 
  Edit3, 
  Crown, 
  ShieldCheck, 
  Gift, 
  Percent, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react'

interface MembershipTier {
  id: string
  name: string
  color: string
  badgeBg: string
  borderColor: string
  minPoints: number
  discountRate: number
  pointMultiplier: number
  perks: string[]
  memberCount: number
}

export default function TierManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null)

  const [tiers, setTiers] = useState<MembershipTier[]>([
    {
      id: 'tier-1',
      name: 'Thành Viên Đồng',
      color: 'text-amber-600',
      badgeBg: 'bg-amber-600/10',
      borderColor: 'border-amber-600/30',
      minPoints: 0,
      discountRate: 0,
      pointMultiplier: 1.0,
      memberCount: 1250,
      perks: [
        'Tích 1 điểm cho mỗi 10.000đ chi tiêu',
        'Đặt lịch ưu tiên giữ slot online',
        'Thông báo chương trình khuyến mãi sớm',
      ],
    },
    {
      id: 'tier-2',
      name: 'Thành Viên Bạc',
      color: 'text-slate-300',
      badgeBg: 'bg-slate-300/10',
      borderColor: 'border-slate-300/30',
      minPoints: 500,
      discountRate: 5,
      pointMultiplier: 1.2,
      memberCount: 480,
      perks: [
        'Giảm trực tiếp 5% cho mọi đơn dịch vụ',
        'Tích điểm x1.2 cho ngày trong tuần',
        'Miễn phí 1 lần khử trùng Ozon nhân sinh nhật',
      ],
    },
    {
      id: 'tier-3',
      name: 'Thành Viên Vàng',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-400/10',
      borderColor: 'border-amber-400/30',
      minPoints: 1200,
      discountRate: 10,
      pointMultiplier: 1.5,
      memberCount: 195,
      perks: [
        'Giảm trực tiếp 10% cho mọi đơn dịch vụ',
        'Tích điểm x1.5 trên tổng hóa đơn',
        'Voucher sinh nhật trị giá 200.000đ',
        'Miễn phí nước uống & phòng chờ VIP',
      ],
    },
    {
      id: 'tier-4',
      name: 'Thành Viên Kim Cương VIP',
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/30',
      minPoints: 3000,
      discountRate: 15,
      pointMultiplier: 2.0,
      memberCount: 42,
      perks: [
        'Giảm 15% tất cả dịch vụ rửa & bảo dưỡng',
        'Tích điểm nhân đôi (x2.0 điểm thưởng)',
        'Đội ngũ KTV trưởng phục vụ riêng',
        'Quà tặng sinh nhật độc quyền + Phủ Ceramic miễn phí',
      ],
    },
  ])

  const [formData, setFormData] = useState({
    name: '',
    minPoints: 0,
    discountRate: 0,
    pointMultiplier: 1.0,
    perksString: '',
  })

  const handleOpenEdit = (tier: MembershipTier) => {
    setEditingTier(tier)
    setFormData({
      name: tier.name,
      minPoints: tier.minPoints,
      discountRate: tier.discountRate,
      pointMultiplier: tier.pointMultiplier,
      perksString: tier.perks.join('\n'),
    })
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTier) {
      setTiers(tiers.map(t => t.id === editingTier.id ? {
        ...t,
        name: formData.name,
        minPoints: Number(formData.minPoints),
        discountRate: Number(formData.discountRate),
        pointMultiplier: Number(formData.pointMultiplier),
        perks: formData.perksString.split('\n').filter(p => p.trim() !== ''),
      } : t))
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Award className="w-7 h-7 text-orange-500" />
            <span>Quản Lý Hạng Thành Viên & Đặc Quyền VIP</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Thiết lập ngưỡng điểm tích lũy, phần trăm giảm giá và quyền lợi dành cho từng hạng thẻ.
          </p>
        </div>
      </div>

      {/* Tiers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`bg-dark-900/60 border ${tier.borderColor} rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between backdrop-blur-xl hover:scale-[1.01] transition-all`}
          >
            {/* Top Tag & Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-2xl ${tier.badgeBg} border ${tier.borderColor}`}>
                    <Crown className={`w-6 h-6 ${tier.color}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-extrabold ${tier.color}`}>{tier.name}</h3>
                    <span className="text-xs text-white/50">
                      Từ <strong className="text-white font-extrabold">{tier.minPoints.toLocaleString('vi-VN')} điểm</strong> tích lũy
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(tier)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-cyan-400 rounded-xl transition-colors border border-white/10 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Sửa Quy Tắc</span>
                </button>
              </div>

              {/* Stat Highlights */}
              <div className="grid grid-cols-3 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5 mb-6 text-center">
                <div>
                  <span className="text-[11px] text-white/40 block">Giảm Giá Đơn</span>
                  <span className="text-lg font-extrabold text-emerald-400">-{tier.discountRate}%</span>
                </div>
                <div className="border-x border-white/5">
                  <span className="text-[11px] text-white/40 block">Hệ Số Điểm</span>
                  <span className="text-lg font-extrabold text-amber-400">x{tier.pointMultiplier}</span>
                </div>
                <div>
                  <span className="text-[11px] text-white/40 block">Số Thành Viên</span>
                  <span className="text-lg font-extrabold text-white">{tier.memberCount}</span>
                </div>
              </div>

              {/* Perks List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-white/80 uppercase tracking-wider mb-2">Đặc Quyền Hạng Thẻ:</h4>
                {tier.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
              <span>Mã cấu hình: <strong className="text-white/60 font-mono">{tier.id}</strong></span>
              <span className="text-orange-400 font-semibold">Tự động nâng hạng</span>
            </div>

          </div>
        ))}
      </div>

      {/* Edit Tier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-up">
            <h3 className="text-xl font-extrabold text-white">
              Cấu Hình Hạng Thẻ: <span className="text-orange-400">{editingTier?.name}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1 font-medium">Tên hạng thành viên:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Ngưỡng điểm (điểm):</label>
                  <input
                    type="number"
                    required
                    value={formData.minPoints}
                    onChange={(e) => setFormData({ ...formData, minPoints: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Giảm giá (%):</label>
                  <input
                    type="number"
                    required
                    value={formData.discountRate}
                    onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-emerald-400 font-extrabold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Hệ số điểm (x):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.pointMultiplier}
                    onChange={(e) => setFormData({ ...formData, pointMultiplier: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-amber-400 font-extrabold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">Danh sách đặc quyền (mỗi dòng 1 quyền lợi):</label>
                <textarea
                  rows={4}
                  value={formData.perksString}
                  onChange={(e) => setFormData({ ...formData, perksString: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-colors shadow-lg shadow-orange-500/20"
                >
                  Cập Nhật Hạng Thẻ
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
