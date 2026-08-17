import { POSITIONS, getRosterIssues, isPosition } from './players';
import type { Player, Position } from './types/players.types';
import type {
	GenerateTeamsInput,
	GenerateTeamsResult,
	GeneratedTeam,
	SwapResult
} from './types/teams.types';

const preferredFormations: Record<number, Record<Position, number>> = {
	4: { DEFENDER: 1, MIDFIELDER: 2, FORWARD: 1 },
	5: { DEFENDER: 2, MIDFIELDER: 2, FORWARD: 1 },
	6: { DEFENDER: 2, MIDFIELDER: 2, FORWARD: 2 },
	7: { DEFENDER: 3, MIDFIELDER: 2, FORWARD: 2 },
	8: { DEFENDER: 3, MIDFIELDER: 3, FORWARD: 2 },
	9: { DEFENDER: 3, MIDFIELDER: 3, FORWARD: 3 },
	10: { DEFENDER: 4, MIDFIELDER: 3, FORWARD: 3 }
};

export function getTeamSizes(playerCount: number, teamCount: number): number[] {
	if (
		!Number.isInteger(playerCount) ||
		!Number.isInteger(teamCount) ||
		playerCount < 1 ||
		teamCount < 1
	) {
		return [];
	}

	const baseSize = Math.floor(playerCount / teamCount);
	const largerTeamCount = playerCount % teamCount;

	return Array.from(
		{ length: teamCount },
		(_, index) => baseSize + (index < largerTeamCount ? 1 : 0)
	);
}

export function isValidTeamCount(playerCount: number, teamCount: number): boolean {
	const sizes = getTeamSizes(playerCount, teamCount);

	return (
		teamCount >= 2 &&
		sizes.length === teamCount &&
		Math.min(...sizes) >= 4 &&
		Math.max(...sizes) <= 10
	);
}

export function getValidTeamCounts(playerCount: number): number[] {
	return Array.from({ length: playerCount }, (_, index) => index + 1).filter((teamCount) =>
		isValidTeamCount(playerCount, teamCount)
	);
}

export function generateTeams({
	players,
	teamCount,
	seed
}: GenerateTeamsInput): GenerateTeamsResult {
	if (getRosterIssues(players).length || !isValidTeamCount(players.length, teamCount) || !seed) {
		return { ok: false, issues: ['Add a valid roster and team count before generating.'] };
	}

	const random = seededRandom(seed);
	const capacities = getTeamSizes(players.length, teamCount);
	const teams: GeneratedTeam[] = capacities.map((_, index) => ({
		id: `team-${index + 1}`,
		players: []
	}));
	const hasCheckedIn = players.some((player) => player.checkedIn === true);
	const checkedInIds = new Set(
		players.filter((player) => player.checkedIn === true).map((player) => player.id)
	);
	const unassigned = shuffle([...players], random).sort(
		(left, right) =>
			(hasCheckedIn ? Number(right.checkedIn === true) - Number(left.checkedIn === true) : 0) ||
			left.eligiblePositions.length - right.eligiblePositions.length
	);

	for (let defender = 0; defender < 4; defender++) {
		for (const [index, team] of teams.entries()) {
			if (team.players.length >= preferredFormations[capacities[index]].DEFENDER) continue;
			const player = hasCheckedIn
				? chooseDefender(unassigned, teams, capacities, index)
				: unassigned.sort(defenderPriority)[0];
			if (!player) continue;
			team.players.push({ playerId: player.id, assignedPosition: 'DEFENDER' });
			unassigned.splice(unassigned.indexOf(player), 1);
		}
	}

	for (const player of unassigned) {
		const candidates = teams.flatMap((team, teamIndex) => {
			if (team.players.length >= capacities[teamIndex]) return [];

			return player.eligiblePositions.map((position) => ({
				team,
				position,
				firstGame: teamIndex < 2,
				checkedInCount: team.players.filter(({ playerId }) => checkedInIds.has(playerId)).length,
				positionDeficit:
					preferredFormations[capacities[teamIndex]][position] -
					team.players.filter((assigned) => assigned.assignedPosition === position).length,
				fullness: team.players.length,
				tieBreaker: random()
			}));
		});

		candidates.sort(
			(left, right) =>
				(hasCheckedIn && player.checkedIn === true
					? Number(right.firstGame) - Number(left.firstGame) ||
						left.checkedInCount - right.checkedInCount
					: 0) ||
				Number(left.positionDeficit <= 0) - Number(right.positionDeficit <= 0) ||
				right.positionDeficit - left.positionDeficit ||
				left.fullness - right.fullness ||
				left.tieBreaker - right.tieBreaker
		);

		const choice = candidates[0];
		if (!choice) return { ok: false, issues: ['No valid position assignment was available.'] };
		choice.team.players.push({ playerId: player.id, assignedPosition: choice.position });
	}

	const issues = getGenerationIssues(players, teamCount, teams);
	if (issues.length) return { ok: false, issues };

	return { ok: true, seed, teams, warnings: getCoverageWarnings(players, teams) };
}

