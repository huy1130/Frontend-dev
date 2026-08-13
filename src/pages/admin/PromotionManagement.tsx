import React, { useState, useEffect } from 'react';
import { 
  Tag, 
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
import { promotionService, PromotionDTO, UpsertPromotionDTO } from '../../services/promotionService';
import { serviceService, ServiceDto } from '../../services/serviceService';
import { toast } from 'sonner';

export default function PromotionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [promotions, setPromotions] = useState<PromotionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  
  const [services, setServices] = useState<ServiceDto[]>([]);

  const initialFormState: UpsertPromotionDTO = {
    promoCode: '',
    promoName: '',
    description: '',
    promoType: 'Discount',
    discountType: 'Fixed',
    discountValue: 0,
    maxDiscount: undefined,
    serviceId: undefined,
    targetTier: 'Member',
    isActive: true,
  };
  const [formData, setFormData] = useState<UpsertPromotionDTO>(initialFormState);

  useEffect(() => {
    fetchPromotions();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getActiveServices();
      setServices(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách dịch vụ:', err);
    }
  };

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const data = await promotionService.getAllAdmin();
      setPromotions(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Không thể tải danh sách khuyến mãi');
      toast.error('Lỗi khi tải dữ liệu khuyến mãi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: PromotionDTO) => {
    setEditingId(promo.promotionId);
    setFormData({
      promoCode: promo.promoCode || '',
      promoName: promo.promoName,
      description: promo.description || '',
      promoType: promo.promoType,
      discountType: promo.discountType || 'Fixed',
      discountValue: promo.discountValue || 0,
      maxDiscount: promo.maxDiscount || undefined,
      serviceId: promo.serviceId || undefined,
      targetTier: promo.targetTier,
      validFrom: promo.validFrom?.split('T')[0],
      validTo: promo.validTo?.split('T')[0],
      isActive: promo.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Clean up payload based on promoType
      const payload: UpsertPromotionDTO = { ...formData };
      if (payload.promoType !== 'Discount') {
        payload.discountType = undefined;
        payload.discountValue = undefined;
        payload.maxDiscount = undefined;
      } else if (payload.discountType === 'Fixed') {
        payload.maxDiscount = undefined;
      }

      if (editingId) {
        await promotionService.updateAdmin(editingId, payload);
        toast.success('Cập nhật khuyến mãi thành công!');
      } else {
        await promotionService.createAdmin(payload);
        toast.success('Tạo khuyến mãi thành công!');
      }
      setIsModalOpen(false);
      fetchPromotions();
    } catch (error: any) {
      toast.error(error.response?.data?.Message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = (id: number) => {
    setDeactivatingId(id);
  };

  const handleActivate = async (promo: PromotionDTO) => {
    try {
      setIsSubmitting(true);
      const updateData: UpsertPromotionDTO = {
        promoCode: promo.promoCode || '',
        promoName: promo.promoName,
        description: promo.description || '',
        promoType: promo.promoType,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        maxDiscount: promo.maxDiscount,
        serviceId: promo.serviceId,
        targetTier: promo.targetTier,
        validFrom: promo.validFrom?.split('T')[0],
        validTo: promo.validTo?.split('T')[0],
        isActive: true,
      };
      await promotionService.updateAdmin(promo.promotionId, updateData);
      toast.success('Đã kích hoạt lại khuyến mãi!');
      fetchPromotions();
    } catch (error: any) {
      toast.error('Lỗi khi kích hoạt lại khuyến mãi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivatingId) return;
    try {
      setIsSubmitting(true);
      await promotionService.deactivateAdmin(deactivatingId);
      toast.success('Đã vô hiệu hóa khuyến mãi!');
      fetchPromotions();
    } catch (error: any) {
      toast.error('Lỗi khi vô hiệu hóa khuyến mãi');
    } finally {
      setIsSubmitting(false);
      setDeactivatingId(null);
    }
  };

  const filteredPromotions = promotions.filter(p => {
    const matchSearch = (p.promoName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.promoCode && p.promoCode.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? p.isActive : !p.isActive;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Tag className="w-7 h-7 text-indigo-500" />
            <span>Quản Lý Khuyến Mãi</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thiết lập các chương trình khuyến mãi và mã voucher cho khách hàng
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo Khuyến Mãi Mới</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-fit bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tất Cả ({promotions.length})
          </button>
          <button 
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === 'active' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Hoạt Động ({promotions.filter(p => p.isActive).length})
          </button>
          <button 
            onClick={() => setFilterStatus('inactive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === 'inactive' ? 'bg-white text-rose-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Đã Tắt ({promotions.filter(p => !p.isActive).length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Tìm mã hoặc tên KM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500">
          <AlertCircle className="w-10 h-10 mb-4" />
          <p>{error}</p>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200 border-dashed">
          <Tag className="w-12 h-12 mb-4 opacity-50" />
          <p>Không tìm thấy chương trình khuyến mãi nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPromotions.map((promo) => (
            <div
              key={promo.promotionId}
              className={`bg-white border rounded-3xl p-6 transition-all shadow-sm relative flex flex-col justify-between space-y-4 ${
                promo.isActive
                  ? 'border-slate-200 hover:border-indigo-500/50 hover:shadow-lg'
                  : 'border-slate-200 opacity-70 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200">
                    {promo.promoType}
                  </span>

                  <div className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      promo.isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    {promo.isActive ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Hoạt Động</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5" /> Vô Hiệu Hóa</>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-800 text-base leading-snug mb-1">{promo.promoName}</h3>
                {promo.promoCode && (
                  <div className="mb-2 inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                    <span className="font-mono text-sm font-extrabold text-indigo-600">{promo.promoCode}</span>
                  </div>
                )}
                <p className="text-xs text-slate-500 mb-3">{promo.description || 'Chưa có mô tả'}</p>
                <p className="text-xs text-slate-500 mb-1">Hạng áp dụng: <span className="text-slate-800 font-bold">{promo.targetTier}</span></p>
                {promo.validTo && <p className="text-xs text-slate-500 mb-3">Hạn dùng: <span className="text-slate-800 font-bold">{new Date(promo.validTo).toLocaleDateString('vi-VN')}</span></p>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(promo)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors border border-slate-200"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-4 h-4 text-sky-600" />
                  </button>
                  {promo.isActive ? (
                    <button
                      onClick={() => handleDeactivate(promo.promotionId)}
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-100"
                      title="Vô hiệu hóa"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(promo)}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors border border-emerald-100"
                      title="Kích hoạt lại"
                    >
                      <CheckCircle2 className="w-4 h-4" />
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
              {editingId ? 'Chỉnh Sửa Khuyến Mãi' : 'Tạo Khuyến Mãi Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Mã Khuyến Mãi (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="VD: SUMMER26"
                    value={formData.promoCode || ''}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-mono uppercase focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Loại Khuyến Mãi <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.promoType}
                    onChange={(e) => setFormData({ ...formData, promoType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  >
                    <option value="Discount">Giảm Giá (Discount)</option>
                    <option value="FreeWash">Rửa Xe Miễn Phí (FreeWash)</option>
                    <option value="AddOn">Tặng Kèm Dịch Vụ (AddOn)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">Tên chương trình <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên chương trình khuyến mãi"
                  value={formData.promoName}
                  onChange={(e) => setFormData({ ...formData, promoName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              
              {/* Conditional Fields based on PromoType */}
              {formData.promoType === 'Discount' && (
                <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold text-xs">Loại Giảm Giá <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.discountType || 'Fixed'}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    >
                      <option value="Fixed">Trừ tiền cố định (đ)</option>
                      <option value="Percent">Theo phần trăm (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold text-xs">Mức Giảm Giá <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder={formData.discountType === 'Percent' ? 'VD: 10' : 'VD: 50000'}
                      value={formData.discountValue || ''}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                  {formData.discountType === 'Percent' && (
                    <div className="col-span-2">
                      <label className="block text-slate-700 mb-1.5 font-bold text-xs">Giảm tối đa (đ) (Tùy chọn)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="VD: 100000"
                        value={formData.maxDiscount || ''}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Dịch vụ áp dụng {formData.promoType !== 'Discount' && <span className="text-rose-500">*</span>}</label>
                  <select
                    required={formData.promoType !== 'Discount'}
                    disabled={formData.promoType === 'Discount'}
                    value={formData.serviceId || ''}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{formData.promoType === 'Discount' ? '-- Tất cả dịch vụ --' : '-- Chọn 1 dịch vụ bắt buộc --'}</option>
                    {services.filter(s => {
                      if (formData.promoType === 'FreeWash') return s.serviceName.toLowerCase().includes('rửa xe');
                      if (formData.promoType === 'AddOn') return !s.serviceName.toLowerCase().includes('rửa xe');
                      return true;
                    }).map(svc => (
                      <option key={svc.serviceId} value={svc.serviceId}>{svc.serviceName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Hạng áp dụng tối thiểu <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.targetTier}
                    onChange={(e) => setFormData({ ...formData, targetTier: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  >
                    <option value="All">Tất cả khách hàng (bao gồm vãng lai)</option>
                    <option value="Member">Member</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Áp dụng từ ngày</label>
                  <input
                    type="date"
                    value={formData.validFrom || ''}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs">Đến ngày</label>
                  <input
                    type="date"
                    value={formData.validTo || ''}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">Mô tả</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                  placeholder="Nhập mô tả chi tiết (tùy chọn)..."
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
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu Khuyến Mãi
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
                Khuyến mãi này sẽ bị tắt và khách hàng không thể sử dụng mã này được nữa. Bạn có chắc chắn không?
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
