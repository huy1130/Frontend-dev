import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-20 md:h-24',
    lg: 'h-24 md:h-32',
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`relative ${currentSize} shrink-0 transition-transform duration-300 hover:scale-105 inline-flex items-center justify-center select-none ml-2 lg:ml-6 ${className}`}>
      <img
        src="/logo-wash.png"
        alt="HYBRIDWASH Logo"
        className="w-auto h-full object-contain scale-110"
      />
    </div>
  )
}
