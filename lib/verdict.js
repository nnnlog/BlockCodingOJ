let obj = {
	0: "채점 중",
	1: "AC",
	2: "WA",
	3: "RTE",
	4: "TLE",
	5: "MLE",
	6: "CLE",
};
module.exports = {
	toString: code => obj[code] || 'Unknown',
	code: {
		JUDGING: 0,
		ACCEPTED: 1,
		WRONG_ANSWER: 2,
		RUNTIME_ERR: 3,
		TIME_LIMIT_EXCEED: 4,
		MEMORY_LIMIT_EXCEED: 5,
		COMPILE_ERR: 6,
		UNKNOWN_ERR: 999
	},
}