import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Car, Plus, Trash2, Edit, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'
import { customerService, VehicleResponseDTO } from '../../services/customerService'

export default function CustomerCars() {
  const [cars, setCars] = useState<VehicleResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await customerService.getMyVehicles()
        if (response.success) {
          setCars(response.data)
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách xe:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCars()
  }, [])

  const openModal = () => {
    alert("Tính năng Thêm/Sửa xe hiện đang được phát triển ở hệ thống Backend.");
  }

  const handleDelete = (id: number) => {
    alert("Tính năng Xóa xe hiện đang được phát triển ở hệ thống Backend.");
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
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Xe Mới</span>
          </button>
        </div>

        {/* Car List */}
        {isLoading ? (
          <div className="flex justify-center p-12 text-emerald-600 font-bold">Đang tải danh sách xe...</div>
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
              onClick={() => openModal()}
              className="px-6 py-3 bg-emerald-50 text-emerald-600 font-extrabold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm Xe Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cars.map(car => (
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal()}
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors border border-slate-200 hover:border-emerald-200"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(car.vehicleId)}
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors border border-slate-200 hover:border-red-200"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col mt-auto pl-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5 uppercase">Loại Xe</span>
                    <span className="font-bold text-slate-800 text-sm">{car.vehicleType}</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-bold mb-2">Mã QR Check-in (Đưa cho nhân viên)</span>
                    {car.qrCode ? (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${car.qrCode}`} 
                        alt="QR Code" 
                        className="w-24 h-24 rounded-lg border border-slate-200 p-1 bg-white shadow-sm" 
                      />
                    ) : (
                      <span className="text-xs italic text-slate-400">Đang cập nhật mã QR...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>



      <Footer />
    </div>
  )
}
