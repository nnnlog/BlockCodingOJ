const fs = require("fs");
let data = JSON.parse(fs.readFileSync(`${__dirname}/../setting.json`, 'utf-8'));

module.exports = {
	data: () => data,
	write: () => fs.writeFileSync(`${__dirname}/../setting.json`, JSON.stringify(data, null, 4)),
};
