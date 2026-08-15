import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { timeSlotService, TimeSlotDto, CreateTimeSlotDto } from '../../services/timeSlotService'

export default function TimeSlotManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const defaultSlot: CreateTimeSlotDto = {
    startTime: '08:00:00',
    endTime: '10:00:00',
    carCapacity: 2,
    bikeCapacity: 5
  }
  const [newSlots, setNewSlots] = useState<CreateTimeSlotDto[]>([{...defaultSlot}])

  useEffect(() => {
    fetchTimeSlots()
  }, [])

  const fetchTimeSlots = async () => {
    try {
      setIsLoading(true)
      const data = await timeSlotService.getAllTimeSlots()
      setTimeSlots(data)
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError('Không thể tải danh sách khung giờ')
      toast.error('Lỗi khi tải dữ liệu khung giờ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate duplicates within the new slots array
    const newSlotKeys = newSlots.map(s => `${s.startTime}-${s.endTime}`);
    const uniqueNewKeys = new Set(newSlotKeys);
    if (uniqueNewKeys.size !== newSlots.length) {
      toast.error('Các ca mới thêm không được trùng thời gian với nhau!');
      return;
    }

    // Validate duplicates with existing slots
    for (const slot of newSlots) {
      const isExist = timeSlots.some(existing => 
        existing.startTime === slot.startTime && existing.endTime === slot.endTime
      );
      if (isExist) {
        toast.error(`Ca làm việc ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)} đã tồn tại trong hệ thống!`);
        return;
      }
    }

    try {
      setIsSubmitting(true)
      // Chạy tất cả các API tạo mới cùng 1 lúc
      await Promise.all(newSlots.map(slot => timeSlotService.createTimeSlot(slot)));
      
      toast.success(`Tạo thành công ${newSlots.length} khung giờ!`)
      setIsModalOpen(false)
      setNewSlots([{...defaultSlot}]) // Reset form
      fetchTimeSlots() // Refresh data
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo khung giờ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddSlotForm = () => {
    setNewSlots([...newSlots, {...defaultSlot}])
  }

  const handleRemoveSlotForm = (index: number) => {
    const updatedSlots = newSlots.filter((_, i) => i !== index)
    setNewSlots(updatedSlots)
  }

  const updateNewSlot = (index: number, field: keyof CreateTimeSlotDto, value: any) => {
    const updated = [...newSlots];
    updated[index] = { ...updated[index], [field]: value };
    setNewSlots(updated);
  }

  const filteredSlots = timeSlots.filter(s => 
    s.startTime.includes(searchTerm) || s.endTime.includes(searchTerm)
  )

  const [togglingSlotId, setTogglingSlotId] = useState<number | null>(null)

  const handleToggleStatus = async (slotId: number, currentStatus: boolean) => {
    try {
      setTogglingSlotId(slotId)
      const nextStatus = !currentStatus
      await timeSlotService.toggleSlotStatus(slotId, nextStatus)
      toast.success(nextStatus ? 'Đã kích hoạt khung giờ!' : 'Đã tạm ngưng khung giờ!')
      setTimeSlots(prev => prev.map(s => s.slotId === slotId ? { ...s, isActive: nextStatus } : s))
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đổi trạng thái khung giờ')
    } finally {
      setTogglingSlotId(null)
    }
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // "08:00:00" -> "08:00"
  }

  return (
    <div className="space-y-6 relative">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Clock className="w-7 h-7 text-sky-500" />
            <span>Quản Lý Khung Giờ</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thiết lập ca làm việc và sức chứa của cửa hàng
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-sky-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Khung Giờ</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs Filter */}
        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 w-fit">
          <button
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-800 shadow-sm border border-slate-200/50"
          >
            Tất Cả ({timeSlots.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Tìm theo giờ (vd: 08:00)..."
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
      ) : filteredSlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200 border-dashed">
          <Clock className="w-12 h-12 mb-4 opacity-50" />
          <p>Chưa có khung giờ nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSlots.map((slot) => (
            <div
              key={slot.slotId}
              className={`bg-white border rounded-3xl p-6 transition-all shadow-sm relative flex flex-col justify-between space-y-4 ${
                slot.isActive !== false
                  ? 'border-slate-200 hover:border-sky-500/50 hover:shadow-lg'
                  : 'border-slate-200 opacity-70 bg-slate-50'
              }`}
            >
              <div>
                {/* Status Toggle Button */}
                <div className="flex items-center justify-end mb-3">
                  <button
                    type="button"
                    disabled={togglingSlotId === slot.slotId}
                    onClick={() => handleToggleStatus(slot.slotId, slot.isActive !== false)}
                    title={slot.isActive !== false ? 'Bấm để Tạm Ngưng' : 'Bấm để Kích Hoạt'}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      slot.isActive !== false
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {togglingSlotId === slot.slotId ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : slot.isActive !== false ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đang Hoạt Động</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Tạm Ngưng</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Title & Desc */}
                <h3 className="font-extrabold text-slate-800 text-xl leading-snug mb-1">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </h3>
              </div>

              {/* Capacities */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Sức chứa Ô Tô</span>
                  <div className="text-base font-extrabold text-slate-700">
                    {slot.carCapacity} <span className="text-xs font-normal">xe</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block font-medium">Sức chứa Xe Máy</span>
                  <div className="text-base font-extrabold text-slate-700">
                    {slot.bikeCapacity} <span className="text-xs font-normal">xe</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-800">Thêm Khung Giờ Mới</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSlot} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {newSlots.map((slot, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 relative animate-in fade-in zoom-in duration-200">
                    {newSlots.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveSlotForm(index)}
                        title="Xóa ca này"
                        className="absolute -top-2.5 -right-2.5 p-1.5 bg-white text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white rounded-full transition-all shadow-sm z-10"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Giờ Bắt Đầu</label>
                        <input 
                          type="time" 
                          step="1"
                          required
                          value={slot.startTime}
                          onChange={(e) => updateNewSlot(index, 'startTime', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Giờ Kết Thúc</label>
                        <input 
                          type="time" 
                          step="1"
                          required
                          value={slot.endTime}
                          onChange={(e) => updateNewSlot(index, 'endTime', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500">SỨC CHỨA Ô TÔ</label>
                        <input 
                          type="number" 
                          min="0"
                          required
                          value={slot.carCapacity}
                          onChange={(e) => updateNewSlot(index, 'carCapacity', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500">SỨC CHỨA XE MÁY</label>
                        <input 
                          type="number" 
                          min="0"
                          required
                          value={slot.bikeCapacity}
                          onChange={(e) => updateNewSlot(index, 'bikeCapacity', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddSlotForm}
                className="w-full py-3 border-2 border-dashed border-sky-200 text-sky-500 font-bold rounded-xl hover:bg-sky-50 hover:border-sky-300 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm ca nữa (Tạo nhiều ca cùng lúc)</span>
              </button>

              <div className="pt-2 flex items-center justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-100 mt-2 py-4">
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
                  <span>Lưu {newSlots.length} Khung Giờ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
