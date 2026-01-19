import { test, expect } from '@playwright/test';

test('has title and loads dashboard', async ({ page }) => {
    await page.goto('/');

    // Expect a title "SaaS POS" or similar in the document (checking sidebar)
    await expect(page.locator('text=SaaS POS')).toBeVisible();

    // Check if categories are visible
    await expect(page.getByText('Coffee')).toBeVisible();

    // Verify Cart starts empty
    await expect(page.locator('text=Cart is empty')).toBeVisible();
});

test('can add item to cart', async ({ page }) => {
    await page.goto('/');

    // Wait for products to load (seeded from RxDB)
    // This might take a moment on first load
    await expect(page.getByText('Espresso')).toBeVisible({ timeout: 10000 });

    // Click on "Espresso" product
    await page.getByText('Espresso').click();

    // Check if it appears in cart
    // Check for "Espresso" in the cart section
    await expect(page.locator('text=Current Order').locator('xpath=..').locator('xpath=..').getByText('Espresso', { exact: true }).first()).toBeVisible();

    // Check price update
    await expect(page.getByText('$2.50')).toBeVisible();
});
