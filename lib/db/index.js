const mongoose = require("mongoose");
const {data} = require("../setting");

let user, submission, problem, jwt;

module.exports = {
	connect: async () => {
		await mongoose.connect(data().db, {useNewUrlParser: true, useUnifiedTopology: true});
		user = mongoose.model('user', new (mongoose.Schema)({
			user_id: String,
			pw: String,
			submissions: Array,
		}), 'user');
		submission = mongoose.model('submission', new (mongoose.Schema)({
			submission_id: Number,
			user_id: String,
			problem_id: Number,
			source_code: String,
			is_test: Boolean,
			judge_result: {
				verdict: Number,
				time: Number,
				memory: Number,
				output: String,
			},
		}), 'submission');
		problem = mongoose.model('problem', new (mongoose.Schema)({
			problem_id: Number,
			title: String,
			statement: {
				body: String,
				example: Array
			},
			limit: {
				time: Number,
				memory: Number,
			},
			accepted: Number,
			submit: Number,
			submissions: Array
		}), 'problem');
		jwt = mongoose.model('jwt', new (mongoose.Schema)({
			token: String,
			exp: Date
		}), 'jwt');
	},
	user: () => user, submission: () => submission, problem: () => problem, jwt: () => jwt,
};
