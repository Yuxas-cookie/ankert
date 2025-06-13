'use client'

import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CosmicCard } from '@/components/ui/cosmic-card'
import { CosmicButton } from '@/components/ui/cosmic-button'

export default function SelectionTestPage() {
  const [singleValue, setSingleValue] = useState<string>('')
  const [multipleValues, setMultipleValues] = useState<string[]>([])

  // Test data with different ID formats
  const testOptions = [
    { id: '123e4567-e89b-12d3-a456-426614174000', text: 'Option 1 (UUID)' },
    { id: '223e4567-e89b-12d3-a456-426614174001', text: 'Option 2 (UUID)' },
    { id: '1', text: 'Option 3 (Number as string)' },
    { id: '2', text: 'Option 4 (Number as string)' },
  ]

  const handleSingleChange = (value: string) => {
    console.log('[Test] Single choice changed:', {
      newValue: value,
      type: typeof value,
      currentValue: singleValue,
      currentType: typeof singleValue
    })
    setSingleValue(value)
  }

  const handleMultipleChange = (optionId: string, checked: boolean) => {
    console.log('[Test] Multiple choice changed:', {
      optionId,
      checked,
      currentValues: multipleValues,
      isIncluded: multipleValues.includes(optionId)
    })
    
    if (checked) {
      setMultipleValues([...multipleValues, optionId])
    } else {
      setMultipleValues(multipleValues.filter(v => v !== optionId))
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Selection Component Test</h1>
      
      <div className="space-y-8">
        {/* Single Choice Test */}
        <CosmicCard variant="nebula" className="p-6">
          <h2 className="text-xl font-semibold mb-4">Single Choice (RadioGroup)</h2>
          <div className="mb-4 p-4 bg-background/50 rounded">
            <p className="text-sm text-muted-foreground">
              Current value: "{singleValue}" (type: {typeof singleValue})
            </p>
          </div>
          
          <RadioGroup value={singleValue} onValueChange={handleSingleChange}>
            {testOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={option.id} id={`single-${option.id}`} />
                <Label htmlFor={`single-${option.id}`} className="cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CosmicCard>

        {/* Multiple Choice Test */}
        <CosmicCard variant="aurora" className="p-6">
          <h2 className="text-xl font-semibold mb-4">Multiple Choice (Checkboxes)</h2>
          <div className="mb-4 p-4 bg-background/50 rounded">
            <p className="text-sm text-muted-foreground">
              Current values: {JSON.stringify(multipleValues)}
            </p>
          </div>
          
          <div className="space-y-2">
            {testOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`multi-${option.id}`}
                  checked={multipleValues.includes(option.id)}
                  onCheckedChange={(checked) => handleMultipleChange(option.id, checked as boolean)}
                />
                <Label htmlFor={`multi-${option.id}`} className="cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        </CosmicCard>

        {/* Test Result */}
        <CosmicCard variant="glass" className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-2">
            <p><strong>Single Choice:</strong> {singleValue || '(none selected)'}</p>
            <p><strong>Multiple Choice:</strong> {multipleValues.length > 0 ? multipleValues.join(', ') : '(none selected)'}</p>
          </div>
          
          <div className="mt-4">
            <CosmicButton onClick={() => {
              console.log('Final values:', { single: singleValue, multiple: multipleValues })
              alert(`Single: ${singleValue}\nMultiple: ${multipleValues.join(', ')}`)
            }}>
              Log Values
            </CosmicButton>
          </div>
        </CosmicCard>
      </div>
    </div>
  )
}