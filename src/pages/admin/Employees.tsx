import React, { useState, useEffect } from 'react'
import { Users, UserCheck, Plus, X, Loader2, ShieldCheck, User, Calendar, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { adminService, CreateStaffRequestDTO, UserDto } from '../../services/adminService'
import { formatDateTime } from '../../utils/date'

export default function Employees() {
  const [activeTab, setActiveTab] = useState<'staff' | 'customer'>('staff')
  const [isLoading, setIsLoading] = useState(true)
  const [staffs, setStaffs] = useState<UserDto[]>([])
  const [customers, setCustomers] = useState<UserDto[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState('Staff')
  const [password, setPassword] = useState('Password@123')

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await adminService.getUsers()
      if (res && res.data) {
        // Gộp Admins và Staffs vào tab Nhân viên
        const allStaffs = [...(res.data.admins || []), ...(res.data.staffs || [])].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        const sortedCustomers = [...(res.data.customers || [])].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        setStaffs(allStaffs)
        setCustomers(sortedCustomers)
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error)
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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

      // Reset form, close modal and refresh list
      setFullName('')
      setPhoneNumber('')
      setRole('Staff')
      setPassword('Password@123')
      setIsModalOpen(false)
      fetchUsers()
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.Message || 'Đã có lỗi xảy ra khi tạo tài khoản')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTierBadgeClass = (tier?: string | null) => {
    switch (tier?.toLowerCase()) {
      case 'gold':
      case 'vàng':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'silver':
      case 'bạc':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20'
      case 'platinum':
      case 'bạch kim':
        return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
      default:
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    }
  }

  const currentList = activeTab === 'staff' ? staffs : customers

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quản Lý Người Dùng</h2>
            <p className="text-slate-500 text-sm">Xem và quản lý thông tin nhân viên và khách hàng trong hệ thống</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/25 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Nhân Viên</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'border-orange-500 text-orange-600 bg-orange-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-xl'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Danh Sách Nhân Viên</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'staff' ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {staffs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'customer'
              ? 'border-orange-500 text-orange-600 bg-orange-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-xl'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Danh Sách Khách Hàng</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'customer' ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {customers.length}
          </span>
        </button>
      </div>

      {/* Main Content Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[350px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="font-semibold text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <UserCheck className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-bold text-lg">Chưa có dữ liệu {activeTab === 'staff' ? 'nhân viên' : 'khách hàng'}</p>
            <p className="text-slate-400 text-sm mt-1">Dữ liệu sẽ xuất hiện khi có tài khoản mới được đăng ký.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">STT</th>
                  <th className="px-6 py-4">Họ và Tên</th>
                  <th className="px-6 py-4">Số Điện Thoại</th>
                  {activeTab === 'staff' ? (
                    <th className="px-6 py-4">Chức Vụ</th>
                  ) : (
                    <th className="px-6 py-4">Hạng Thẻ</th>
                  )}
                  <th className="px-6 py-4">Ngày Tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {currentList.map((user, index) => (
                  <tr key={`${user.role}-${user.id}-${index}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-400">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span>{user.fullName || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.phoneNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === 'staff' ? (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${
                          user.role === 'Admin'
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {user.role}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${getTierBadgeClass(user.tier)}`}>
                          {user.tier || 'Mặc định'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                      {user.createdAt ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateTime(user.createdAt)}</span>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm Nhân Viên */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Thêm Nhân Viên Mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-slate-800 cursor-pointer"
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
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
