import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login page', async ({ page }) => {
    await page.click('text=ログイン')
    await expect(page).toHaveURL('/auth/login')
    await expect(page.locator('h1')).toContainText('ログイン')
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login')
    await page.click('button[type="submit"]')
    
    // Check for validation errors
    await expect(page.locator('text=メールアドレスは必須です')).toBeVisible()
    await expect(page.locator('text=パスワードは必須です')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid login credentials')).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/auth/login')
    await page.click('text=新規登録')
    
    await expect(page).toHaveURL('/auth/register')
    await expect(page.locator('h1')).toContainText('新規登録')
  })

  test('should display OAuth login options', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page.locator('text=Googleでログイン')).toBeVisible()
    await expect(page.locator('text=Microsoftでログイン')).toBeVisible()
    await expect(page.locator('text=GitHubでログイン')).toBeVisible()
  })

  test('should navigate to password reset page', async ({ page }) => {
    await page.goto('/auth/login')
    await page.click('text=パスワードを忘れた場合')
    
    await expect(page).toHaveURL('/auth/reset-password')
    await expect(page.locator('h1')).toContainText('パスワードリセット')
  })

  test('registration form validation', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Submit empty form
    await page.click('button[type="submit"]')
    await expect(page.locator('text=メールアドレスは必須です')).toBeVisible()
    
    // Test email validation
    await page.fill('input[type="email"]', 'invalid-email')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible()
    
    // Test password validation
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', '123')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=パスワードは8文字以上で入力してください')).toBeVisible()
  })
})