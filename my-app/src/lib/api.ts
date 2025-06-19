// src/lib/api.ts

const API_HOST = import.meta.env.VITE_API_HOST;

export async function fetchGeojsonFeatures(year: number) {
	const response = await fetch(`${API_HOST}/api/polities/?year=${year}`, {
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});

	const data = await response.json();
	return data.shapes.map((shape) => ({
		geometry: JSON.parse(shape.geom_json),
		colour: shape.colour,
		shape_name: shape.member_of || shape.name
	}));
}

export async function getScore(params) {
	const { min_year, max_year, trueAge, guessAge, hint_penalty } = params;
	const multiplier = Math.round(365 * (hint_penalty / 100.0));

	const res = await fetch(
		`${API_HOST}/api/score/?min_year=${min_year}&max_year=${max_year}&true_year=${trueAge}&guess_year=${guessAge}&multiplier=${multiplier}`,
		{
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		}
	);
	return res.ok ? res.json() : null;
}

export async function submitLeaderboard(initials: string, score: number) {
	const res = await fetch(`${API_HOST}/api/leaderboard/update/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ initials, score: score.toString() })
	});
	return res.ok ? res.json() : null;
}