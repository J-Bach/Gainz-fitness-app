# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integration.spec.ts >> shows login screen on first load
- Location: tests/integration.spec.ts:5:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder('your@email.com')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByPlaceholder('your@email.com')

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // ─── 1. Auth Gate ────────────────────────────────────────────────────────────
  4   | 
  5   | test('shows login screen on first load', async ({ page }) => {
  6   |   const errors: string[] = [];
  7   |   page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  8   |   page.on('pageerror', err => errors.push(err.message));
  9   | 
  10  |   await page.goto('/');
  11  |   await page.waitForTimeout(2000); // let auth init settle
  12  | 
  13  |   // Dump page for diagnosis
  14  |   const body = await page.textContent('body');
  15  |   console.log('PAGE BODY:', body?.slice(0, 500));
  16  |   await page.screenshot({ path: 'test-results/login-screen.png' });
  17  |   expect(body?.trim().length).toBeGreaterThan(10);
  18  | 
  19  |   // Should show the login form
> 20  |   await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
      |                                                         ^ Error: expect(locator).toBeVisible() failed
  21  |   await expect(page.getByText('Send magic link')).toBeVisible();
  22  | 
  23  |   console.log('Console errors:', errors);
  24  |   expect(errors).toHaveLength(0);
  25  | });
  26  | 
  27  | // ─── 2. Supabase reachability ────────────────────────────────────────────────
  28  | 
  29  | test('Supabase URL is reachable', async ({ request }) => {
  30  |   const res = await request.get(
  31  |     'https://ahtpgdeideidwybcaqxi.supabase.co/rest/v1/',
  32  |     { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s' } }
  33  |   );
  34  |   expect(res.status()).toBeLessThan(500);
  35  |   console.log('Supabase status:', res.status());
  36  | });
  37  | 
  38  | // ─── 3. Database tables exist ────────────────────────────────────────────────
  39  | 
  40  | test('workout_plans table exists and has RLS', async ({ request }) => {
  41  |   const res = await request.get(
  42  |     'https://ahtpgdeideidwybcaqxi.supabase.co/rest/v1/workout_plans?limit=1',
  43  |     {
  44  |       headers: {
  45  |         apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s',
  46  |         Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s',
  47  |       }
  48  |     }
  49  |   );
  50  |   const status = res.status();
  51  |   const body = await res.text();
  52  |   console.log('workout_plans status:', status, 'body:', body);
  53  | 
  54  |   // 200 = table exists (RLS returns empty array for anon)
  55  |   // 401/404 = table missing or project not set up
  56  |   expect(status).not.toBe(404);
  57  |   expect(status).toBeLessThan(500);
  58  | });
  59  | 
  60  | test('pr_entries table exists', async ({ request }) => {
  61  |   const res = await request.get(
  62  |     'https://ahtpgdeideidwybcaqxi.supabase.co/rest/v1/pr_entries?limit=1',
  63  |     {
  64  |       headers: {
  65  |         apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s',
  66  |         Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s',
  67  |       }
  68  |     }
  69  |   );
  70  |   console.log('pr_entries status:', res.status(), await res.text());
  71  |   expect(res.status()).not.toBe(404);
  72  | });
  73  | 
  74  | // ─── 4. Auth callback page renders ──────────────────────────────────────────
  75  | 
  76  | test('auth callback page renders without crashing', async ({ page }) => {
  77  |   const errors: string[] = [];
  78  |   page.on('pageerror', err => errors.push(err.message));
  79  | 
  80  |   // Simulate landing on callback with a bad/expired code — should not blank out
  81  |   await page.goto('/auth/callback?code=fake-expired-code');
  82  |   await page.waitForTimeout(3000);
  83  | 
  84  |   const body = await page.textContent('body');
  85  |   console.log('Callback page body length:', body?.trim().length);
  86  |   expect(body?.trim().length).toBeGreaterThan(0);
  87  |   console.log('Callback errors:', errors);
  88  | });
  89  | 
  90  | // ─── 5. All main pages load without JS errors ────────────────────────────────
  91  | 
  92  | for (const path of ['/', '/library', '/builder', '/calendar']) {
  93  |   test(`${path} loads without crash`, async ({ page }) => {
  94  |     const errors: string[] = [];
  95  |     page.on('pageerror', err => errors.push(err.message));
  96  | 
  97  |     await page.goto(path);
  98  |     await page.waitForTimeout(2000);
  99  | 
  100 |     const body = await page.textContent('body');
  101 |     expect(body?.trim().length).toBeGreaterThan(10);
  102 |     console.log(`${path} errors:`, errors);
  103 |   });
  104 | }
  105 | 
```