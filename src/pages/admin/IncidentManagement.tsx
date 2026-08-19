import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, XCircle, Clock, Eye, Loader2, FileText, Filter, ShieldAlert, Sparkles, Send, User, Calendar, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { incidentReportService, IncidentReportDto } from '../../services/incidentReportService'
import { formatDateTime } from '../../utils/date'
import { AuthenticatedImage } from '../../components/common/AuthenticatedImage'

export default function IncidentManagement() {
  const [reports, setReports] = useState<IncidentReportDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<IncidentReportDto | null>(null)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)

  // Form resolution state
  const [resolveStatus, setResolveStatus] = useState<string>('InReview')
  const [managerNote, setManagerNote] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const res = await incidentReportService.getAllReports()
      const data = Array.isArray(res) ? res : res.data || []
      setReports(data.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()))
    } catch (err: any) {
      console.error('Error fetching incident reports:', err)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách báo cáo sự cố')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleOpenResolveModal = (report: IncidentReportDto) => {
    setSelectedReport(report)
    setResolveStatus(report.status || 'InReview')
    setManagerNote(report.managerNote || '')
    setIsResolveModalOpen(true)
  }

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReport) return
    if (!managerNote.trim()) {
      toast.error('Vui lòng nhập ghi chú xử lý của Quản lý / Nhân viên')
      return
    }

    setIsSubmitting(true)
    try {
      await incidentReportService.resolveReport(selectedReport.reportId, {
        status: resolveStatus,
        managerNote: managerNote.trim(),
      })

      toast.success('Cập nhật phản hồi khiếu nại thành công!')
      setIsResolveModalOpen(false)
      setSelectedReport(null)
      fetchReports()
    } catch (err: any) {
      console.error('Error resolving report:', err)
      toast.error(err.response?.data?.message || 'Có lỗi khi cập nhật trạng thái xử lý khiếu nại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true
    return r.status === filterStatus
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200/60 rounded-2xl text-rose-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quản Lý Sự Cố & Khiếu Nại</h2>
            <p className="text-slate-500 text-xs font-medium mt-0.5">Tiếp nhận và giải quyết phản ánh về tình trạng xe từ khách hàng</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filterStatus === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            Tất Cả ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('Pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filterStatus === 'Pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              }`}
          >
            Chờ Xử Lý ({reports.filter((r) => r.status === 'Pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('InReview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filterStatus === 'InReview' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
              }`}
          >
            Đang Xem Xét ({reports.filter((r) => r.status === 'InReview').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('Resolved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filterStatus === 'Resolved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
          >
            Đã Giải Quyết ({reports.filter((r) => r.status === 'Resolved').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('Rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filterStatus === 'Rejected' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
              }`}
          >
            Từ Chối ({reports.filter((r) => r.status === 'Rejected').length})
          </button>
        </div>
      </div>

      {/* Table List */}
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
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredReports.map((report) => (
                  <tr key={report.reportId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-extrabold text-slate-900">#REP-{report.reportId}</td>
                    <td className="px-6 py-4 font-mono font-bold text-orange-600">#{report.bookingId}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{report.customerName || 'Khách hàng'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium max-w-xs truncate">
                      {report.customerNote}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {formatDateTime(report.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {report.status === 'Pending' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          Chờ Xử Lý
                        </span>
                      )}
                      {report.status === 'InReview' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                          Đang Xem Xét
                        </span>
                      )}
                      {report.status === 'Resolved' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Đã Giải Quyết
                        </span>
                      )}
                      {report.status === 'Rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                          Từ Chối
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {['Resolved', 'Rejected'].includes(report.status || '') ? (
                        <button
                          type="button"
                          onClick={() => handleOpenResolveModal(report)}
                          className="px-3.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Xem Chi Tiết</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenResolveModal(report)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Xử Lý Khiếu Nại
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Xử Lý Sự Cố (Resolve Modal) */}
      {isResolveModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Xử Lý Khiếu Nại #REP-{selectedReport.reportId}</h3>
                  <p className="text-xs text-slate-500 font-medium">Lịch đặt #{selectedReport.bookingId} - {selectedReport.customerName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-6 overflow-y-auto space-y-5">
              {/* Nội dung phản ánh của khách hàng */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nội Dung Phản Ánh Từ Khách Hàng</p>
                <p className="text-xs text-slate-800 whitespace-pre-wrap font-semibold leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {selectedReport.customerNote}
                </p>

                {(selectedReport.image1ApiPath || selectedReport.image2ApiPath || selectedReport.image1 || selectedReport.image2) && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-orange-600" />
                      <span>Ảnh Bằng Chứng Khách Hàng Gửi:</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          url: selectedReport.image1ApiPath || (selectedReport.image1 ? `/IncidentReport/${selectedReport.reportId}/images/1` : null),
                          label: 'Ảnh bằng chứng 1',
                        },
                        {
                          url: selectedReport.image2ApiPath || (selectedReport.image2 ? `/IncidentReport/${selectedReport.reportId}/images/2` : null),
                          label: 'Ảnh bằng chứng 2',
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

              {/* Banner khi báo cáo đã hoàn tất xử lý (Resolved hoặc Rejected) */}
              {selectedReport.status === 'Resolved' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Báo cáo sự cố này đã được Giải Quyết thành công.</span>
                </div>
              )}
              {selectedReport.status === 'Rejected' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-rose-800">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Báo cáo sự cố này đã bị Từ Chối xử lý.</span>
                </div>
              )}

              {/* Lựa chọn trạng thái giải quyết */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Trạng Thái Xử Lý:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={['Resolved', 'Rejected'].includes(selectedReport.status || '')}
                    onClick={() => setResolveStatus('InReview')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border ${resolveStatus === 'InReview'
                        ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      } ${['Resolved', 'Rejected'].includes(selectedReport.status || '') ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    Đang Xem Xét
                  </button>

                  <button
                    type="button"
                    disabled={['Resolved', 'Rejected'].includes(selectedReport.status || '')}
                    onClick={() => setResolveStatus('Resolved')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border ${resolveStatus === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      } ${['Resolved', 'Rejected'].includes(selectedReport.status || '') ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    Đã Giải Quyết
                  </button>

                  <button
                    type="button"
                    disabled={['Resolved', 'Rejected'].includes(selectedReport.status || '')}
                    onClick={() => setResolveStatus('Rejected')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border ${resolveStatus === 'Rejected'
                        ? 'bg-rose-50 text-rose-700 border-rose-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      } ${['Resolved', 'Rejected'].includes(selectedReport.status || '') ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    Từ Chối
                  </button>
                </div>
              </div>

              {/* Ghi chú phản hồi của Quản lý / Nhân viên */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phản Hồi / Ghi Chú Của Quản Lý <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  value={managerNote}
                  disabled={['Resolved', 'Rejected'].includes(selectedReport.status || '')}
                  onChange={(e) => setManagerNote(e.target.value)}
                  placeholder="Nhập phương án giải quyết, lý do chấp nhận/từ chối hoặc thông tin liên hệ bồi thường..."
                  className={`w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-slate-50 transition-all ${['Resolved', 'Rejected'].includes(selectedReport.status || '') ? 'bg-slate-100/80 text-slate-600 cursor-not-allowed' : 'focus:bg-white'
                    }`}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                {['Resolved', 'Rejected'].includes(selectedReport.status || '') ? (
                  <button
                    type="button"
                    onClick={() => setIsResolveModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer text-xs"
                  >
                    Đóng
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsResolveModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-xs"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 cursor-pointer text-xs disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <span>Lưu & Cập Nhật Khiếu Nại</span>
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
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
