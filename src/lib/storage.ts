import { getRosterIssues, isPosition } from './players';
import { getGenerationIssues, isValidTeamCount } from './teams';
import type { Player } from './types/players.types';
import type { StorageLike, Workspace } from './types/storage.types';
import type { GeneratedResult, GeneratedTeam } from './types/teams.types';

export const WORKSPACE_KEY = 'qteam.workspace.v1';

export function emptyWorkspace(): Workspace {
	return { schemaVersion: 1, screen: 'players', roster: [] };
}

export function decodeWorkspace(value: unknown): Workspace | null {
	if (
		!isRecord(value) ||
		value.schemaVersion !== 1 ||
		(value.screen !== 'players' && value.screen !== 'setup' && value.screen !== 'teams')
	)
		return null;
	if (!Array.isArray(value.roster)) return null;

	const roster: Player[] = [];
	const ids = new Set<string>();

	for (const candidate of value.roster) {
		if (!isRecord(candidate)) return null;
		if (typeof candidate.id !== 'string' || !candidate.id || ids.has(candidate.id)) return null;
		if (typeof candidate.name !== 'string' || !Array.isArray(candidate.eligiblePositions)) {
			return null;
		}
		const checkedIn = candidate.checkedIn;
		if (checkedIn !== undefined && typeof checkedIn !== 'boolean') return null;
		if (!candidate.eligiblePositions.every(isPosition)) return null;
		if (new Set(candidate.eligiblePositions).size !== candidate.eligiblePositions.length)
			return null;

		ids.add(candidate.id);
		roster.push({
			id: candidate.id,
			name: candidate.name,
			eligiblePositions: [...candidate.eligiblePositions],
			...(checkedIn === undefined ? {} : { checkedIn })
		});
	}

	const teamCount = value.teamCount;
	if (
		teamCount !== undefined &&
		(typeof teamCount !== 'number' || !isValidTeamCount(roster.length, teamCount))
	)
		return null;
	if ((value.screen === 'setup' || value.screen === 'teams') && getRosterIssues(roster).length)
		return null;
	const generated = decodeGenerated(value.generated, roster, teamCount);
	if (value.generated !== undefined && !generated) return null;
	if (value.screen === 'teams' && !generated) return null;

	return {
		schemaVersion: 1,
		screen: value.screen,
		roster,
		...(teamCount === undefined ? {} : { teamCount }),
		...(generated ? { generated } : {})
	};
}

export function loadWorkspace(storage: StorageLike): {
	workspace: Workspace;
	error?: string;
} {
	try {
		const stored = storage.getItem(WORKSPACE_KEY);
		if (stored === null) return { workspace: emptyWorkspace() };

		let value: unknown;
		try {
			value = JSON.parse(stored);
		} catch {
			storage.removeItem(WORKSPACE_KEY);
			return {
				workspace: emptyWorkspace(),
				error: 'The saved roster was invalid and has been reset.'
			};
		}

		const workspace = decodeWorkspace(value);
		if (workspace) return { workspace };

		storage.removeItem(WORKSPACE_KEY);
		return {
			workspace: emptyWorkspace(),
			error: 'The saved roster was invalid and has been reset.'
		};
	} catch {
		return {
			workspace: emptyWorkspace(),
			error: 'The saved roster could not be restored.'
		};
	}
}

export function saveWorkspace(storage: StorageLike, workspace: Workspace): boolean {
	try {
		storage.setItem(
			WORKSPACE_KEY,
			JSON.stringify({
				...workspace,
				roster: workspace.roster.map((player) => ({ ...player, name: player.name.trim() }))
			})
		);
		return true;
	} catch {
		return false;
	}
}

export function clearWorkspace(storage: StorageLike): boolean {
	try {
		storage.removeItem(WORKSPACE_KEY);
		return true;
	} catch {
		return false;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decodeGenerated(
	value: unknown,
	roster: Player[],
	teamCount: unknown
): GeneratedResult | null {
	if (value === undefined) return null;
	if (
		!isRecord(value) ||
		typeof value.seed !== 'string' ||
		!value.seed ||
		!Array.isArray(value.teams)
	) {
		return null;
	}
	if (typeof teamCount !== 'number') return null;

	const teams: GeneratedTeam[] = [];
	for (const candidate of value.teams) {
		if (
			!isRecord(candidate) ||
			typeof candidate.id !== 'string' ||
			!Array.isArray(candidate.players)
		) {
			return null;
		}

		const players = candidate.players.map((assigned) => {
			if (
				!isRecord(assigned) ||
				typeof assigned.playerId !== 'string' ||
				typeof assigned.assignedPosition !== 'string'
			)
				return null;
			return { playerId: assigned.playerId, assignedPosition: assigned.assignedPosition };
		});
		if (players.some((player) => player === null)) return null;
		teams.push({ id: candidate.id, players: players as GeneratedTeam['players'] });
	}

	return getGenerationIssues(roster, teamCount, teams).length ? null : { seed: value.seed, teams };
}
