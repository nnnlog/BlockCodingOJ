const express = require("express");
const router = express.Router();

const db = require("../../lib/db");
const auth = require("../../lib/auth");

router.post("/register/", async (req, res) => {
	try {
		let {id, pw} = req.body;
		if (req.loginData !== undefined || typeof id !== "string" || typeof pw !== "string" || !id.length || !pw.length) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		res.end(JSON.stringify({
			status: +!(await auth.register({user_id: id, pw})),
		}));
	} catch (e) {
		console.log('api/auth/register - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.post("/login/", async (req, res) => {
	try {
		let {id, pw} = req.body;
		if (req.loginData !== undefined || typeof id !== "string" || typeof pw !== "string") {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		let ret = await auth.login({
			user_id: id,
			pw
		});
		res.end(JSON.stringify({
			status: +!ret,
			result: ret
		}));
	} catch (e) {
		console.log('api/auth/login - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.get("/user/", async (req, res) => {
	try {
		if (req.loginData === undefined) {
			res.end(JSON.stringify({
				status: 1,
			}));
			return;
		}
		res.end(JSON.stringify({
			status: 0,
			result: req.loginData.id
		}));
	} catch (e) {
		console.log('api/auth/user - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

router.get("/logout/", async (req, res) => {
	try {
		if (req.loginData === undefined) {
			res.end(JSON.stringify({
				status: 500,
			}));
			return;
		}
		res.end(JSON.stringify({
			status: +!(await auth.expire(req.loginData.token)),
		}));
	} catch (e) {
		console.log('api/auth/logout - error', e);
		res.end(JSON.stringify({
			status: 500,
		}));
	}
});

module.exports = router;
