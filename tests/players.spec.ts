import { expect, test } from '@playwright/test';

test('centres the add players dialog', async ({ page }) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Add players' }).click();

	const dialog = page.locator('dialog');
	const box = await dialog.boundingBox();
	const viewport = page.viewportSize();

	expect(box).not.toBeNull();
	expect(viewport).not.toBeNull();
	expect(Math.abs(box!.x + box!.width / 2 - viewport!.width / 2)).toBeLessThanOrEqual(1);
	expect(Math.abs(box!.y + box!.height / 2 - viewport!.height / 2)).toBeLessThanOrEqual(1);
});

test('imports valid players, keeps errors editable, and restores the roster', async ({ page }) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Add players' }).click();
	await page
		.getByLabel('Player list')
		.fill(
			['1. Anuv Love - Forward', '2. Femi - Defender, Midfielder', '3. Keeper - Goalkeeper'].join(
				'\n'
			)
		);

	await expect(page.getByText('2 players ready to add.')).toBeVisible();
	await expect(page.getByText('Line 3: Unknown position: Goalkeeper.')).toBeVisible();
	await page.getByRole('button', { name: /Add 2 imported players/ }).click();

	await expect(page.getByLabel('Player list')).toHaveValue('3. Keeper - Goalkeeper');
	await page.getByRole('button', { name: 'Close' }).click();
	await expect(page.getByLabel('Player 1')).toHaveValue('Anuv Love');
	await expect(page.getByLabel('Player 2')).toHaveValue('Femi');

	await page.reload();

	await expect(page.getByLabel('Player 1')).toHaveValue('Anuv Love');
	await expect(page.getByLabel('Player 2')).toHaveValue('Femi');
});

test('adds and edits a player, then starts over', async ({ page }) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Add players' }).click();
	await page.getByText('Add one manually', { exact: true }).click();
	const form = page.getByRole('form', { name: 'Add player manually' });

	await form.getByRole('button', { name: 'Add player' }).click();
	await expect(form.getByText('Enter a player name.')).toBeVisible();
	await expect(form.getByText('Choose at least one position.')).toBeVisible();

	await form.getByLabel('Player name').fill('  Mayor  ');
	await form.getByRole('button', { name: 'Midfielder' }).click();
	await form.getByRole('button', { name: 'Add player' }).click();

	await expect(page.getByLabel('Player 1')).toHaveValue('Mayor');
	await page.getByLabel('Player 1').fill('Mayor Junior');
	await page.getByRole('button', { name: 'Forward' }).last().click();
	await page.reload();

	await expect(page.getByLabel('Player 1')).toHaveValue('Mayor Junior');
	const rosterItem = page.getByRole('listitem').filter({ has: page.getByLabel('Player 1') });
	await expect(rosterItem.getByRole('button', { name: 'Forward' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);

	page.once('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: 'Start over' }).click();
	await expect(page.getByText('Add or import players to build your roster.')).toBeVisible();

	await page.reload();
	await expect(page.getByLabel('Player 1')).toHaveCount(0);
});
