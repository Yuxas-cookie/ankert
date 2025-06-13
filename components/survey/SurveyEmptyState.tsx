import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, PlusCircle } from 'lucide-react'

interface SurveyEmptyStateProps {
  hasSurveys: boolean
  searchTerm: string
}

export function SurveyEmptyState({ hasSurveys, searchTerm }: SurveyEmptyStateProps) {
  if (!hasSurveys) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          アンケートがまだありません
        </h3>
        <p className="text-gray-600 mb-6">
          最初のアンケートを作成して、回答の収集を始めましょう
        </p>
        <Link href="/surveys/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            最初のアンケートを作成
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <div className="text-lg text-gray-600 mb-4">
        「{searchTerm}」に一致するアンケートが見つかりません
      </div>
      <p className="text-sm text-gray-500">
        別のキーワードで検索するか、フィルターを変更してください
      </p>
    </div>
  )
}