import React, { useState } from 'react'
import { Sparkles, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { mockIndividualServices } from '../../mock/homeData'

export default function IndividualServices() {
  const [activeTab, setActiveTab] = useState<'all' | 'exterior' | 'interior' | 'detailing' | 'protection'>('all')

  const filteredServices = activeTab === 'all'
    ? mockIndividualServices
    : mockIndividualServices.filter(s => s.category === activeTab)

  return (
    <section id="services" className="py-24 bg-dark-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
            Lựa Chọn Linh Hoạt
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            DANH MỤC <span className="gradient-text">DỊCH VỤ LẺ CHUYÊN SÂU</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Tùy chọn từng hạng mục rửa & chăm sóc xe riêng biệt theo đúng nhu cầu sử dụng thực tế của bạn.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
          {[
            { id: 'all', label: 'Tất cả dịch vụ' },
            { id: 'exterior', label: 'Rửa & Vỏ xe' },
            { id: 'interior', label: 'Dọn Nội thất' },
            { id: 'detailing', label: 'Khoang máy & Kính' },
            { id: 'protection', label: 'Phủ Wax & Protection' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'glass-panel text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="glass-panel p-6 rounded-2xl border border-white/10 glass-panel-hover flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                    {srv.name}
                  </h3>
                  {srv.popular && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      Phổ biến
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {srv.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xl font-extrabold text-white">
                    {srv.price.toLocaleString()}đ
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    ~{srv.durationMinutes} phút
                  </div>
                </div>

                <a
                  href="#booking"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-brand-500 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1 group-hover:shadow-md"
                >
                  Chọn dịch vụ
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
