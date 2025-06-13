'use client'

import React, { useState } from 'react'
import { format, parse, isValid } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar, Clock } from 'lucide-react'

export type DateTimeMode = 'date' | 'time' | 'datetime'

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  mode?: DateTimeMode
  disabled?: boolean
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

const DatePicker: React.FC<{
  value?: Date
  onChange?: (date: Date | undefined) => void
  minDate?: Date
  maxDate?: Date
}> = ({ value, onChange, minDate, maxDate }) => {
  const [currentMonth, setCurrentMonth] = useState(value || new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const today = new Date()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handleDayClick = (day: number) => {
    if (isDateDisabled(day)) return
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange?.(newDate)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={previousMonth}>
          ←
        </Button>
        <h3 className="font-medium">
          {format(currentMonth, 'yyyy年MM月', { locale: ja })}
        </h3>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          →
        </Button>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}
        {days.map((day) => {
          const isSelected = value && 
            value.getDate() === day && 
            value.getMonth() === currentMonth.getMonth() && 
            value.getFullYear() === currentMonth.getFullYear()
          const isToday = 
            today.getDate() === day && 
            today.getMonth() === currentMonth.getMonth() && 
            today.getFullYear() === currentMonth.getFullYear()
          const disabled = isDateDisabled(day)

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={disabled}
              className={cn(
                'p-2 text-sm rounded hover:bg-accent transition-colors',
                isSelected && 'bg-primary text-primary-foreground',
                isToday && !isSelected && 'bg-accent',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const TimePicker: React.FC<{
  value?: Date
  onChange?: (date: Date | undefined) => void
}> = ({ value, onChange }) => {
  const [hours, setHours] = useState(value?.getHours() || 0)
  const [minutes, setMinutes] = useState(value?.getMinutes() || 0)

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const newDate = new Date()
    if (value) {
      newDate.setFullYear(value.getFullYear(), value.getMonth(), value.getDate())
    }
    newDate.setHours(newHours, newMinutes, 0, 0)
    onChange?.(newDate)
  }

  const handleHoursChange = (newHours: number) => {
    setHours(newHours)
    handleTimeChange(newHours, minutes)
  }

  const handleMinutesChange = (newMinutes: number) => {
    setMinutes(newMinutes)
    handleTimeChange(hours, newMinutes)
  }

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center justify-center gap-2">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">時</div>
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleHoursChange(Math.min(23, hours + 1))}
            >
              +
            </Button>
            <div className="w-12 h-8 border rounded flex items-center justify-center text-sm">
              {hours.toString().padStart(2, '0')}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleHoursChange(Math.max(0, hours - 1))}
            >
              -
            </Button>
          </div>
        </div>

        <div className="text-2xl">:</div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">分</div>
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMinutesChange(Math.min(59, minutes + 1))}
            >
              +
            </Button>
            <div className="w-12 h-8 border rounded flex items-center justify-center text-sm">
              {minutes.toString().padStart(2, '0')}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMinutesChange(Math.max(0, minutes - 1))}
            >
              -
            </Button>
          </div>
        </div>
      </div>

      {/* Quick time buttons */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '09:00', hours: 9, minutes: 0 },
          { label: '12:00', hours: 12, minutes: 0 },
          { label: '18:00', hours: 18, minutes: 0 },
        ].map((time) => (
          <Button
            key={time.label}
            variant="outline"
            size="sm"
            onClick={() => handleTimeChange(time.hours, time.minutes)}
          >
            {time.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  mode = 'date',
  disabled = false,
  placeholder,
  minDate,
  maxDate,
  className
}) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  React.useEffect(() => {
    if (value) {
      const formatString = 
        mode === 'date' ? 'yyyy-MM-dd' :
        mode === 'time' ? 'HH:mm' :
        'yyyy-MM-dd HH:mm'
      setInputValue(format(value, formatString))
    } else {
      setInputValue('')
    }
  }, [value, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Try to parse the input
    const formatString = 
      mode === 'date' ? 'yyyy-MM-dd' :
      mode === 'time' ? 'HH:mm' :
      'yyyy-MM-dd HH:mm'

    try {
      const parsedDate = parse(newValue, formatString, new Date())
      if (isValid(parsedDate)) {
        onChange?.(parsedDate)
      }
    } catch {
      // Invalid input, do nothing
    }
  }

  const getDisplayValue = () => {
    if (!value) return ''
    
    switch (mode) {
      case 'date':
        return format(value, 'yyyy-MM-dd')
      case 'time':
        return format(value, 'HH:mm')
      case 'datetime':
        return format(value, 'yyyy-MM-dd HH:mm')
      default:
        return ''
    }
  }

  const getPlaceholder = () => {
    if (placeholder) return placeholder
    
    switch (mode) {
      case 'date':
        return 'YYYY-MM-DD'
      case 'time':
        return 'HH:MM'
      case 'datetime':
        return 'YYYY-MM-DD HH:MM'
      default:
        return ''
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            {mode === 'time' ? (
              <Clock className="mr-2 h-4 w-4" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            {getDisplayValue() || getPlaceholder()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {mode === 'date' && (
            <DatePicker
              value={value}
              onChange={(date) => {
                onChange?.(date)
                setOpen(false)
              }}
              minDate={minDate}
              maxDate={maxDate}
            />
          )}
          {mode === 'time' && (
            <TimePicker
              value={value}
              onChange={(date) => {
                onChange?.(date)
                setOpen(false)
              }}
            />
          )}
          {mode === 'datetime' && (
            <div className="flex">
              <DatePicker
                value={value}
                onChange={onChange}
                minDate={minDate}
                maxDate={maxDate}
              />
              <div className="border-l">
                <TimePicker
                  value={value}
                  onChange={onChange}
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Manual input option */}
      <div className="mt-2">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className="text-sm"
        />
      </div>
    </div>
  )
}