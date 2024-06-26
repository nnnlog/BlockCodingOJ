const fs = require("fs");
const http = require("http");
const https = require("https");

const auth = require("./lib/auth");
auth.init();

const Queue = require("./lib/queue");
global.updateProblemData = new Queue(10);

const express = require("express");
const app = express();
/*
const cors = require("cors");
app.use(cors());
*/
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/api/', require('./routes/api/apiRouter'));
app.use(express.static(`${__dirname}/static/dist/`));
app.use((req, res) => res.sendFile(`${__dirname}/static/dist/index.html`));

(async () => {
	await require("./lib/db").connect();
	console.log("Success to connect DB");

	http.createServer({
		// cert: fs.readFileSync(`${__dirname}/data/ssl/cert.pem`),
		// ca: fs.readFileSync(`${__dirname}/data/ssl/fullchain.pem`),
		// key: fs.readFileSync(`${__dirname}/data/ssl/privkey.pem`),
	}, app).listen(80, () => {
		console.log("Express server is listening on port 80.")
	});
	// https.createServer({
	// 	cert: fs.readFileSync(`${__dirname}/data/ssl/cert.pem`),
	// 	ca: fs.readFileSync(`${__dirname}/data/ssl/fullchain.pem`),
	// 	key: fs.readFileSync(`${__dirname}/data/ssl/privkey.pem`),
	// }, app).listen(443, () => {
	// 	console.log("Express server is listening on port 443.")
	// });

	express().use((req, res) => res.redirect('https://dnhs.me')).listen(80);
})();
