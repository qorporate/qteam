import { describe, expect, it } from 'vitest';
import {
	formatFormation,
	generateTeams,
	getGenerationIssues,
	getTeamSizes,
	getValidTeamCounts,
	isValidTeamCount,
	swapPlayers
} from './teams';
import type { Player } from './types/players.types';

describe('team sizes', () => {
	it.each([
		{ players: 8, teams: 2, sizes: [4, 4], valid: true },
		{ players: 31, teams: 4, sizes: [8, 8, 8, 7], valid: true },
		{ players: 32, teams: 3, sizes: [11, 11, 10], valid: false },
		{ players: 32, teams: 8, sizes: [4, 4, 4, 4, 4, 4, 4, 4], valid: true },
		{ players: 32, teams: 9, sizes: [4, 4, 4, 4, 4, 3, 3, 3, 3], valid: false }
	])('calculates $players players across $teams teams', ({ players, teams, sizes, valid }) => {
		expect(getTeamSizes(players, teams)).toEqual(sizes);
		expect(isValidTeamCount(players, teams)).toBe(valid);
	});

	it('offers only valid options for indivisible rosters', () => {
		expect(getValidTeamCounts(25)).toEqual([3, 4, 5, 6]);
		expect(getValidTeamCounts(29)).toEqual([3, 4, 5, 6, 7]);
		expect(getValidTeamCounts(31)).toEqual([4, 5, 6, 7]);
	});

	it('rejects non-positive and fractional inputs', () => {
		expect(getTeamSizes(0, 2)).toEqual([]);
		expect(getTeamSizes(8, 1.5)).toEqual([]);
		expect(isValidTeamCount(8, 1)).toBe(false);
	});
});

