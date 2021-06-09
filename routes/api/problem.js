const express = require("express");
const router = express.Router();

const db = require("../../lib/db");

router.get("/recent", async (req, res) => {
	res.end(JSON.stringify({
		status: 0,
		result: await db.problem().find({}, {
			_id: 0,
			submissions: 0,
			statement: 0,
		}).sort({problem_id: -1}).limit(10)
	}));
});

router.get("/:id/", async (req, res) => {
	let {id} = req.params;
	let ret = await db.problem().findOne({
		problem_id: id
	}, {_id: 0,});
	if (ret === null) {
		res.end(JSON.stringify({
			status: 1
		}));
		return;
	}
	res.end(JSON.stringify({
		status: 0,
		result: ret
	}));
});

module.exports = router;
