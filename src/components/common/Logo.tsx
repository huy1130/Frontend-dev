import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-14 md:h-16',
    lg: 'h-16 md:h-20',
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`relative ${currentSize} shrink-0 transition-transform duration-300 hover:scale-105 inline-flex items-center justify-center select-none ml-2 lg:ml-6 ${className}`}>
      <img
        src="/LOGO-HYBRID-transparent.png"
        alt="HYBRIDWASH Logo"
        className="w-auto h-full object-contain scale-110"
      />
    </div>
  )
}
