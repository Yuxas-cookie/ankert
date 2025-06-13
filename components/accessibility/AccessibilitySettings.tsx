'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAccessibility } from './AccessibilityProvider'
import { 
  Eye, 
  Type, 
  Zap, 
  Volume2, 
  Target, 
  Keyboard,
  RotateCcw,
  Settings,
  Info
} from 'lucide-react'

export const AccessibilitySettings: React.FC = () => {
  const { settings, updateSetting, resetSettings, announce } = useAccessibility()
  const [showInfo, setShowInfo] = useState<string | null>(null)

  const settingsConfig = [
    {
      key: 'highContrast' as const,
      title: 'ハイコントラスト',
      description: 'テキストと背景のコントラストを高くして見やすくします',
      icon: Eye,
      info: 'ハイコントラストモードは、視覚的な識別を改善し、読みやすさを向上させます。'
    },
    {
      key: 'largeText' as const,
      title: '大きな文字',
      description: 'フォントサイズを大きくして読みやすくします',
      icon: Type,
      info: 'すべてのテキストのサイズが約125%に拡大されます。'
    },
    {
      key: 'reducedMotion' as const,
      title: 'アニメーション軽減',
      description: 'アニメーションや動きを減らします',
      icon: Zap,
      info: '画面上の動きや変化を最小限に抑え、注意散漫を防ぎます。'
    },
    {
      key: 'screenReader' as const,
      title: 'スクリーンリーダー最適化',
      description: 'スクリーンリーダーでの使用を最適化します',
      icon: Volume2,
      info: 'スクリーンリーダーでの読み上げがより分かりやすくなります。'
    },
    {
      key: 'focusVisible' as const,
      title: 'フォーカス表示強化',
      description: 'キーボードフォーカスをより見やすくします',
      icon: Target,
      info: 'キーボードで操作する際のフォーカス位置が明確に表示されます。'
    },
    {
      key: 'keyboardNavigation' as const,
      title: 'キーボードナビゲーション',
      description: 'キーボードでの操作を有効にします',
      icon: Keyboard,
      info: 'マウスを使わずにキーボードだけで操作できます。'
    }
  ]

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSetting(key, value)
    
    const setting = settingsConfig.find(s => s.key === key)
    if (setting) {
      announce(
        `${setting.title}を${value ? '有効' : '無効'}にしました`,
        'polite'
      )
    }
  }

  const handleReset = () => {
    resetSettings()
    announce('アクセシビリティ設定をリセットしました', 'polite')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>アクセシビリティ設定</CardTitle>
        </div>
        <CardDescription>
          あなたの使いやすさに合わせて設定をカスタマイズできます
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {settingsConfig.map((setting, index) => (
          <div key={setting.key}>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <setting.icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Label 
                      htmlFor={setting.key}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {setting.title}
                    </Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => setShowInfo(showInfo === setting.key ? null : setting.key)}
                      aria-label={`${setting.title}の詳細情報を表示`}
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                  
                  {showInfo === setting.key && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm">{setting.info}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Switch
                id={setting.key}
                checked={settings[setting.key]}
                onCheckedChange={(value) => handleSettingChange(setting.key, value)}
                aria-describedby={`${setting.key}-description`}
              />
            </div>
            
            {index < settingsConfig.length - 1 && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">設定をリセット</h4>
            <p className="text-sm text-muted-foreground">
              すべての設定を初期値に戻します
            </p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            リセット
          </Button>
        </div>

        {/* Status summary */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">現在の設定状況</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {settingsConfig.map(setting => (
              <div 
                key={setting.key}
                className={`flex items-center gap-1 ${
                  settings[setting.key] ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  settings[setting.key] ? 'bg-green-600' : 'bg-muted-foreground'
                }`} />
                <span>{setting.title}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick accessibility toolbar
export const AccessibilityToolbar: React.FC<{ className?: string }> = ({ className }) => {
  const { settings, updateSetting } = useAccessibility()

  const quickSettings = [
    { key: 'highContrast' as const, icon: Eye, label: 'ハイコントラスト' },
    { key: 'largeText' as const, icon: Type, label: '大きな文字' },
    { key: 'reducedMotion' as const, icon: Zap, label: 'アニメーション軽減' }
  ]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground mr-2">アクセシビリティ:</span>
      {quickSettings.map(setting => (
        <Button
          key={setting.key}
          variant={settings[setting.key] ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting(setting.key, !settings[setting.key])}
          aria-pressed={settings[setting.key]}
          aria-label={`${setting.label}を${settings[setting.key] ? '無効' : '有効'}にする`}
          className="h-8"
        >
          <setting.icon className="h-3 w-3 mr-1" />
          {setting.label}
        </Button>
      ))}
    </div>
  )
}