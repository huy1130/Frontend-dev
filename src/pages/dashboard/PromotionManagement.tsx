import React, { useState } from 'react'
import { 
  Tag, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  Calendar, 
  Users,
  Sparkles
} from 'lucide-react'

interface PromotionItem {
  id: string
  code: string
  title: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minSpend: number
  usageLimit: number
  usedCount: number
  startDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'disabled'
}

export default function PromotionManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PromotionItem | null>(null)

  const [promotions, setPromotions] = useState<PromotionItem[]>([
    {
      id: 'PROMO-101',
      code: 'HYBRIDNEW',
      title: 'Giảm 10% Cho Khách Hàng Đặt Lịch Online Mới',
      discountType: 'percentage',
      discountValue: 10,
      minSpend: 100000,
      usageLimit: 500,
      usedCount: 142,
      startDate: '01/01/2026',
      expiryDate: '31/12/2026',
      status: 'active',
    },
    {
      id: 'PROMO-102',
      code: 'GOLDVIP50K',
      title: 'Ưu Đãi Đặc Quyền Hạng Thành Viên Vàng (Giảm 50K)',
      discountType: 'fixed',
      discountValue: 50000,
      minSpend: 300000,
      usageLimit: 200,
      usedCount: 89,
      startDate: '01/05/2026',
      expiryDate: '31/12/2026',
      status: 'active',
    },
    {
      id: 'PROMO-103',
      code: 'SUMMER2026',
      title: 'Khuyến Mãi Chăm Sóc Xe Mùa Hè 2026 (Giảm 15%)',
      discountType: 'percentage',
      discountValue: 15,
      minSpend: 500000,
      usageLimit: 300,
      usedCount: 300,
      startDate: '01/06/2026',
      expiryDate: '30/09/2026',
      status: 'expired',
    },
    {
      id: 'PROMO-104',
      code: 'CERAMIC100K',
      title: 'Voucher Giảm 100K Dịch Vụ Phủ Ceramic Cao Cấp',
      discountType: 'fixed',
      discountValue: 100000,
      minSpend: 800000,
      usageLimit: 100,
      usedCount: 12,
      startDate: '01/07/2026',
      expiryDate: '31/12/2026',
      status: 'active',
    },
  ])

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 100000,
    usageLimit: 100,
    expiryDate: '2026-12-31',
  })

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      code: '',
      title: '',
      discountType: 'percentage',
      discountValue: 10,
      minSpend: 100000,
      usageLimit: 200,
      expiryDate: '2026-12-31',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: PromotionItem) => {
    setEditingItem(item)
    setFormData({
      code: item.code,
      title: item.title,
      discountType: item.discountType,
      discountValue: item.discountValue,
      minSpend: item.minSpend,
      usageLimit: item.usageLimit,
      expiryDate: '2026-12-31',
    })
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      setPromotions(promotions.map(p => p.id === editingItem.id ? {
        ...p,
        code: formData.code.toUpperCase(),
        title: formData.title,
        discountType: formData.discountType as 'percentage' | 'fixed',
        discountValue: Number(formData.discountValue),
        minSpend: Number(formData.minSpend),
        usageLimit: Number(formData.usageLimit),
      } : p))
    } else {
      const newId = 'PROMO-' + Math.floor(100 + Math.random() * 900)
      setPromotions([...promotions, {
        id: newId,
        code: formData.code.toUpperCase(),
        title: formData.title,
        discountType: formData.discountType as 'percentage' | 'fixed',
        discountValue: Number(formData.discountValue),
        minSpend: Number(formData.minSpend),
        usageLimit: Number(formData.usageLimit),
        usedCount: 0,
        startDate: '10/08/2026',
        expiryDate: '31/12/2026',
        status: 'active',
      }])
    }
    setIsModalOpen(false)
  }

  const toggleStatus = (id: string) => {
    setPromotions(promotions.map(p => p.id === id ? {
      ...p,
      status: p.status === 'active' ? 'disabled' : 'active'
    } : p))
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) {
      setPromotions(promotions.filter(p => p.id !== id))
    }
  }

  const filteredPromotions = promotions.filter(p => 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Tag className="w-7 h-7 text-orange-500" />
            <span>Quản Lý Chương Trình Khuyến Mãi & Voucher</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Cấu hình mã giảm giá, mức chi tiêu tối thiểu và giới hạn số lượt sử dụng voucher.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo Mã Khuyến Mãi Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Tìm theo Mã voucher hoặc tên khuyến mãi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-dark-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-white/60 font-semibold">
                <th className="py-4 px-6">Mã Voucher</th>
                <th className="py-4 px-6">Chương Trình Khuyến Mãi</th>
                <th className="py-4 px-6">Mức Giảm</th>
                <th className="py-4 px-6">Đơn Tối Thiểu</th>
                <th className="py-4 px-6">Lượt Sử Dụng</th>
                <th className="py-4 px-6">Hạn Sử Dụng</th>
                <th className="py-4 px-6">Trạng Thái</th>
                <th className="py-4 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {filteredPromotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-mono font-extrabold text-orange-400">
                    <span className="bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/30">
                      {promo.code}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold max-w-xs">{promo.title}</td>
                  <td className="py-4 px-6 font-extrabold text-emerald-400 text-sm">
                    {promo.discountType === 'percentage' 
                      ? `${promo.discountValue}%` 
                      : `${promo.discountValue.toLocaleString('vi-VN')}đ`}
                  </td>
                  <td className="py-4 px-6 text-white/70 font-semibold">
                    {promo.minSpend.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      <span>{promo.usedCount} / {promo.usageLimit}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white/60">{promo.expiryDate}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleStatus(promo.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 w-fit ${
                        promo.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : promo.status === 'expired'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {promo.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đang Chạy</span>
                        </>
                      ) : promo.status === 'expired' ? (
                        <span>Hết Hạn</span>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Đã Khóa</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(promo)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-cyan-400 rounded-lg transition-colors border border-white/10"
                        title="Sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-up">
            <h3 className="text-xl font-extrabold text-white">
              {editingItem ? 'Chỉnh Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Mã Voucher (Code):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SUMMER50K"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono uppercase font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Loại giảm giá:</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="percentage">Theo Phần Trăm (%)</option>
                    <option value="fixed">Số Tiền Cố Định (VNĐ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">Tên chương trình ưu đãi:</label>
                <input
                  type="text"
                  required
                  placeholder="Mô tả ngắn hiển thị cho khách hàng"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Giá trị giảm:</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-emerald-400 font-extrabold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Đơn hàng tối thiểu (đ):</label>
                  <input
                    type="number"
                    required
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Giới hạn số lượt dùng:</label>
                  <input
                    type="number"
                    required
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Ngày hết hạn:</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
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
                  Lưu Mã Voucher
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
