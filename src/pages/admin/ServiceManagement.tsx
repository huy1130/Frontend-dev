import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { serviceService, ServiceDto, UpsertServiceDto } from '../../services/serviceService'

export default function ServiceManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [services, setServices] = useState<ServiceDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null)
  
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [serviceToDeactivate, setServiceToDeactivate] = useState<number | null>(null)
  
  const defaultForm: UpsertServiceDto = {
    serviceName: '',
    description: '',
    price: 0
  }
  const [formData, setFormData] = useState<UpsertServiceDto>(defaultForm)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      // Dùng API Admin để lấy đầy đủ cả dịch vụ bị ẩn
      const data = await serviceService.getAllAdminServices()
      setServices(data)
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải danh sách dịch vụ')
      toast.error('Lỗi khi tải dữ liệu dịch vụ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingServiceId(null)
    setFormData(defaultForm)
    setIsModalOpen(true)
  }

  const handleOpenEdit = async (svc: ServiceDto) => {
    try {
      const detailedSvc = await serviceService.getAdminServiceById(svc.serviceId)
      setEditingServiceId(detailedSvc.serviceId)
      setFormData({
        serviceName: detailedSvc.serviceName,
        description: detailedSvc.description || '',
        price: detailedSvc.price
      })
      setIsModalOpen(true)
    } catch (error) {
      console.error(error)
      toast.error('Không thể lấy thông tin chi tiết dịch vụ')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.serviceName.trim()) {
      toast.error('Tên dịch vụ không được để trống')
      return
    }

    if (formData.price <= 0) {
      toast.error('Giá dịch vụ phải lớn hơn 0đ')
      return
    }

    try {
      setIsSubmitting(true)
      if (editingServiceId) {
        await serviceService.updateService(editingServiceId, formData)
        toast.success('Cập nhật dịch vụ thành công!')
      } else {
        await serviceService.createService(formData)
        toast.success('Thêm dịch vụ mới thành công!')
      }
      setIsModalOpen(false)
      fetchServices()
    } catch (err: any) {
      console.error(err)
      
      // Extract detailed error messages from backend (especially ASP.NET Core Validation errors)
      let errorMsg = 'Có lỗi xảy ra khi lưu dịch vụ'
      if (err.response?.data) {
        if (err.response.data.errors) {
          // Gộp tất cả các lỗi validation lại
          const validationErrors = Object.values(err.response.data.errors).flat().join('\n')
          errorMsg = validationErrors
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message
        } else if (err.response.data.Message) {
          errorMsg = err.response.data.Message
        } else if (err.response.data.title) {
          errorMsg = err.response.data.title
        }
      }
      
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDeactivate = (id: number) => {
    setServiceToDeactivate(id)
    setIsDeactivateModalOpen(true)
  }

  const handleDeactivate = async () => {
    if (!serviceToDeactivate) return
    try {
      setIsSubmitting(true)
      await serviceService.deactivateService(serviceToDeactivate)
      toast.success('Đã tạm ngưng dịch vụ thành công!')
      setIsDeactivateModalOpen(false)
      fetchServices()
    } catch (err: any) {
      console.error(err)
      toast.error('Có lỗi xảy ra khi tạm ngưng dịch vụ')
    } finally {
      setIsSubmitting(false)
      setServiceToDeactivate(null)
    }
  }

  const filteredServices = services.filter(s => {
    const matchesSearch = s.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false;
    
    if (filterTab === 'ACTIVE') return s.isActive !== false;
    if (filterTab === 'INACTIVE') return s.isActive === false;
    return true; // 'ALL'
  })

  return (
    <div className="space-y-6 relative">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-sky-500" />
            <span>Quản Lý Dịch Vụ</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thiết lập danh sách và giá các gói chăm sóc xe
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-sky-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Dịch Vụ</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs Filter */}
        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 w-fit overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterTab === 'ALL' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tất Cả ({services.length})
          </button>
          <button
            onClick={() => setFilterTab('ACTIVE')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterTab === 'ACTIVE' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-200/50' : 'text-slate-500 hover:text-emerald-600'}`}
          >
            Đang Hoạt Động
          </button>
          <button
            onClick={() => setFilterTab('INACTIVE')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterTab === 'INACTIVE' ? 'bg-white text-rose-600 shadow-sm border border-rose-200/50' : 'text-slate-500 hover:text-rose-600'}`}
          >
            Tạm Ngưng
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Tìm tên dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500">
          <AlertCircle className="w-10 h-10 mb-4" />
          <p>{error}</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200 border-dashed">
          <Package className="w-12 h-12 mb-4 opacity-50" />
          <p>Không tìm thấy dịch vụ nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((svc) => (
            <div
              key={svc.serviceId}
              className={`bg-white border rounded-3xl p-6 transition-all shadow-sm relative flex flex-col justify-between space-y-4 group ${
                svc.isActive !== false
                  ? 'border-slate-200 hover:border-sky-500/50 hover:shadow-lg'
                  : 'border-slate-200 opacity-70 bg-slate-50'
              }`}
            >
              {/* Quick Actions overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(svc)}
                  title="Chỉnh sửa"
                  className="p-2 bg-white text-sky-500 border border-sky-100 hover:bg-sky-50 rounded-full shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {svc.isActive !== false && (
                  <button
                    onClick={() => confirmDeactivate(svc.serviceId)}
                    title="Tạm ngưng"
                    className="p-2 bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 rounded-full shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                {/* Status */}
                <div className="flex items-center justify-start mb-3">
                  <div
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      svc.isActive !== false
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    {svc.isActive !== false ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đang Hoạt Động</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Tạm Ngưng</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Title & Desc */}
                <h3 className="font-extrabold text-slate-800 text-lg leading-snug mb-1 pr-16">{svc.serviceName}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{svc.description || 'Chưa có mô tả'}</p>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Giá dịch vụ</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-sky-600">
                      {svc.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-sm font-bold text-sky-600/70">đ</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-800">
                {editingServiceId ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Tên Dịch Vụ</label>
                <input 
                  type="text" 
                  required
                  placeholder="VD: Rửa xe bọt tuyết siêu cấp"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Giá Tiền (VNĐ)</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  placeholder="VD: 150000"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Mô Tả</label>
                <textarea 
                  rows={3}
                  placeholder="Nhập mô tả ngắn về dịch vụ..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-sky-500/20"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  <span>{editingServiceId ? 'Lưu Thay Đổi' : 'Tạo Dịch Vụ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirm Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">Xác Nhận Tạm Ngưng</h2>
              <p className="text-slate-500 text-sm">
                Dịch vụ này sẽ không còn hiển thị cho khách hàng đặt lịch nữa. Bạn có chắc chắn muốn tạm ngưng không?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleDeactivate}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-rose-500/20 flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tạm Ngưng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
