import { test, expect } from '@playwright/test';

test('SEO: Page title and description update on tab change', async ({ page }) => {
  // Mock the notes fetch BEFORE navigating
  await page.route('**/issues?state=open', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        id: 1,
        title: "Test Note Title",
        body: "This is a test note body content that is long enough to be a description.",
        created_at: "2023-01-01T12:00:00Z",
        comments: 0,
        comments_url: "http://mock/comments",
        labels: []
      }])
    });
  });

  await page.goto('http://localhost:5173');

  // Wait for loading to finish
  await page.waitForSelector('.dashboard');

  // Initial State (Projects) - now immediate watcher should set it
  await expect(page).toHaveTitle(/پروژه‌ها | Software Engineer/);
  const metaDesc = page.locator('meta[name="description"]');
  await expect(metaDesc).toHaveAttribute('content', /نمونه کارهای علیرضا لطفی‌مقدم/);

  // Switch to Interests
  await page.click('button:has-text("علاقه‌مندی")');
  await expect(page).toHaveTitle(/علاقه‌مندی‌ها | Software Engineer/);

  // Switch to History
  await page.click('button:has-text("سوابق")');
  await expect(page).toHaveTitle(/سوابق شغلی | Software Engineer/);
  await expect(metaDesc).toHaveAttribute('content', /سوابق شغلی و تجربه کاری من/);

  // Switch to Roadmap
  await page.click('button:has-text("مسیر من")');
  await expect(page).toHaveTitle(/مسیر من | Software Engineer/);

  // Switch to Notes
  await page.click('button:has-text("یادداشت")');
  await expect(page).toHaveTitle(/یادداشت‌ها | Software Engineer/);

  // Open a Note
  // Wait for note list to render
  const noteRow = page.locator('.note-row').first();
  await expect(noteRow).toBeVisible({ timeout: 5000 });

  await noteRow.click();

  // Verify Note Detail SEO
  await expect(page).toHaveTitle(/Test Note Title | Alireza Lotfi/);
  await expect(metaDesc).toHaveAttribute('content', /This is a test note body/);

  // Close note
  await page.click('button.back-btn'); // Using class selector for back button
  await expect(page).toHaveTitle(/یادداشت‌ها | Software Engineer/);

});
