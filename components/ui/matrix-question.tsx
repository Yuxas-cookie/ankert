'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Checkbox } from './checkbox'
import { Label } from './label'

export type MatrixType = 'single' | 'multiple'

interface MatrixOption {
  id: string
  label: string
}

interface MatrixRow {
  id: string
  label: string
}

interface MatrixQuestionProps {
  rows: MatrixRow[]
  columns: MatrixOption[]
  values?: Record<string, string | string[]>
  onChange?: (values: Record<string, string | string[]>) => void
  type?: MatrixType
  required?: boolean
  disabled?: boolean
  className?: string
}

export const MatrixQuestion: React.FC<MatrixQuestionProps> = ({
  rows,
  columns,
  values = {},
  onChange,
  type = 'single',
  required = false,
  disabled = false,
  className
}) => {
  const handleSingleChange = (rowId: string, value: string) => {
    if (disabled) return
    
    const newValues = {
      ...values,
      [rowId]: value
    }
    onChange?.(newValues)
  }

  const handleMultipleChange = (rowId: string, columnId: string, checked: boolean) => {
    if (disabled) return
    
    const currentValues = (values[rowId] as string[]) || []
    let newValues: string[]
    
    if (checked) {
      newValues = [...currentValues, columnId]
    } else {
      newValues = currentValues.filter(id => id !== columnId)
    }
    
    const allValues = {
      ...values,
      [rowId]: newValues
    }
    onChange?.(allValues)
  }

  const isColumnSelected = (rowId: string, columnId: string): boolean => {
    if (type === 'single') {
      return values[rowId] === columnId
    } else {
      const rowValues = values[rowId] as string[]
      return rowValues?.includes(columnId) || false
    }
  }

  return (
    <div className={cn('overflow-auto', className)}>
      <div className="min-w-fit">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-3 font-medium min-w-[200px]">
                {/* Empty cell for row headers */}
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="text-center p-3 font-medium min-w-[120px] text-sm"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={cn(
                  'border-t',
                  rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                )}
              >
                <td className="p-3 font-medium text-sm">
                  <Label className="cursor-pointer">
                    {row.label}
                    {required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                </td>
                {columns.map((column) => (
                  <td key={column.id} className="p-3 text-center">
                    {type === 'single' ? (
                      <RadioGroup
                        value={values[row.id] as string || ''}
                        onValueChange={(value) => handleSingleChange(row.id, value)}
                        disabled={disabled}
                      >
                        <div className="flex items-center justify-center">
                          <RadioGroupItem
                            value={column.id}
                            id={`${row.id}-${column.id}`}
                            className="mx-auto"
                          />
                        </div>
                      </RadioGroup>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Checkbox
                          id={`${row.id}-${column.id}`}
                          checked={isColumnSelected(row.id, column.id)}
                          onCheckedChange={(checked) =>
                            handleMultipleChange(row.id, column.id, checked as boolean)
                          }
                          disabled={disabled}
                        />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {required && Object.keys(values).length === 0 && (
        <p className="text-xs text-destructive mt-2">
          すべての項目を選択してください
        </p>
      )}
    </div>
  )
}

// Utility component for matrix question builder
interface MatrixBuilderProps {
  rows: MatrixRow[]
  columns: MatrixOption[]
  onRowsChange?: (rows: MatrixRow[]) => void
  onColumnsChange?: (columns: MatrixOption[]) => void
  className?: string
}

export const MatrixBuilder: React.FC<MatrixBuilderProps> = ({
  rows,
  columns,
  onRowsChange,
  onColumnsChange,
  className
}) => {
  const addRow = () => {
    const newRow: MatrixRow = {
      id: `row-${Date.now()}`,
      label: `行 ${rows.length + 1}`
    }
    onRowsChange?.([...rows, newRow])
  }

  const addColumn = () => {
    const newColumn: MatrixOption = {
      id: `col-${Date.now()}`,
      label: `列 ${columns.length + 1}`
    }
    onColumnsChange?.([...columns, newColumn])
  }

  const updateRow = (index: number, label: string) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], label }
    onRowsChange?.(newRows)
  }

  const updateColumn = (index: number, label: string) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], label }
    onColumnsChange?.(newColumns)
  }

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index)
    onRowsChange?.(newRows)
  }

  const removeColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index)
    onColumnsChange?.(newColumns)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h4 className="font-medium mb-2">行の設定</h4>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={row.id} className="flex gap-2">
              <input
                type="text"
                value={row.label}
                onChange={(e) => updateRow(index, e.target.value)}
                className="flex-1 px-3 py-1 border rounded text-sm"
                placeholder={`行 ${index + 1}`}
              />
              <button
                onClick={() => removeRow(index)}
                className="px-2 py-1 text-destructive hover:bg-destructive/10 rounded text-sm"
              >
                削除
              </button>
            </div>
          ))}
          <button
            onClick={addRow}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
          >
            + 行を追加
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">列の設定</h4>
        <div className="space-y-2">
          {columns.map((column, index) => (
            <div key={column.id} className="flex gap-2">
              <input
                type="text"
                value={column.label}
                onChange={(e) => updateColumn(index, e.target.value)}
                className="flex-1 px-3 py-1 border rounded text-sm"
                placeholder={`列 ${index + 1}`}
              />
              <button
                onClick={() => removeColumn(index)}
                className="px-2 py-1 text-destructive hover:bg-destructive/10 rounded text-sm"
              >
                削除
              </button>
            </div>
          ))}
          <button
            onClick={addColumn}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
          >
            + 列を追加
          </button>
        </div>
      </div>
    </div>
  )
}