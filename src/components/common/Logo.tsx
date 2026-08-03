import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-2xl' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl' },
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon (Dùng logo-icon-white-bg.png làm logo toàn hệ thống) */}
      <div className={`relative ${currentSize.icon} shrink-0 transition-transform duration-300 hover:scale-105 rounded-xl overflow-hidden shadow-sm`}>
        <img
          src="/logo-icon-white-bg.png"
          alt="HYBRIDWASH Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={`font-black ${currentSize.text} tracking-tight leading-none text-slate-900 dark:text-white`}>
          HYBRID<span className="gradient-text">WASH</span>
        </span>
      )}
    </div>
  )
}
