import { describe, expect, it } from 'vitest';
import {
	WORKSPACE_KEY,
	clearWorkspace,
	decodeWorkspace,
	emptyWorkspace,
	loadWorkspace,
	saveWorkspace
} from './storage';
import type { Workspace } from './types/storage.types';

class MemoryStorage {
	values = new Map<string, string>();

	getItem(key: string) {
		return this.values.get(key) ?? null;
	}

	setItem(key: string, value: string) {
		this.values.set(key, value);
	}

	removeItem(key: string) {
		this.values.delete(key);
	}
}

const workspace: Workspace = {
	schemaVersion: 1,
	screen: 'players',
	roster: [
		{
			id: 'player-1',
			name: 'Femi',
			eligiblePositions: ['DEFENDER', 'MIDFIELDER']
		}
	]
};

describe('workspace persistence', () => {
	it('round-trips a valid workspace', () => {
		const storage = new MemoryStorage();

		expect(saveWorkspace(storage, workspace)).toBe(true);
		expect(loadWorkspace(storage)).toEqual({ workspace });
		expect(clearWorkspace(storage)).toBe(true);
		expect(loadWorkspace(storage)).toEqual({ workspace: emptyWorkspace() });
	});

	it('loads an empty workspace when the key is missing', () => {
		expect(loadWorkspace(new MemoryStorage())).toEqual({ workspace: emptyWorkspace() });
	});

	it('rejects malformed JSON and removes the broken document', () => {
		const storage = new MemoryStorage();
		storage.values.set(WORKSPACE_KEY, '{broken');

		expect(loadWorkspace(storage)).toEqual({
			workspace: emptyWorkspace(),
			error: 'The saved roster was invalid and has been reset.'
		});
		expect(storage.values.has(WORKSPACE_KEY)).toBe(false);
	});

	it('trims player names before storage', () => {
		const storage = new MemoryStorage();
		saveWorkspace(storage, {
			...workspace,
			roster: [{ ...workspace.roster[0], name: '  Femi  ' }]
		});

		expect(loadWorkspace(storage).workspace.roster[0].name).toBe('Femi');
	});

	it('round-trips a valid team setup', () => {
		const storage = new MemoryStorage();
		const setup: Workspace = {
			schemaVersion: 1,
			screen: 'setup',
			teamCount: 2,
			roster: Array.from({ length: 8 }, (_, index) => ({
				id: `player-${index}`,
				name: `Player ${index + 1}`,
				eligiblePositions: ['MIDFIELDER']
			}))
		};

		expect(saveWorkspace(storage, setup)).toBe(true);
		expect(loadWorkspace(storage)).toEqual({ workspace: setup });
	});

	it('round-trips generated teams', () => {
		const storage = new MemoryStorage();
		const teams: Workspace = {
			schemaVersion: 1,
			screen: 'teams',
			teamCount: 2,
			roster: Array.from({ length: 8 }, (_, index) => ({
				id: `player-${index}`,
				name: `Player ${index + 1}`,
				eligiblePositions: ['MIDFIELDER']
			})),
			generated: {
				seed: 'saved',
				teams: [
					{
						id: 'team-1',
						players: Array.from({ length: 4 }, (_, index) => ({
							playerId: `player-${index}`,
							assignedPosition: 'MIDFIELDER' as const
						}))
					},
					{
						id: 'team-2',
						players: Array.from({ length: 4 }, (_, index) => ({
							playerId: `player-${index + 4}`,
							assignedPosition: 'MIDFIELDER' as const
						}))
					}
				]
			}
		};

		expect(saveWorkspace(storage, teams)).toBe(true);
		expect(loadWorkspace(storage)).toEqual({ workspace: teams });
	});

	it.each([
		{ ...workspace, schemaVersion: 2 },
		{ ...workspace, screen: 'teams' },
		{ ...workspace, teamCount: 2 },
		{ ...workspace, roster: [{ id: 'player-1', name: 'Femi', eligiblePositions: ['GOALKEEPER'] }] },
		{
			...workspace,
			roster: [
				{ id: 'same', name: 'Femi', eligiblePositions: ['DEFENDER'] },
				{ id: 'same', name: 'Mayor', eligiblePositions: ['FORWARD'] }
			]
		}
	])('rejects an invalid workspace', (candidate) => {
		expect(decodeWorkspace(candidate)).toBeNull();
	});

	it('keeps the application usable when storage throws', () => {
		const brokenStorage = {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('full');
			},
			removeItem: () => {
				throw new Error('blocked');
			}
		};

		expect(loadWorkspace(brokenStorage)).toEqual({
			workspace: emptyWorkspace(),
			error: 'The saved roster could not be restored.'
		});
		expect(saveWorkspace(brokenStorage, workspace)).toBe(false);
		expect(clearWorkspace(brokenStorage)).toBe(false);
	});
});
