import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Car, Plus, Trash2, Edit, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'

interface CarItem {
  id: string
  plateNumber: string
  brand: string
  model: string
  color: string
}

export default function CustomerCars() {
  const [cars, setCars] = useState<CarItem[]>([
    { id: 'c1', plateNumber: '51G-123.45', brand: 'Toyota', model: 'Camry 2023', color: 'Trắng' },
    { id: 'c2', plateNumber: '51F-987.65', brand: 'Honda', model: 'CR-V 2022', color: 'Đen' },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<CarItem | null>(null)

  // Form State
  const [plateNumber, setPlateNumber] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')

  const openModal = (car?: CarItem) => {
    if (car) {
      setEditingCar(car)
      setPlateNumber(car.plateNumber)
      setBrand(car.brand)
      setModel(car.model)
      setColor(car.color)
    } else {
      setEditingCar(null)
      setPlateNumber('')
      setBrand('')
      setModel('')
      setColor('')
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCar(null)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCar) {
      setCars(cars.map(c => c.id === editingCar.id ? { ...c, plateNumber, brand, model, color } : c))
    } else {
      const newCar: CarItem = {
        id: 'c' + Date.now(),
        plateNumber,
        brand,
        model,
        color
      }
      setCars([...cars, newCar])
    }
    closeModal()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      setCars(cars.filter(c => c.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <NavBar />

      <main className="flex-1 pt-24 pb-32 px-4 sm:px-6 max-w-4xl w-full mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link to="/customer" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 font-semibold mb-2 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại trang chính</span>
            </Link>
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
        {cars.length === 0 ? (
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
              <div key={car.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>

                <div className="flex justify-between items-start mb-4 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                      <Car className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mb-0.5 uppercase tracking-wider">Biển Số</span>
                      <h3 className="text-lg font-extrabold text-slate-900 leading-none">{car.plateNumber}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(car)}
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors border border-slate-200 hover:border-emerald-200"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors border border-slate-200 hover:border-red-200"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pl-2">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5 uppercase">Hãng & Dòng Xe</span>
                    <span className="font-bold text-slate-800 text-sm">{car.brand} {car.model}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5 uppercase">Màu Sắc</span>
                    <span className="font-bold text-slate-800 text-sm">{car.color}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-lg text-slate-900">
                {editingCar ? 'Cập Nhật Thông Tin Xe' : 'Thêm Xe Mới'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <AlertCircle className="w-5 h-5 rotate-45" /> {/* Use as close icon */}
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Biển Số Xe *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 51G-123.45"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Hãng Xe *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Toyota"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Dòng Xe *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Camry 2023"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Màu Sắc *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trắng"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-emerald-500/20 text-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingCar ? 'Lưu Thay Đổi' : 'Thêm Mới'}</span>
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
