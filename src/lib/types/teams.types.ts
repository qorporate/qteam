import type { Player, Position } from './players.types';

export type AssignedPlayer = {
	playerId: string;
	assignedPosition: Position;
};

export type GeneratedTeam = {
	id: string;
	players: AssignedPlayer[];
};

export type GeneratedResult = {
	seed: string;
	teams: GeneratedTeam[];
};

export type GenerateTeamsInput = {
	players: Player[];
	teamCount: number;
	seed: string;
};

export type GenerateTeamsResult =
	| { ok: true; seed: string; teams: GeneratedTeam[]; warnings: string[] }
	| { ok: false; issues: string[] };

export type SwapResult =
	{ ok: true; teams: GeneratedTeam[]; addedWarnings: string[] } | { ok: false; issues: string[] };
