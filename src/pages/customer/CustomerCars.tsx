import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Car, Plus, ChevronLeft, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'
import { customerService, VehicleResponseDTO } from '../../services/customerService'

export default function CustomerCars() {
  const [cars, setCars] = useState<VehicleResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [licensePlate, setLicensePlate] = useState('')
  const [vehicleType, setVehicleType] = useState('Car')

  const fetchCars = async () => {
    try {
      setIsLoading(true)
      const response = await customerService.getMyVehicles()
      if (response && response.data) {
        setCars(response.data)
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách xe:', error)
      toast.error('Không thể tải danh sách xe')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCars()
  }, [])

  const handleOpenAddModal = () => {
    setLicensePlate('')
    setVehicleType('Car')
    setIsModalOpen(true)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!licensePlate.trim()) {
      toast.error('Vui lòng nhập biển số xe')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await customerService.addVehicle({
        licensePlate: licensePlate.trim(),
        vehicleType
      })

      if (res) {
        toast.success(res.message || 'Thêm xe mới thành công!')
        setIsModalOpen(false)
        setLicensePlate('')
        setVehicleType('Car')
        fetchCars()
      }
    } catch (error: any) {
      console.error('Lỗi khi thêm xe:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <NavBar />

      <main className="flex-1 pt-24 pb-32 px-4 sm:px-6 max-w-4xl w-full mx-auto space-y-6">

        {/* Back Link */}
        <div className="mb-4">
          <Link to="/customer" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 font-semibold transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại trang chính</span>
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Car className="w-8 h-8 text-emerald-600" />
              <span>Quản Lý Xe Của Bạn</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Thêm thông tin xe để chọn nhanh khi đặt lịch rửa xe và bảo dưỡng.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Xe Mới</span>
          </button>
        </div>

        {/* Car List */}
        {isLoading ? (
          <div className="flex justify-center p-12 text-emerald-600 font-bold items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Đang tải danh sách xe...</span>
          </div>
        ) : cars.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-md shadow-slate-200/50">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-200">
              <Car className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Chưa có xe nào</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
              Bạn chưa thêm thông tin xe nào. Hãy thêm xe ngay để tiết kiệm thời gian cho những lần đặt lịch tiếp theo.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-3 bg-emerald-50 text-emerald-600 font-extrabold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200 text-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm Xe Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cars.map((car: any) => (
              <div key={car.vehicleId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>

                <div className="flex justify-between items-start mb-4 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                      <Car className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mb-0.5 uppercase tracking-wider">Biển Số</span>
                      <h3 className="text-lg font-extrabold text-slate-900 leading-none">{car.licensePlate}</h3>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col mt-auto pl-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Loại Xe</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 text-xs">{car.vehicleType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Modal Thêm Xe Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <Car className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">Thêm Xe Mới</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Biển Số Xe <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="Ví dụ: 30A-123.45 hoặc 51H-99999"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Loại Xe <span className="text-rose-500">*</span>
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-800 font-medium cursor-pointer"
                  required
                >
                  <option value="Car">Xe Ô tô (Car)</option>
                  <option value="Motorbike">Xe Máy (Motorbike)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu Phương Tiện</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}
