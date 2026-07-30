import { getRosterIssues, isPosition } from './players';
import { isValidTeamCount } from './teams';
import type { Player } from './types/players.types';
import type { StorageLike, Workspace } from './types/storage.types';

export const WORKSPACE_KEY = 'qteam.workspace.v1';

export function emptyWorkspace(): Workspace {
	return { schemaVersion: 1, screen: 'players', roster: [] };
}

export function decodeWorkspace(value: unknown): Workspace | null {
	if (
		!isRecord(value) ||
		value.schemaVersion !== 1 ||
		(value.screen !== 'players' && value.screen !== 'setup')
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
		if (!candidate.eligiblePositions.every(isPosition)) return null;
		if (new Set(candidate.eligiblePositions).size !== candidate.eligiblePositions.length)
			return null;

		ids.add(candidate.id);
		roster.push({
			id: candidate.id,
			name: candidate.name,
			eligiblePositions: [...candidate.eligiblePositions]
		});
	}

	const teamCount = value.teamCount;
	if (
		teamCount !== undefined &&
		(typeof teamCount !== 'number' || !isValidTeamCount(roster.length, teamCount))
	)
		return null;
	if (value.screen === 'setup' && getRosterIssues(roster).length) return null;

	return {
		schemaVersion: 1,
		screen: value.screen,
		roster,
		...(teamCount === undefined ? {} : { teamCount })
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
