import { test, expect } from '@playwright/test'

test.describe('Survey Response Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock a published survey for testing
    await page.goto('/')
  })

  test('should display public survey correctly', async ({ page }) => {
    // Navigate to a mock public survey
    await page.goto('/surveys/mock-survey-id/respond')
    
    // Check survey title and description are displayed
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=質問')).toBeVisible()
  })

  test('should complete survey with different question types', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/respond')
    
    // Answer single choice question
    await page.click('input[type="radio"][value="option1"]')
    
    // Answer multiple choice question
    await page.check('input[type="checkbox"][value="option1"]')
    await page.check('input[type="checkbox"][value="option2"]')
    
    // Answer text question
    await page.fill('input[type="text"]', 'テスト回答')
    
    // Answer textarea question
    await page.fill('textarea', 'これは長文の回答です。詳細な内容を記入しています。')
    
    // Answer rating question
    await page.click('[data-rating="4"]')
    
    // Submit survey
    await page.click('text=送信')
    
    // Verify completion
    await expect(page.locator('text=回答ありがとうございました')).toBeVisible()
  })

  test('should validate required questions', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/respond')
    
    // Try to submit without answering required questions
    await page.click('text=送信')
    
    // Check validation messages
    await expect(page.locator('text=この質問は必須です')).toBeVisible()
  })

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/respond')
    
    // Check progress bar exists
    await expect(page.locator('[role="progressbar"]')).toBeVisible()
    
    // Answer first question and check progress updates
    await page.click('input[type="radio"]')
    await page.click('text=次へ')
    
    // Progress should have increased
    const progress = await page.locator('[role="progressbar"]').getAttribute('aria-valuenow')
    expect(parseInt(progress || '0')).toBeGreaterThan(0)
  })

  test('should support file upload questions', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/respond')
    
    // Find file upload question
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      // Upload a test file
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test file content')
      })
      
      // Verify file was uploaded
      await expect(page.locator('text=test.txt')).toBeVisible()
    }
  })

  test('should handle date questions', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/respond')
    
    // Find date input
    const dateInput = page.locator('input[type="date"]')
    if (await dateInput.count() > 0) {
      await dateInput.fill('2024-12-25')
      
      // Verify date was set
      expect(await dateInput.inputValue()).toBe('2024-12-25')
    }
  })

  test('should handle matrix questions', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/respond')
    
    // Find matrix question
    const matrixQuestion = page.locator('.matrix-question')
    if (await matrixQuestion.count() > 0) {
      // Select ratings for each row
      await page.click('.matrix-row:first-child input[value="3"]')
      await page.click('.matrix-row:nth-child(2) input[value="4"]')
      
      // Verify selections were made
      await expect(page.locator('.matrix-row:first-child input[value="3"]')).toBeChecked()
      await expect(page.locator('.matrix-row:nth-child(2) input[value="4"]')).toBeChecked()
    }
  })

  test('should save partial responses', async ({ page }) => {
    await page.goto('/surveys/mock-survey-id/respond')
    
    // Answer some questions
    await page.fill('input[type="text"]', '部分回答')
    
    // Wait for auto-save
    await page.waitForTimeout(2000)
    
    // Refresh page
    await page.reload()
    
    // Verify partial response was saved
    expect(await page.locator('input[type="text"]').inputValue()).toBe('部分回答')
  })

  test('should handle survey access restrictions', async ({ page }) => {
    // Test password-protected survey
    await page.goto('/surveys/password-protected-id/respond')
    
    // Should show password prompt
    await expect(page.locator('text=パスワードが必要です')).toBeVisible()
    
    // Enter incorrect password
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('text=アクセス')
    
    await expect(page.locator('text=パスワードが正しくありません')).toBeVisible()
    
    // Enter correct password
    await page.fill('input[type="password"]', 'correctpassword')
    await page.click('text=アクセス')
    
    // Should now show survey
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should respect survey time limits', async ({ page }) => {
    // Test survey that hasn't started yet
    await page.goto('/surveys/future-survey-id/respond')
    
    await expect(page.locator('text=まだ開始されていません')).toBeVisible()
    
    // Test expired survey
    await page.goto('/surveys/expired-survey-id/respond')
    
    await expect(page.locator('text=期限が過ぎています')).toBeVisible()
  })

  test('should handle survey completion limit', async ({ page }) => {
    // Test survey that has reached maximum responses
    await page.goto('/surveys/full-survey-id/respond')
    
    await expect(page.locator('text=回答の上限に達しました')).toBeVisible()
  })
})