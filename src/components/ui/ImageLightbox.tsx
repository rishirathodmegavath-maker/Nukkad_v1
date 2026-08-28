import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ImageLightboxProps {
  src: string | null
  alt?: string
  onClose: () => void
}

/** Full-bleed image viewer for "View photo" on an avatar/cover — Modal is chrome-heavy for this. */
export function ImageLightbox({ src, alt = '', onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [src, onClose])

  if (!src) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in">
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
        aria-label="Close"
      >
        <X className="size-5" />
      </button>
      <img src={src} alt={alt} className="relative max-w-full max-h-full rounded-lg object-contain" />
    </div>,
    document.body,
  )
}
