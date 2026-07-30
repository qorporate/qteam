import type { Player } from './players.types';

export type Workspace = {
	schemaVersion: 1;
	screen: 'players' | 'setup';
	roster: Player[];
	teamCount?: number;
};

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