describe('team generation', () => {
	const roster: Player[] = [
		{ id: 'd', name: 'Defender', eligiblePositions: ['DEFENDER'] },
		{ id: 'm', name: 'Midfielder', eligiblePositions: ['MIDFIELDER'] },
		{ id: 'f', name: 'Forward', eligiblePositions: ['FORWARD'] },
		{ id: 'dm', name: 'Defender Midfielder', eligiblePositions: ['DEFENDER', 'MIDFIELDER'] },
		{ id: 'df', name: 'Defender Forward', eligiblePositions: ['DEFENDER', 'FORWARD'] },
		{ id: 'mf', name: 'Midfielder Forward', eligiblePositions: ['MIDFIELDER', 'FORWARD'] },
		{
			id: 'dmf',
			name: 'Flexible',
			eligiblePositions: ['DEFENDER', 'MIDFIELDER', 'FORWARD']
		},
		{ id: 'm2', name: 'Second Midfielder', eligiblePositions: ['MIDFIELDER'] }
	];

	it('satisfies every hard rule across all eligible-position combinations', () => {
		const result = generateTeams({ players: roster, teamCount: 2, seed: 'fixture' });

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(getGenerationIssues(roster, 2, result.teams)).toEqual([]);
		expect(formatFormation(result.teams[0])).toMatch(/^\d+-\d+-\d+$/);
	});

	it('is deterministic and does not mutate its input', () => {
		const before = structuredClone(roster);
		const input = { players: roster, teamCount: 2, seed: 'repeatable' };

		expect(generateTeams(input)).toEqual(generateTeams(input));
		expect(roster).toEqual(before);
	});

	it('uses midfielders before forwards to fill missing defender slots', () => {
		const players: Player[] = [
			...Array.from({ length: 2 }, (_, index): Player => ({
				id: `defender-${index}`,
				name: `Defender ${index}`,
				eligiblePositions: ['DEFENDER']
			})),
			...Array.from({ length: 10 }, (_, index): Player => ({
				id: `midfielder-${index}`,
				name: `Midfielder ${index}`,
				eligiblePositions: ['MIDFIELDER']
			})),
			...Array.from({ length: 4 }, (_, index): Player => ({
				id: `forward-${index}`,
				name: `Forward ${index}`,
				eligiblePositions: ['FORWARD']
			}))
		];
		const result = generateTeams({ players, teamCount: 2, seed: 'defence' });

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.teams.map(formatFormation)).toEqual(['3-3-2', '3-3-2']);
		expect(
			result.teams
				.flatMap((team) => team.players)
				.filter((player) => player.assignedPosition === 'DEFENDER').length
		).toBe(6);
		expect(
			result.teams
				.flatMap((team) => team.players)
				.filter(
					(player) =>
						player.assignedPosition === 'DEFENDER' && player.playerId.startsWith('forward-')
				)
		).toHaveLength(0);
	});

	it('returns honest coverage warnings for scarce positions', () => {
		const scarceRoster: Player[] = roster.map((player) => ({
			...player,
			eligiblePositions:
				player.id === 'd'
					? (['DEFENDER'] as Player['eligiblePositions'])
					: player.eligiblePositions.filter((position) => position !== 'DEFENDER')
		}));
		const result = generateTeams({
			players: scarceRoster,
			teamCount: 2,
			seed: 'scarce'
		});

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.warnings).toContain('Only 1 defender was available for 2 teams.');
	});

	it('swaps players across teams and reports added coverage warnings', () => {
		const players: Player[] = [
			{ id: 'd1', name: 'Defender 1', eligiblePositions: ['DEFENDER'] },
			{ id: 'd2', name: 'Defender 2', eligiblePositions: ['DEFENDER'] },
			{ id: 'd3', name: 'Defender 3', eligiblePositions: ['DEFENDER'] },
			{ id: 'm1', name: 'Midfielder 1', eligiblePositions: ['MIDFIELDER'] },
			{ id: 'm2', name: 'Midfielder 2', eligiblePositions: ['MIDFIELDER'] },
			{ id: 'm3', name: 'Midfielder 3', eligiblePositions: ['MIDFIELDER'] },
			{ id: 'f1', name: 'Forward 1', eligiblePositions: ['FORWARD'] },
			{ id: 'f2', name: 'Forward 2', eligiblePositions: ['FORWARD'] }
		];
		const teams = [
			{
				id: 'team-1',
				players: [
					{ playerId: 'd1', assignedPosition: 'DEFENDER' as const },
					{ playerId: 'm1', assignedPosition: 'MIDFIELDER' as const },
					{ playerId: 'm2', assignedPosition: 'MIDFIELDER' as const },
					{ playerId: 'f1', assignedPosition: 'FORWARD' as const }
				]
			},
			{
				id: 'team-2',
				players: [
					{ playerId: 'd2', assignedPosition: 'DEFENDER' as const },
					{ playerId: 'd3', assignedPosition: 'DEFENDER' as const },
					{ playerId: 'm3', assignedPosition: 'MIDFIELDER' as const },
					{ playerId: 'f2', assignedPosition: 'FORWARD' as const }
				]
			}
		];
		const result = swapPlayers(players, teams, 'd1', 'm3');

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.teams.map((team) => team.players)).toHaveLength(2);
		expect(result.teams[0].players).toContainEqual({
			playerId: 'm3',
			assignedPosition: 'MIDFIELDER'
		});
		expect(result.teams[1].players).toContainEqual({
			playerId: 'd1',
			assignedPosition: 'DEFENDER'
		});
		expect(result.addedWarnings).toContain('Team A has no assigned defender.');
	});

	it('rejects same-team and unknown-player swaps', () => {
		const generated = generateTeams({ players: roster, teamCount: 2, seed: 'swaps' });
		expect(generated.ok).toBe(true);
		if (!generated.ok) return;

		expect(
			swapPlayers(
				roster,
				generated.teams,
				generated.teams[0].players[0].playerId,
				generated.teams[0].players[1].playerId
			)
		).toEqual({ ok: false, issues: ['Choose a player on another team.'] });
		expect(
			swapPlayers(roster, generated.teams, 'unknown', generated.teams[1].players[0].playerId)
		).toEqual({
			ok: false,
			issues: ['Choose two players in the teams.']
		});
	});

	it('rejects an invalid generation request', () => {
		expect(generateTeams({ players: roster, teamCount: 3, seed: 'invalid' })).toEqual({
			ok: false,
			issues: ['Add a valid roster and team count before generating.']
		});
	});
});
