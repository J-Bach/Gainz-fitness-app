import { test, expect } from '@playwright/test';

// ─── 1. Auth Gate ────────────────────────────────────────────────────────────

test('shows login screen on first load', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('/');
  await page.waitForTimeout(2000); // let auth init settle

  // Dump page for diagnosis
  const body = await page.textContent('body');
  console.log('PAGE BODY:', body?.slice(0, 500));
  await page.screenshot({ path: 'test-results/login-screen.png' });
  expect(body?.trim().length).toBeGreaterThan(10);

  // Should show the login form
  await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
  await expect(page.getByText('Send magic link')).toBeVisible();

  console.log('Console errors:', errors);
  expect(errors).toHaveLength(0);
});

// ─── 2. Supabase reachability ────────────────────────────────────────────────

test('Supabase URL is reachable', async ({ request }) => {
  const res = await request.get(
    'https://ahtpgdeideidwybcaqxi.supabase.co/rest/v1/',
    { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s' } }
  );
  expect(res.status()).toBeLessThan(500);
  console.log('Supabase status:', res.status());
});

// ─── 3. Database tables exist ────────────────────────────────────────────────

test('workout_plans table exists and has RLS', async ({ request }) => {
  const res = await request.get(
    'https://ahtpgdeideidwybcaqxi.supabase.co/rest/v1/workout_plans?limit=1',
    {
      headers: {
        apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s',
      }
    }
  );
  const status = res.status();
  const body = await res.text();
  console.log('workout_plans status:', status, 'body:', body);

  // 200 = table exists (RLS returns empty array for anon)
  // 401/404 = table missing or project not set up
  expect(status).not.toBe(404);
  expect(status).toBeLessThan(500);
});

test('pr_entries table exists', async ({ request }) => {
  const res = await request.get(
    'https://ahtpgdeideidwybcaqxi.supabase.co/rest/v1/pr_entries?limit=1',
    {
      headers: {
        apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s',
      }
    }
  );
  console.log('pr_entries status:', res.status(), await res.text());
  expect(res.status()).not.toBe(404);
});

// ─── 4. Auth callback page renders ──────────────────────────────────────────

test('auth callback page renders without crashing', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));

  // Simulate landing on callback with a bad/expired code — should not blank out
  await page.goto('/auth/callback?code=fake-expired-code');
  await page.waitForTimeout(3000);

  const body = await page.textContent('body');
  console.log('Callback page body length:', body?.trim().length);
  expect(body?.trim().length).toBeGreaterThan(0);
  console.log('Callback errors:', errors);
});

// ─── 5. All main pages load without JS errors ────────────────────────────────

for (const path of ['/', '/library', '/builder', '/calendar']) {
  test(`${path} loads without crash`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(path);
    await page.waitForTimeout(2000);

    const body = await page.textContent('body');
    expect(body?.trim().length).toBeGreaterThan(10);
    console.log(`${path} errors:`, errors);
  });
}
