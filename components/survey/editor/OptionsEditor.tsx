'use client'

import React, { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface OptionsEditorProps {
  options: string[]
  onChange: (options: string[]) => void
  questionType: string
}

interface SortableOptionProps {
  id: string
  option: string
  index: number
  onUpdate: (index: number, value: string) => void
  onDelete: (index: number) => void
  canDelete: boolean
}

function SortableOption({ id, option, index, onUpdate, onDelete, canDelete }: SortableOptionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-3 bg-card/80 backdrop-blur-md border border-border/20 rounded-xl shadow-sm',
        'hover:shadow-md hover:border-border/30 transition-all duration-200',
        isDragging && 'opacity-50 shadow-xl scale-105'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move p-1 hover:bg-background/50 rounded text-muted-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <Input
        value={option}
        onChange={(e) => onUpdate(index, e.target.value)}
        placeholder={`選択肢 ${index + 1}`}
        className="flex-1 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(index)}
        disabled={!canDelete}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function OptionsEditor({ options, onChange, questionType }: OptionsEditorProps) {
  const [items, setItems] = useState(() => 
    options.map((option, index) => ({
      id: `option-${index}`,
      text: option
    }))
  )
  
  const [isInternalUpdate, setIsInternalUpdate] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Only sync with parent when options prop changes from outside
  React.useEffect(() => {
    if (!isInternalUpdate) {
      const newItems = options.map((option, index) => ({
        id: `option-${index}`,
        text: option
      }))
      // Only update if actually different to prevent loops
      if (JSON.stringify(newItems) !== JSON.stringify(items)) {
        setItems(newItems)
      }
    } else {
      setIsInternalUpdate(false)
    }
  }, [options, isInternalUpdate, items])

  // Notify parent when items change internally
  const notifyParent = React.useCallback((newItems: typeof items) => {
    const newOptions = newItems.map(item => item.text)
    if (JSON.stringify(newOptions) !== JSON.stringify(options)) {
      setIsInternalUpdate(true)
      onChange(newOptions)
    }
  }, [onChange, options])

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex(item => item.id === active.id)
        const newIndex = prevItems.findIndex(item => item.id === over.id)
        
        const newItems = arrayMove(prevItems, oldIndex, newIndex)
        notifyParent(newItems)
        return newItems
      })
    }
  }

  const addOption = () => {
    const newId = `option-${Date.now()}`
    setItems(prev => {
      const newItems = [...prev, { id: newId, text: '' }]
      notifyParent(newItems)
      return newItems
    })
  }

  const updateOption = (index: number, value: string) => {
    setItems(prev => {
      const newItems = prev.map((item, i) => 
        i === index ? { ...item, text: value } : item
      )
      notifyParent(newItems)
      return newItems
    })
  }

  const deleteOption = (index: number) => {
    setItems(prev => {
      const newItems = prev.filter((_, i) => i !== index)
      notifyParent(newItems)
      return newItems
    })
  }

  const minOptionsRequired = questionType === 'single_choice' || questionType === 'multiple_choice' ? 2 : 0
  const canDelete = items.length > minOptionsRequired

  if (!['single_choice', 'multiple_choice'].includes(questionType)) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-foreground font-medium">選択肢</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="h-8 bg-background/50 border-border/50 text-foreground hover:bg-background/80"
        >
          <Plus className="h-4 w-4 mr-1" />
          選択肢を追加
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableOption
                key={item.id}
                id={item.id}
                option={item.text}
                index={index}
                onUpdate={updateOption}
                onDelete={deleteOption}
                canDelete={canDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length < minOptionsRequired && (
        <p className="text-sm text-destructive">
          {questionType === 'single_choice' || questionType === 'multiple_choice' 
            ? '最低2つの選択肢が必要です' 
            : ''
          }
        </p>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-2">選択肢がありません</p>
          <Button 
            variant="outline" 
            onClick={addOption}
            className="bg-background/50 border-border/50 text-foreground hover:bg-background/80"
          >
            最初の選択肢を追加
          </Button>
        </div>
      )}
    </div>
  )
}