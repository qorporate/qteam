import { describe, expect, it } from 'vitest';
import { getTeamSizes, getValidTeamCounts, isValidTeamCount } from './teams';

describe('team sizes', () => {
	it.each([
		{ players: 8, teams: 2, sizes: [4, 4], valid: true },
		{ players: 31, teams: 4, sizes: [8, 8, 8, 7], valid: true },
		{ players: 32, teams: 3, sizes: [11, 11, 10], valid: false },
		{ players: 32, teams: 8, sizes: [4, 4, 4, 4, 4, 4, 4, 4], valid: true },
		{ players: 32, teams: 9, sizes: [4, 4, 4, 4, 4, 3, 3, 3, 3], valid: false }
	])('calculates $players players across $teams teams', ({ players, teams, sizes, valid }) => {
		expect(getTeamSizes(players, teams)).toEqual(sizes);
		expect(isValidTeamCount(players, teams)).toBe(valid);
	});

	it('offers only valid options for indivisible rosters', () => {
		expect(getValidTeamCounts(25)).toEqual([3, 4, 5, 6]);
		expect(getValidTeamCounts(29)).toEqual([3, 4, 5, 6, 7]);
		expect(getValidTeamCounts(31)).toEqual([4, 5, 6, 7]);
	});

	it('rejects non-positive and fractional inputs', () => {
		expect(getTeamSizes(0, 2)).toEqual([]);
		expect(getTeamSizes(8, 1.5)).toEqual([]);
		expect(isValidTeamCount(8, 1)).toBe(false);
	});
});