export function getGenerationIssues(
	players: Player[],
	teamCount: number,
	teams: GeneratedTeam[]
): string[] {
	const issues: string[] = [];
	const playersById = new Map(players.map((player) => [player.id, player]));
	const assignedIds = teams.flatMap((team) => team.players.map((assigned) => assigned.playerId));
	const expectedSizes = getTeamSizes(players.length, teamCount);

	if (teams.length !== teamCount) issues.push('The requested number of teams was not generated.');
	if (new Set(assignedIds).size !== assignedIds.length)
		issues.push('A player was assigned more than once.');
	if (assignedIds.length !== players.length || assignedIds.some((id) => !playersById.has(id))) {
		issues.push('Generated teams do not contain every player exactly once.');
	}
	if (teams.some((team, index) => team.players.length !== expectedSizes[index])) {
		issues.push('Generated team sizes are incorrect.');
	}
	if (
		teams.some((team) =>
			team.players.some((assigned) => {
				const player = playersById.get(assigned.playerId);
				return !player || !isPosition(assigned.assignedPosition) || !canPlay(player, assigned);
			})
		)
	) {
		issues.push('A player was assigned to an ineligible position.');
	}

	return issues;
}

export function formatFormation(team: GeneratedTeam): string {
	return POSITIONS.map(
		(position) => team.players.filter((player) => player.assignedPosition === position).length
	).join('-');
}

export function getCoverageWarnings(players: Player[], teams: GeneratedTeam[]): string[] {
	const warnings = POSITIONS.flatMap((position) => {
		const available = players.filter((player) =>
			player.eligiblePositions.includes(position)
		).length;
		return available < teams.length
			? [
					`Only ${available} ${positionLabel(position, available)} ${available === 1 ? 'was' : 'were'} available for ${teams.length} teams.`
				]
			: [];
	});

	teams.forEach((team, index) => {
		POSITIONS.forEach((position) => {
			if (!team.players.some((player) => player.assignedPosition === position)) {
				warnings.push(`Team ${teamName(index)} has no assigned ${positionLabel(position, 1)}.`);
			}
		});
	});

	return warnings;
}

export function swapPlayers(
	players: Player[],
	teams: GeneratedTeam[],
	firstPlayerId: string,
	secondPlayerId: string
): SwapResult {
	const firstTeam = teams.find((team) =>
		team.players.some((player) => player.playerId === firstPlayerId)
	);
	const secondTeam = teams.find((team) =>
		team.players.some((player) => player.playerId === secondPlayerId)
	);
	if (!firstTeam || !secondTeam) return { ok: false, issues: ['Choose two players in the teams.'] };
	if (firstTeam === secondTeam) return { ok: false, issues: ['Choose a player on another team.'] };

	const first = firstTeam.players.find((player) => player.playerId === firstPlayerId)!;
	const second = secondTeam.players.find((player) => player.playerId === secondPlayerId)!;
	const swappedTeams = teams.map((team) => ({
		...team,
		players: team.players.map((player) => {
			if (player.playerId === firstPlayerId) return second;
			if (player.playerId === secondPlayerId) return first;
			return player;
		})
	}));

	const warnings = new Set(getCoverageWarnings(players, teams));
	return {
		ok: true,
		teams: swappedTeams,
		addedWarnings: getCoverageWarnings(players, swappedTeams).filter(
			(warning) => !warnings.has(warning)
		)
	};
}

export function teamName(index: number): string {
	return String.fromCharCode(65 + index);
}

function positionLabel(position: Position, count: number): string {
	const label: Record<Position, string> = {
		DEFENDER: 'defender',
		MIDFIELDER: 'midfielder',
		FORWARD: 'forward'
	};
	return `${label[position]}${count === 1 ? '' : 's'}`;
}

function defenderPriority(left: Player, right: Player): number {
	return (
		defenderFallbackCost(left) - defenderFallbackCost(right) ||
		left.eligiblePositions.length - right.eligiblePositions.length
	);
}

function chooseDefender(
	unassigned: Player[],
	teams: GeneratedTeam[],
	capacities: number[],
	teamIndex: number
): Player | undefined {
	const checkedIn = unassigned.filter((player) => player.checkedIn === true);
	const unchecked = unassigned.filter((player) => player.checkedIn !== true);
	const firstGameSlots = capacities
		.slice(0, 2)
		.reduce((remaining, capacity, index) => remaining + capacity - teams[index].players.length, 0);
	const useCheckedIn = teamIndex < 2 || checkedIn.length > firstGameSlots;
	const candidates = useCheckedIn ? checkedIn : unchecked.length ? unchecked : checkedIn;

	return candidates.sort(defenderPriority)[0];
}

function defenderFallbackCost(player: Player): number {
	if (player.eligiblePositions.includes('DEFENDER')) return 0;
	return player.eligiblePositions.includes('MIDFIELDER') ? 1 : 2;
}

function canPlay(player: Player, assigned: { assignedPosition: Position }): boolean {
	return (
		player.eligiblePositions.includes(assigned.assignedPosition) ||
		(assigned.assignedPosition === 'DEFENDER' && defenderFallbackCost(player) > 0)
	);
}

function seededRandom(seed: string): () => number {
	let state = 2166136261;
	for (let index = 0; index < seed.length; index++) {
		state = Math.imul(state ^ seed.charCodeAt(index), 16777619);
	}

	return () => {
		state += 0x6d2b79f5;
		let value = state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function shuffle<T>(items: T[], random: () => number): T[] {
	for (let index = items.length - 1; index > 0; index--) {
		const swapIndex = Math.floor(random() * (index + 1));
		[items[index], items[swapIndex]] = [items[swapIndex], items[index]];
	}
	return items;
}
