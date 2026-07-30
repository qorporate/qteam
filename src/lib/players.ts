import type {
	ParseError,
	ParseResult,
	ParsedPlayer,
	Player,
	PlayerDraft,
	Position
} from './types/players.types';

export const POSITIONS = [
	'DEFENDER',
	'MIDFIELDER',
	'FORWARD'
] as const satisfies readonly Position[];

export const POSITION_LABELS: Record<Position, string> = {
	DEFENDER: 'Defender',
	MIDFIELDER: 'Midfielder',
	FORWARD: 'Forward'
};

const POSITION_ALIASES: Record<Position, string[]> = {
	DEFENDER: ['Defender', 'Defence', 'Def', 'DF', 'D'],
	MIDFIELDER: ['Midfielder', 'Midfield', 'Mid', 'MF', 'M', 'CM'],
	FORWARD: ['Forward', 'Attack', 'Attacker', 'FW', 'F', 'ST', 'CF']
};

const positionByToken = new Map(
	POSITIONS.flatMap((position) =>
		POSITION_ALIASES[position].map((token) => [token.toLowerCase(), position] as const)
	)
);

export function isPosition(value: unknown): value is Position {
	return typeof value === 'string' && POSITIONS.includes(value as Position);
}

export function parsePlayerList(source: string): ParseResult {
	const players: ParsedPlayer[] = [];
	const errors: ParseError[] = [];

	for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
		if (!rawLine.trim()) continue;

		const line = index + 1;
		const input = rawLine.trim();
		const text = input.replace(/^\d+\s*(?:[.)]|-\s)\s*/, '');
		const separator = text.lastIndexOf(' - ');
		const missingName = text.startsWith('- ');
		const missingPosition = text.endsWith(' -');

		if (separator < 0 && !missingName && !missingPosition) {
			errors.push({ line, input, message: 'Use “Name - Position” format.' });
			continue;
		}

		const name = missingName
			? ''
			: text.slice(0, missingPosition ? text.length - 2 : separator).trim();
		const positionText = missingPosition ? '' : text.slice(missingName ? 2 : separator + 3).trim();

		if (!name) {
			errors.push({ line, input, message: 'Add a player name.' });
			continue;
		}

		if (!positionText) {
			errors.push({ line, input, message: 'Add at least one position.' });
			continue;
		}

		const tokens = positionText
			.split(',')
			.map((token) => token.trim())
			.filter(Boolean);
		const unknownTokens = tokens.filter((token) => !positionByToken.has(token.toLowerCase()));

		if (unknownTokens.length) {
			errors.push({
				line,
				input,
				message: `Unknown position${unknownTokens.length > 1 ? 's' : ''}: ${unknownTokens.join(', ')}.`
			});
			continue;
		}

		const found = new Set(tokens.map((token) => positionByToken.get(token.toLowerCase())));
		const eligiblePositions = POSITIONS.filter((position) => found.has(position));

		if (!eligiblePositions.length) {
			errors.push({ line, input, message: 'Add at least one position.' });
			continue;
		}

		players.push({ line, input, player: { name, eligiblePositions } });
	}

	return { players, errors };
}

export function createPlayer(draft: PlayerDraft, id: string = crypto.randomUUID()): Player {
	return {
		id,
		name: draft.name.trim(),
		eligiblePositions: POSITIONS.filter((position) => draft.eligiblePositions.includes(position))
	};
}

export function togglePosition(positions: Position[], position: Position): Position[] {
	const next = positions.includes(position)
		? positions.filter((current) => current !== position)
		: [...positions, position];

	return POSITIONS.filter((current) => next.includes(current));
}

export function getRosterIssues(roster: Player[]): string[] {
	const issues: string[] = [];

	if (roster.length < 8) {
		const remaining = 8 - roster.length;
		issues.push(`Add ${remaining} more player${remaining === 1 ? '' : 's'}.`);
	}
	if (roster.some((player) => !player.name.trim())) {
		issues.push('Give every player a name.');
	}
	if (roster.some((player) => player.eligiblePositions.length === 0)) {
		issues.push('Choose at least one position for every player.');
	}

	return issues;
}
