const express = require("express");
const router = express.Router();

const auth = require("../../lib/auth");

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
	if (ret !== false) req.loginData = ret;
	next();
});

router.use('/auth/', require("./auth"));
router.use('/prob/', require("./problem"));

module.exports = router;
