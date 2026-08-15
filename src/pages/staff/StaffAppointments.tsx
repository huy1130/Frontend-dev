import React, { useState, useEffect, useRef } from 'react'
import { CalendarDays, CarFront, Phone, Clock, User, CheckCircle2, PlayCircle, LogOut, Eye, X, QrCode, Search, Check, AlertCircle, Camera, Sparkles, Scan, FileText, PenTool } from 'lucide-react'
import { toast } from 'sonner'
import { staffService, TodayBookingDto } from '../../services/staffService'
import { bookingService } from '../../services/bookingService'
import { broadcastPlateScan, subscribePlateScan, getLatestPlateScan, dismissPlateScan, PlateScanEventPayload } from '../../utils/plateNotification'
import { formatDateTime } from '../../utils/date'

export default function StaffAppointments() {
  const [bookings, setBookings] = useState<TodayBookingDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [bookingDetail, setBookingDetail] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [checkInBookingId, setCheckInBookingId] = useState<number | null>(null)
  const [incidentImage1, setIncidentImage1] = useState<File | null>(null)
  const [incidentImage2, setIncidentImage2] = useState<File | null>(null)
  const [staffNote, setStaffNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const [searchType, setSearchType] = useState<'phone' | 'plate'>('phone')
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  // Parking Receipt Modal & Canvas State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [receiptBookingId, setReceiptBookingId] = useState<number | null>(null)
  const [isCustomerLeaving, setIsCustomerLeaving] = useState(true)
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSigned, setHasSigned] = useState(false)

  // Real-time AI Plate Scan Alert for Staff
  const [realtimeAlert, setRealtimeAlert] = useState<PlateScanEventPayload | null>(null)

  // AI Plate OCR States for Staff
  const [isPlateOcrModalOpen, setIsPlateOcrModalOpen] = useState(false)
  const [ocrScanning, setOcrScanning] = useState(false)
  const [ocrDetectedPlate, setOcrDetectedPlate] = useState<string | null>(null)
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null)
  const [ocrHasBooking, setOcrHasBooking] = useState(false)

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      if (searchPhone.trim()) {
        const queryStr = searchPhone.trim()
        let response
        if (searchType === 'phone') {
          response = await bookingService.getBookingHistory(queryStr)
        } else {
          response = await bookingService.getBookingByLicensePlate(queryStr)
          // Fallback: If search by plate returned empty data, search today's bookings by normalized plate case-insensitively
          if (!response.data || response.data.length === 0) {
            try {
              const todayRes = await staffService.getTodayBookings()
              const rawList = Array.isArray(todayRes) ? todayRes : (todayRes as any)?.data || []
              const cleanQuery = queryStr.replace(/[^A-Z0-9]/gi, '').toUpperCase()
              const matched = rawList.filter((b: any) => 
                (b.licensePlate || '').replace(/[^A-Z0-9]/gi, '').toUpperCase().includes(cleanQuery)
              )
              response = { data: matched }
            } catch (e) {
              console.warn('Fallback today bookings search failed', e)
            }
          }
        }

        if (response.data) {
          const detailedBookings = await Promise.all(
            response.data.map(async (b: any) => {
              try {
                const detailResponse = await bookingService.getBookingDetail(b.bookingId);
                return { ...b, customerPhone: detailResponse.data?.customerPhone || 'N/A' };
              } catch (e) {
                return { ...b, customerPhone: 'N/A' };
              }
            })
          );

          const mapped: TodayBookingDto[] = detailedBookings.map((b: any) => ({
            bookingId: b.bookingId,
            customerName: b.customerName || 'Khách vãng lai',
            customerPhone: b.customerPhone,
            licensePlate: b.licensePlate || 'N/A',
            vehicleType: b.vehicleType || 'N/A',
            status: b.status,
            slotId: b.slotId,
            serviceId: b.serviceId,
            serviceName: b.serviceName,
            bookingDate: b.bookingDate,
            startTime: b.startTime,
            endTime: b.endTime
          }))
          setBookings(mapped.sort((a, b) => b.bookingId - a.bookingId))
        }
      } else {
        const response = await staffService.getTodayBookings()
        if (response && Array.isArray(response)) {
          setBookings([...response].sort((a, b) => b.bookingId - a.bookingId))
        } else if (response && (response as any).data && Array.isArray((response as any).data)) {
          // Fallback in case the interceptor doesn't unwrap the nested data
          setBookings([...(response as any).data].sort((a: any, b: any) => b.bookingId - a.bookingId))
        }
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách lịch hẹn')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    // Check if there was a recent plate scan from Admin in the last 30 minutes that hasn't been dismissed
    const latestScan = getLatestPlateScan(30 * 60 * 1000)
    if (latestScan) {
      setRealtimeAlert(latestScan)
    }
  }, [])

  // Auto-dismiss real-time modal popup after 15 seconds
  useEffect(() => {
    if (!realtimeAlert) return
    const timer = setTimeout(() => {
      setRealtimeAlert(null)
    }, 15000)
    return () => clearTimeout(timer)
  }, [realtimeAlert])

  // Real-time listener for AI Plate Scanning Events from Admin or other Staff
  useEffect(() => {
    const unsubscribe = subscribePlateScan((event) => {
      setRealtimeAlert(event)
      toast.dismiss() // Clear any existing toasts (e.g. "Đăng nhập thành công!") to prevent overlapping
      toast.info(`🚗 Xe biển số: ${event.plateNumber} (Mã lịch hẹn: #${event.bookingId || 'N/A'}) vừa được quét thành công!`, {
        duration: 5000,
      })
      fetchBookings()
    })
    return () => unsubscribe()
  }, [])

  // AI License Plate OCR Upload & Scan Handler for Staff
  const handleScanPlateFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setOcrImagePreview(URL.createObjectURL(file))
    setOcrScanning(true)
    setOcrDetectedPlate(null)
    setOcrHasBooking(false)

    try {
      const res = await bookingService.scanPlate(file)
      const data = res.data || (res as any)
      const detected = data?.detectedPlate

      if (detected) {
        setOcrDetectedPlate(detected)

        let foundBookings = data?.bookings || []

        // Fallback 1: search by plate API if scanPlate returned empty bookings
        if (foundBookings.length === 0) {
          try {
            const plateSearchRes = await bookingService.getBookingByLicensePlate(detected)
            if (plateSearchRes.data && plateSearchRes.data.length > 0) {
              foundBookings = plateSearchRes.data
            }
          } catch (e) {
            console.warn('Fallback plate search failed', e)
          }
        }

        // Fallback 2: match in local bookings list (case-insensitive)
        if (foundBookings.length === 0 && bookings.length > 0) {
          const cleanDetected = detected.replace(/[^A-Z0-9]/gi, '').toUpperCase()
          const matchedLocal = bookings.filter(b => (b.licensePlate || '').replace(/[^A-Z0-9]/gi, '').toUpperCase() === cleanDetected)
          if (matchedLocal.length > 0) {
            foundBookings = matchedLocal
          }
        }

        // Fallback 3: query today's bookings API with normalized plate comparison
        if (foundBookings.length === 0) {
          try {
            const todayRes = await staffService.getTodayBookings()
            const rawList = Array.isArray(todayRes) ? todayRes : (todayRes as any)?.data || []
            const cleanDetected = detected.replace(/[^A-Z0-9]/gi, '').toUpperCase()
            const matched = rawList.filter((b: any) => 
              (b.licensePlate || '').replace(/[^A-Z0-9]/gi, '').toUpperCase() === cleanDetected
            )
            if (matched.length > 0) {
              foundBookings = matched
            }
          } catch (e) {
            console.warn('Fallback today bookings search failed', e)
          }
        }

        if (foundBookings.length > 0) {
          setOcrHasBooking(true)
          const firstBooking = foundBookings[0]

          let realServiceName = firstBooking.serviceName || ''
          let realCustomerName = firstBooking.customerName || 'Khách hàng'

          try {
            const detailRes = await bookingService.getBookingDetail(firstBooking.bookingId)
            const detailObj = detailRes?.data || detailRes
            if (detailObj) {
              if (detailObj.serviceName) realServiceName = detailObj.serviceName
              if (detailObj.customerName) realCustomerName = detailObj.customerName
            }
          } catch (e) {
            console.warn('Could not fetch booking detail for serviceName', e)
          }

          // Broadcast real-time notification to other Staff/Admin!
          broadcastPlateScan({
            plateNumber: firstBooking.licensePlate || detected,
            bookingId: firstBooking.bookingId,
            customerName: realCustomerName,
            serviceName: realServiceName || undefined,
          })

          const mapped: TodayBookingDto[] = foundBookings.map((b: any) => ({
            bookingId: b.bookingId,
            customerName: b.customerName || 'Khách vãng lai',
            customerPhone: b.customerPhone || 'N/A',
            licensePlate: b.licensePlate || detected,
            vehicleType: b.vehicleType || 'N/A',
            status: b.status,
            slotId: b.slotId,
            serviceId: b.serviceId,
            serviceName: b.serviceName || realServiceName,
            bookingDate: b.bookingDate,
            startTime: b.startTime,
            endTime: b.endTime
          }))
          setBookings(mapped)
          toast.success(`🎉 Nhận diện thành công biển số ${firstBooking.licensePlate || detected}! Mã đơn #${firstBooking.bookingId}.`)
        } else {
          setOcrHasBooking(false)
          // Broadcast event even if no booking in DB
          broadcastPlateScan({
            plateNumber: detected,
          })
          toast.success(`Đã nhận diện thành công biển số: ${detected}!`)
        }
      } else {
        toast.error('Không thể nhận diện biển số xe từ hình ảnh này, vui lòng chọn ảnh rõ ràng hơn!')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi quét biển số xe')
    } finally {
      setOcrScanning(false)
    }
  }

  useEffect(() => {
    if (!searchPhone) {
      fetchBookings()
    }
  }, [searchPhone])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBookings()
  }

  const handleClearSearch = () => {
    setSearchPhone('')
  }

  const handleScanSuccess = async (qrCode: string) => {
    setIsScannerOpen(false)
    setIsLoading(true)
    try {
      const res = await bookingService.getBookingByQrCode(qrCode)
      if (res.success && res.data) {
        setBookingDetail(res.data)
        setSelectedBookingId(res.data.bookingId)
        setIsModalOpen(true)
        toast.success('Quét mã thành công!')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.Message || 'Mã QR không hợp lệ hoặc lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  // Effect to initialize QR Scanner when modal opens
  useEffect(() => {
    if (isScannerOpen) {
      let scanner: any = null;
      // dynamic import to avoid SSR issues if any, and only load when needed
      import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
        scanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        )
        scanner.render(
          (decodedText: string) => {
            if (scanner) {
              scanner.clear()
            }
            handleScanSuccess(decodedText)
          },
          (error: any) => {
            // ignore continuous scanning errors
          }
        )
      })

      return () => {
        if (scanner) {
          scanner.clear().catch((e: any) => console.error(e))
        }
      }
    }
  }, [isScannerOpen])

  const handleStatusUpdate = async (bookingId: number, currentStatus: string) => {
    try {
      if (currentStatus === 'Pending') {
        await staffService.confirmBooking(bookingId)
        toast.success('Đã xác nhận lịch hẹn!')
      } else if (currentStatus === 'Confirmed') {
        setCheckInBookingId(bookingId)
        setIsCheckInModalOpen(true)
        return // Wait for modal submission
      } else if (currentStatus === 'Washing') {
        await staffService.checkOutBooking(bookingId)
        toast.success('Giao xe thành công!')
      }
      fetchBookings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkInBookingId) return
    if (!incidentImage1 || !incidentImage2) {
      toast.error('Vui lòng chụp đủ 2 ảnh tình trạng xe')
      return
    }
    if (!staffNote.trim()) {
      toast.error('Vui lòng nhập ghi chú tình trạng xe')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('BookingId', checkInBookingId.toString())
      formData.append('IncidentImage1', incidentImage1)
      formData.append('IncidentImage2', incidentImage2)
      formData.append('StaffNote', staffNote)

      await staffService.checkInBooking(formData)
      toast.success('Đã Check-in và bắt đầu rửa!')
      setIsCheckInModalOpen(false)

      const targetBookingId = checkInBookingId

      // Reset form
      setIncidentImage1(null)
      setIncidentImage2(null)
      setStaffNote('')
      setCheckInBookingId(null)

      // Open Receipt Modal for step 2
      setReceiptBookingId(targetBookingId)
      setIsCustomerLeaving(true)
      setHasSigned(false)
      setIsReceiptModalOpen(true)

      fetchBookings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi Check-in')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Signature Canvas Helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.stroke()
    setHasSigned(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSigned(false)
  }

  const handleSkipReceipt = () => {
    setIsReceiptModalOpen(false)
    setReceiptBookingId(null)
    toast.info('Đã hoàn tất Check-in (Bỏ qua cấp phiếu giữ xe).')
  }

  const handleIssueReceiptSubmit = async () => {
    if (!receiptBookingId) return

    setIsSubmittingReceipt(true)
    try {
      let signatureData: string | null = null
      if (isCustomerLeaving && canvasRef.current && hasSigned) {
        signatureData = canvasRef.current.toDataURL()
      }

      await staffService.issueReceipt({
        bookingId: receiptBookingId,
        isCustomerLeaving,
        customerSignature: signatureData
      })

      toast.success('Phát hành phiếu gửi xe thành công!')
      setIsReceiptModalOpen(false)
      setReceiptBookingId(null)
      fetchBookings()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.Message || err.response?.data?.message || 'Có lỗi khi phát hành phiếu gửi xe')
    } finally {
      setIsSubmittingReceipt(false)
    }
  }

  // Helper cho Stepper
  const steps = [
    { key: 'Confirmed', label: 'Đã xác nhận' },
    { key: 'Checkin', label: 'Đã nhận xe' },
    { key: 'Washing', label: 'Đang rửa' },
    { key: 'Washed', label: 'Đã rửa xong' },
    { key: 'Payment', label: 'Thanh toán' },
    { key: 'CheckedOut', label: 'Hoàn thành' }
  ]

  const handleViewDetail = async (bookingId: number) => {
    try {
      const res = await bookingService.getBookingDetail(bookingId);
      if (res.success || res.data) {
        setBookingDetail(res.data);
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
      }
    } catch (error) {
      toast.error('Không thể tải chi tiết lịch hẹn');
    }
  }

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return -1;
      case 'Confirmed': return 0;
      case 'Checkin': return 1;
      case 'Washing': return 2;
      case 'Completed': return 3;
      case 'Payment': return 4;
      case 'CheckedOut': return 5;
      default: return -1;
    }
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header Card với các Nút Quét Scanner Nổi bật */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-200/50 rounded-2xl">
            <CalendarDays className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Lịch Hẹn Của Bạn</h2>
            <p className="text-slate-500 text-xs font-medium mt-0.5">Các lịch hẹn rửa xe cần xử lý hôm nay</p>
          </div>
        </div>

        {/* Cụm Nút Thao Tác Quét AI & QR */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsPlateOcrModalOpen(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl font-extrabold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-cyan-400/30"
          >
            <Camera className="w-4 h-4 text-cyan-100 animate-pulse" />
            <span>Quét Biển Số AI</span>
          </button>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-slate-700/50"
          >
            <QrCode className="w-4 h-4 text-slate-300" />
            <span>Quét Mã QR</span>
          </button>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Lọc Riêng Biệt Thoáng Đẹp */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'phone' | 'plate')}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-slate-50/50 focus:bg-white cursor-pointer shrink-0"
          >
            <option value="phone">SĐT</option>
            <option value="plate">Biển số</option>
          </select>

          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchType === 'phone' ? "Nhập số điện thoại..." : "Nhập biển số xe..."}
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-orange-500/20 cursor-pointer shrink-0"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              setSearchPhone('')
              fetchBookings()
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm cursor-pointer shrink-0 border border-slate-200/60"
          >
            Làm mới
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 font-medium">Đang tải danh sách...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center">
          <CalendarDays className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium text-lg">Hôm nay chưa có lịch hẹn nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map(booking => {
            const currentStepIndex = getStepIndex(booking.status)
            const isCancelled = booking.status === 'Cancelled'
            const isNoShow = booking.status === 'No-Show'

            return (
              <div key={booking.bookingId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">

                {/* Header Info & Actions */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">

                  {/* Info Left */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
                        <span className="text-sm font-bold text-slate-700">{booking.bookingId}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">
                        {booking.licensePlate}
                      </h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase">
                        {booking.vehicleType}
                      </span>
                      {booking.startTime && (
                        <span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.startTime.slice(0, 5)} {booking.endTime ? `- ${booking.endTime.slice(0, 5)}` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 ml-[52px]">
                      <div className="flex items-center gap-1.5 text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        <Clock className="w-4 h-4 text-orange-500" />
                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        {booking.customerName}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {booking.customerPhone}
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 ml-[52px] md:ml-0">
                    <button
                      onClick={() => handleViewDetail(booking.bookingId)}
                      className="flex-1 md:flex-none w-full md:w-36 h-10 px-3 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" /> Chi tiết
                    </button>

                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.bookingId, 'Pending')}
                        className="flex-1 md:flex-none w-full md:w-36 h-10 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Xác nhận
                      </button>
                    )}
                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.bookingId, 'Confirmed')}
                        className="flex-1 md:flex-none w-full md:w-36 h-10 px-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
                      >
                        <PlayCircle className="w-4 h-4" /> Check-in Xe
                      </button>
                    )}
                    {booking.status === 'Washing' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.bookingId, 'Washing')}
                        className="flex-1 md:flex-none w-full md:w-36 h-10 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
                      >
                        <LogOut className="w-4 h-4" /> Bàn Giao Xe
                      </button>
                    )}
                    {booking.status === 'CheckedOut' && (
                      <div className="flex-1 md:flex-none w-full md:w-36 h-10 px-3 bg-slate-50 border border-slate-200 text-slate-500 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <CheckCircle2 className="w-4 h-4" /> Đã xong
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {isCancelled || isNoShow ? (
                  <div className="py-4 px-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center mt-2">
                    <p className="text-rose-600 font-bold flex items-center gap-2">
                      Đã hủy ({booking.status})
                    </p>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 pt-5">
                    {/* Stepper */}
                    <div className="w-full overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <div className="flex items-center justify-between w-full min-w-[768px] px-1">
                        {steps.map((step, idx) => {
                          const isCompleted = idx < currentStepIndex
                          const isActive = idx === currentStepIndex
                          const isLast = idx === steps.length - 1

                          return (
                            <React.Fragment key={step.key}>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted || isActive ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                </div>
                                <span className={`text-sm font-semibold whitespace-nowrap ${isCompleted || isActive ? 'text-slate-800' : 'text-slate-400'
                                  }`}>
                                  {step.label}
                                </span>
                              </div>

                              {!isLast && (
                                <div className="flex-1 mx-2 sm:mx-4 h-[3px] rounded-full bg-slate-100 overflow-hidden">
                                  <div className={`h-full transition-all duration-500 ${isCompleted ? 'bg-teal-600 w-full' : 'w-0'}`}></div>
                                </div>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Booking Detail Modal */}
      {isModalOpen && bookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Chi Tiết Lịch Hẹn #{bookingDetail.bookingId}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Khách hàng */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-orange-500" /> Thông tin khách hàng</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Tên khách hàng:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.customerName || 'Khách vãng lai'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Số điện thoại:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.customerPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Biển số xe:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.licensePlate} ({bookingDetail.vehicleType || 'N/A'})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Loại khách hàng:</span>
                    {bookingDetail.customerId ? (
                      <span className="font-semibold text-blue-600">Khách hệ thống</span>
                    ) : (
                      <span className="font-semibold text-purple-600">Khách vãng lai</span>
                    )}
                  </div>
                  {bookingDetail.customerTier && (
                    <div>
                      <span className="text-slate-500 block mb-1">Hạng thành viên:</span>
                      <span className="font-semibold text-orange-600">{bookingDetail.customerTier}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dịch vụ */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><CarFront className="w-4 h-4 text-blue-500" /> Dịch vụ & Thanh toán</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <span className="text-slate-500 block mb-1">Tên dịch vụ:</span>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-slate-800 text-base">{bookingDetail.serviceName}</span>
                      {bookingDetail.originalPrice != null && (
                        <span className="font-semibold text-slate-700 text-base">
                          {bookingDetail.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                    {bookingDetail.addOns && bookingDetail.addOns.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-emerald-500">
                        <span className="text-xs text-slate-500 block mb-1">Dịch vụ tặng kèm / Add-on:</span>
                        {bookingDetail.addOns.map((addon: any) => (
                          <div key={addon.bookingAddOnId} className="font-semibold text-emerald-600 text-sm">
                            + {addon.serviceName}
                            {addon.finalPrice === 0 ? ' (Miễn phí)' : ` (${addon.finalPrice.toLocaleString('vi-VN')} đ)`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Giá gốc:</span>
                    <span className="font-semibold text-slate-600 line-through">{(bookingDetail.originalPrice || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-right">
                    <span className="text-slate-500">Thành tiền:</span>
                    <span className="font-bold text-emerald-600 text-base">{(bookingDetail.finalPrice || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  {bookingDetail.promoCode && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block mb-1">Mã khuyến mãi áp dụng:</span>
                      <span className="font-semibold px-2 py-1 bg-rose-100 text-rose-600 rounded-md">{bookingDetail.promoCode}</span>
                    </div>
                  )}
                  {(bookingDetail.appliedReward?.serviceName || bookingDetail.appliedReward?.rewardName || bookingDetail.rewardName) && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block mb-1">Phần thưởng áp dụng:</span>
                      <span className="font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md inline-flex items-center gap-1.5 text-xs sm:text-sm border border-amber-200">
                        Miễn phí dịch vụ:  {bookingDetail.appliedReward?.serviceName || bookingDetail.appliedReward?.rewardName || bookingDetail.rewardName}
                        {bookingDetail.appliedReward?.pointsSpent ? ` (${bookingDetail.appliedReward.pointsSpent} điểm)` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lịch trình */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> Trạng thái & Lịch trình</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Ngày đặt:</span>
                    <span className="font-semibold text-slate-800">{new Date(bookingDetail.bookingDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Khung giờ:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.startTime} - {bookingDetail.endTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Trạng thái:</span>
                    <span className="font-semibold px-2 py-1 bg-slate-200 text-slate-700 rounded-md">{bookingDetail.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Nhân viên phụ trách:</span>
                    <span className="font-semibold text-slate-800">{bookingDetail.staffName || 'Chưa phân công'}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin kiểm tra xe (Nếu có) */}
              {(bookingDetail.staffNote || bookingDetail.incidentImage1 || bookingDetail.incidentImage2) && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> Tình trạng xe lúc nhận
                  </h4>

                  {bookingDetail.staffNote && (
                    <div className="mb-4">
                      <span className="text-slate-500 block mb-1 text-sm">Ghi chú của nhân viên:</span>
                      <p className="font-semibold text-slate-800 text-sm whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
                        {bookingDetail.staffNote}
                      </p>
                    </div>
                  )}

                  {(bookingDetail.incidentImage1 || bookingDetail.incidentImage2 || (bookingDetail.incidentImageUrls && bookingDetail.incidentImageUrls.length > 0)) && (
                    <div>
                      <span className="text-slate-500 block mb-2 text-sm">Ảnh chụp thực trạng: (Bấm vào để xem lớn)</span>
                      <div className="grid grid-cols-2 gap-3">
                        {(bookingDetail.incidentImageUrls && bookingDetail.incidentImageUrls.length > 0
                          ? bookingDetail.incidentImageUrls
                          : [bookingDetail.incidentImage1, bookingDetail.incidentImage2].filter(Boolean)
                        ).map((imgUrl: string, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPreviewImage(imgUrl)}
                            className="block group relative overflow-hidden rounded-lg border border-slate-200 aspect-video bg-slate-100 text-left w-full cursor-pointer focus:outline-none"
                          >
                            {failedImages[imgUrl] ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-2 text-center border border-dashed border-slate-300 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                                <span className="text-[11px] font-bold text-slate-600">Ảnh AWS S3 không tải được</span>
                                <span className="text-[9px] text-slate-400 truncate max-w-full px-1">Bấm để xem URL chi tiết</span>
                              </div>
                            ) : (
                              <>
                                <img
                                  src={imgUrl}
                                  alt={`Tình trạng xe ${idx + 1}`}
                                  onError={() => setFailedImages((prev) => ({ ...prev, [imgUrl]: true }))}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white" />
                                </div>
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Thông tin Phiếu giữ xe (Nếu có) */}
              {bookingDetail.parkingReceipt && (
                <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-200/80">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-600" /> Thông Tin Phiếu Gửi Xe (#RECEIPT-{bookingDetail.parkingReceipt.receiptId})
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Nhân viên lập phiếu:</span>
                      <span className="font-bold text-slate-800">{bookingDetail.parkingReceipt.issueStaffName || 'Chưa cập nhật'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Thời gian phát hành:</span>
                      <span className="font-bold text-slate-800">
                        {formatDateTime(bookingDetail.parkingReceipt.issuedAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Hình thức gửi xe:</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-extrabold ${bookingDetail.parkingReceipt.isCustomerLeaving ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {bookingDetail.parkingReceipt.isCustomerLeaving ? '🚗 Khách gửi xe lại gara' : '🧍 Khách ở lại chờ tại chỗ'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Trạng thái phiếu:</span>
                      <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                        {bookingDetail.parkingReceipt.status}
                      </span>
                    </div>
                  </div>

                  {bookingDetail.parkingReceipt.customerSignature && (
                    <div className="pt-2 border-t border-orange-200/60">
                      <span className="text-slate-500 block text-xs mb-1.5 font-medium">Chữ ký xác nhận của khách hàng:</span>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 inline-block">
                        <img src={bookingDetail.parkingReceipt.customerSignature} alt="Chữ ký khách hàng" className="h-16 object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              {bookingDetail.status === 'Confirmed' && (
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setCheckInBookingId(bookingDetail.bookingId)
                    setIsCheckInModalOpen(true)
                  }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  <PlayCircle className="w-5 h-5" /> Tiến hành Check-in
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-600" />
                Quét Mã Khách Hàng
              </h3>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 relative">
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-slate-700 bg-black"></div>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Form Modal */}
      {isCheckInModalOpen && checkInBookingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Kiểm Tra Nhận Xe #{checkInBookingId}</h3>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh tình trạng 1 <span className="text-rose-500">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  required
                  onChange={(e) => setIncidentImage1(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh tình trạng 2 <span className="text-rose-500">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  required
                  onChange={(e) => setIncidentImage2(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú tình trạng xe <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  placeholder="Vd: Xe có vết xước nhỏ ở cánh cửa phải..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none h-24 text-slate-700 font-medium text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Xác Nhận Check-in</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              title="Đóng xem ảnh"
            >
              <X className="w-6 h-6" />
            </button>

            {failedImages[previewImage] ? (
              <div className="bg-white p-6 rounded-2xl max-w-md text-center space-y-3 shadow-2xl">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-base">Không Thể Tải Ảnh Từ AWS S3</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Đường dẫn ảnh dưới đây không thể hiển thị trên trình duyệt (Do AWS S3 Bucket chưa bật <strong>Public Access</strong> hoặc chưa điền <strong>AWS AccessKey</strong> ở Backend).
                </p>
                <div className="bg-slate-100 p-3 rounded-xl text-[11px] font-mono text-slate-700 break-all text-left max-h-32 overflow-y-auto border border-slate-200">
                  {previewImage}
                </div>
              </div>
            ) : (
              <img
                src={previewImage}
                alt="Xem ảnh lớn"
                onError={() => setFailedImages((prev) => ({ ...prev, [previewImage]: true }))}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl border border-white/10 shadow-2xl"
              />
            )}
          </div>
        </div>
      )}

      {/* Real-time Floating Alert Banner for Staff when Admin scans a plate */}
      {realtimeAlert && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border-2 border-orange-500/60 space-y-3.5 backdrop-blur-xl animate-fade-up">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4.5 h-4.5 animate-pulse text-amber-300" />
              <span>Xe Đã Đến & Admin Đã Quét Biển Số!</span>
            </div>
            <button
              onClick={() => {
                if (realtimeAlert) dismissPlateScan(realtimeAlert.timestamp)
                setRealtimeAlert(null)
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl space-y-2 text-xs border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Biển số xe:</span>
              <strong className="text-amber-400 font-mono text-lg font-black tracking-wider">{realtimeAlert.plateNumber}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Mã lịch hẹn:</span>
              {realtimeAlert.bookingId ? (
                <strong className="text-cyan-400 font-mono text-base font-extrabold">#{realtimeAlert.bookingId}</strong>
              ) : (
                <span className="text-amber-300 font-semibold text-xs">Chưa có lịch hẹn</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Khách hàng:</span>
              <strong className="text-white text-sm font-bold">
                {realtimeAlert.customerName || 'Khách vãng lai'}
              </strong>
            </div>
            {(() => {
              const matchedBk = realtimeAlert.bookingId ? bookings.find(b => b.bookingId === realtimeAlert.bookingId) : undefined
              const serviceToShow = (realtimeAlert.serviceName && realtimeAlert.serviceName !== 'Dịch vụ rửa xe')
                ? realtimeAlert.serviceName
                : (matchedBk?.serviceName || (realtimeAlert.bookingId ? 'Rửa Xe Cơ bản' : 'N/A'))
              return (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Dịch vụ:</span>
                  <span className="text-emerald-300 font-bold">{serviceToShow}</span>
                </div>
              )
            })()}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            💡 <em>Admin đã quét nhận diện biển số xe. Nhân viên chỉ cần <strong>Quét mã QR từ Khách hàng</strong> để xem chi tiết & nhận xe!</em>
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                if (realtimeAlert) dismissPlateScan(realtimeAlert.timestamp)
                setIsScannerOpen(true)
                setRealtimeAlert(null)
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-600 shadow-md"
            >
              <QrCode className="w-4 h-4 text-cyan-300" />
              <span>Quét QR Khách</span>
            </button>
            <button
              onClick={() => {
                if (realtimeAlert) dismissPlateScan(realtimeAlert.timestamp)
                setSearchPhone(realtimeAlert.plateNumber)
                setSearchType('plate')
                setRealtimeAlert(null)
                fetchBookings()
              }}
              className="py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25"
            >
              <Search className="w-4 h-4" />
              <span>Xem Đơn Hàng</span>
            </button>
          </div>
        </div>
      )}

      {/* AI License Plate OCR Scanner Modal for Staff */}
      {isPlateOcrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-2xl text-cyan-600">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Quét Biển Số Xe AI (OCR)</h3>
                  <p className="text-xs text-slate-500 font-medium">Bóc tách tự động biển số xe từ hình ảnh</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlateOcrModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Preview & Upload Box */}
              <div className="border-2 border-dashed border-cyan-200 bg-cyan-50/30 rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
                {ocrImagePreview ? (
                  <div className="relative inline-block max-h-48 rounded-xl overflow-hidden shadow-md">
                    <img src={ocrImagePreview} alt="Biển số xe" className="max-h-48 object-cover rounded-xl" />
                    {ocrScanning && (
                      <div className="absolute inset-0 bg-cyan-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                        <Scan className="w-8 h-8 animate-pulse text-cyan-300" />
                        <span className="text-xs font-bold animate-pulse">AI đang bóc tách biển số...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Camera className="w-12 h-12 text-cyan-500 mx-auto opacity-70" />
                    <p className="text-xs text-slate-600 font-semibold">Tải lên hoặc chụp ảnh biển số xe đằng trước / đằng sau</p>
                    <p className="text-[11px] text-slate-400">Hệ thống hỗ trợ các định dạng PNG, JPG, JPEG (Tối đa 5MB)</p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScanPlateFile}
                  disabled={ocrScanning}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                />
              </div>

              {/* Detected Plate Output */}
              {ocrDetectedPlate && (
                <div className="bg-slate-900 text-white p-4 rounded-2xl border border-cyan-500/40 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold block">Biển số AI nhận diện:</span>
                    <span className="text-2xl font-black text-amber-400 font-mono tracking-widest">{ocrDetectedPlate}</span>
                  </div>
                  {ocrHasBooking ? (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Đã tìm thấy lịch hẹn
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400" /> Chưa có lịch hẹn
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPlateOcrModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Cấp Phiếu Gửi Xe (Bước 2 sau Check-in) */}
      {isReceiptModalOpen && receiptBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Phát Hành Phiếu Gửi Xe</h3>
                  <p className="text-xs text-slate-500">Mã đơn #{receiptBookingId}</p>
                </div>
              </div>
              <button
                onClick={handleSkipReceipt}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Lựa chọn hình thức gửi xe */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Hình thức gửi xe:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCustomerLeaving(true)}
                    className={`p-3.5 rounded-xl border font-bold text-xs sm:text-sm text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      isCustomerLeaving
                        ? 'border-orange-500 bg-orange-50/80 text-orange-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <CarFront className="w-4 h-4" /> Khách gửi xe lại
                    </span>
                    <span className="text-[11px] font-normal text-slate-500">Gửi xe lại gara, cần chữ ký xác nhận</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomerLeaving(false)}
                    className={`p-3.5 rounded-xl border font-bold text-xs sm:text-sm text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      !isCustomerLeaving
                        ? 'border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Khách ở lại chờ
                    </span>
                    <span className="text-[11px] font-normal text-slate-500">Chờ tại chỗ lấy xe ngay sau rửa</span>
                  </button>
                </div>
              </div>

              {/* Bảng ký tên Canvas nếu khách gửi xe lại */}
              {isCustomerLeaving && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-orange-500" /> Chữ ký xác nhận của khách:
                    </label>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-slate-500 hover:text-rose-600 font-bold underline cursor-pointer"
                    >
                      Xóa chữ ký
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden relative touch-none">
                    <canvas
                      ref={canvasRef}
                      width={440}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-28 bg-white cursor-crosshair"
                    />
                    {!hasSigned && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-semibold">
                        Ký tên tại đây
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleSkipReceipt}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-sm"
                >
                  Bỏ qua (Khách chờ tại chỗ)
                </button>
                <button
                  type="button"
                  onClick={handleIssueReceiptSubmit}
                  disabled={isSubmittingReceipt}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer text-sm"
                >
                  {isSubmittingReceipt ? (
                    <span>Đang phát hành...</span>
                  ) : (
                    <span>Xác Nhận & Cấp Phiếu</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
