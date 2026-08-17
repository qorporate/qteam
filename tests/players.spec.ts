import { expect, test } from '@playwright/test';

test('generates teams and restores them after reload', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByRole('button', { name: 'Team setup' })).toBeDisabled();
	await page.getByRole('button', { name: 'Add players' }).click();
	await page
		.getByLabel('Player list')
		.fill(Array.from({ length: 31 }, (_, index) => `Player ${index + 1} - Midfielder`).join('\n'));
	await page.getByRole('button', { name: /Add 31 imported players/ }).click();
	await page.getByRole('button', { name: 'Choose teams' }).click();

	await expect(page.getByRole('heading', { name: 'Set up teams' })).toBeVisible();
	await expect(page.getByRole('button', { name: /^3 teams/ })).toHaveCount(0);
	const fourTeams = page.getByRole('button', { name: /4 teams.*8, 8, 8, 7 players/ });
	await fourTeams.click();
	await expect(fourTeams).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('button', { name: 'Generate teams' }).click();
	await expect(page.getByRole('heading', { name: 'Generated teams' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Team A' })).toBeVisible();
	await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {
		origin: 'http://127.0.0.1:4173'
	});
	await page.getByRole('button', { name: 'Copy all' }).click();
	await expect(page.getByText('All teams copied.')).toBeVisible();
	const teamA = page.getByRole('heading', { name: 'Team A' }).locator('xpath=ancestor::section');
	const teamB = page.getByRole('heading', { name: 'Team B' }).locator('xpath=ancestor::section');
	const playerFromTeamB = (
		await teamB
			.locator('button')
			.filter({ hasText: /^\d+\./ })
			.first()
			.textContent()
	)?.replace(/^\d+\.\s*/, '');
	await teamA
		.locator('button')
		.filter({ hasText: /^\d+\./ })
		.first()
		.click();
	await teamB
		.locator('button')
		.filter({ hasText: /^\d+\./ })
		.first()
		.click();
	await expect(page.getByText('Swapped players.')).toBeVisible();
	await expect(teamA).toContainText(playerFromTeamB ?? '');

	await page.reload();

	await expect(page).toHaveTitle('Teams · QTeam');
	await expect(page.getByRole('heading', { name: 'Team A' })).toBeVisible();
	await expect(
		page.getByRole('heading', { name: 'Team A' }).locator('xpath=ancestor::section')
	).toContainText(playerFromTeamB ?? '');
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

test('checks in players, prioritises them in the first two teams, and clears check-ins', async ({
	page
}) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Add players' }).click();
	await page
		.getByLabel('Player list')
		.fill(Array.from({ length: 12 }, (_, index) => `Player ${index + 1} - Midfielder`).join('\n'));
	await page.getByRole('button', { name: /Add 12 imported players/ }).click();

	const roster = page.locator('section[aria-labelledby="roster-heading"]').getByRole('listitem');
	for (let index = 0; index < 8; index++) {
		await roster
			.nth(index)
			.getByRole('button', { name: /^Check in/ })
			.click();
	}
	await page.reload();
	await expect(page.getByRole('button', { name: /^Uncheck/ })).toHaveCount(8);

	await page.getByRole('button', { name: 'Choose teams' }).click();
	await page.getByRole('button', { name: /3 teams.*4, 4, 4 players/ }).click();
	await page.getByRole('button', { name: 'Generate teams' }).click();

	const teamA = page.getByRole('heading', { name: 'Team A' }).locator('xpath=ancestor::section');
	const teamB = page.getByRole('heading', { name: 'Team B' }).locator('xpath=ancestor::section');
	const teamC = page.getByRole('heading', { name: 'Team C' }).locator('xpath=ancestor::section');
	const firstTwoText = `${await teamA.textContent()} ${await teamB.textContent()}`;
	for (let index = 1; index <= 8; index++) {
		expect(firstTwoText).toContain(`Player ${index}`);
	}
	for (let index = 1; index <= 8; index++) {
		expect(await teamC.getByRole('button', { name: new RegExp(`Player ${index}$`) }).count()).toBe(
			0
		);
	}
	await expect(teamA.getByRole('img', { name: 'Checked in' })).toHaveCount(4);
	await expect(teamB.getByRole('img', { name: 'Checked in' })).toHaveCount(4);
	await expect(teamC.getByRole('img', { name: 'Checked in' })).toHaveCount(0);

	await page.getByRole('button', { name: 'Players', exact: true }).click();
	page.once('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: 'Clear check-ins' }).click();
	await expect(page.getByRole('button', { name: /^Uncheck/ })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Teams', exact: true })).toBeDisabled();
});
