import React, { useState } from 'react'
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Tag, 
  Sparkles,
  Layers,
  Wrench
} from 'lucide-react'

interface ServiceItem {
  id: string
  name: string
  type: 'combo' | 'single'
  category: string
  price: number
  originalPrice?: number
  duration: string
  status: 'active' | 'inactive'
  description: string
}

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'combo' | 'single'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null)

  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 'SVC-001',
      name: 'Combo Vệ Sinh Nội Thất & Diệt Khuẩn Ozon',
      type: 'combo',
      category: 'Gói Chăm Sóc Cao Cấp',
      price: 450000,
      originalPrice: 550000,
      duration: '75 phút',
      status: 'active',
      description: 'Giặt ghế da/nỉ, dưỡng tablo, xông Ozon diệt 99% vi khuẩn khoang xe.',
    },
    {
      id: 'SVC-002',
      name: 'Phủ Ceramic Sơn & Tẩy Ố Mốc Kính',
      type: 'combo',
      category: 'Bảo Vệ & Làm Đẹp',
      price: 850000,
      originalPrice: 1050000,
      duration: '120 phút',
      status: 'active',
      description: 'Tẩy mảng bám kính chắn gió, phủ 2 lớp Ceramic tăng bóng chống bám nước.',
    },
    {
      id: 'SVC-003',
      name: 'Rửa Xe Bọt Tuyết & Hút Bụi',
      type: 'single',
      category: 'Dịch Vụ Cơ Bản',
      price: 150000,
      duration: '35 phút',
      status: 'active',
      description: 'Rửa thân xe bằng bọt tuyết bám bẩn, sấy khô, lau kính và hút bụi sàn xe.',
    },
    {
      id: 'SVC-004',
      name: 'Vệ Sinh Khoang Máy Bằng Hơi Nước Nóng',
      type: 'single',
      category: 'Bảo Dưỡng Động Cơ',
      price: 300000,
      originalPrice: 350000,
      duration: '45 phút',
      status: 'active',
      description: 'Dùng hơi nước nóng loại bỏ dầu mỡ bám lâu ngày, dưỡng dây curoa.',
    },
    {
      id: 'SVC-005',
      name: 'Combo Toàn Diện VIP (Rửa + Vệ Sinh + Ceramic)',
      type: 'combo',
      category: 'Gói Đặc Biệt VIP',
      price: 1250000,
      originalPrice: 1600000,
      duration: '180 phút',
      status: 'inactive',
      description: 'Trọn gói làm mới xe toàn diện từ nội thất đến ngoại thất và lớp phủ Ceramic.',
    },
  ])

  // Form State for Add/Edit
  const [formData, setFormData] = useState<{
    name: string
    type: 'combo' | 'single'
    category: string
    price: number
    originalPrice: number
    duration: string
    description: string
  }>({
    name: '',
    type: 'combo',
    category: '',
    price: 0,
    originalPrice: 0,
    duration: '',
    description: '',
  })

  const handleOpenAddModal = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      type: 'combo',
      category: 'Gói Chăm Sóc Xe',
      price: 200000,
      originalPrice: 250000,
      duration: '45 phút',
      description: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: ServiceItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      type: item.type,
      category: item.category,
      price: item.price,
      originalPrice: item.originalPrice || 0,
      duration: item.duration,
      description: item.description,
    })
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      setServices(services.map(s => s.id === editingItem.id ? {
        ...s,
        name: formData.name,
        type: formData.type,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        duration: formData.duration,
        description: formData.description,
      } : s))
    } else {
      const newId = 'SVC-' + Math.floor(100 + Math.random() * 900)
      setServices([...services, {
        id: newId,
        name: formData.name,
        type: formData.type,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        duration: formData.duration,
        status: 'active',
        description: formData.description,
      }])
    }
    setIsModalOpen(false)
  }

  const toggleStatus = (id: string) => {
    setServices(services.map(s => s.id === id ? {
      ...s,
      status: s.status === 'active' ? 'inactive' : 'active'
    } : s))
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  const filteredServices = services.filter(s => {
    const matchesTab = activeTab === 'all' || s.type === activeTab
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-orange-500" />
            <span>Quản Lý Gói Dịch Vụ & Dịch Vụ Lẻ</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Tạo mới, thiết lập bảng giá combo và cấu hình danh mục chăm sóc xe hệ thống.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Gói Dịch Vụ Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tabs Filter */}
        <div className="flex items-center gap-2 bg-dark-900/80 p-1.5 rounded-2xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Tất Cả ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('combo')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'combo'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gói Combo ({services.filter(s => s.type === 'combo').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('single')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'single'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Dịch Vụ Lẻ ({services.filter(s => s.type === 'single').length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Tìm tên gói hoặc danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

      </div>

      {/* Services Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((svc) => (
          <div
            key={svc.id}
            className={`bg-dark-900/60 border rounded-3xl p-6 transition-all shadow-xl relative flex flex-col justify-between space-y-4 ${
              svc.status === 'active'
                ? 'border-white/10 hover:border-orange-500/50'
                : 'border-rose-500/20 opacity-70 bg-dark-900/30'
            }`}
          >
            <div>
              {/* Type Badge & Status */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                  svc.type === 'combo'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}>
                  {svc.type === 'combo' ? 'Gói Combo' : 'Dịch Vụ Lẻ'}
                </span>

                <button
                  onClick={() => toggleStatus(svc.id)}
                  className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 transition-colors ${
                    svc.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                  }`}
                >
                  {svc.status === 'active' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đang Bán</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tạm Ngưng</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title & Desc */}
              <h3 className="font-extrabold text-white text-base leading-snug mb-1">{svc.name}</h3>
              <p className="text-xs text-white/50 mb-3">{svc.description}</p>

              <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>Thời gian thực hiện: <strong className="text-white/80">{svc.duration}</strong></span>
              </div>
            </div>

            {/* Price & Action Buttons */}
            <div className="pt-4 border-t border-white/5 flex items-end justify-between">
              <div>
                <span className="text-[11px] text-white/40 block">Giá niêm yết</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-orange-400">
                    {svc.price.toLocaleString('vi-VN')}đ
                  </span>
                  {svc.originalPrice && svc.originalPrice > svc.price && (
                    <span className="text-xs text-white/40 line-through">
                      {svc.originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(svc)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                  title="Chỉnh sửa"
                >
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                </button>
                <button
                  onClick={() => handleDelete(svc.id)}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal Form Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-up">
            <h3 className="text-xl font-extrabold text-white">
              {editingItem ? 'Chỉnh Sửa Gói Dịch Vụ' : 'Thêm Gói Dịch Vụ Mới'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1 font-medium">Tên gói dịch vụ:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Loại dịch vụ:</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'combo' | 'single' })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="combo">Gói Combo</option>
                    <option value="single">Dịch Vụ Lẻ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Danh mục:</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Giá khuyến mãi (đ):</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 font-bold text-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1 font-medium">Giá gốc niêm yết (đ):</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">Thời gian thực hiện dự kiến:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 60 phút"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">Mô tả ngắn gọn:</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500"
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
                  Lưu Thông Tin
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
