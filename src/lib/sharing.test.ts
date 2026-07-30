import { describe, expect, it } from 'vitest';
import { formatTeam, formatTeams } from './sharing';
import type { Player } from './types/players.types';
import type { GeneratedTeam } from './types/teams.types';

const players: Player[] = [
	{ id: '1', name: 'Sam', eligiblePositions: ['DEFENDER'] },
	{ id: '2', name: 'Sam', eligiblePositions: ['MIDFIELDER'] },
	{ id: '3', name: 'Tayo', eligiblePositions: ['FORWARD'] },
	{ id: '4', name: 'Femi', eligiblePositions: ['DEFENDER'] }
];

const teams: GeneratedTeam[] = [
	{
		id: 'team-1',
		players: [
			{ playerId: '1', assignedPosition: 'DEFENDER' },
			{ playerId: '2', assignedPosition: 'MIDFIELDER' },
			{ playerId: '3', assignedPosition: 'FORWARD' }
		]
	},
	{
		id: 'team-2',
		players: [{ playerId: '4', assignedPosition: 'DEFENDER' }]
	}
];

describe('team sharing', () => {
	it('formats a team with grouped, numbered players', () => {
		expect(formatTeam(players, teams[0], 0)).toBe(`TEAM A — 1-1-1

Defenders
1. Sam

Midfielders
2. Sam

Forwards
3. Tayo`);
	});

	it('formats several unequal teams', () => {
		expect(formatTeams(players, teams)).toContain('TEAM B — 1-0-0');
	});
});
