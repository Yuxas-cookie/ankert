'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Card, CardContent } from './card'
import { 
  Upload, 
  File as FileIcon, 
  Image, 
  X, 
  CheckCircle, 
  AlertCircle,
  Download
} from 'lucide-react'

interface FileWithPreview extends File {
  preview?: string
  id: string
  uploadProgress?: number
  uploadStatus?: 'uploading' | 'success' | 'error'
}

interface FileUploadProps {
  value?: FileWithPreview[]
  onChange?: (files: FileWithPreview[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  multiple?: boolean
  showPreview?: boolean
  className?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) {
    return <Image className="h-5 w-5" />
  }
  return <FileIcon className="h-5 w-5" />
}

const FilePreview: React.FC<{
  file: FileWithPreview
  onRemove: () => void
  showPreview: boolean
}> = ({ file, onRemove, showPreview }) => {
  const isImage = file.type.startsWith('image/')

  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        {showPreview && isImage && file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
            {getFileIcon(file)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          
          {file.uploadProgress !== undefined && (
            <div className="mt-1">
              <Progress value={file.uploadProgress} className="h-1" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {file.uploadStatus === 'success' && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          {file.uploadStatus === 'error' && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onChange,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.csv'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  multiple = true,
  showPreview = true,
  className
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled) return

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.warn('Some files were rejected:', rejectedFiles)
    }

    // Process accepted files
    const newFiles: FileWithPreview[] = acceptedFiles.map((file) => {
      const fileWithPreview = Object.assign(file, {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        uploadProgress: 0,
        uploadStatus: 'uploading' as const
      })
      return fileWithPreview
    })

    // Update files list
    const updatedFiles = multiple 
      ? [...value, ...newFiles].slice(0, maxFiles)
      : newFiles.slice(0, 1)

    onChange?.(updatedFiles)

    // Simulate upload progress
    newFiles.forEach((file) => {
      simulateUpload(file.id, updatedFiles)
    })
  }, [value, onChange, maxFiles, multiple, disabled])

  const simulateUpload = (fileId: string, currentFiles: FileWithPreview[]) => {
    setUploadingFiles(prev => new Set(prev).add(fileId))
    
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadingFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })
        
        // Update file status
        const updatedFiles = currentFiles.map(file => 
          file.id === fileId 
            ? { ...file, uploadProgress: 100, uploadStatus: 'success' as const }
            : file
        )
        onChange?.(updatedFiles)
      } else {
        // Update progress
        const updatedFiles = currentFiles.map(file => 
          file.id === fileId 
            ? { ...file, uploadProgress: progress }
            : file
        )
        onChange?.(updatedFiles)
      }
    }, 200)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? maxFiles : 1,
    maxSize,
    disabled,
    multiple
  })

  const removeFile = (fileId: string) => {
    const updatedFiles = value.filter(file => file.id !== fileId)
    onChange?.(updatedFiles)
    
    // Revoke preview URL to prevent memory leaks
    const fileToRemove = value.find(file => file.id === fileId)
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
  }

  const canAddMore = multiple && value.length < maxFiles

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      {(value.length === 0 || canAddMore) && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          
          {isDragActive ? (
            <p className="text-sm">ファイルをドロップしてください...</p>
          ) : (
            <div>
              <p className="text-sm font-medium mb-1">
                ファイルをドラッグ&ドロップまたはクリックして選択
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {multiple && `最大${maxFiles}ファイル、`}
                最大{formatFileSize(maxSize)}まで
              </p>
              <Button variant="outline" size="sm" disabled={disabled}>
                ファイルを選択
              </Button>
            </div>
          )}
        </div>
      )}

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              アップロードしたファイル ({value.length}/{multiple ? maxFiles : 1})
            </h4>
            {value.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange?.([])}
              >
                すべて削除
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            {value.map((file) => (
              <FilePreview
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
                showPreview={showPreview}
              />
            ))}
          </div>
        </div>
      )}

      {/* File type info */}
      <div className="text-xs text-muted-foreground">
        対応ファイル形式: {Object.keys(accept).join(', ')}
      </div>
    </div>
  )
}

// Add progress component if not already available
export const Progress: React.FC<{
  value: number
  className?: string
}> = ({ value, className }) => {
  return (
    <div className={cn('w-full bg-muted rounded-full h-2', className)}>
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}