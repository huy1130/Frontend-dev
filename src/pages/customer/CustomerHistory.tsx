import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  History,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  PlusCircle,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Car,
  Tag,
  QrCode,
  FileText,
  Eye,
  Loader2,
  ShieldAlert,
  Send,
  Camera,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import NavBar from '../../components/layout/NavBar'
import Footer from '../../components/layout/Footer'

import { bookingService, BookingResponseDTO } from '../../services/bookingService'
import { promotionService } from '../../services/promotionService'
import { loyaltyService } from '../../services/loyaltyService'
import { incidentReportService, IncidentReportDto } from '../../services/incidentReportService'
import { formatDateTime, parseApiDate } from '../../utils/date'
import { AuthenticatedImage } from '../../components/common/AuthenticatedImage'
import { toast } from 'sonner'

const isBookingExpired = (createdAt?: string | Date) => {
  if (!createdAt) return false
  const parsedDate = parseApiDate(createdAt)
  if (!parsedDate) return false
  return (parsedDate.getTime() + 10 * 60 * 1000) <= Date.now()
}

const PendingCountdown: React.FC<{ createdAt?: string | Date; onExpire?: () => void }> = ({ createdAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!createdAt) return

    const calculateTime = () => {
      const parsedDate = parseApiDate(createdAt)
      if (!parsedDate) return
      const createdTime = parsedDate.getTime()
      const expireTime = createdTime + 10 * 60 * 1000
      const diff = Math.floor((expireTime - Date.now()) / 1000)
      if (diff <= 0) {
        setTimeLeft(0)
        onExpire?.()
      } else {
        setTimeLeft(diff)
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [createdAt, onExpire])

  if (timeLeft === null) return null
  if (timeLeft <= 0) {
    return <span className="text-rose-600 font-extrabold text-[11px] ml-1">(Hết hạn cọc)</span>
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <span className="text-amber-600 font-bold text-[11px] ml-1">
      (Hạn cọc: {formatted})
    </span>
  )
}

export default function CustomerHistory() {
  const [searchParams] = useSearchParams()
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Completed' | 'Cancelled'>('all')


  const [historyData, setHistoryData] = useState<BookingResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDTO | null>(null)
  const [promotionsMap, setPromotionsMap] = useState<Record<number, string>>({})
  const [redemptionsMap, setRedemptionsMap] = useState<Record<number, string>>({})

  // VietQR Deposit Modal state
  const [depositModalData, setDepositModalData] = useState<{
    bookingId: number
    amount: number
    accountNumber: string
    accountName: string
    bin: string
    description: string
    qrCode?: string
    qrImageUrl?: string
    checkoutUrl?: string
    createdAt?: string | Date
  } | null>(null)
  const [, setTick] = useState(0)
  const handleCountdownExpire = React.useCallback(() => {
    setTick(t => t + 1)
  }, [])
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false)
  const [depositBookingId, setDepositBookingId] = useState<number | null>(null)
  const [depositAmountValue, setDepositAmountValue] = useState<number>(0)
  const navigate = useNavigate()
  const [depositPayosUrl, setDepositPayosUrl] = useState<string>('')
  const [successDepositBookingId, setSuccessDepositBookingId] = useState<number | null>(null)
  const [isCheckingDeposit, setIsCheckingDeposit] = useState<boolean>(false)
  const [isCancellingDeposit, setIsCancellingDeposit] = useState<boolean>(false)
  const [confirmCancelBookingId, setConfirmCancelBookingId] = useState<number | null>(null)

  const handleConfirmCancel = async (bookingId: number) => {
    if (!bookingId) return
    setIsCancellingDeposit(true)
    try {
      await bookingService.cancelBooking(bookingId)
      toast.success(`Đơn đặt lịch #${bookingId} đã được chuyển sang trạng thái Đã Hủy.`)
      setConfirmCancelBookingId(null)
      setDepositModalData(null)
      fetchHistory()
      navigate('/customer/history', { replace: true })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn đặt lịch. Vui lòng thử lại.')
    } finally {
      setIsCancellingDeposit(false)
    }
  }

  // Polling to automatically detect when deposit is completed while QR modal is open
  React.useEffect(() => {
    if (!depositModalData?.bookingId) return

    const interval = setInterval(async () => {
      try {
        const detailRes = await bookingService.getBookingDetail(depositModalData.bookingId)
        const currentStatus = detailRes?.data?.status || detailRes?.data?.bookingStatus
        const createdAt = detailRes?.data?.createdAt || depositModalData.createdAt

        if (currentStatus === 'Deposited') {
          const bId = depositModalData.bookingId
          setDepositModalData(null)
          setSuccessDepositBookingId(bId)
          fetchHistory()
          navigate('/customer/history', { replace: true })
          toast.success('🎉 Giao dịch thanh toán cọc đã được ghi nhận!')
        } else if (createdAt && isBookingExpired(createdAt)) {
          setDepositModalData(null)
          toast.error('⏱️ Mã QR cọc đã hết hạn thanh toán (quá 10 phút). Lịch hẹn đã bị dọn dẹp!')
          fetchHistory()
        }
      } catch {
        // silent catch
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [depositModalData?.bookingId, depositModalData?.createdAt, navigate])

  const handleCheckDepositStatus = async (bId: number) => {
    setIsCheckingDeposit(true)
    try {
      const detailRes = await bookingService.getBookingDetail(bId)
      const currentStatus = detailRes?.data?.status || detailRes?.data?.bookingStatus
      if (currentStatus === 'Deposited') {
        setDepositModalData(null)
        setSuccessDepositBookingId(bId)
        fetchHistory()
        navigate('/customer/history', { replace: true })
        toast.success('🎉 Giao dịch thanh toán cọc đã được ghi nhận!')
      } else {
        toast.info('Hệ thống chưa nhận được giao dịch. Vui lòng kiểm tra lại sau khi hoàn tất chuyển khoản.')
      }
    } catch {
      toast.error('Không thể kiểm tra trạng thái thanh toán.')
    } finally {
      setIsCheckingDeposit(false)
    }
  }

  // Automatic notification upon returning from PayOS payment or opening QR modal from booking
  const openQrParam = searchParams.get('openQr')
  React.useEffect(() => {
    const bookingIdParam = searchParams.get('bookingId')
    const codeParam = searchParams.get('code')
    const statusParam = searchParams.get('status')

    if (bookingIdParam && (codeParam === '00' || statusParam === 'PAID' || statusParam === 'success')) {
      toast.success(`🎉 Giao dịch thanh toán cọc đơn #${bookingIdParam} đã hoàn tất!`)
    }

    if (openQrParam) {
      const bId = parseInt(openQrParam, 10)
      if (!isNaN(bId)) {
        (async () => {
          try {
            const detailRes = await bookingService.getBookingDetail(bId).catch(() => null)
            const createdAt = detailRes?.data?.createdAt
            if (createdAt && isBookingExpired(createdAt)) {
              toast.error('⏱️ Lịch hẹn này đã hết hạn thanh toán cọc (quá 10 phút). Vui lòng đặt lại lịch mới!')
              fetchHistory()
              return
            }

            toast.info('Đang khởi tạo mã QR cọc PayOS...')
            const payRes = await bookingService.createDepositPayment(bId)
            if (payRes) {
              const depositAmt = payRes.amount ?? payRes.Amount ?? 0
              const isPaid = payRes.status === 'PAID' || payRes.Status === 'PAID'
              if (depositAmt <= 0 || isPaid) {
                setSuccessDepositBookingId(bId)
                toast.success('🎉 Đơn hàng được miễn phí 100% cọc (0đ)! Đã tự động cập nhật trạng thái Đã Đặt Cọc.')
              } else {
                setDepositModalData({
                  bookingId: bId,
                  amount: depositAmt,
                  accountNumber: payRes.accountNumber || payRes.AccountNumber || '',
                  accountName: payRes.accountName || payRes.AccountName || '',
                  bin: payRes.bin || payRes.Bin || '',
                  description: payRes.description || payRes.Description || `Deposit for booking ${bId}`,
                  qrCode: payRes.qrCode || payRes.QrCode,
                  qrImageUrl: payRes.qrImageUrl || payRes.QrImageUrl,
                  checkoutUrl: payRes.checkoutUrl || payRes.CheckoutUrl,
                  createdAt: createdAt
                })
              }
            }
          } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || ''
            if (errorMsg.toLowerCase().includes('not found') || err.response?.status === 404 || err.response?.status === 400) {
              toast.error('⏱️ Lịch hẹn này đã hết hạn thanh toán cọc (quá 10 phút) và đã được tự động dọn dẹp. Vui lòng đặt lại lịch mới!')
              fetchHistory()
            } else {
              toast.error('Không thể tạo mã QR thanh toán cọc.')
            }
          }
        })()
      }
    }
  }, [searchParams, openQrParam])

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [loadingDetailBookingId, setLoadingDetailBookingId] = useState<number | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'condition' | 'receipt' | 'report'>('info')

  // Incident Report states for Customer
  const [myReports, setMyReports] = useState<IncidentReportDto[]>([])
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false)
  const [reportNote, setReportNote] = useState('')
  const [reportImage1, setReportImage1] = useState<File | null>(null)
  const [reportImage2, setReportImage2] = useState<File | null>(null)
  const [reportImage3, setReportImage3] = useState<File | null>(null)
  const [reportImage4, setReportImage4] = useState<File | null>(null)
  const [reportImage5, setReportImage5] = useState<File | null>(null)
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus])

  const fetchHistory = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token')
      if (!token) return
      const phoneNumber = sessionStorage.getItem('phoneNumber') || localStorage.getItem('phoneNumber')

      if (phoneNumber) {
        try {
          const [historyRes, publicPromosRes, eligiblePromosRes, redemptionsRes, myReportsRes] = await Promise.all([
            bookingService.getBookingHistory(phoneNumber),
            promotionService.getPublicPromotions().catch(() => []),
            promotionService.getEligiblePromotions().catch(() => []),
            loyaltyService.getMyRedemptions().catch(() => []),
            incidentReportService.getMyReports().catch(() => ({ data: [] }))
          ])

          if (historyRes && historyRes.data) {
            const sorted = historyRes.data.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
            setHistoryData(sorted)
          }

          const reportsData = Array.isArray(myReportsRes) ? myReportsRes : myReportsRes.data || []
          setMyReports(reportsData)

          const promoMap: Record<number, string> = {}
          if (Array.isArray(publicPromosRes)) {
            publicPromosRes.forEach(p => promoMap[p.promotionId] = p.promoName)
          }
          if (Array.isArray(eligiblePromosRes)) {
            eligiblePromosRes.forEach(p => promoMap[p.promotionId] = p.promoName)
          }
          setPromotionsMap(promoMap)

          const redemptionMap: Record<number, string> = {}
          if (Array.isArray(redemptionsRes)) {
            redemptionsRes.forEach((r: any) => redemptionMap[r.redemptionId] = r.rewardName)
          }
          setRedemptionsMap(redemptionMap)
        } catch (error) {
          console.error('Error fetching data:', error)
          toast.error('Có lỗi xảy ra khi lấy dữ liệu.')
        }
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Có lỗi xảy ra khi lấy lịch sử đặt lịch.')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchHistory()
  }, [])

  const handleViewDetail = async (item: BookingResponseDTO) => {
    setLoadingDetailBookingId(item.bookingId)
    setIsLoadingDetail(true)
    setActiveModalTab('info')
    fetchMyReports()
    try {
      const res = await bookingService.getBookingDetail(item.bookingId)
      if (res && res.data) {
        setSelectedBooking(res.data)
      } else {
        setSelectedBooking(item)
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn đặt lịch:', error)
      setSelectedBooking(item)
    } finally {
      setIsLoadingDetail(false)
      setLoadingDetailBookingId(null)
    }
  }

  const fetchMyReports = async () => {
    try {
      const res = await incidentReportService.getMyReports()
      const data = Array.isArray(res) ? res : res.data || []
      setMyReports(data)
    } catch (e) {
      console.error('Error fetching my reports:', e)
    }
  }

  React.useEffect(() => {
    if (selectedBooking && activeModalTab === 'report') {
      fetchMyReports()
    }
  }, [selectedBooking, activeModalTab])

  const handleCreateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
    if (!reportNote.trim()) {
      toast.error('Vui lòng mô tả chi tiết sự cố xe')
      return
    }

    setIsSubmittingReport(true)
    try {
      const formData = new FormData()
      formData.append('BookingId', selectedBooking.bookingId.toString())
      formData.append('CustomerNote', reportNote.trim())
      if (reportImage1) formData.append('Image1', reportImage1)
      if (reportImage2) formData.append('Image2', reportImage2)
      if (reportImage3) formData.append('Image3', reportImage3)
      if (reportImage4) formData.append('Image4', reportImage4)
      if (reportImage5) formData.append('Image5', reportImage5)

      await incidentReportService.createReport(formData)
      toast.success('Gửi báo cáo sự cố thành công! Quản lý gara sẽ phản hồi sớm nhất.')
      setIsCreateReportModalOpen(false)
      setReportNote('')
      setReportImage1(null)
      setReportImage2(null)
      setReportImage3(null)
      setReportImage4(null)
      setReportImage5(null)
      fetchMyReports()
    } catch (err: any) {
      console.error('Error submitting report:', err)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo sự cố')
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const filteredData = historyData.filter((item) => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'Completed') return item.status === 'Completed' || item.status === 'CheckedOut'
    if (filterStatus === 'Pending') return item.status === 'Pending' || item.status === 'Confirmed' || item.status === 'Washing'
    if (filterStatus === 'Cancelled') return item.status === 'Cancelled' || item.status === 'NoShow' || item.status === 'Processed'
    return item.status === filterStatus
  })

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const currentData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2.5">
              <History className="w-6 h-6 text-orange-600" />
              <span>Lịch Sử Đặt Lịch & Dịch Vụ</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Theo dõi và quản lý tất cả các lần chăm sóc xe tại hệ thống HybridWash.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/customer/booking"
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đặt Lịch Dịch Vụ Mới</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl border border-slate-200 self-start w-fit flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === 'all'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            Tất Cả ({historyData.length})
          </button>
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === 'Pending'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            Đang Thực Hiện ({historyData.filter(i => ['Pending', 'Confirmed', 'Washing'].includes(i.status)).length})
          </button>
          <button
            onClick={() => setFilterStatus('Completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === 'Completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            Hoàn Thành ({historyData.filter(i => ['Completed', 'CheckedOut'].includes(i.status)).length})
          </button>
          <button
            onClick={() => setFilterStatus('Cancelled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === 'Cancelled'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            Đã Hủy ({historyData.filter(i => ['Cancelled', 'NoShow', 'Processed'].includes(i.status)).length})
          </button>
        </div>

        {/* Cards List */}
        <div className="space-y-3.5">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 font-medium">Đang tải dữ liệu...</div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 font-medium text-sm">Chưa có lịch sử dịch vụ nào thuộc danh mục này.</p>
            </div>
          ) : (
            <>
              {currentData.map((item) => (
                <div
                  key={item.bookingId}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-300 transition-all shadow-md shadow-slate-200/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                          Mã lịch hẹn -{item.bookingId}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                          <CalendarIcon className="w-3.5 h-3.5 text-orange-600" />
                          <span>{item.bookingDate ? new Date(item.bookingDate).toLocaleDateString('vi-VN') : ''} • {item.startTime?.substring(0, 5)}</span>
                        </div>
                      </div>

                      {(item.appliedReward || item.redemptionId || item.promotionId || item.promoCode || (item as any).promotionName) && (
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {(item.appliedReward || item.redemptionId) && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              <Tag className="w-3 h-3 text-amber-600" />
                              🎁 {item.appliedReward?.serviceName || item.appliedReward?.rewardName || (item.redemptionId ? redemptionsMap[item.redemptionId] : null) || 'Đổi thưởng'}
                            </span>
                          )}
                          {(item.promotionId || item.promoCode || (item as any).promotionName) && (
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                              <Tag className="w-3 h-3 text-rose-600" />
                              🏷️ {item.promoCode || (item.promotionId ? promotionsMap[item.promotionId] : null) || (item as any).promotionName || 'Khuyến mãi'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 self-start sm:self-auto">
                      {item.status === 'Pending' && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-extrabold shadow-xs ${isBookingExpired(item.createdAt) ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Chờ Xử Lý</span>
                          <PendingCountdown createdAt={item.createdAt} onExpire={handleCountdownExpire} />
                        </span>
                      )}
                      {item.status === 'Deposited' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-300 text-[11px] font-extrabold shadow-xs">
                          <CreditCard className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Đã Đặt Cọc</span>
                        </span>
                      )}
                      {item.status === 'Confirmed' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-extrabold shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Đã Xác Nhận</span>
                        </span>
                      )}
                      {item.status === 'Washing' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-extrabold shadow-xs">
                          <History className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          <span>Đang Rửa</span>
                        </span>
                      )}
                      {(item.status === 'Completed' || item.status === 'CheckedOut') && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Đã Hoàn Thành</span>
                        </span>
                      )}
                      {item.status === 'Cancelled' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold shadow-xs">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Đã Hủy</span>
                        </span>
                      )}
                      {item.status === 'NoShow' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-extrabold shadow-xs">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span>Không Đến</span>
                        </span>
                      )}
                      {item.status === 'Processed' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold shadow-xs">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Đã xử lý khiếu nại</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <Car className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] text-slate-500 font-medium mb-0.5">Dịch vụ đã đăng ký:</p>
                          <ul className="list-disc pl-4 space-y-0.5 text-xs sm:text-sm font-bold text-slate-900">
                            <li>{item.serviceName}</li>
                            {item.addOns && item.addOns.length > 0 && item.addOns.map(addon => (
                              <li key={addon.bookingAddOnId} className="text-orange-600 flex items-center gap-1">
                                <span>+ {addon.serviceName}</span>
                                {addon.finalPrice === 0 && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded-sm">Miễn phí</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.licensePlate} - {item.vehicleType}</span>
                      </div>
                    </div>

                    <div className="md:col-span-4 text-left md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      {['deposited', 'confirmed', 'washing', 'inprogress', 'in-progress'].includes((item.status || '').toLowerCase()) ? (
                        <div>
                          <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">Thanh toán còn lại</span>
                          <span className="text-xl font-extrabold text-orange-600">
                            {Math.max(0, (item.finalPrice ?? 0) - (item.depositAmount ?? ((item.vehicleType || '').toLowerCase().includes('bike') ? 20000 : Math.round((item.finalPrice ?? 0) * 0.2)))).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">Tổng tiền thanh toán</span>
                          <span className="text-xl font-extrabold text-orange-600">
                            {item.finalPrice?.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2 md:justify-end flex-wrap">
                        {item.status === 'Pending' && !isBookingExpired(item.createdAt) && (
                          <button
                            onClick={async () => {
                              if (isBookingExpired(item.createdAt)) {
                                toast.error('⏱️ Lịch hẹn này đã hết hạn thanh toán cọc (quá 10 phút). Vui lòng đặt lại lịch mới!')
                                fetchHistory()
                                return
                              }
                              try {
                                toast.info('Đang khởi tạo mã QR cọc PayOS...')
                                const payRes = await bookingService.createDepositPayment(item.bookingId)
                                if (payRes) {
                                  const depositAmt = payRes.amount ?? payRes.Amount ?? 0
                                  const isPaid = payRes.status === 'PAID' || payRes.Status === 'PAID'
                                  if (depositAmt <= 0 || isPaid) {
                                    toast.success('🎉 Đơn hàng được miễn phí 100% cọc (0đ)! Đã tự động cập nhật trạng thái Đã Đặt Cọc.')
                                    fetchHistory()
                                  } else {
                                    setDepositModalData({
                                      bookingId: item.bookingId,
                                      amount: depositAmt,
                                      accountNumber: payRes.accountNumber || payRes.AccountNumber || '',
                                      accountName: payRes.accountName || payRes.AccountName || '',
                                      bin: payRes.bin || payRes.Bin || '',
                                      description: payRes.description || payRes.Description || `Deposit for booking ${item.bookingId}`,
                                      qrCode: payRes.qrCode || payRes.QrCode,
                                      qrImageUrl: payRes.qrImageUrl || payRes.QrImageUrl,
                                      checkoutUrl: payRes.checkoutUrl || payRes.CheckoutUrl,
                                      createdAt: item.createdAt
                                    })
                                  }
                                }
                              } catch (err: any) {
                                const errorMsg = err.response?.data?.message || err.message || ''
                                if (errorMsg.toLowerCase().includes('not found') || err.response?.status === 404 || err.response?.status === 400) {
                                  toast.error('⏱️ Lịch hẹn này đã hết hạn thanh toán cọc (quá 10 phút) và đã được tự động dọn dẹp. Vui lòng đặt lại lịch mới!')
                                  fetchHistory()
                                } else {
                                  toast.error(errorMsg || 'Không thể tạo link cọc PayOS')
                                }
                              }
                            }}
                            className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Thanh Toán Cọc PayOS</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetail(item)}
                          disabled={isLoadingDetail && loadingDetailBookingId === item.bookingId}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-colors border border-slate-200/80 cursor-pointer flex items-center gap-1.5 disabled:opacity-70 shrink-0"
                        >
                          {isLoadingDetail && loadingDetailBookingId === item.bookingId ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                              <span>Đang tải...</span>
                            </>
                          ) : (
                            <span>Xem Chi Tiết</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-1 flex-wrap justify-center max-w-[250px] sm:max-w-none">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </main>

      {/* Modal Xem Chi Tiết với các Tab */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Chi Tiết Lịch Đặt #{selectedBooking.bookingId}</h3>
                  <p className="text-xs text-slate-500 font-medium">Theo dõi thông tin chi tiết và tình trạng dịch vụ</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Thanh Tab Điều Hướng */}
            <div className="flex border-b border-slate-100 bg-slate-100/70 p-1.5 gap-1.5 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveModalTab('info')}
                className={`flex-1 shrink-0 py-2.5 px-3.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${activeModalTab === 'info'
                  ? 'bg-white text-orange-600 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Mã QR & Chi Tiết</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('condition')}
                className={`flex-1 shrink-0 py-2.5 px-3.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${activeModalTab === 'condition'
                  ? 'bg-white text-orange-600 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Tình Trạng Xe</span>
                {(selectedBooking.staffNote || selectedBooking.incidentImage1 || selectedBooking.incidentImage2 || selectedBooking.incidentImage3 || selectedBooking.incidentImage4 || selectedBooking.incidentImage5) && (
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('receipt')}
                className={`flex-1 shrink-0 py-2.5 px-3.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${activeModalTab === 'receipt'
                  ? 'bg-white text-orange-600 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Phiếu Gửi Xe</span>
                {selectedBooking.parkingReceipt && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('report')}
                className={`flex-1 shrink-0 py-2.5 px-3.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${activeModalTab === 'report'
                  ? 'bg-white text-rose-600 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Báo Cáo Sự Cố</span>
                {myReports.some(r => r.bookingId === selectedBooking.bookingId) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>
            </div>

            {/* Nội dung Tab */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* TAB 1: MÃ QR & THÔNG TIN CHUNG */}
              {activeModalTab === 'info' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {selectedBooking.qrCode && (
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-orange-200">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-orange-600" />
                        Mã QR Check-in
                      </p>
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <QRCodeSVG
                          value={selectedBooking.qrCode}
                          size={140}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 text-center">
                        Đưa mã này cho nhân viên để check-in nhanh
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mã Đặt Lịch</p>
                      <p className="text-sm font-bold text-slate-900">#{selectedBooking.bookingId}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Trạng Thái</p>
                      <p className={`text-sm font-bold ${['Completed', 'CheckedOut'].includes(selectedBooking.status) ? 'text-emerald-600'
                        : selectedBooking.status === 'Deposited' ? 'text-teal-600'
                          : ['Pending', 'Confirmed', 'Washing'].includes(selectedBooking.status) ? 'text-blue-600'
                            : 'text-rose-600'
                        }`}>
                        {selectedBooking.status === 'Completed' || selectedBooking.status === 'CheckedOut' ? 'Đã Hoàn Thành'
                          : selectedBooking.status === 'Deposited' ? 'Đã Đặt Cọc'
                            : selectedBooking.status === 'Pending' ? 'Chờ Xử Lý'
                              : selectedBooking.status === 'Confirmed' ? 'Đã Xác Nhận'
                                : selectedBooking.status === 'Washing' ? 'Đang Rửa'
                                  : selectedBooking.status === 'NoShow' ? 'Không Đến'
                                    : selectedBooking.status === 'Processed' ? 'Đã xử lý khiếu nại'
                                      : 'Đã Hủy'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ngày Đặt</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN') : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Khung Giờ</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedBooking.startTime?.substring(0, 5)} - {selectedBooking.endTime?.substring(0, 5)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phương Tiện</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedBooking.licensePlate} ({selectedBooking.vehicleType})
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dịch Vụ & Tặng Kèm</p>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-900">{selectedBooking.serviceName}</p>
                      {selectedBooking.originalPrice != null && (
                        <p className="text-sm font-bold text-slate-800">
                          {selectedBooking.originalPrice.toLocaleString('vi-VN')}đ
                        </p>
                      )}
                    </div>
                    {selectedBooking.addOns && selectedBooking.addOns.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedBooking.addOns.map(addon => (
                          <div key={addon.bookingAddOnId} className="flex justify-between items-center bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                            <span className="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
                              <PlusCircle className="w-3 h-3" />
                              {addon.serviceName}
                            </span>
                            <div className="text-right">
                              {addon.finalPrice === 0 ? (
                                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Miễn phí</span>
                              ) : (
                                <span className="text-xs font-bold text-slate-700">{addon.finalPrice.toLocaleString('vi-VN')}đ</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {(selectedBooking.appliedReward?.serviceName || (selectedBooking.redemptionId && redemptionsMap[selectedBooking.redemptionId])) && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phần Thưởng Áp Dụng</p>
                      <span className="font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md inline-flex items-center gap-1.5 text-xs border border-amber-200">
                        🎁 Miễn phí: {selectedBooking.appliedReward?.serviceName || redemptionsMap[selectedBooking.redemptionId!]}
                      </span>
                    </div>
                  )}

                  {(selectedBooking.promotionId || selectedBooking.promoCode || (selectedBooking as any).promotionName) && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Khuyến Mãi Áp Dụng</p>
                      <span className="font-semibold px-2.5 py-1 bg-rose-100 text-rose-700 rounded-md inline-flex items-center gap-1.5 text-xs border border-rose-200">
                        🏷️ {selectedBooking.promoCode || (selectedBooking.promotionId ? promotionsMap[selectedBooking.promotionId] : null) || (selectedBooking as any).promotionName || 'Mã khuyến mãi'}
                        {selectedBooking.originalPrice != null && selectedBooking.finalPrice != null && selectedBooking.originalPrice > selectedBooking.finalPrice && (
                          <span className="font-bold text-rose-800 ml-1">
                            (-{(selectedBooking.originalPrice - selectedBooking.finalPrice).toLocaleString('vi-VN')}đ)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {(() => {
                    const total = selectedBooking.finalPrice ?? selectedBooking.originalPrice ?? 0
                    const isBike = (selectedBooking.vehicleType || '').toLowerCase().includes('bike') || (selectedBooking.vehicleType || '').toLowerCase().includes('xe máy')
                    const depositAmt = selectedBooking.depositAmount ?? (isBike ? 20000 : Math.round(total * 0.2))
                    const remaining = Math.max(0, total - depositAmt)

                    return (
                      <div className="pt-3 border-t border-slate-200 space-y-2 mt-3">
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                          <span>Tổng giá trị dịch vụ:</span>
                          <span className="font-bold text-slate-900">{total.toLocaleString('vi-VN')}đ</span>
                        </div>

                        {['deposited', 'confirmed', 'washing', 'inprogress', 'in-progress'].includes((selectedBooking.status || '').toLowerCase()) ? (
                          <>
                            <div className="flex justify-between items-center text-xs font-bold text-teal-700">
                              <span className="flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span>Đã cọc giữ chỗ (PayOS):</span>
                              </span>
                              <span className="font-black text-teal-700">-{depositAmt.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-black text-orange-600 pt-2 border-t border-slate-200">
                              <span>Còn lại thanh toán khi đến tiệm:</span>
                              <span className="text-xl text-orange-600 font-black">{remaining.toLocaleString('vi-VN')}đ</span>
                            </div>
                          </>
                        ) : selectedBooking.status === 'Pending' ? (
                          <>
                            <div className="flex justify-between items-center text-xs font-bold text-blue-700">
                              <span>Tiền cọc giữ chỗ cần chuyển:</span>
                              <span className="font-black">{depositAmt.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                              <span>Còn lại thanh toán khi rửa xong:</span>
                              <span className="font-bold text-slate-900">{remaining.toLocaleString('vi-VN')}đ</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center text-sm font-black text-orange-600 pt-1.5 border-t border-slate-200">
                            <span>Tổng tiền thanh toán:</span>
                            <span className="text-xl font-black text-orange-600">{total.toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* TAB 2: TÌNH TRẠNG XE LÚC NHẬN */}
              {activeModalTab === 'condition' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {(selectedBooking.staffNote || selectedBooking.incidentImage1ApiPath || selectedBooking.incidentImage2ApiPath || selectedBooking.incidentImage3ApiPath || selectedBooking.incidentImage4ApiPath || selectedBooking.incidentImage5ApiPath || selectedBooking.incidentImage1 || selectedBooking.incidentImage2 || selectedBooking.incidentImage3 || selectedBooking.incidentImage4 || selectedBooking.incidentImage5) ? (
                    <div className="space-y-3">
                      {selectedBooking.staffNote && (
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ghi Chú Nhân Viên</p>
                          <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap font-semibold leading-relaxed">
                            {selectedBooking.staffNote}
                          </p>
                        </div>
                      )}

                      {(selectedBooking.incidentImage1ApiPath || selectedBooking.incidentImage2ApiPath || selectedBooking.incidentImage3ApiPath || selectedBooking.incidentImage4ApiPath || selectedBooking.incidentImage5ApiPath || selectedBooking.incidentImage1 || selectedBooking.incidentImage2 || selectedBooking.incidentImage3 || selectedBooking.incidentImage4 || selectedBooking.incidentImage5) && (
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ảnh Chụp Thực Trạng Xe Khi Nhận</p>
                          <div className="grid grid-cols-2 gap-3">
                            {(() => {
                              const images: string[] = []
                              if (selectedBooking.incidentImage1ApiPath) images.push(selectedBooking.incidentImage1ApiPath)
                              else if (selectedBooking.incidentImage1) images.push(selectedBooking.incidentImage1)

                              if (selectedBooking.incidentImage2ApiPath) images.push(selectedBooking.incidentImage2ApiPath)
                              else if (selectedBooking.incidentImage2) images.push(selectedBooking.incidentImage2)

                              if (selectedBooking.incidentImage3ApiPath) images.push(selectedBooking.incidentImage3ApiPath)
                              else if (selectedBooking.incidentImage3) images.push(selectedBooking.incidentImage3)

                              if (selectedBooking.incidentImage4ApiPath) images.push(selectedBooking.incidentImage4ApiPath)
                              else if (selectedBooking.incidentImage4) images.push(selectedBooking.incidentImage4)

                              if (selectedBooking.incidentImage5ApiPath) images.push(selectedBooking.incidentImage5ApiPath)
                              else if (selectedBooking.incidentImage5) images.push(selectedBooking.incidentImage5)

                              return images.map((imgSrc: string, idx: number) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setPreviewImage(imgSrc)}
                                  className="block relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 cursor-pointer text-left w-full focus:outline-none"
                                >
                                  <AuthenticatedImage
                                    src={imgSrc}
                                    alt={`Ảnh tình trạng xe ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="w-6 h-6 text-white" />
                                  </div>
                                </button>
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                      <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-700 font-bold text-sm mb-1">Chưa Có Dữ Liệu Tình Trạng Xe</p>
                      <p className="text-slate-500 text-xs">Hình ảnh thực trạng và ghi chú xe sẽ được nhân viên tải lên sau khi làm thủ tục check-in tại gara.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PHIẾU GỬI XE */}
              {activeModalTab === 'receipt' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {selectedBooking.parkingReceipt ? (
                    <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
                        <p className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          Phiếu Gửi Xe (#RECEIPT-{selectedBooking.parkingReceipt.receiptId})
                        </p>
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
                          {selectedBooking.parkingReceipt.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block mb-0.5">Nhân viên lập phiếu:</span>
                          <span className="font-bold text-slate-800">{selectedBooking.parkingReceipt.issueStaffName || 'Chưa cập nhật'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5">Thời gian phát hành:</span>
                          <span className="font-bold text-slate-800">{formatDateTime(selectedBooking.parkingReceipt.issuedAt)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 block mb-0.5">Hình thức gửi xe:</span>
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-extrabold ${selectedBooking.parkingReceipt.isCustomerLeaving ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                            {selectedBooking.parkingReceipt.isCustomerLeaving ? '🚗 Khách gửi xe lại gara' : '🧍 Khách ở lại chờ tại chỗ'}
                          </span>
                        </div>
                      </div>

                      {selectedBooking.parkingReceipt.customerSignature && (
                        <div className="pt-3 border-t border-orange-200/60">
                          <span className="text-slate-500 block text-xs font-medium mb-1.5">Chữ ký xác nhận của bạn:</span>
                          <div className="bg-white p-2 rounded-xl border border-slate-200 inline-block shadow-xs">
                            <img src={selectedBooking.parkingReceipt.customerSignature} alt="Chữ ký khách hàng" className="h-16 object-contain" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-700 font-bold text-sm mb-1">Chưa Có Phiếu Gửi Xe</p>
                      <p className="text-slate-500 text-xs">Phiếu gửi xe sẽ được phát hành sau khi nhân viên làm thủ tục tiếp nhận xe tại gara.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BÁO CÁO SỰ CỐ / KHIẾU NẠI */}
              {activeModalTab === 'report' && (() => {
                const bookingReports = myReports.filter(r => r.bookingId === selectedBooking.bookingId)
                const hasExistingReport = bookingReports.length > 0
                const isWashing = selectedBooking.status === 'Washing'

                return (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lịch Sử Báo Cáo Cho Đơn Lịch Này</p>
                        <p className="text-[11px] text-slate-500 font-medium">Theo dõi tiến độ xử lý khiếu nại và phản hồi từ Gara</p>
                      </div>

                      {hasExistingReport ? (
                        <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-rose-600" />
                          <span>Đã gửi khiếu nại (1/1)</span>
                        </span>
                      ) : !isWashing ? (
                        <span title="Chỉ có thể tạo báo cáo khi xe đang thực hiện rửa tại gara (Trạng thái Washing)" className="px-3 py-1.5 bg-slate-200/70 text-slate-600 rounded-xl text-[11px] font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5 cursor-not-allowed">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Chỉ báo cáo khi bạn đến nhận xe</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsCreateReportModalOpen(true)}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] shrink-0"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Gửi Báo Cáo Sự Cố</span>
                        </button>
                      )}
                    </div>

                    {bookingReports.length > 0 ? (
                      <div className="space-y-4">
                        {myReports.filter(r => r.bookingId === selectedBooking.bookingId).map((report) => {
                          const images = [
                            { url: report.image1ApiPath || (report.image1 ? `/IncidentReport/${report.reportId}/images/1` : null), label: 'Bằng chứng 1' },
                            { url: report.image2ApiPath || (report.image2 ? `/IncidentReport/${report.reportId}/images/2` : null), label: 'Bằng chứng 2' },
                            { url: report.image3ApiPath || (report.image3 ? `/IncidentReport/${report.reportId}/images/3` : null), label: 'Bằng chứng 3' },
                            { url: report.image4ApiPath || (report.image4 ? `/IncidentReport/${report.reportId}/images/4` : null), label: 'Bằng chứng 4' },
                            { url: report.image5ApiPath || (report.image5 ? `/IncidentReport/${report.reportId}/images/5` : null), label: 'Bằng chứng 5' },
                          ].filter((item): item is { url: string; label: string } => Boolean(item.url))

                          return (
                            <div key={report.reportId} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                              {/* Card Header: Code, Date & Status */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                <div>
                                  <span className="font-extrabold text-slate-900 text-xs block">Mã Khiếu Nại #REP-{report.reportId}</span>
                                  {report.createdAt && (
                                    <span className="text-[10px] text-slate-400 font-medium block">Ngày gửi: {formatDateTime(report.createdAt)}</span>
                                  )}
                                </div>
                                {report.status === 'Pending' && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200/80 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    Chờ Tiếp Nhận
                                  </span>
                                )}
                                {report.status === 'InReview' && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200/80 flex items-center gap-1">
                                    <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                                    Đang Xem Xét
                                  </span>
                                )}
                                {report.status === 'Resolved' && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Đã Giải Quyết
                                  </span>
                                )}
                                {report.status === 'Rejected' && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200/80 flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                    Từ Chối
                                  </span>
                                )}
                              </div>

                              {/* Customer Note */}
                              <div className="text-xs text-slate-700 font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 whitespace-pre-wrap">
                                <span className="font-bold text-slate-900 block mb-1">Nội dung báo cáo sự cố xe:</span>
                                {report.customerNote}
                              </div>

                              {/* Images Gallery */}
                              {images.length > 0 && (
                                <div>
                                  <p className="text-[11px] font-bold text-slate-600 mb-1.5">Ảnh bằng chứng đi kèm:</p>
                                  <div className="flex items-center gap-2.5">
                                    {images.map((item, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() => setPreviewImage(item.url)}
                                        className="relative w-24 h-18 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs cursor-pointer"
                                      >
                                        <AuthenticatedImage
                                          src={item.url}
                                          alt={item.label}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                          <Eye className="w-4 h-4" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Admin / Manager Response Box */}
                              {report.managerNote ? (
                                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${report.status === 'Resolved'
                                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                                  : report.status === 'Rejected'
                                    ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                                    : 'bg-blue-50/90 border-blue-200 text-blue-950'
                                  }`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`font-extrabold flex items-center gap-1.5 ${report.status === 'Resolved' ? 'text-emerald-900' : report.status === 'Rejected' ? 'text-rose-900' : 'text-blue-900'
                                      }`}>
                                      <span>💬 Phản Hồi Từ Quản Lý Gara:</span>
                                    </span>
                                    {report.resolvedAt && (
                                      <span className="text-[10px] font-semibold text-slate-500">
                                        {formatDateTime(report.resolvedAt)}
                                      </span>
                                    )}
                                  </div>

                                  <p className="font-medium whitespace-pre-wrap leading-relaxed">{report.managerNote}</p>

                                  {(report.managerContactPhone || report.managerContactEmail) && (
                                    <div className="pt-2 border-t border-slate-200/50 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
                                      <span>Liên hệ hỗ trợ:</span>
                                      {report.managerContactPhone && (
                                        <span className="text-slate-800 font-bold">📞 {report.managerContactPhone}</span>
                                      )}
                                      {report.managerContactEmail && (
                                        <span className="text-slate-800 font-bold">✉️ {report.managerContactEmail}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                report.status === 'Pending' && (
                                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-800 font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Báo cáo sự cố đang chờ Ban quản lý gara tiếp nhận và phản hồi.</span>
                                  </div>
                                )
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                        <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-700 font-bold text-sm mb-1">Chưa Có Báo Cáo Sự Cố Nào</p>
                        <p className="text-slate-500 text-xs max-w-md mx-auto">
                          {!isWashing
                            ? 'Báo cáo sự cố chỉ có thể được tạo khi xe đang ở trạng thái rửa tại gara lúc bạn đến nhận xe.'
                            : 'Nếu xe của bạn gặp vấn đề khi nhận xe tại gara, hãy bấm nút "Gửi Báo Cáo Sự Cố" ở trên để gửi khiếu nại.'}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {selectedBooking.status === 'Washing' && !myReports.some(r => r.bookingId === selectedBooking.bookingId) ? (
                <button
                  type="button"
                  onClick={() => setIsCreateReportModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold transition-colors text-xs cursor-pointer flex items-center gap-1.5 border border-rose-200"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Báo Cáo Sự Cố Xe</span>
                </button>
              ) : (
                <div></div>
              )}
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Báo Cáo Sự Cố Xe */}
      {isCreateReportModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Báo Cáo Sự Cố Xe #{selectedBooking.bookingId}</h3>
                  <p className="text-xs text-slate-500 font-medium">Gửi khiếu nại thực trạng xe về hệ thống HybridWash</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateReportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateReportSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mô Tả Chi Tiết Sự Cố <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  rows={4}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Mô tả cụ thể vết trầy xước, hỏng hóc hoặc vấn đề về dịch vụ mà bạn muốn phản ánh..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-slate-50 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tải Ảnh Bằng Chứng (Tối đa 5 ảnh tùy chọn):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: 'Bằng chứng 1', state: reportImage1, setter: setReportImage1 },
                    { label: 'Bằng chứng 2', state: reportImage2, setter: setReportImage2 },
                    { label: 'Bằng chứng 3', state: reportImage3, setter: setReportImage3 },
                    { label: 'Bằng chứng 4', state: reportImage4, setter: setReportImage4 },
                    { label: 'Bằng chứng 5', state: reportImage5, setter: setReportImage5 },
                  ].map((item, index) => (
                    <div key={index} className="relative group">
                      <label className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed cursor-pointer transition-all h-20 text-center relative overflow-hidden ${item.state ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/20'}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => item.setter(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        {item.state ? (
                          <div className="w-full h-full relative">
                            <img
                              src={URL.createObjectURL(item.state)}
                              alt={item.label}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-end justify-center p-1 rounded-lg">
                              <span className="text-[10px] font-semibold text-white truncate drop-shadow">{item.label}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
                            <Camera className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                            <span className="text-[11px] font-bold text-slate-600 line-clamp-1">{item.label}</span>
                          </div>
                        )}
                      </label>
                      {item.state && (
                        <button
                          type="button"
                          onClick={() => item.setter(null)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-all z-10"
                          title="Xóa ảnh"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateReportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md flex items-center gap-2 cursor-pointer text-xs disabled:opacity-70"
                >
                  {isSubmittingReport ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi Báo Cáo Sự Cố</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Ảnh Xem Lớn */}
      {previewImage && (
        <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-800" onClick={(e) => e.stopPropagation()}>
            <AuthenticatedImage src={previewImage} alt="Xem ảnh lớn" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-colors cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Thanh Toán Cọc VietQR/PayOS */}
      {depositModalData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-orange-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500 text-white rounded-2xl shadow-md shadow-orange-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Thanh Toán Tiền Cọc</h3>
                  <p className="text-xs text-slate-500 font-medium">Mã lịch hẹn #{depositModalData.bookingId}</p>
                </div>
              </div>
              <button
                onClick={() => setDepositModalData(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {depositModalData.createdAt && (
                <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-center text-xs font-extrabold text-rose-700 flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Thời gian thanh toán còn lại: </span>
                  <PendingCountdown
                    createdAt={depositModalData.createdAt}
                    onExpire={() => {
                      setDepositModalData(null)
                      toast.error('⏱️ Mã QR cọc đã hết hạn thanh toán (quá 10 phút). Lịch hẹn đã bị dọn dẹp!')
                      fetchHistory()
                    }}
                  />
                </div>
              )}

              <div className="flex flex-col items-center justify-center">
                <div className="p-3 bg-white border-2 border-orange-200 rounded-3xl shadow-lg relative group">
                  {depositModalData.qrImageUrl ? (
                    <img
                      src={depositModalData.qrImageUrl}
                      alt="Mã QR Chuyển Khoản PayOS"
                      className="w-52 h-52 object-contain rounded-2xl"
                    />
                  ) : (
                    <QRCodeSVG
                      value={depositModalData.qrCode || depositModalData.checkoutUrl || ''}
                      size={200}
                      includeMargin={true}
                    />
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Quét mã bằng App Ngân Hàng để chuyển khoản cọc
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                {depositModalData.accountName && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500 font-semibold">Chủ tài khoản:</span>
                    <span className="font-extrabold text-slate-900 uppercase">{depositModalData.accountName}</span>
                  </div>
                )}

                {depositModalData.accountNumber && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500 font-semibold">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-orange-600 font-mono text-sm">{depositModalData.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(depositModalData.accountNumber)
                          toast.success('Đã sao chép Số Tài Khoản!')
                        }}
                        className="p-1 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer"
                        title="Sao chép STK"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-semibold">Số tiền cọc:</span>
                  <span className="font-black text-rose-600 text-sm">
                    {depositModalData.amount.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {depositModalData.description && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                        {depositModalData.description}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(depositModalData.description)
                          toast.success('Đã sao chép Nội Dung!')
                        }}
                        className="p-1 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer"
                        title="Sao chép Nội Dung"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-relaxed">
                ⚠️ <strong>Lưu ý:</strong> Quý khách vui lòng điền <strong>chính xác tuyệt đối</strong> nội dung chuyển khoản để hệ thống PayOS tự động xác nhận tiền cọc.
              </p>

              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={() => handleCheckDepositStatus(depositModalData.bookingId)}
                  disabled={isCheckingDeposit}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isCheckingDeposit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Đang kiểm tra giao dịch...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Tôi Đã Chuyển Khoản - Kiểm Tra Ngay</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDepositModalData(null)
                    navigate('/customer/history', { replace: true })
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-xl transition-all border border-slate-200 cursor-pointer"
                >
                  Đóng (Thanh Toán Sau)
                </button>

                <button
                  type="button"
                  disabled={isCancellingDeposit}
                  onClick={() => setConfirmCancelBookingId(depositModalData.bookingId)}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-sm rounded-xl transition-all border border-rose-200 hover:border-rose-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 font-semibold text-sm"
                >
                  {isCancellingDeposit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      <span>Đang hủy đơn...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Hủy Đơn Lịch Hẹn Này</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Hủy Lịch Hẹn */}
      {confirmCancelBookingId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto border-2 border-rose-200 text-rose-600 shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Xác Nhận Hủy Lịch Hẹn
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Bạn có chắc chắn muốn hủy đơn đặt lịch <strong className="text-orange-600">#{confirmCancelBookingId}</strong> này không?
                <span className="block mt-1.5 text-rose-600 font-semibold">
                  ⚠️ Thao tác này sẽ hủy suất giữ chỗ và không thể hoàn tác sau khi xác nhận.
                </span>
              </p>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isCancellingDeposit}
                onClick={() => setConfirmCancelBookingId(null)}
                className="py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all text-xs sm:text-sm cursor-pointer border border-slate-200"
              >
                Quay Lại
              </button>

              <button
                type="button"
                disabled={isCancellingDeposit}
                onClick={() => handleConfirmCancel(confirmCancelBookingId)}
                className="py-3 px-4 rounded-xl font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 disabled:opacity-70"
              >
                {isCancellingDeposit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang Hủy...</span>
                  </>
                ) : (
                  <span>Xác Nhận Hủy</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thông Báo Thanh Toán Cọc Thành Công */}
      {successDepositBookingId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200 border border-emerald-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>

            <div>
              <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-xs">
                ✓ Giao Dịch Đã Được Ghi Nhận
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Thanh Toán Cọc Thành Công!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Khoản tiền cọc cho đơn hẹn <strong className="text-orange-600">#{successDepositBookingId}</strong> đã được hệ thống ghi nhận thành công. Lịch rửa xe của bạn đã được giữ chỗ ưu tiên!
              </p>
            </div>

            <button
              onClick={() => {
                setSuccessDepositBookingId(null)
                fetchHistory()
              }}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              Xem Lịch Sử Đặt Lịch
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
