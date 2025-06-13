'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Star, Heart, ThumbsUp } from 'lucide-react'

export type RatingType = 'stars' | 'numbers' | 'hearts' | 'thumbs' | 'emoji'

interface RatingScaleProps {
  value?: number
  onChange?: (value: number) => void
  max?: number
  min?: number
  type?: RatingType
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
  labels?: string[]
  showValue?: boolean
  className?: string
}

const RatingIcon: React.FC<{
  type: RatingType
  filled: boolean
  size: 'sm' | 'md' | 'lg'
}> = ({ type, filled, size }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const iconClass = cn(
    sizeClasses[size],
    filled ? 'text-yellow-500 fill-current' : 'text-gray-300'
  )

  switch (type) {
    case 'stars':
      return <Star className={iconClass} />
    case 'hearts':
      return <Heart className={cn(iconClass, filled && 'text-red-500')} />
    case 'thumbs':
      return <ThumbsUp className={cn(iconClass, filled && 'text-blue-500')} />
    default:
      return <Star className={iconClass} />
  }
}

const EmojiRating: React.FC<{
  value: number
  max: number
  size: 'sm' | 'md' | 'lg'
}> = ({ value, max, size }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  const emojis = ['😞', '😐', '🙂', '😊', '😍']
  const emojiIndex = Math.max(0, Math.min(emojis.length - 1, Math.floor((value - 1) * (emojis.length / max))))

  return (
    <span className={sizeClasses[size]}>
      {value > 0 ? emojis[emojiIndex] : '😐'}
    </span>
  )
}

export const RatingScale: React.FC<RatingScaleProps> = ({
  value = 0,
  onChange,
  max = 5,
  min = 1,
  type = 'stars',
  size = 'md',
  disabled = false,
  required = false,
  labels = [],
  showValue = false,
  className
}) => {
  const [hoverValue, setHoverValue] = useState(0)

  const handleClick = (rating: number) => {
    if (disabled) return
    onChange?.(rating)
  }

  const handleMouseEnter = (rating: number) => {
    if (disabled) return
    setHoverValue(rating)
  }

  const handleMouseLeave = () => {
    setHoverValue(0)
  }

  const renderNumberRating = () => {
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)
    
    return (
      <div className="flex gap-2">
        {numbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleClick(num)}
            onMouseEnter={() => handleMouseEnter(num)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={cn(
              'w-10 h-10 rounded-full border-2 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              {
                'bg-primary text-primary-foreground border-primary': num <= (hoverValue || value),
                'border-muted-foreground/30 hover:border-primary': num > (hoverValue || value) && !disabled,
                'opacity-50 cursor-not-allowed': disabled,
                'cursor-pointer': !disabled
              }
            )}
          >
            {num}
          </button>
        ))}
      </div>
    )
  }

  const renderIconRating = () => {
    const items = Array.from({ length: max }, (_, i) => i + 1)
    
    return (
      <div className="flex gap-1">
        {items.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={cn(
              'transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded',
              {
                'opacity-50 cursor-not-allowed': disabled,
                'cursor-pointer hover:scale-110': !disabled
              }
            )}
          >
            <RatingIcon
              type={type}
              filled={rating <= (hoverValue || value)}
              size={size}
            />
          </button>
        ))}
      </div>
    )
  }

  const renderEmojiRating = () => {
    const items = Array.from({ length: max }, (_, i) => i + 1)
    
    return (
      <div className="flex gap-2">
        {items.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={cn(
              'transition-transform focus:outline-none focus:ring-2 focus:ring-primary rounded',
              {
                'opacity-50 cursor-not-allowed': disabled,
                'cursor-pointer hover:scale-110': !disabled,
                'scale-125': rating === (hoverValue || value)
              }
            )}
          >
            <EmojiRating value={rating} max={max} size={size} />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-4">
        {type === 'numbers' && renderNumberRating()}
        {type === 'emoji' && renderEmojiRating()}
        {['stars', 'hearts', 'thumbs'].includes(type) && renderIconRating()}
        
        {showValue && value > 0 && (
          <span className="text-sm font-medium">
            {value}/{max}
          </span>
        )}
      </div>

      {labels.length > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{labels[0]}</span>
          {labels[1] && <span>{labels[1]}</span>}
        </div>
      )}

      {required && value === 0 && (
        <p className="text-xs text-destructive">この項目は必須です</p>
      )}
    </div>
  )
}