import { expect, test } from '@playwright/test';

test('imports valid players, keeps errors editable, and restores the roster', async ({ page }) => {
	await page.goto('./');
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

	await expect(page.getByLabel('Player 1')).toHaveValue('Anuv Love');
	await expect(page.getByLabel('Player 2')).toHaveValue('Femi');
	await expect(page.getByLabel('Player list')).toHaveValue('3. Keeper - Goalkeeper');

	await page.reload();

	await expect(page.getByLabel('Player 1')).toHaveValue('Anuv Love');
	await expect(page.getByLabel('Player 2')).toHaveValue('Femi');
});

test('adds and edits a player, then starts over', async ({ page }) => {
	await page.goto('./');
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
