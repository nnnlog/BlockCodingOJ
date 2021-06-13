const axios = require("axios");
const qs = require("querystring");
const fs = require("fs");
const Blockly = require("node-blockly");
const verdict = require("./verdict");
const db = require("./db");

Blockly.JavaScript.text_print = text => `console.log(${Blockly.JavaScript.valueToCode(text, "TEXT", Blockly.JavaScript.ORDER_NONE) || ''});\n`;
module.exports = async (data) => {
	try {
		let xml = Blockly.Xml.textToDom(data.source_code);
		let workspace = new Blockly.Workspace();
		Blockly.Xml.domToWorkspace(xml, workspace);
		let code = Blockly.JavaScript.workspaceToCode(workspace).trim();
		let path = `${__dirname}/../data/problem/test/${data.problem_id}/`;

		let judgeResult = {
			verdict: verdict.code.ACCEPTED,
			time: 0,
			memory: 0,
		};

		for (let file of fs.readdirSync(path)) {
			let id = (await axios.post("http://api.paiza.io/runners/create", {
				source_code: code.trim(),
				language: 'javascript',
				api_key: "guest"
			})).data.id;
			for (let i = 1; i <= 5; i++) {
				await new Promise(r => setTimeout(r, 1000));
				let ret = (await axios.get(`http://api.paiza.io/runners/get_details?${qs.encode({
					id,
					api_key: "guest",
				})}`)).data;
				if (ret.status === "completed") {
					let {stdout, stderr, exit_code, time, memory, result} = ret;
					if (result === 'timeout') {
						judgeResult.verdict = verdict.code.TIME_LIMIT_EXCEED;
					}
					else {
						judgeResult.time = Math.max(judgeResult.time, parseFloat(time));
						judgeResult.memory = Math.max(judgeResult.memory, memory);
						if (exit_code !== 0) {
							if (typeof stderr === "string" && stderr.indexOf(`SyntaxError: Unexpected token`) > -1) {
								judgeResult.verdict = verdict.code.COMPILE_ERR;
							} else {
								judgeResult.verdict = verdict.code.RUNTIME_ERR;
							}
						} else {
							if (typeof stdout === "string") {
								let data = fs.readFileSync(`${path}/${file}`, 'utf-8').trim().split("\n").map(s => s.trim()).join("\n").trim();
								stdout = stdout.trim().split("\n").map(s => s.trim()).join("\n").trim();
								if (data !== stdout) judgeResult.verdict = verdict.code.WRONG_ANSWER;
							}
						}
					}
					break;
				}
			}
		}
		if (judgeResult.verdict !== verdict.code.ACCEPTED) {
			delete judgeResult.time;
			delete judgeResult.memory;
		}
		await db.submission().findOneAndUpdate({submission_id: data.submission_id}, {
			$set: {
				judge_result: judgeResult
			}
		});
	} catch (e) {
		console.log("Judge - Failed", e);
	}
};
