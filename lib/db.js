const mongoose = require("mongoose");
const {data} = require("./setting");

let user, submission, problem, jwt, counters;

module.exports = {
	connect: async () => {
		let {Schema} = mongoose;
		await mongoose.connect(data().db, {useNewUrlParser: true, useUnifiedTopology: true});
		user = mongoose.model('user', new Schema({
			user_id: String,
			pw: String,
			submissions: Array,
			xml: {type: mongoose.Schema.Types.Mixed, default: {}},
		}, {minimize: false}), 'user');
		submission = mongoose.model('submission', new Schema({
			submission_id: Number,
			user_id: String,
			problem_id: Number,
			source_code: String,
			date: Date,
			judge_result: {
				verdict: Number,
				time: Number,
				memory: Number,
			},
			test: {
				is_test: Boolean,
				input: String,
				output: String,
			},
		}), 'submission');
		problem = mongoose.model('problem', new Schema({
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
		jwt = mongoose.model('jwt', new Schema({
			token: String,
			exp: Date
		}), 'jwt');
		counters = mongoose.model('counters', new Schema({
			key: String,
			value: Schema.Types.Mixed,
		}), 'counters');
	},
	user: () => user, submission: () => submission, problem: () => problem, jwt: () => jwt,
	counters: {
		getNextSubmissionId: async () => (await counters.findOneAndUpdate({key: "submission_id"}, {$inc: {value: 1}})).value,
	},
};
