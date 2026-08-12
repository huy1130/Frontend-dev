import React, { useState } from 'react'
import { Users, Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminService, CreateStaffRequestDTO } from '../../services/adminService'

export default function Employees() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState('Staff')
  const [password, setPassword] = useState('Password@123')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !phoneNumber || !password || !role) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateStaffRequestDTO = {
        fullName,
        phoneNumber,
        password,
        role
      }

      await adminService.createStaff(payload)
      toast.success('Tạo tài khoản nhân viên thành công!')

      // Reset form and close modal
      setFullName('')
      setPhoneNumber('')
      setRole('Staff')
      setPassword('Password@123')
      setIsModalOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.Message || 'Đã có lỗi xảy ra khi tạo tài khoản')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <Users className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Danh Sách Nhân Viên</h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Nhân Viên</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <Users className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">Chưa có dữ liệu danh sách nhân viên.</p>
        <p className="text-slate-400 text-sm mt-1">Sử dụng nút "Thêm Nhân Viên" để tạo tài khoản mới.</p>
      </div>

      {/* Modal Thêm Nhân Viên */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Thêm Nhân Viên Mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Họ và Tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Số Điện Thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Chức Vụ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-slate-800"
                  required
                >
                  <option value="Admin">Admin (Quản trị viên)</option>
                  <option value="Staff">Staff (Nhân viên)</option>

                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Mật Khẩu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Mật khẩu mặc định là <strong className="text-slate-700">Password@123</strong>. Nhân viên có thể đổi sau khi đăng nhập.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Tạo Tài Khoản</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
