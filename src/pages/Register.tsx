import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Lock, ArrowLeft, ArrowRight, ShieldCheck, Phone, Loader2 } from 'lucide-react'
import Logo from '../components/common/Logo'
import { authService } from '../services/authService'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authService.register({
        fullName: name,
        phoneNumber: phone,
        password: password
      })
      
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      
      navigate('/login')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col font-['Montserrat',sans-serif] relative overflow-hidden">

      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_banner_bg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-40 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-dark-900/90" />
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-10 p-6 flex justify-between items-center w-full max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-dark-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">

            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <Logo size="sm" className="mb-8" />

              <div className="text-center space-y-2 mb-10">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Đăng Ký</h1>
                <p className="text-white/60 font-medium">Tạo tài khoản để đặt lịch và tích điểm thành viên</p>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-6">

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/80">Họ và tên</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <User className="w-5 h-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ và tên của bạn"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all font-medium placeholder:text-white/30"
                      required
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/80">Số điện thoại</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Phone className="w-5 h-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all font-medium placeholder:text-white/30"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/80">Mật khẩu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Lock className="w-5 h-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all font-medium placeholder:text-white/30"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-[#f97316] hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng Ký Ngay</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Badge */}
              <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
                <span>Thông tin của bạn được bảo mật an toàn tuyệt đối</span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-white/60 font-medium">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-bold transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
