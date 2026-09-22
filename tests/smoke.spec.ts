import { expect, test } from '@playwright/test';

test('the built application loads', async ({ page }) => {
	await page.goto('./');

	await expect(page).toHaveURL(/\/qteam\/$/);
	await expect(page).toHaveTitle('Players · QTeam');
	await expect(page.getByRole('heading', { name: 'How To Use' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Team creation' })).toBeVisible();
});
