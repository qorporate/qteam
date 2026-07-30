import { POSITION_LABELS, POSITIONS } from './players';
import { formatFormation, teamName } from './teams';
import type { Player } from './types/players.types';
import type { GeneratedTeam } from './types/teams.types';

export function formatTeam(players: Player[], team: GeneratedTeam, index: number): string {
	const playersById = new Map(players.map((player) => [player.id, player]));
	let number = 1;
	const groups = POSITIONS.flatMap((position) => {
		const assigned = team.players.filter((player) => player.assignedPosition === position);
		if (!assigned.length) return [];
		return `${POSITION_LABELS[position]}s\n${assigned.map((assignedPlayer) => `${number++}. ${playersById.get(assignedPlayer.playerId)!.name}`).join('\n')}`;
	});

	return [`TEAM ${teamName(index)} — ${formatFormation(team)}`, ...groups].join('\n\n');
}

export function formatTeams(players: Player[], teams: GeneratedTeam[]): string {
	return teams.map((team, index) => formatTeam(players, team, index)).join('\n\n');
}
