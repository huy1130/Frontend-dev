import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertTriangle, XCircle, Eye, Loader2, ShieldAlert, User, Camera, Search } from 'lucide-react'
import { incidentReportService, IncidentReportDto } from '../../services/incidentReportService'
import { formatDateTime } from '../../utils/date'
import { AuthenticatedImage } from '../../components/common/AuthenticatedImage'

const StatusBadge = ({ status }: { status?: string }) => {
  switch (status) {
    case 'Pending':
      return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">Chờ Xử Lý</span>
    case 'InReview':
      return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">Đang Xem Xét</span>
    case 'Resolved':
      return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">Đã Giải Quyết</span>
    case 'Rejected':
      return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">Từ Chối</span>
    default:
      return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>
  }
}

export default function StaffIncidentView() {
  const location = useLocation()
  const [reports, setReports] = useState<IncidentReportDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedReport, setSelectedReport] = useState<IncidentReportDto | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const res = await incidentReportService.getAllReports()
      const data = Array.isArray(res) ? res : res.data || []
      setReports(data.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()))
    } catch (err: any) {
      console.error('Error fetching incident reports:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
    if (location.state?.bookingId) {
      setSearchQuery(String(location.state.bookingId))
    }
  }, [location.state])

  const handleViewDetail = (report: IncidentReportDto) => {
    setSelectedReport(report)
    setIsDetailOpen(true)
  }

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      String(r.bookingId).includes(q) ||
      String(r.reportId).includes(q) ||
      (r.customerName || '').toLowerCase().includes(q) ||
      (r.customerNote || '').toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  const filterButtons = [
    { key: 'all', label: 'Tất Cả', count: reports.length, activeClass: 'bg-slate-900 text-white' },
    { key: 'Pending', label: 'Chờ Xử Lý', count: reports.filter(r => r.status === 'Pending').length, activeClass: 'bg-amber-500 text-white' },
    { key: 'InReview', label: 'Đang Xem Xét', count: reports.filter(r => r.status === 'InReview').length, activeClass: 'bg-blue-600 text-white' },
    { key: 'Resolved', label: 'Đã Giải Quyết', count: reports.filter(r => r.status === 'Resolved').length, activeClass: 'bg-emerald-600 text-white' },
    { key: 'Rejected', label: 'Từ Chối', count: reports.filter(r => r.status === 'Rejected').length, activeClass: 'bg-rose-600 text-white' },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200/60 rounded-2xl text-rose-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Báo Cáo Sự Cố</h2>
            <p className="text-slate-500 text-xs font-medium mt-0.5">Xem danh sách phản ánh khiếu nại từ khách hàng (chỉ xem)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-bold text-amber-700">Chế độ Xem — Chỉ Admin được xử lý</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đặt lịch, tên khách hàng, nội dung..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-slate-50 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setFilterStatus(btn.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filterStatus === btn.key ? btn.activeClass : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {btn.label} ({btn.count})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-sm font-semibold">Đang tải danh sách khiếu nại...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">Chưa có báo cáo sự cố nào trong danh mục này</p>
            <p className="text-xs text-slate-400">Tất cả phản ánh khiếu nại từ khách hàng sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Mã Báo Cáo</th>
                  <th className="px-6 py-4">Mã Đặt Lịch</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Nội Dung Phản Ánh</th>
                  <th className="px-6 py-4">Thời Gian Gửi</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredReports.map((report) => (
                  <tr key={report.reportId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-extrabold text-slate-900">#REP-{report.reportId}</td>
                    <td className="px-6 py-4 font-mono font-bold text-orange-600">#{report.bookingId}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{report.customerName || 'Khách hàng'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium max-w-xs truncate">
                      {report.customerNote}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {formatDateTime(report.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(report)}
                        className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem Chi Tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View-Only Detail Modal */}
      {isDetailOpen && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Chi Tiết Khiếu Nại #REP-{selectedReport.reportId}</h3>
                  <p className="text-xs text-slate-500 font-medium">Lịch đặt #{selectedReport.bookingId} — {selectedReport.customerName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng Thái:</span>
                <StatusBadge status={selectedReport.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thời Gian Gửi:</span>
                <span className="text-xs font-semibold text-slate-700">{formatDateTime(selectedReport.createdAt)}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nội Dung Phản Ánh Từ Khách Hàng</p>
                <p className="text-xs text-slate-800 whitespace-pre-wrap font-semibold leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {selectedReport.customerNote}
                </p>

                {(selectedReport.image1ApiPath || selectedReport.image2ApiPath || selectedReport.image3ApiPath || selectedReport.image4ApiPath || selectedReport.image5ApiPath || selectedReport.image1 || selectedReport.image2 || selectedReport.image3 || selectedReport.image4 || selectedReport.image5) && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-orange-600" />
                      <span>Ảnh Bằng Chứng Khách Hàng Gửi:</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        {
                          url: selectedReport.image1ApiPath || (selectedReport.image1 ? `/IncidentReport/${selectedReport.reportId}/images/1` : null),
                          label: 'Ảnh bằng chứng 1',
                        },
                        {
                          url: selectedReport.image2ApiPath || (selectedReport.image2 ? `/IncidentReport/${selectedReport.reportId}/images/2` : null),
                          label: 'Ảnh bằng chứng 2',
                        },
                        {
                          url: selectedReport.image3ApiPath || (selectedReport.image3 ? `/IncidentReport/${selectedReport.reportId}/images/3` : null),
                          label: 'Ảnh bằng chứng 3',
                        },
                        {
                          url: selectedReport.image4ApiPath || (selectedReport.image4 ? `/IncidentReport/${selectedReport.reportId}/images/4` : null),
                          label: 'Ảnh bằng chứng 4',
                        },
                        {
                          url: selectedReport.image5ApiPath || (selectedReport.image5 ? `/IncidentReport/${selectedReport.reportId}/images/5` : null),
                          label: 'Ảnh bằng chứng 5',
                        },
                      ].map((item, idx) => item.url ? (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewImage(item.url || null)}
                          className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 group shadow-xs transition-all hover:border-orange-500 text-left w-full cursor-pointer focus:outline-none"
                        >
                          <AuthenticatedImage
                            src={item.url}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-white">
                            <Eye className="w-6 h-6" />
                            <span className="text-[11px] font-bold">Xem ảnh lớn</span>
                          </div>
                        </button>
                      ) : null)}
                    </div>
                  </div>
                )}
              </div>

              {selectedReport.managerNote && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200/80 space-y-1.5">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Phản Hồi Từ Quản Lý / Admin:</p>
                  <p className="text-xs text-blue-900 whitespace-pre-wrap font-semibold leading-relaxed bg-white p-3 rounded-xl border border-blue-200">
                    {selectedReport.managerNote}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-700">Nhân viên chỉ được xem. Liên hệ Admin/Manager để xử lý khiếu nại này.</p>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <AuthenticatedImage src={previewImage} alt="Ảnh bằng chứng" className="w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  )
}
