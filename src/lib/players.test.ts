import { describe, expect, it } from 'vitest';
import { createPlayer, getRosterIssues, parsePlayerList, togglePosition } from './players';
import type { Player } from './types/players.types';

describe('parsePlayerList', () => {
	it('parses numbered and unnumbered Qball lines with fixed aliases', () => {
		const result = parsePlayerList(`
			1. Anuv Love - Forward
			2) Oluwaseun Aladeyelu - DF
			3 - Femi - Defender, Midfielder, ST
			Mayor - cm
		`);

		expect(result.errors).toEqual([]);
		expect(result.players.map(({ player }) => player)).toEqual([
			{ name: 'Anuv Love', eligiblePositions: ['FORWARD'] },
			{ name: 'Oluwaseun Aladeyelu', eligiblePositions: ['DEFENDER'] },
			{ name: 'Femi', eligiblePositions: ['DEFENDER', 'MIDFIELDER', 'FORWARD'] },
			{ name: 'Mayor', eligiblePositions: ['MIDFIELDER'] }
		]);
	});

	it('splits on the final spaced hyphen and keeps position-like name text', () => {
		const result = parsePlayerList('Jean-Pierre - Defender\nmuhammed CM - Midfielder');

		expect(result.players.map(({ player }) => player.name)).toEqual(['Jean-Pierre', 'muhammed CM']);
	});

	it('keeps duplicate names as separate players', () => {
		const result = parsePlayerList('Femi - Defender\nFemi - Forward');

		expect(result.players).toHaveLength(2);
	});

	it('returns valid lines alongside line-numbered errors without guessing', () => {
		const result = parsePlayerList(`
			Femi - Defender
			No separator
			 - Forward
			Mayor -
			Teslim - Goalkeeper
		`);

		expect(result.players.map(({ line }) => line)).toEqual([2]);
		expect(result.errors.map(({ line, message }) => ({ line, message }))).toEqual([
			{ line: 3, message: 'Use “Name - Position” format.' },
			{ line: 4, message: 'Add a player name.' },
			{ line: 5, message: 'Add at least one position.' },
			{ line: 6, message: 'Unknown position: Goalkeeper.' }
		]);
	});

	it('accepts blank input without producing players or errors', () => {
		expect(parsePlayerList('\n \n')).toEqual({ players: [], errors: [] });
	});
});

describe('player helpers', () => {
	it('trims names, normalises position order, and toggles positions', () => {
		const player = createPlayer(
			{ name: '  Femi  ', eligiblePositions: ['FORWARD', 'DEFENDER', 'FORWARD'] },
			'player-1'
		);

		expect(player).toEqual({
			id: 'player-1',
			name: 'Femi',
			eligiblePositions: ['DEFENDER', 'FORWARD'],
			checkedIn: false
		});
		expect(togglePosition(player.eligiblePositions, 'DEFENDER')).toEqual(['FORWARD']);
		expect(togglePosition(['FORWARD'], 'MIDFIELDER')).toEqual(['MIDFIELDER', 'FORWARD']);
	});

	it('reports only the rules blocking a roster from continuing', () => {
		const validPlayers: Player[] = Array.from({ length: 8 }, (_, index) => ({
			id: `player-${index}`,
			name: `Player ${index}`,
			eligiblePositions: ['MIDFIELDER']
		}));

		expect(getRosterIssues(validPlayers)).toEqual([]);
		expect(
			getRosterIssues([
				...validPlayers.slice(0, 6),
				{ id: 'blank', name: ' ', eligiblePositions: [] }
			])
		).toEqual([
			'Add 1 more player.',
			'Give every player a name.',
			'Choose at least one position for every player.'
		]);
	});
});
