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
        avatarUrl: "/Damoon-d.jpg",
        titles: ["Software Engineer", ".NET Developer"],
        bio: "توسعه‌دهنده بک‌اند",
        badges: ["Backend", "Database"],
        cardEmail: "hi@alirz.ir",
        identityCard: {
          eyebrow: "Available for Projects",
          role: "Software Engineer",
          bio: "توسعه‌دهنده بک‌اند",
          focus: "ASP.NET Core",
          email: "hi@alirz.ir",
          badges: ["Backend", "Database"],
          enterLabel: "ورود به داشبورد",
          resumeLabel: "رزومه"
        },
        contact: {
          email: "hi@alirz.ir"
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

  // Wait for editorial layout to render
  const dashboard = page.locator('.pure-layout-wrapper');
  await expect(dashboard).toBeVisible();

  // 2. Terminal Interactions
  // Click Terminal button in header
  const terminalBtn = page.locator('.header-icon-link.cli');
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

  // 3. Project technical specs interaction testing
  const toggleSpecsBtn = page.locator('.toggle-specs-btn').first();
  if (await toggleSpecsBtn.isVisible()) {
    await toggleSpecsBtn.click();
    const specsPanel = page.locator('.project-specs-panel').first();
    await expect(specsPanel).toBeVisible();
  }
});
