const express = require("express");
const queue = require("express-queue");
const router = express.Router();

const db = require("../../lib/db");
const judge = require("../../lib/judge");
const verdict = require("../../lib/verdict");

router.get("/recent", async (req, res) => {
	try {
		res.end(JSON.stringify({
			status: 0,
			result: await db.problem().find({}, {
				_id: 0,
				submissions: 0,
				statement: 0,
			}).sort({problem_id: 1}).limit(10)
		}));
	} catch (e) {
		console.log('api/prob/recent - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.use('/:problem_id', async (req, res, next) => {
	try {
		let {problem_id} = req.params;
		if (isNaN(problem_id)) {
			res.end(JSON.stringify({
				status: 500
			}));
			return;
		}
		let ret = await db.problem().findOne({problem_id}, {_id: 0,});
		if (ret === null) {
			res.end(JSON.stringify({
				status: 1
			}));
			return;
		}
		req.problemData = ret;
		next();
	} catch (e) {
		console.log('[api/prob/:id, preprocess - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.get('/:id/', (req, res) => {
	try {
		res.end(JSON.stringify({
			status: 0,
			result: req.problemData
		}));
	} catch (e) {
		console.log('api/prob/:id - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.use((req, res, next) => {
	if (req.loginData === undefined) {
		res.end(JSON.stringify({
			status: 403,
		}));
	} else next();
});

router.get("/:id/load", async (req, res) => {
	try {
		let xml = req.loginData.db.xml[req.problemData.problem_id];
		if (xml === undefined) {
			res.end(JSON.stringify({
				status: 1,
			}));
		} else {
			res.end(JSON.stringify({
				status: 0,
				result: xml
			}));
		}
	} catch (e) {
		console.log('api/prob/:id/load - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.post("/:id/save", async (req, res) => {
	try {
		let {xml} = req.body;
		if (typeof xml !== "string") {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		xml = xml.trim();
		let obj = req.loginData.db.xml;
		if (xml === "") {
			if (obj[req.problemData.problem_id] !== undefined) delete obj[req.problemData.problem_id];
		} else {
			obj[req.problemData.problem_id] = xml;
		}
		await db.user().findOneAndUpdate({user_id: req.loginData.id}, {$set: {xml: obj}});
		res.end(JSON.stringify({
			status: 0,
		}));
	} catch (e) {
		console.log('api/prob/:id/save - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.post("/:id/submit", queue({activeLimit: 1, queuedLimit: -1}), async (req, res) => {
	try {
		let {xml} = req.body;
		if (typeof xml !== "string") {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		if ((new Date(req.loginData.db.lastSubmitTime)).getTime() + 1000 * 5 > Date.now()) {
			res.end(JSON.stringify({
				status: 1,
				message: "마지막 제출 5초 후에 제출할 수 있습니다."
			}));
			return;
		}
		xml = xml.trim();
		let submission_id = await db.counters.getNextSubmissionId(), sub;
		await db.submission().insertMany(sub = {
			submission_id,
			user_id: req.loginData.id,
			problem_id: req.problemData.problem_id,
			source_code: xml,
			date: Date.now(),
			judge_result: {
				verdict: verdict.code.JUDGING,
			},
			test: {
				is_test: false
			}
		});
		req.loginData.db.submissions.push(submission_id);
		req.loginData.db.try[req.problemData.problem_id] = 1;
		await db.user().findOneAndUpdate({user_id: req.loginData.id}, {
			$set: {
				try: req.loginData.db.try,
				lastSubmitTime: Date.now(),
				submissions: req.loginData.db.submissions,
			}
		});
		req.problemData.try[req.loginData.id] = 1;
		req.problemData.submissions.push(submission_id);
		await db.problem().findOneAndUpdate({
			problem_id: req.problemData.problem_id,
		}, {
			$set: {
				try: req.problemData.try,
				submissions: req.problemData.submissions,
			},
			$inc: {
				submit: 1,
			}
		});
		judge(sub);
		res.end(JSON.stringify({
			status: 0,
		}));
	} catch (e) {
		console.log('api/prob/:id/submit - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

module.exports = router;
