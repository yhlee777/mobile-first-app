'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Camera, 
  Upload, 
  X, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  type: 'profile' | 'portfolio'
  className?: string
  disabled?: boolean
}

export function ImageUpload({ 
  value, 
  onChange, 
  type, 
  className = '',
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다')
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다')
      return
    }

    setUploading(true)
    
    try {
      // FileReader를 사용하여 Base64로 변환
      const reader = new FileReader()
      
      reader.onloadend = () => {
        const base64String = reader.result as string
        
        // 이미지 리사이즈 (선택사항)
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // 최대 크기 설정
          const maxWidth = type === 'profile' ? 400 : 800
          const maxHeight = type === 'profile' ? 400 : 1200
          
          let width = img.width
          let height = img.height
          
          // 비율 유지하며 리사이즈
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height)
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          ctx?.drawImage(img, 0, 0, width, height)
          
          // 압축된 이미지를 Base64로 변환
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85)
          
          setPreview(compressedBase64)
          onChange(compressedBase64)
          setUploading(false)
        }
        
        img.src = base64String
      }
      
      reader.onerror = () => {
        alert('이미지를 읽을 수 없습니다')
        setUploading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image processing error:', error)
      alert('이미지 처리 중 오류가 발생했습니다')
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange('')
    setPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (type === 'profile') {
    return (
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
        
        {preview ? (
          <div className="relative w-32 h-32">
            <img 
              src={preview} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
            {!disabled && (
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div 
            className="w-32 h-32 bg-gray-100 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Camera className="h-8 w-8 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">프로필 사진</span>
              </>
            )}
          </div>
        )}
        
        {!preview && !uploading && !disabled && (
          <Button
            size="sm"
            className="absolute bottom-0 right-0 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  // Portfolio image upload
  return (
    <div className={`${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      {preview ? (
        <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={preview} 
            alt="Portfolio" 
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div 
          className="aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all"
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">이미지 업로드</span>
              <span className="text-xs text-gray-400 mt-1">최대 5MB</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}