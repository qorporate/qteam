import { expect, test } from '@playwright/test';

test('reveals generated teams as a position-pot draw when the experiment is on', async ({
	page
}) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Import players' }).click();
	await page
		.getByLabel('Player list')
		.fill(
			[
				...Array.from({ length: 3 }, (_, index) => `Def ${index + 1} - Defender`),
				...Array.from({ length: 3 }, (_, index) => `Mid ${index + 1} - Midfielder`),
				...Array.from({ length: 2 }, (_, index) => `Fwd ${index + 1} - Forward`)
			].join('\n')
		);
	await page.getByRole('button', { name: /^Import \d+ players?$/ }).click();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: /4v4: 2 teams, 4 players each/ }).click();

	const toggle = page.getByRole('switch', { name: 'Reveal as a draw' });
	await expect(toggle).not.toBeChecked();
	await page.getByText('Reveal as a draw').click();
	await expect(toggle).toBeChecked();
	await page.getByRole('button', { name: 'Generate teams' }).click();

	await expect(page.getByRole('heading', { name: 'Team draw' })).toBeVisible();
	await expect(page.getByText('0 of 8 drawn')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Copy all' })).toBeHidden();

	await page.getByRole('button', { name: 'Draw next' }).click();
	await expect(page.getByText('1 of 8 drawn')).toBeVisible();
	await expect(page.getByRole('region', { name: 'Latest pick' })).toContainText(/Def \d/);
	await expect(page.getByRole('region', { name: 'Latest pick' })).toContainText('Defender to');

	await page.getByRole('button', { name: 'Show all' }).click();
	await expect(page.getByText('8 of 8 drawn')).toBeVisible();
	await page.getByRole('button', { name: 'See teams' }).click();
	await expect(page.getByRole('region', { name: 'Generated team summary' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Copy all' })).toBeVisible();

	await page.reload();
	await page.getByRole('button', { name: 'Team setup' }).click();
	await expect(page.getByRole('switch', { name: 'Reveal as a draw' })).toBeChecked();
});
