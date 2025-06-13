'use client'

import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestRadioPage() {
  const [value, setValue] = useState<string>('')

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">ラジオボタンテスト</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>基本的なラジオグループ</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={value} onValueChange={setValue}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option1" id="option1" />
              <Label htmlFor="option1">オプション1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option2" id="option2" />
              <Label htmlFor="option2">オプション2</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option3" id="option3" />
              <Label htmlFor="option3">オプション3</Label>
            </div>
          </RadioGroup>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-sm font-medium">選択された値: {value || '(未選択)'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}