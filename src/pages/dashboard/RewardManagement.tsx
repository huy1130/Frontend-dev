import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Plus, 
  Search, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { toast } from 'sonner';
import { rewardService, RewardDTO, UpsertRewardDTO } from '../../services/rewardService';
import { serviceService, ServiceDto } from '../../services/serviceService';

export default function RewardManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rewards, setRewards] = useState<RewardDTO[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  
  const initialFormState: UpsertRewardDTO = {
    rewardName: '',
    description: '',
    rewardType: 'Discount',
    pointCost: 100,
    minimumTier: 'Member',
    isActive: true,
  };
  const [formData, setFormData] = useState<UpsertRewardDTO>(initialFormState);

  useEffect(() => {
    fetchRewards();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getActiveServices();
      setServices(data);
    } catch (err) {
      console.error('Lỗi tải danh sách dịch vụ', err);
    }
  };

  const fetchRewards = async () => {
    try {
      setIsLoading(true);
      const data = await rewardService.getAll();
      setRewards(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Không thể tải danh sách phần thưởng');
      toast.error('Lỗi khi tải dữ liệu phần thưởng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reward: RewardDTO) => {
    setEditingId(reward.rewardId);
    setFormData({
      rewardName: reward.rewardName,
      description: reward.description || '',
      rewardType: reward.rewardType,
      pointCost: reward.pointCost,
      discountValue: reward.discountValue,
      serviceId: reward.serviceId,
      minimumTier: reward.minimumTier,
      validFrom: reward.validFrom?.split('T')[0],
      validTo: reward.validTo?.split('T')[0],
      isActive: reward.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await rewardService.update(editingId, formData);
        toast.success('Cập nhật phần thưởng thành công!');
      } else {
        await rewardService.create(formData);
        toast.success('Tạo phần thưởng thành công!');
      }
      setIsModalOpen(false);
      fetchRewards();
    } catch (error: any) {
      toast.error(error.response?.data?.Message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = (id: number) => {
    setDeactivatingId(id);
  };

  const confirmDeactivate = async () => {
    if (!deactivatingId) return;
    try {
      setIsSubmitting(true);
      await rewardService.deactivate(deactivatingId);
      toast.success('Đã vô hiệu hóa phần thưởng!');
      fetchRewards();
    } catch (error: any) {
      toast.error('Lỗi khi vô hiệu hóa phần thưởng');
    } finally {
      setIsSubmitting(false);
      setDeactivatingId(null);
    }
  };

  const filteredRewards = rewards.filter(r => {
    const matchSearch = r.rewardName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? r.isActive : !r.isActive;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Gift className="w-7 h-7 text-pink-500" />
            <span>Quản Lý Phần Thưởng</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thiết lập quà tặng, voucher đổi điểm cho thành viên
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-pink-500/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Phần Thưởng</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-fit bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tất Cả ({rewards.length})
          </button>
          <button 
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === 'active' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Hoạt Động ({rewards.filter(r => r.isActive).length})
          </button>
          <button 
            onClick={() => setFilterStatus('inactive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === 'inactive' ? 'bg-white text-rose-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Đã Tắt ({rewards.filter(r => !r.isActive).length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Tìm tên phần thưởng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500">
          <AlertCircle className="w-10 h-10 mb-4" />
          <p>{error}</p>
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200 border-dashed">
          <Gift className="w-12 h-12 mb-4 opacity-50" />
          <p>Không tìm thấy phần thưởng nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRewards.map((reward) => (
            <div
              key={reward.rewardId}
              className={`bg-white border rounded-3xl p-6 transition-all shadow-sm relative flex flex-col justify-between space-y-4 ${
                reward.isActive
                  ? 'border-slate-200 hover:border-pink-500/50 hover:shadow-lg'
                  : 'border-slate-200 opacity-70 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full border bg-pink-50 text-pink-600 border-pink-200">
                    {reward.rewardType}
                  </span>

                  <div className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      reward.isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    {reward.isActive ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Hoạt Động</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5" /> Vô Hiệu Hóa</>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-800 text-base leading-snug mb-1">{reward.rewardName}</h3>
                <p className="text-xs text-slate-500 mb-3">{reward.description || 'Chưa có mô tả'}</p>
                <p className="text-xs text-slate-500 mb-3">Hạng áp dụng: <span className="text-slate-800 font-bold">{reward.minimumTier}</span></p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Điểm quy đổi</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-amber-500">{reward.pointCost}</span>
                    <span className="text-xs font-bold text-amber-500/70">pts</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(reward)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors border border-slate-200"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-4 h-4 text-sky-600" />
                  </button>
                  {reward.isActive && (
                    <button
                      onClick={() => handleDeactivate(reward.rewardId)}
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-100"
                      title="Vô hiệu hóa"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-fade-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-extrabold text-slate-900">
              {editingId ? 'Chỉnh Sửa Phần Thưởng' : 'Thêm Phần Thưởng Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">Tên phần thưởng <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.rewardName}
                  onChange={(e) => setFormData({ ...formData, rewardName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">Loại phần thưởng <span className="text-rose-500">*</span></label>
                <select
                  value={formData.rewardType}
                  onChange={(e) => {
                    const type = e.target.value;
                    setFormData({ 
                      ...formData, 
                      rewardType: type,
                      // Reset related fields when switching type
                      discountValue: type === 'Discount' ? formData.discountValue : undefined,
                      serviceId: (type === 'FreeWash' || type === 'AddOn') ? formData.serviceId : undefined
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                >
                  <option value="Discount">Giảm Giá (Discount)</option>
                  <option value="FreeWash">Rửa Xe Miễn Phí (FreeWash)</option>
                  <option value="AddOn">Dịch Vụ Tặng Kèm (AddOn)</option>
                </select>
              </div>

              <div>
                {formData.rewardType === 'Discount' ? (
                  <>
                    <label className="block text-slate-700 mb-1.5 font-bold text-xs">Giá trị giảm (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.discountValue || ''}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                      placeholder="VD: 50000"
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-slate-700 mb-1.5 font-bold text-xs">Dịch vụ liên kết (Tùy chọn)</label>
                    <select
                      value={formData.serviceId || ''}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                    >
                      <option value="">-- Chọn dịch vụ --</option>
                      {services.map(s => (
                        <option key={s.serviceId} value={s.serviceId}>{s.serviceName}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Hạng thẻ tối thiểu <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.minimumTier}
                    onChange={(e) => setFormData({ ...formData, minimumTier: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                  >
                    <option value="Member">Member</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Điểm quy đổi <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.pointCost}
                    onChange={(e) => setFormData({ ...formData, pointCost: Number(e.target.value) })}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-4 py-2.5 text-amber-600 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Áp dụng từ ngày</label>
                  <input
                    type="date"
                    value={formData.validFrom || ''}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Đến ngày</label>
                  <input
                    type="date"
                    value={formData.validTo || ''}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">Mô tả</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all resize-none"
                  placeholder="Nhập mô tả cho phần thưởng..."
                />
              </div>

              <div className="pt-5 flex justify-end gap-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-bold text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2 text-sm"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu Phần Thưởng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Deactivate Confirm Modal */}
      {deactivatingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-fade-up">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Xác nhận vô hiệu hóa</h3>
              <p className="text-sm text-slate-500">
                Phần thưởng này sẽ bị ẩn đi và khách hàng không thể dùng điểm để đổi được nữa. Bạn có chắc chắn không?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeactivatingId(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-bold text-sm"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={confirmDeactivate}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vô Hiệu Hóa'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
