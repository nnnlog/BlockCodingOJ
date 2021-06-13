const express = require("express");
const router = express.Router();

const db = require("../../lib/db");

router.get("/recent", async (req, res) => {
	try {
		let {page} = req.query;
		if (isNaN(page)) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		page = parseInt(page);
		if (page < 1 || page > 50) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		res.end(JSON.stringify({
			status: 0,
			result: await db.submission().find({}, {
				_id: 0,
				/* source_code: 0,
				test: 0 */
			}).sort({submission_id: -1}).limit(page)
		}));
	} catch (e) {
		console.log('api/submission/recent - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.get("/problem/:problem_id", async (req, res) => {
	try {
		let {page} = req.query;
		if (isNaN(page)) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		let {problem_id} = req.params;
		if (isNaN(problem_id)) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		page = parseInt(page);
		if (page < 1 || page > 50) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		problem_id = parseInt(problem_id);
		let problem = await db.problem().findOne(problem_id);
		if (problem === null) {
			res.end(JSON.stringify({
				status: 1,
			}));
			return;
		}
		res.end(JSON.stringify({
			status: 0,
			result: await db.submission().find({problem_id}, {
				_id: 0,
				/* source_code: 0,
				test: 0 */
			}).sort({submission_id: -1}).limit(page)
		}));
	} catch (e) {
		console.log('api/submission/problem/ - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.get("/user/:user_id", async (req, res) => {
	try {
		let {page} = req.query;
		if (isNaN(page)) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		let {user_id} = req.params;
		if (typeof user_id !== "string") {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		page = parseInt(page);
		if (page < 1 || page > 50) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		let user = await db.user().findOne({user_id});
		if (user === null) {
			res.end(JSON.stringify({
				status: 1,
			}));
			return;
		}
		res.end(JSON.stringify({
			status: 0,
			result: await db.submission().find({user_id}, {
				_id: 0,
				/* source_code: 0,
				test: 0 */
			}).sort({submission_id: -1}).limit(page)
		}));
	} catch (e) {
		console.log('api/submission/user/ - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.get("/get/:submission_id", async (req, res) => {
	try {
		let {submission_id} = req.params;
		if (isNaN(submission_id)) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		submission_id = parseInt(submission_id);
		res.end(JSON.stringify({
			status: 0,
			result: await db.submission().find({submission_id}, {
				_id: 0,
				/* source_code: 0,
				test: 0 */
			})
		}));
	} catch (e) {
		console.log('api/submission/get/ - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

module.exports = router;
