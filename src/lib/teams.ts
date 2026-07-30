export function getTeamSizes(playerCount: number, teamCount: number): number[] {
	if (
		!Number.isInteger(playerCount) ||
		!Number.isInteger(teamCount) ||
		playerCount < 1 ||
		teamCount < 1
	) {
		return [];
	}

	const baseSize = Math.floor(playerCount / teamCount);
	const largerTeamCount = playerCount % teamCount;

	return Array.from(
		{ length: teamCount },
		(_, index) => baseSize + (index < largerTeamCount ? 1 : 0)
	);
}

export function isValidTeamCount(playerCount: number, teamCount: number): boolean {
	const sizes = getTeamSizes(playerCount, teamCount);

	return (
		teamCount >= 2 &&
		sizes.length === teamCount &&
		Math.min(...sizes) >= 4 &&
		Math.max(...sizes) <= 10
	);
}

export function getValidTeamCounts(playerCount: number): number[] {
	return Array.from({ length: playerCount }, (_, index) => index + 1).filter((teamCount) =>
		isValidTeamCount(playerCount, teamCount)
	);
}
