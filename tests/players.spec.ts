import { expect, test } from '@playwright/test';

test('generates teams and restores them after reload', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByRole('button', { name: 'Team setup' })).toBeDisabled();
	await page.getByRole('button', { name: 'Import players' }).click();
	await page
		.getByLabel('Player list')
		.fill(Array.from({ length: 31 }, (_, index) => `Player ${index + 1} - Midfielder`).join('\n'));
	await page.getByRole('button', { name: 'Import', exact: true }).click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await expect(page.getByRole('heading', { name: 'Set up teams' })).toBeVisible();
	const eightAside = page.getByRole('button', {
		name: /8v8: 4 teams, 7 to 8 players each/
	});
	await eightAside.click();
	await expect(eightAside).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('button', { name: 'Generate teams' }).click();
	await expect(page.getByRole('heading', { name: 'Generated teams' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Team A' })).toBeVisible();
	await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {
		origin: 'http://127.0.0.1:4173'
	});
	await page.getByRole('button', { name: 'Copy all' }).click();
	await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
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
	await page.getByRole('button', { name: 'Import players' }).click();
	await page
		.getByLabel('Player list')
		.fill(
			['1. Anuv Love - Forward', '2. Femi - Defender, Midfielder', '3. Keeper - Goalkeeper'].join(
				'\n'
			)
		);

	await expect(page.getByText('2 players ready to add.')).toBeVisible();
	await expect(page.getByText('Line 3: Unknown position: Goalkeeper.')).toBeVisible();
	await page.getByRole('button', { name: 'Import', exact: true }).click();

	await expect(page.getByLabel('Player list')).toHaveValue('3. Keeper - Goalkeeper');
	await page.getByRole('button', { name: 'Cancel' }).click();
	await expect(page.getByLabel('Player 1')).toHaveValue('Anuv Love');
	await expect(page.getByLabel('Player 2')).toHaveValue('Femi');

	await page.reload();

	await expect(page.getByLabel('Player 1')).toHaveValue('Anuv Love');
	await expect(page.getByLabel('Player 2')).toHaveValue('Femi');
});

test('adds and edits a player, then starts over', async ({ page }) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Add manually' }).click();
	const form = page.getByRole('form', { name: 'Add player manually' });
	const addPlayer = form.getByRole('button', { name: 'Add player' });

	await expect(addPlayer).toBeDisabled();
	await form.getByLabel('Player name').fill('   ');
	await expect(addPlayer).toBeDisabled();

	await form.getByLabel('Player name').fill('  Mayor  ');
	await expect(addPlayer).toBeDisabled();
	await form.getByRole('checkbox', { name: 'Midfielder' }).check();
	await expect(addPlayer).toBeEnabled();
	await addPlayer.click();

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
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect(page.getByText('Add or import players to build your roster.')).toBeVisible();

	await page.reload();
	await expect(page.getByLabel('Player 1')).toHaveCount(0);
});

test('checks in players, prioritises them in the first two teams, and clears check-ins', async ({
	page
}) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Import players' }).click();
	await page
		.getByLabel('Player list')
		.fill(Array.from({ length: 12 }, (_, index) => `Player ${index + 1} - Midfielder`).join('\n'));
	await page.getByRole('button', { name: 'Import', exact: true }).click();

	const roster = page.locator('section[aria-labelledby="roster-heading"]').getByRole('listitem');
	for (let index = 0; index < 8; index++) {
		await roster
			.nth(index)
			.getByRole('button', { name: /^Check in/ })
			.click();
	}
	await page.reload();
	await expect(page.getByRole('button', { name: /^Uncheck/ })).toHaveCount(8);

	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: /4v4: 3 teams, 4 players each/ }).click();
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

test('keeps a generated roster edit unchanged when confirmation is cancelled', async ({ page }) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Import players' }).click();
	await page
		.getByLabel('Player list')
		.fill(Array.from({ length: 8 }, (_, index) => `Player ${index + 1} - Midfielder`).join('\n'));
	await page.getByRole('button', { name: 'Import', exact: true }).click();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: /4v4: 2 teams, 4 players each/ }).click();
	await page.getByRole('button', { name: 'Generate teams' }).click();
	await page.getByRole('button', { name: 'Players', exact: true }).click();

	const player = page.getByRole('textbox', { name: 'Player 1' });
	page.once('dialog', (dialog) => dialog.dismiss());
	await player.fill('Changed name');

	await expect(player).toHaveValue('Player 1');
	await expect(page.getByRole('button', { name: 'Teams', exact: true })).toBeEnabled();
});
