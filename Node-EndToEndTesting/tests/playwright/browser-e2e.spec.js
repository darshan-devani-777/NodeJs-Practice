const { test, expect } = require('@playwright/test');

test.describe('User Management Frontend', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Node.js E2E Testing');

    await expect(page.locator('h1')).toContainText('Node.js E2E Testing');
  });

  test('should have user creation form', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#createUserForm')).toBeVisible();

    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    await expect(page.locator('#createBtn')).toBeVisible();
    await expect(page.locator('#createBtn')).toContainText('Create User');
  });

  test('should have login form', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#loginForm')).toBeVisible();

    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();

    await expect(page.locator('#loginBtn')).toBeVisible();
    await expect(page.locator('#loginBtn')).toContainText('Login');
  });

  test('should have users list section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h2').filter({ hasText: 'Users List' })).toBeVisible();

    await expect(page.locator('#loadUsersBtn')).toBeVisible();
    await expect(page.locator('#loadUsersBtn')).toContainText('Load Users');

    await expect(page.locator('#userList')).toBeAttached();
  });

  test('should be able to click load users button', async ({ page }) => {
    await page.goto('/');

    await page.locator('#loadUsersBtn').click();

    await page.waitForTimeout(1000);

    await expect(page.locator('#loadUsersBtn')).toBeVisible();
    await expect(page.locator('#loadUsersBtn')).toContainText('Load Users');
  });

  test('should allow filling create user form', async ({ page }) => {
    await page.goto('/');

    await page.type('#firstName', 'John', { delay: 200 });
    await page.type('#lastName', 'Doe', { delay: 200 });
    await page.type('#email', 'john.doe@example.com', { delay: 150 });
    await page.type('#password', 'password123', { delay: 150 });


    await expect(page.locator('#firstName')).toHaveValue('John');
    await expect(page.locator('#lastName')).toHaveValue('Doe');
    await expect(page.locator('#email')).toHaveValue('john.doe@example.com');
    await expect(page.locator('#password')).toHaveValue('password123');
  });

  test('should allow filling login form', async ({ page }) => {
    await page.goto('/');

    await page.type('#loginEmail', 'test@example.com', { delay: 150 });
    await page.type('#loginPassword', 'testpass123', { delay: 150 });


    await expect(page.locator('#loginEmail')).toHaveValue('test@example.com');
    await expect(page.locator('#loginPassword')).toHaveValue('testpass123');
  });
});
