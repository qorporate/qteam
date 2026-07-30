import type { Player } from './players.types';
import type { GeneratedResult } from './teams.types';

export type Workspace = {
	schemaVersion: 1;
	screen: 'players' | 'setup' | 'teams';
	roster: Player[];
	teamCount?: number;
	generated?: GeneratedResult;
};

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
