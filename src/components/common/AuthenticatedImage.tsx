import React, { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import axiosClient from '../../api/axiosClient'

interface AuthenticatedImageProps {
  src?: string | null
  alt?: string
  className?: string
  onClick?: () => void
  onBlobLoaded?: (blobUrl: string) => void
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt = 'Image',
  className = '',
  onClick,
  onBlobLoaded,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    let createdUrl: string | null = null

    if (!src) {
      setError(true)
      setLoading(false)
      return
    }

    // Direct HTTP/HTTPS external link
    if (src.startsWith('http://') || src.startsWith('https://')) {
      setBlobUrl(src)
      setLoading(false)
      if (onBlobLoaded) onBlobLoaded(src)
      return
    }

    // Backend API route (requires Auth header)
    const fetchImage = async () => {
      try {
        setLoading(true)
        setError(false)
        // Normalize URL for axiosClient
        const cleanPath = src.startsWith('/api/') ? src.replace('/api/', '/') : src
        const response: any = await axiosClient.get(cleanPath, { responseType: 'blob' })

        const blob = response instanceof Blob ? response : new Blob([response], { type: 'image/jpeg' })
        createdUrl = URL.createObjectURL(blob)

        if (isMounted) {
          setBlobUrl(createdUrl)
          if (onBlobLoaded) onBlobLoaded(createdUrl)
        }
      } catch (err) {
        console.error('Failed to load authenticated image:', err)
        if (isMounted) {
          setError(true)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchImage()

    return () => {
      isMounted = false
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [src])

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error || !blobUrl) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 p-2 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg ${className}`}>
        <AlertCircle className="w-5 h-5 text-amber-500 mb-1 shrink-0" />
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Không thể tải ảnh</span>
      </div>
    )
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  )
}
