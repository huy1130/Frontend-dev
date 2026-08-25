import React, { useState, useEffect } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { serviceService, ServiceDto } from '../../services/serviceService'
import { Link } from 'react-router-dom'

export default function IndividualServices() {
  const [services, setServices] = useState<ServiceDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    serviceService.getActiveServices().then((data) => {
      setServices(data)
    }).finally(() => setIsLoading(false))
  }, [])

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
            {isLoading ? (
               <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-brand-600 font-bold">Đang tải danh sách dịch vụ...</div>
            ) : services.map((srv) => (
              <motion.div
                layout
                key={srv.serviceId}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative bg-white dark:bg-dark-800/90 p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-400/60 dark:hover:border-brand-500/40 transition-all duration-300 overflow-hidden"
              >
                {/* Top decorative gradient line on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-extrabold text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors leading-snug">
                      {srv.serviceName}
                    </h3>
                    <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {srv.description || 'Chăm sóc xe chuyên nghiệp'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Giá dịch vụ</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {srv.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <Link
                    to="/customer/booking"
                    onClick={() => window.scrollTo(0,0)}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-500 dark:hover:bg-brand-600 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md hover:shadow-brand-500/30 active:scale-95"
                  >
                    Chọn dịch vụ
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  )
}
