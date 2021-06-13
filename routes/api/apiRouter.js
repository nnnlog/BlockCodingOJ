const express = require("express");
const router = express.Router();

const auth = require("../../lib/auth");
const db = require("../../lib/db");

router.use((req, res, next) => {
	res.setHeader('Content-Type', 'application/json; charset=utf8');
	next();
});

router.use(async (req, res, next) => {
	let {authorization} = req.headers;
	if (typeof authorization !== "string") {
		next();
		return;
	}
	let ret = await auth.verify(authorization);
	if (ret !== false) {
		let userData = await db.user().findOne({user_id: ret.id});
		if (userData !== null) {
			req.loginData = ret;
			req.loginData.db = userData;
		} else await auth.expire(ret.token);
	}
	next();
});

router.use('/auth/', require("./authRouter"));
router.use('/prob/', require("./problemRouter"));
router.use('/submission/', require("./submissionRouter"));

router.use((req, res) => res.end(JSON.stringify({
	status: 404,
})));

module.exports = router;
