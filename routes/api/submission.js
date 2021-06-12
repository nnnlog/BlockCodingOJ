const express = require("express");
const router = express.Router();

const db = require("../../lib/db");

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

router.use('/:id', async (req, res, next) => {
	try {
		let {id} = req.params;
		if (typeof id !== "string") {
			res.end(JSON.stringify({
				status: 500
			}));
			return;
		}
		let ret = await db.problem().findOne({
			problem_id: id
		}, {_id: 0,});
		if (ret === null) {
			res.end(JSON.stringify({
				status: 1
			}));
			return;
		}
		req.problemInfo = ret;
		next();
	} catch (e) {
		console.log('api/prob/:id, preprocess - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.get('/:id/', (req, res) => {
	try {
		res.end(JSON.stringify({
			status: 0,
			result: req.problemInfo
		}));
	} catch (e) {
		console.log('api/prob/:id - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.get("/:id/load", async (req, res) => {
	try {
		let xml = req.loginData.db.xml[req.problemInfo.problem_id];
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
			if (obj[req.problemInfo.problem_id] !== undefined) delete obj[req.problemInfo.problem_id];
		} else {
			obj[req.problemInfo.problem_id] = xml;
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

module.exports = router;
