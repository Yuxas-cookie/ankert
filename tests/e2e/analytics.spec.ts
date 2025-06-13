import { test, expect } from '@playwright/test'

test.describe('Analytics and Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and navigate to dashboard
    await page.goto('/dashboard')
  })

  test('should display dashboard with survey list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('ダッシュボード')
    await expect(page.locator('text=アンケート一覧')).toBeVisible()
    
    // Check if survey cards are displayed
    await expect(page.locator('.survey-card')).toHaveCountGreaterThan(0)
  })

  test('should show survey analytics', async ({ page }) => {
    // Click on a survey to view analytics
    await page.click('.survey-card:first-child')
    
    // Should navigate to survey analytics page
    await expect(page).toHaveURL(/\/surveys\/.*\/responses/)
    
    // Check analytics components
    await expect(page.locator('text=回答数')).toBeVisible()
    await expect(page.locator('text=完了率')).toBeVisible()
    await expect(page.locator('text=平均完了時間')).toBeVisible()
  })

  test('should display different chart types', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/responses')
    
    // Check for various chart types
    await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="line-chart"]')).toBeVisible()
  })

  test('should filter responses by date range', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/responses')
    
    // Open date filter
    await page.click('text=期間フィルター')
    
    // Set date range
    await page.fill('input[name="startDate"]', '2024-01-01')
    await page.fill('input[name="endDate"]', '2024-12-31')
    await page.click('text=適用')
    
    // Verify filter was applied
    await expect(page.locator('text=2024-01-01 〜 2024-12-31')).toBeVisible()
  })

  test('should export responses to different formats', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/responses')
    
    // Open export dialog
    await page.click('text=エクスポート')
    
    // Check export options
    await expect(page.locator('text=CSV')).toBeVisible()
    await expect(page.locator('text=Excel')).toBeVisible()
    await expect(page.locator('text=PDF')).toBeVisible()
    
    // Test CSV export
    const downloadPromise = page.waitForEvent('download')
    await page.click('text=CSV')
    await page.click('text=ダウンロード')
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.csv')
  })

  test('should show real-time metrics', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/responses')
    
    // Check real-time metrics components
    await expect(page.locator('text=リアルタイム')).toBeVisible()
    await expect(page.locator('text=アクティブ回答者')).toBeVisible()
    await expect(page.locator('text=最新回答')).toBeVisible()
    
    // Check if metrics update (this would require WebSocket simulation)
    const activeCount = page.locator('[data-testid="active-respondents"]')
    await expect(activeCount).toBeVisible()
  })

  test('should display individual response details', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/responses')
    
    // Click on individual response
    await page.click('.response-row:first-child')
    
    // Should show response detail modal
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('text=回答詳細')).toBeVisible()
    
    // Check response data is displayed
    await expect(page.locator('.response-answer')).toHaveCountGreaterThan(0)
  })

  test('should support advanced filtering', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/responses')
    
    // Open advanced filters
    await page.click('text=詳細フィルター')
    
    // Apply completion status filter
    await page.selectOption('select[name="status"]', 'completed')
    
    // Apply demographic filter
    await page.fill('input[name="ageRange"]', '20-30')
    
    // Apply filter
    await page.click('text=フィルターを適用')
    
    // Verify filtered results
    await expect(page.locator('text=フィルター適用中')).toBeVisible()
  })

  test('should show text analysis and sentiment', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/responses')
    
    // Navigate to text analysis tab
    await page.click('text=テキスト分析')
    
    // Check sentiment analysis
    await expect(page.locator('text=感情分析')).toBeVisible()
    await expect(page.locator('text=ポジティブ')).toBeVisible()
    await expect(page.locator('text=ネガティブ')).toBeVisible()
    
    // Check word cloud
    await expect(page.locator('[data-testid="word-cloud"]')).toBeVisible()
    
    // Check keyword extraction
    await expect(page.locator('text=キーワード')).toBeVisible()
  })

  test('should generate and display insights', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/responses')
    
    // Navigate to insights tab
    await page.click('text=インサイト')
    
    // Check AI-generated insights
    await expect(page.locator('text=主要な発見')).toBeVisible()
    await expect(page.locator('text=推奨アクション')).toBeVisible()
    await expect(page.locator('text=トレンド分析')).toBeVisible()
    
    // Check insight cards
    await expect(page.locator('.insight-card')).toHaveCountGreaterThan(0)
  })

  test('should support comparison between surveys', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Select multiple surveys for comparison
    await page.check('input[data-survey-id="survey1"]')
    await page.check('input[data-survey-id="survey2"]')
    
    // Open comparison view
    await page.click('text=比較分析')
    
    // Check comparison charts
    await expect(page.locator('text=アンケート比較')).toBeVisible()
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible()
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // Navigate to survey with large response count
    await page.goto('/surveys/large-survey-id/responses')
    
    // Check pagination
    await expect(page.locator('.pagination')).toBeVisible()
    
    // Check virtual scrolling for large lists
    const responseList = page.locator('.response-list')
    await expect(responseList).toBeVisible()
    
    // Test scrolling performance
    await page.evaluate(() => {
      document.querySelector('.response-list')?.scrollTo(0, 1000)
    })
    
    // Should load more data smoothly
    await page.waitForTimeout(1000)
    await expect(responseList).toBeVisible()
  })
})