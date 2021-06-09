const fs = require("fs");
const readline = require("readline");
const db = require("../lib/db");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const input = (question) => new Promise(r => {
	rl.question(question, r);
});

const exit = () => process.exit(0);

(async () => {
	let ret = (await Promise.all([db.connect(), input("파일 명을 입력하세요: ")])).pop();
	ret = `${__dirname}/../data/problem/${ret}`;
	if (!ret.endsWith(".json")) ret += ".json";
	if (!fs.existsSync(ret)) {
		console.log("존재하지 않는 파일입니다.");
		exit();
	}
	let data = JSON.parse(fs.readFileSync(ret, 'utf-8'));
	if (await db.problem().findOne({problem_id: data.problem_id}) !== null) {
		let ret = await input("이미 존재하는 문제입니다.\n삭제하고 새로 생성하시겠습니까? ");
		if (ret.trim().toUpperCase() !== "Y") exit();
		await db.problem().deleteOne({problem_id: data.problem_id});
	}
	await db.problem().insertMany(data);
	setTimeout(exit, 1000);
})();
