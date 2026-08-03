import React, { useState } from 'react'
import { Clock, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockIndividualServices } from '../../mock/homeData'

export default function IndividualServices() {
  const [activeTab, setActiveTab] = useState<'all' | 'exterior' | 'interior' | 'detailing' | 'protection'>('all')

  const filteredServices = activeTab === 'all'
    ? mockIndividualServices
    : mockIndividualServices.filter(s => s.category === activeTab)

  return (
    <section id="services" className="py-24 bg-slate-50 dark:bg-dark-900 relative transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            Lựa Chọn Linh Hoạt
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            DANH MỤC <span className="gradient-text">DỊCH VỤ LẺ CHUYÊN SÂU</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Tùy chọn từng hạng mục rửa & chăm sóc xe riêng biệt theo đúng nhu cầu sử dụng thực tế của bạn.
          </p>
        </motion.div>

        {/* Tab Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-2 flex-wrap mb-12"
        >
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
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105'
                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          layout
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.map((srv) => (
              <motion.div
                layout
                key={srv.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-dark-800/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 glass-panel-hover flex flex-col justify-between group shadow-sm dark:shadow-none"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                      {srv.name}
                    </h3>
                    {srv.popular && (
                      <span className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        Phổ biến
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {srv.price.toLocaleString()}đ
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      ~{srv.durationMinutes} phút
                    </div>
                  </div>

                  <a
                    href="#booking"
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-500 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 group-hover:shadow-md border border-slate-200 dark:border-transparent"
                  >
                    Chọn dịch vụ
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  )
}
