export type Position = 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

export type Player = {
	id: string;
	name: string;
	eligiblePositions: Position[];
	checkedIn?: boolean;
};

export type PlayerDraft = Omit<Player, 'id' | 'checkedIn'>;

export type PlayerUpdate = Partial<Pick<Player, 'name' | 'eligiblePositions'>>;

export type ParsedPlayer = {
	line: number;
	input: string;
	player: PlayerDraft;
};

export type ParseError = {
	line: number;
	input: string;
	message: string;
};

export type ParseResult = {
	players: ParsedPlayer[];
	errors: ParseError[];
};
