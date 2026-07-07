import { test, expect } from '@playwright/test';

test('Dashboard: Navigation, Terminal Commands, and Guestbook E2E', async ({ page }) => {
  // Mock configuration files
  await page.route('**/config.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ urls: {} })
    });
  });

  await page.route('**/dynamicData/profile.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        name: "علیرضا لطفی‌مقدم",
        role: "Software Expert",
        githubUser: "AlirezaLotfiM",
        avatarUrl: "/Damoon-d.png",
        titles: ["Software Engineer", ".NET Developer"],
        bio: "توسعه‌دهنده بک‌اند",
        badges: ["Backend", "Database"],
        cardEmail: "Lotfi.moghaddam.alireza@gmail.com",
        identityCard: {
          eyebrow: "backend identity",
          role: "Software Engineer",
          bio: "توسعه‌دهنده بک‌اند",
          focus: "ASP.NET Core",
          email: "Lotfi.moghaddam.alireza@gmail.com",
          badges: ["Backend", "Database"],
          enterLabel: "ورود به داشبورد",
          resumeLabel: "رزومه"
        },
        contact: {
          email: "Lotfi.moghaddam.alireza@gmail.com"
        },
        learning: {
          focus: "Dapr & K8s"
        }
      })
    });
  });

  await page.route('**/dynamicData/skills.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { name: "C#", level: 90 },
        { name: "SQL", level: 85 }
      ])
    });
  });

  await page.route('**/dynamicData/projects.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: "Test Project", description: "Test Desc", language: "C#" }
      ])
    });
  });

  await page.route('**/dynamicData/roadmap.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { title: "Step 1", desc: "First step", status: "done" }
      ])
    });
  });

  await page.route('**/dynamicData/interests.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { icon: "💻", title: "Coding", desc: "Always coding" }
      ])
    });
  });

  await page.route('**/dynamicData/experience.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.route('**/dynamicData/techStack.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        "C#": { color: "#38bdf8", short: "C#" }
      })
    });
  });

  await page.route('**/dynamicData/notes.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.route('**/dynamicData/guestbook.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.goto('http://localhost:5173');

  // 1. Verify Greeting Card & Enter Dashboard
  const enterBtn = page.locator('.primary-btn');
  await expect(enterBtn).toContainText('ورود به داشبورد');
  await enterBtn.click();

  // Wait for layout grid to render
  const dashboard = page.locator('.layout-grid');
  await expect(dashboard).toBeVisible();

  // 2. Terminal Interactions
  // Click Terminal button
  const terminalBtn = page.locator('.command-shortcut >> text="Terminal"');
  await expect(terminalBtn).toBeVisible();
  await terminalBtn.click();

  // Verify Terminal modal is active
  const terminal = page.locator('.terminal-window');
  await expect(terminal).toBeVisible();

  // Enter command
  const termInput = page.locator('.terminal-body input');
  await termInput.fill('help');
  await termInput.press('Enter');

  // Verify output
  const outputLines = page.locator('.output-line');
  await expect(outputLines.first()).toContainText('Available Commands:');

  // Test Auto-completion
  await termInput.fill('wh');
  await termInput.press('Tab');
  await expect(termInput).toHaveValue('whoami ');

  // Test Command History
  await termInput.fill('ls');
  await termInput.press('Enter');
  
  await termInput.press('ArrowUp');
  await expect(termInput).toHaveValue('ls');

  // Close terminal
  await page.locator('.win-btn.close').click();
  await expect(terminal).not.toBeVisible();

  // 3. Guestbook tab testing
  const guestbookTab = page.locator('.main-tabs button >> text="یادگاری"');
  await expect(guestbookTab).toBeVisible();
  await guestbookTab.click();

  // Verify Giscus container wrapper is rendered
  const giscusWrapper = page.locator('.giscus-wrapper');
  await expect(giscusWrapper).toBeVisible();
});
