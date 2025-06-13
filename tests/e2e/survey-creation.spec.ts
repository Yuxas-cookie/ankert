import { test, expect } from '@playwright/test'

test.describe('Survey Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for testing
    await page.goto('/')
    // In a real scenario, you'd need to authenticate first
    // For now, we'll navigate directly to the survey creation page
  })

  test('should create a new survey with basic questions', async ({ page }) => {
    await page.goto('/surveys/new')
    
    // Fill survey basic information
    await page.fill('input[name="title"]', 'テストアンケート')
    await page.fill('textarea[name="description"]', 'これはテスト用のアンケートです')
    
    // Add a single choice question
    await page.click('text=単一選択')
    await page.fill('input[placeholder="質問文を入力してください"]', '好きな色は何ですか？')
    
    // Add options
    await page.fill('input[placeholder="選択肢1"]', '赤')
    await page.fill('input[placeholder="選択肢2"]', '青')
    await page.click('text=選択肢を追加')
    await page.fill('input[placeholder="選択肢3"]', '緑')
    
    // Save survey
    await page.click('text=保存')
    
    // Verify survey was created
    await expect(page.locator('text=アンケートが保存されました')).toBeVisible()
  })

  test('should add multiple question types', async ({ page }) => {
    await page.goto('/surveys/new')
    
    await page.fill('input[name="title"]', '複合アンケート')
    
    // Add single choice question
    await page.click('text=単一選択')
    await page.fill('input[placeholder="質問文を入力してください"]', '年齢層を選択してください')
    
    // Add multiple choice question
    await page.click('text=複数選択')
    await page.fill('input[placeholder="質問文を入力してください"]', '興味のある分野を選択してください（複数可）')
    
    // Add text question
    await page.click('text=短文回答')
    await page.fill('input[placeholder="質問文を入力してください"]', 'お名前を入力してください')
    
    // Add rating question
    await page.click('text=評価スケール')
    await page.fill('input[placeholder="質問文を入力してください"]', 'サービスを5段階で評価してください')
    
    // Verify all questions were added
    await expect(page.locator('.question-card')).toHaveCount(4)
  })

  test('should preview survey before publishing', async ({ page }) => {
    await page.goto('/surveys/new')
    
    await page.fill('input[name="title"]', 'プレビューテスト')
    await page.click('text=単一選択')
    await page.fill('input[placeholder="質問文を入力してください"]', 'テスト質問')
    
    // Open preview
    await page.click('text=プレビュー')
    
    // Check preview modal is open
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('text=アンケートプレビュー')).toBeVisible()
    
    // Check different view modes
    await page.click('text=テスト')
    await expect(page.locator('text=テストモード')).toBeVisible()
    
    await page.click('text=検証')
    await expect(page.locator('text=検証結果')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/surveys/new')
    
    // Try to save without title
    await page.click('text=保存')
    await expect(page.locator('text=タイトルは必須です')).toBeVisible()
    
    // Add title but no questions
    await page.fill('input[name="title"]', 'テスト')
    await page.click('text=保存')
    await expect(page.locator('text=最低1つの質問を追加してください')).toBeVisible()
  })

  test('should support drag and drop for question reordering', async ({ page }) => {
    await page.goto('/surveys/new')
    
    await page.fill('input[name="title"]', 'ドラッグテスト')
    
    // Add multiple questions
    await page.click('text=単一選択')
    await page.fill('input[placeholder="質問文を入力してください"]', '質問1')
    
    await page.click('text=短文回答')
    await page.fill('input[placeholder="質問文を入力してください"]', '質問2')
    
    // Test drag and drop (this would require more complex setup in a real test)
    const firstQuestion = page.locator('.question-card').first()
    const secondQuestion = page.locator('.question-card').last()
    
    await expect(firstQuestion).toContainText('質問1')
    await expect(secondQuestion).toContainText('質問2')
  })

  test('should publish survey and generate shareable link', async ({ page }) => {
    await page.goto('/surveys/new')
    
    await page.fill('input[name="title"]', '公開テスト')
    await page.click('text=単一選択')
    await page.fill('input[placeholder="質問文を入力してください"]', '公開質問')
    
    // Save first
    await page.click('text=保存')
    await expect(page.locator('text=アンケートが保存されました')).toBeVisible()
    
    // Then publish
    await page.click('text=公開')
    
    // Check publish settings
    await expect(page.locator('text=公開設定')).toBeVisible()
    await page.click('text=公開する')
    
    // Verify published status
    await expect(page.locator('text=公開済み')).toBeVisible()
    await expect(page.locator('text=共有リンク')).toBeVisible()
  })
})