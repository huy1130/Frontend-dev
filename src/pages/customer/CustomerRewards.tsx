import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, ChevronLeft, Gift, AlertCircle, Loader2, Tag, CheckCircle2, History, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'
import { loyaltyService } from '../../services/loyaltyService'
import { PointTransactionDTO } from '../../types/loyalty'
import { toast } from 'sonner'

export default function CustomerRewards() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'exchange' | 'my_rewards' | 'transactions'>('exchange')
  const [currentPoints, setCurrentPoints] = useState<number>(0)
  
  const [eligibleRewards, setEligibleRewards] = useState<any[]>([])
  const [myRedemptions, setMyRedemptions] = useState<any[]>([])
  const [transactions, setTransactions] = useState<PointTransactionDTO[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false)
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
      } else if (activeTab === 'my_rewards') {
        const redemptions = await loyaltyService.getMyRedemptions()
        setMyRedemptions(redemptions)
      } else if (activeTab === 'transactions') {
        await fetchTransactions(1)
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
      toast.error('Có lỗi xảy ra khi tải dữ liệu phần thưởng.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async (page: number) => {
    setIsTransactionsLoading(true)
    try {
      const res = await loyaltyService.getTransactions(page)
      setTransactions(res.items || [])
      setCurrentPage(res.page)
      setTotalPages(res.totalPages)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Lỗi khi lấy lịch sử giao dịch.')
    } finally {
      setIsTransactionsLoading(false)
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
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'transactions' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Lịch Sử Giao Dịch
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
                    {Object.values(
                      myRedemptions.reduce((acc: any, curr: any) => {
                        const key = `${curr.rewardName}-${curr.status}`
                        if (!acc[key]) {
                          acc[key] = { ...curr, count: 1 }
                        } else {
                          acc[key].count += 1
                        }
                        return acc
                      }, {})
                    ).map((redemption: any) => {
                      const isUsed = redemption.status !== 'Issued'
                      return (
                        <div key={redemption.redemptionId} className={`relative border rounded-xl p-4 flex gap-4 items-center ${isUsed ? 'bg-slate-50 border-slate-200' : 'bg-white border-orange-200 shadow-sm'}`}>
                          {redemption.count > 1 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white z-10">
                              x{redemption.count}
                            </div>
                          )}
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

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                {isTransactionsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                    <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Chưa có giao dịch điểm nào.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="divide-y divide-slate-100">
                        {transactions.map((tx) => {
                          const isEarn = tx.transactionType === 'Earn'
                          const isRedeem = tx.transactionType === 'Redeem'
                          const isExpire = tx.transactionType === 'Expire'
                          
                          let icon = <Clock className="w-5 h-5 text-slate-400" />
                          let typeLabel = tx.transactionType
                          let pointColor = 'text-slate-600'
                          let pointPrefix = ''
                          
                          if (isEarn) {
                            icon = <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                            typeLabel = 'Cộng điểm (Hoàn tất dịch vụ)'
                            pointColor = 'text-emerald-600'
                            pointPrefix = '+'
                          } else if (isRedeem) {
                            icon = <ArrowDownCircle className="w-5 h-5 text-orange-500" />
                            typeLabel = 'Đổi quà'
                            pointColor = 'text-orange-600'
                            pointPrefix = '-'
                          } else if (isExpire) {
                            icon = <AlertCircle className="w-5 h-5 text-red-500" />
                            typeLabel = 'Điểm hết hạn'
                            pointColor = 'text-red-600'
                            pointPrefix = '-'
                          }

                          return (
                            <div key={tx.transactionId} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                  {icon}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-slate-900">{typeLabel}</h4>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                  </p>
                                </div>
                              </div>
                              <div className={`font-extrabold text-base ${pointColor}`}>
                                {pointPrefix}{Math.abs(tx.points)} điểm
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => fetchTransactions(currentPage - 1)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trang trước
                        </button>
                        <span className="text-sm font-bold text-slate-700">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => fetchTransactions(currentPage + 1)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trang sau
                        </button>
                      </div>
                    )}
                  </>
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
