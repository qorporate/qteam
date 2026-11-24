import { describe, expect, it } from 'vitest';
import { getDrawOrder } from './draw';
import type { GeneratedTeam } from './types/teams.types';

const teams: GeneratedTeam[] = [
	{
		id: 'team-1',
		players: [
			{ playerId: 'a1', assignedPosition: 'DEFENDER' },
			{ playerId: 'a2', assignedPosition: 'DEFENDER' },
			{ playerId: 'a3', assignedPosition: 'MIDFIELDER' },
			{ playerId: 'a4', assignedPosition: 'FORWARD' }
		]
	},
	{
		id: 'team-2',
		players: [
			{ playerId: 'b1', assignedPosition: 'DEFENDER' },
			{ playerId: 'b2', assignedPosition: 'MIDFIELDER' },
			{ playerId: 'b3', assignedPosition: 'MIDFIELDER' },
			{ playerId: 'b4', assignedPosition: 'FORWARD' }
		]
	}
];

describe('draw order', () => {
	it('reveals every player once, on their own team and position', () => {
		const order = getDrawOrder(teams, 'seed');

		expect(order).toHaveLength(8);
		expect(new Set(order.map((pick) => pick.playerId)).size).toBe(8);
		for (const pick of order) {
			expect(teams[pick.teamIndex].players).toContainEqual({
				playerId: pick.playerId,
				assignedPosition: pick.position
			});
		}
	});

	it('draws the defender pot, then midfielders, then forwards', () => {
		expect(getDrawOrder(teams, 'seed').map((pick) => pick.position)).toEqual([
			'DEFENDER',
			'DEFENDER',
			'DEFENDER',
			'MIDFIELDER',
			'MIDFIELDER',
			'MIDFIELDER',
			'FORWARD',
			'FORWARD'
		]);
	});

	it('gives each team one player per round within a pot', () => {
		for (const seed of ['one', 'two', 'three', 'four']) {
			const defenders = getDrawOrder(teams, seed).filter((pick) => pick.position === 'DEFENDER');
			// Both teams receive a defender before Team A receives its second.
			expect(new Set(defenders.slice(0, 2).map((pick) => pick.teamIndex))).toEqual(new Set([0, 1]));
		}
	});

	it('is reproducible from the seed', () => {
		expect(getDrawOrder(teams, 'seed')).toEqual(getDrawOrder(teams, 'seed'));
	});
});
