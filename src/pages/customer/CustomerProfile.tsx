import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Camera, Loader2, Crown, Sparkles, TrendingUp, CreditCard, CheckCircle2, ChevronRight, Zap, Info } from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'
import { loyaltyService } from '../../services/loyaltyService'
import { LoyaltySummaryDTO } from '../../types/loyalty'

export default function CustomerProfile() {
  const navigate = useNavigate()

  const fullName = sessionStorage.getItem('fullName') || localStorage.getItem('fullName') || '';
  const phone = sessionStorage.getItem('phoneNumber') || localStorage.getItem('phoneNumber') || '';
  const [currentTier, setCurrentTier] = useState<string | null>(sessionStorage.getItem('currentTier') || localStorage.getItem('currentTier'));
  const [currentPoints, setCurrentPoints] = useState<string | null>(sessionStorage.getItem('currentPoints') || localStorage.getItem('currentPoints'));
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [loyaltySummary, setLoyaltySummary] = useState<LoyaltySummaryDTO | null>(null);
  const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(false);

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        setIsLoadingLoyalty(true);
        const data = await loyaltyService.getSummary();
        const pointsStr = data.currentPoints.toString();

        setLoyaltySummary(data);
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

  // Calculations for tier progress
  const nextTier = loyaltySummary?.nextTier;
  const qualMode = loyaltySummary?.qualificationMode || 'OR';
  const qualSpend = loyaltySummary?.qualifyingSpend ?? totalSpent;
  const spendReq = loyaltySummary?.spendRequiredForNextTier ?? 0;
  const targetSpend = qualSpend + spendReq;
  const spendPercent = targetSpend > 0 ? Math.min(100, Math.round((qualSpend / targetSpend) * 100)) : 100;

  const qualVisits = loyaltySummary?.qualifyingVisits ?? totalVisits;
  const visitsReq = loyaltySummary?.visitsRequiredForNextTier ?? 0;
  const targetVisits = qualVisits + visitsReq;
  const visitsPercent = targetVisits > 0 ? Math.min(100, Math.round((qualVisits / targetVisits) * 100)) : 100;

  const overallPercent = qualMode === 'OR'
    ? Math.max(spendPercent, visitsPercent)
    : Math.round((spendPercent + visitsPercent) / 2);

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
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <p className="text-white font-extrabold text-base sm:text-lg">{currentTier} • {currentPoints} điểm</p>
                    {loyaltySummary?.pointMultiplier && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white font-extrabold text-xs flex items-center gap-1 backdrop-blur-sm border border-white/30 shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                        Tích điểm x{loyaltySummary.pointMultiplier}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-white/80 justify-center sm:justify-start">
                    <span>Đã chi tiêu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSpent)}</span>
                    <span>•</span>
                    <span>Số lần đến: {totalVisits}</span>
                  </div>
                  <p className="text-[11px] text-white/70 font-medium">Tỷ lệ quy đổi: 10.000đ = 1 điểm tích lũy</p>
                </div>
              )}
            </div>
          </div>

          {/* LOYALTY TIER PROGRESS SECTION */}
          {!isLoadingLoyalty && (
            <div className="p-6 sm:p-8 bg-slate-50/80 border-b border-slate-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-sm">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Tiến Trình Thăng Hạng Thành Viên</h3>
                    <p className="text-xs text-slate-500">
                      {nextTier
                        ? `Quy tắc xét duyệt (${qualMode === 'OR' ? 'Đạt 1 trong 2 chỉ tiêu' : 'Đạt cả 2 chỉ tiêu'}):`
                        : 'Bạn đã đạt hạng thành viên cao nhất!'}
                    </p>
                  </div>
                </div>

                {nextTier && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold shadow-sm self-start sm:self-auto">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">{currentTier || 'Thành viên'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="px-2 py-0.5 rounded-lg bg-orange-500 text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {nextTier}
                    </span>
                  </div>
                )}
              </div>

              {nextTier ? (
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-5">
                  {/* Overall Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Tiến độ lên hạng {nextTier}</span>
                      <span className="text-orange-600 font-extrabold text-sm">{overallPercent}%</span>
                    </div>
                    <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${overallPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Grid 2 progress cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Spend Progress */}
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-orange-500" />
                          Tổng Chi Tiêu
                        </span>
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${spendPercent >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {spendPercent}%
                        </span>
                      </div>

                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${spendPercent >= 100 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                          style={{ width: `${spendPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-0.5">
                        <span>{qualSpend.toLocaleString('vi-VN')}đ / {targetSpend.toLocaleString('vi-VN')}đ</span>
                        {spendReq > 0 ? (
                          <span className="text-orange-600 font-semibold">Còn thiếu: {spendReq.toLocaleString('vi-VN')}đ</span>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã đạt
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visits Progress */}
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          Số Lượt Đến
                        </span>
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${visitsPercent >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {visitsPercent}%
                        </span>
                      </div>

                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${visitsPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${visitsPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-0.5">
                        <span>{qualVisits} / {targetVisits} lượt</span>
                        {visitsReq > 0 ? (
                          <span className="text-blue-600 font-semibold">Còn thiếu: {visitsReq} lượt</span>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã đạt
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Point conversion rate info badge */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold px-1">
                    <Info className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Quy tắc tích điểm: <strong>10.000đ = 1 điểm</strong></span>
                  </div>

                  {/* Summary Tip Box */}
                  <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      {qualMode === 'OR' ? (
                        (spendPercent >= 100 || visitsPercent >= 100) ? (
                          <span>🎉 Bạn đã hoàn thành chỉ tiêu để sẵn sàng thăng hạng <strong>{nextTier}</strong>!</span>
                        ) : (
                          <span>
                            Chỉ cần hoàn thành <strong>1 trong 2</strong> chỉ tiêu trên (còn thiếu <strong>{spendReq.toLocaleString('vi-VN')}đ</strong> chi tiêu HOẶC <strong>{visitsReq} lượt đến</strong>) để đạt hạng <strong>{nextTier}</strong>.
                          </span>
                        )
                      ) : (
                        (spendPercent >= 100 && visitsPercent >= 100) ? (
                          <span>🎉 Bạn đã hoàn thành cả 2 chỉ tiêu để thăng hạng <strong>{nextTier}</strong>!</span>
                        ) : (
                          <span>
                            Cần hoàn thành <strong>cả 2</strong> chỉ tiêu chi tiêu và lượt đến để thăng hạng <strong>{nextTier}</strong>.
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 rounded-2xl p-4 text-xs font-bold text-amber-900 flex items-center gap-3">
                  <Crown className="w-6 h-6 text-amber-600 shrink-0" />
                  <span>Bạn đang ở hạng thành viên cao nhất <strong>({currentTier})</strong>. Tận hưởng tất cả các ưu đãi độc quyền của hệ thống!</span>
                </div>
              )}
            </div>
          )}

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

            {/* <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95"
              >
                <Save className="w-5 h-5" />
                <span>Lưu thay đổi</span>
              </button>
            </div> */}
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
