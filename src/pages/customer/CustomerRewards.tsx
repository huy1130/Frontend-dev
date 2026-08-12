import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, ChevronLeft, Gift, AlertCircle, Loader2, Tag, CheckCircle2 } from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'
import { loyaltyService } from '../../services/loyaltyService'
import { toast } from 'sonner'

export default function CustomerRewards() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'exchange' | 'my_rewards'>('exchange')
  const [currentPoints, setCurrentPoints] = useState<number>(0)
  
  const [eligibleRewards, setEligibleRewards] = useState<any[]>([])
  const [myRedemptions, setMyRedemptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null)
  const [confirmModal, setConfirmModal] = useState<{rewardId: number, pointCost: number, rewardName: string} | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const summary = await loyaltyService.getSummary()
      setCurrentPoints(summary.currentPoints)

      if (activeTab === 'exchange') {
        const rewards = await loyaltyService.getEligibleRewards()
        setEligibleRewards(rewards)
      } else {
        const redemptions = await loyaltyService.getMyRedemptions()
        setMyRedemptions(redemptions)
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
      toast.error('Có lỗi xảy ra khi tải dữ liệu phần thưởng.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const handleRedeem = (rewardId: number, pointCost: number, rewardName: string) => {
    if (currentPoints < pointCost) {
      toast.error('Bạn không đủ điểm để đổi phần thưởng này.')
      return
    }
    setConfirmModal({ rewardId, pointCost, rewardName })
  }

  const confirmRedeem = async () => {
    if (!confirmModal) return
    setIsRedeeming(confirmModal.rewardId)
    const rewardId = confirmModal.rewardId
    setConfirmModal(null)
    try {
      await loyaltyService.redeemReward(rewardId)
      toast.success('Đổi phần thưởng thành công! Bạn có thể sử dụng khi đặt lịch.')
      // Refresh points and data
      fetchData()
    } catch (error: any) {
      console.error('Redeem error:', error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi thưởng.')
    } finally {
      setIsRedeeming(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <NavBar />

      <main className="flex-1 pt-28 pb-32 px-4 sm:px-6 max-w-4xl w-full mx-auto space-y-6">
        
        {/* Back Link */}
        <div className="mb-4">
          <Link to="/customer" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 font-semibold transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại trang chính</span>
          </Link>
        </div>

        {/* Header & Points */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg shadow-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight mb-1">Cửa Hàng Đổi Thưởng</h1>
              <p className="text-orange-100 text-sm">Dùng điểm tích lũy để nhận voucher và dịch vụ miễn phí.</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center min-w-[140px]">
            <span className="block text-orange-100 text-xs font-semibold mb-1 uppercase tracking-wider">Điểm hiện tại</span>
            <span className="text-3xl font-black">{currentPoints}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('exchange')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'exchange' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Đổi Quà Mới
          </button>
          <button
            onClick={() => setActiveTab('my_rewards')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'my_rewards' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Quà Của Tôi
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div>
            {/* Exchange Tab */}
            {activeTab === 'exchange' && (
              <div className="space-y-4">
                {eligibleRewards.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Hiện chưa có phần thưởng nào để đổi.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eligibleRewards.map((reward) => (
                      <div key={reward.rewardId} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-300 transition-all shadow-sm flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                            <Award className="w-5 h-5" />
                          </div>
                          <span className="bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-1 rounded-md">
                            {reward.pointCost} điểm
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 mb-1">{reward.rewardName}</h3>
                        <p className="text-xs text-slate-500 mb-5 flex-1">{reward.description || 'Không có mô tả'}</p>
                        <button
                          disabled={currentPoints < reward.pointCost || isRedeeming === reward.rewardId}
                          onClick={() => handleRedeem(reward.rewardId, reward.pointCost, reward.rewardName)}
                          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            currentPoints < reward.pointCost 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                          }`}
                        >
                          {isRedeeming === reward.rewardId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          <span>{currentPoints < reward.pointCost ? 'Không đủ điểm' : 'Đổi Ngay'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Rewards Tab */}
            {activeTab === 'my_rewards' && (
              <div className="space-y-4">
                {myRedemptions.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                    <Gift className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Bạn chưa đổi phần thưởng nào.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myRedemptions.map((redemption: any) => {
                      const isUsed = redemption.status !== 'Issued'
                      return (
                        <div key={redemption.redemptionId} className={`border rounded-xl p-4 flex gap-4 items-center ${isUsed ? 'bg-slate-50 border-slate-200' : 'bg-white border-orange-200 shadow-sm'}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isUsed ? 'bg-slate-200 text-slate-400' : 'bg-orange-100 text-orange-600'}`}>
                            {isUsed ? <CheckCircle2 className="w-6 h-6" /> : <Tag className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className={`text-sm font-extrabold mb-0.5 ${isUsed ? 'text-slate-500' : 'text-slate-900'}`}>
                              {redemption.rewardName}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {isUsed ? 'Đã sử dụng' : 'Có thể sử dụng khi đặt lịch'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {myRedemptions.filter((r: any) => r.status === 'Issued').length > 0 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => navigate('/customer/booking')}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      Dùng Quà Đặt Lịch Ngay
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận đổi thưởng</h3>
              <p className="text-slate-600 text-sm mb-1">
                Bạn có chắc chắn muốn dùng <strong className="text-orange-600">{confirmModal.pointCost} điểm</strong>
              </p>
              <p className="text-slate-600 text-sm">
                để đổi lấy <strong className="text-slate-800">{confirmModal.rewardName}</strong> không?
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmRedeem}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-orange-500/20"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
