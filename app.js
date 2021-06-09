const auth = require("./lib/auth");
auth.init();

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/api/', require('./routes/api'));
app.use(express.static(`${__dirname}/static/dist/`));

(async () => {
	await require("./lib/db").connect();
	console.log("Success to connect DB");

	app.listen(80, () => {
		console.log("Express server is listening on port 80.")
	});
	/*
		await auth.register({
			user_id: 'admin',
			pw: 'test',
		});
		await auth.login('admin');
	 */

})();
