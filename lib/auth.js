const crypto = require("crypto");
const setting = require("./setting");
const jwt = require("jsonwebtoken");
const db = require("./db");

let privateKey;

const sha512 = str => crypto.createHash("sha512").update(str).digest().toString('hex');

const verify = async (token) => {
	try {
		let decoded = jwt.verify(token, privateKey);
		if (await db.jwt().findOne({token: decoded.token}) !== null)
			return {id: decoded.user_id, token: decoded.token};
		else return false;
	} catch (e) {
		return false;
	}
};

const expire = async (token) => await db.jwt().deleteMany({token});

const login = async ({user_id, pw}) => {
	pw = sha512(pw);
	let find = await db.user().findOne({user_id, pw});
	if (find === null) return false;
	let token = crypto.randomBytes(32).toString('hex');
	await db.jwt().insertMany({token, exp: Date.now() + 1000 * 60 * 60 * 24 * 7}); //7d
	return jwt.sign({
		user_id, token,
	}, privateKey, {
		expiresIn: '7d'
	});
};

const register = async ({user_id, pw}) => {
	let find = await db.user().findOne({user_id});
	if (find !== null) return false;
	db.user().insertMany({user_id, pw: sha512(pw)});
	return true;
};

module.exports = {
	init: () => {
		if (setting.data().jwt === undefined || setting.data().jwt.length !== 256) {
			setting.data().jwt = crypto.randomBytes(128).toString('hex');
			setting.write();
		}
		privateKey = setting.data().jwt;
	},
	verify, expire, login, register
}