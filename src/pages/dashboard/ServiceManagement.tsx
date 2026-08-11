import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { serviceService, ServiceDto } from '../../services/serviceService'

export default function ServiceManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [services, setServices] = useState<ServiceDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const data = await serviceService.getActiveServices()
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

  const filteredServices = services.filter(s => 
    s.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-sky-500" />
            <span>Quản Lý Dịch Vụ</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Danh sách các dịch vụ hiện có trong hệ thống
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs Filter */}
        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 w-fit">
          <button
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-800 shadow-sm border border-slate-200/50"
          >
            Tất Cả ({services.length})
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
              className={`bg-white border rounded-3xl p-6 transition-all shadow-sm relative flex flex-col justify-between space-y-4 ${
                svc.isActive !== false
                  ? 'border-slate-200 hover:border-sky-500/50 hover:shadow-lg'
                  : 'border-slate-200 opacity-70 bg-slate-50'
              }`}
            >
              <div>
                {/* Status */}
                <div className="flex items-center justify-end mb-3">
                  <div
                    className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      svc.isActive !== false
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    {svc.isActive !== false ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đang Hoạt Động</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tạm Ngưng</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Title & Desc */}
                <h3 className="font-extrabold text-slate-800 text-base leading-snug mb-1">{svc.serviceName}</h3>
                <p className="text-xs text-slate-500 mb-3">{svc.description || 'Chưa có mô tả'}</p>
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
    </div>
  )
}
