import { POSITIONS } from './players';
import { seededRandom, shuffle } from './teams';
import type { Position } from './types/players.types';
import type { GeneratedTeam } from './types/teams.types';

export type DrawPick = {
	playerId: string;
	teamIndex: number;
	position: Position;
};

// Experiment: reveal already generated teams like a cup draw. Each position is a pot, drawn in
// order (defenders, midfielders, forwards). Within a pot, every team receives one player per
// round in a shuffled team order, so captains see their squads grow evenly.
export function getDrawOrder(teams: GeneratedTeam[], seed: string): DrawPick[] {
	const random = seededRandom(`${seed}:draw`);

	return POSITIONS.flatMap((position) => {
		const queues = teams.map((team, teamIndex) =>
			shuffle(
				team.players
					.filter((assigned) => assigned.assignedPosition === position)
					.map((assigned) => ({ playerId: assigned.playerId, teamIndex, position })),
				random
			)
		);
		const picks: DrawPick[] = [];

		while (queues.some((queue) => queue.length)) {
			const round = shuffle(
				queues.filter((queue) => queue.length),
				random
			);
			for (const queue of round) picks.push(queue.shift()!);
		}

		return picks;
	});
}
