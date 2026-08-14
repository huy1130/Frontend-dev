import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Camera, Loader2 } from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'
import { loyaltyService } from '../../services/loyaltyService'

export default function CustomerProfile() {
  const navigate = useNavigate()

  const fullName = sessionStorage.getItem('fullName') || localStorage.getItem('fullName') || '';
  const phone = sessionStorage.getItem('phoneNumber') || localStorage.getItem('phoneNumber') || '';
  const [currentTier, setCurrentTier] = useState<string | null>(sessionStorage.getItem('currentTier') || localStorage.getItem('currentTier'));
  const [currentPoints, setCurrentPoints] = useState<string | null>(sessionStorage.getItem('currentPoints') || localStorage.getItem('currentPoints'));
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(false);

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        setIsLoadingLoyalty(true);
        const data = await loyaltyService.getSummary();
        const pointsStr = data.currentPoints.toString();

        setCurrentTier(data.currentTier);
        setCurrentPoints(pointsStr);
        setTotalSpent(data.totalSpent);
        setTotalVisits(data.totalVisits);

        sessionStorage.setItem('currentTier', data.currentTier);
        sessionStorage.setItem('currentPoints', pointsStr);
        localStorage.setItem('currentTier', data.currentTier);
        localStorage.setItem('currentPoints', pointsStr);
      } catch (error) {
        console.error('Failed to fetch loyalty summary:', error);
      } finally {
        setIsLoadingLoyalty(false);
      }
    };

    if (sessionStorage.getItem('token') || localStorage.getItem('token')) {
      fetchLoyalty();
    }
  }, []);

  const [formData, setFormData] = useState({
    fullName: fullName,
    email: '',
    phone: phone,
    address: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle update profile
    alert('Cập nhật thông tin thành công!')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <NavBar />

      <main className="flex-1 pt-28 pb-32 px-4 sm:px-6 max-w-3xl w-full mx-auto">
        <button
          onClick={() => navigate('/customer')}
          className="flex items-center gap-2 text-slate-500 hover:text-orange-600 font-semibold mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại Portal</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-md shadow-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center text-orange-500 shadow-lg border-4 border-white/20">
                <User className="w-12 h-12" />
              </div>
              <button className="absolute bottom-0 right-0 bg-white text-slate-700 p-2 rounded-full shadow-md hover:bg-slate-50 transition-colors border border-slate-200 group-hover:scale-110">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center sm:text-left text-white">
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">{formData.fullName}</h1>
              {isLoadingLoyalty ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start text-white/80">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-medium">Đang tải...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-white/80 font-medium">{currentTier} • {currentPoints} điểm</p>
                  <div className="flex items-center gap-4 text-sm text-white/60 justify-center sm:justify-start">
                    <span>Đã chi tiêu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSpent)}</span>
                    <span>•</span>
                    <span>Số lần đến: {totalVisits}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  required
                />
              </div>




            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95"
              >
                <Save className="w-5 h-5" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
