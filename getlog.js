const fs = require('fs');
const readline = require('readline');
var url = require('url');

var myArgs = process.argv.slice(2);
var myFile = process.argv[1];

var host = "";
var username = "";
var password;
var verbose = false;
var init = false;

// let data = username + ":" + password;
let configFile = "getlog.json";
let logFile = __dirname + "/getlog.log";
// console.log("AUTH: [" + data + "] ");
let auth;

const https = require('https')
const options = {
	hostname: host,
	port: 443,
	// path: '/api/now/table/syslog?sysparm_limit=20000&sysparm_query='+encodeURIComponent(query), 
	method: 'GET',
	headers: {
		// Authorization: auth
	}
}

if (process.argv.length <= 2) {
	console.log("Usage: node getlog.js");
	console.log("\t-v Verbose Mode")
	console.log("\t-c[ConfigFile]")
	console.log("\t-l[LogFile]")
	console.log("\n\tExample: node getlog.js -csampleconfig.json -v")
	return
}

process.argv.forEach(function (param) {
	// console.log(__dirname + " " + param)
	if (param.match(/^-c/)) {
		configFile = param.substring(2);
	}
	if (param.match(/^-v/)) {
		verbose = true;
	}
	if (param.match(/^-l/)) {
		logFile = param.substring(2);
	}
});


fs.readFile(configFile, function (err, data) {
	if (err) {
		console.log(err);
		console.log("Configfile: " + configFile);
	}
	else {
		try {
			let confObj = JSON.parse(data);
			_log("DATA: " + JSON.stringify(confObj, null, 4));
			_log("instance: " + confObj.instance);
			if (confObj.logfile)
				logFile = confObj.logfile;
			if (confObj.username)
				username = confObj.username;
			host += confObj.instance + ".service-now.com";
			if (confObj.auth) {
				auth = confObj.auth;
				let cf = {
					auth: auth,
					instance: confObj.instance,
					logfile: logFile,
					username: username
				}
				writeConfig(cf);
				options.headers.Authorization = auth;
				options.hostname = host;

				_log("CONNECT:\n" + JSON.stringify(options))

				getUserID(getUserIDResponse);
			} else if (confObj.username && confObj.password) {
				_log("username: " + confObj.username);
				_log("password: " + confObj.password);
				let userpw = username + ":" + password;
				auth = "Basic " + Buffer.from(userpw).toString('base64');
				let cf = {
					auth: auth,
					instance: confObj.instance,
					logfile: logFile,
					username: username
				}

				writeConfig(cf);
			}
			_log("AUTH: [" + auth + "] ");
		} catch (e) {
			console.log("Error reading Config file " + configFile + "\n" + e)
		}

	}
});

return

function _log(_text) {
	if (verbose)
		console.log("\x1b[36m", _text);
}

function _out(_text) {
	console.log("\x1b[37m", _text);
}

function _error(_text) {
	console.log("\x1b[31m", _text);
}

function writeConfig(_obj) {
	fs.writeFile(configFile, JSON.stringify(_obj, null, 4), function (err) {
		if (err) {
			return console.log(err);
		}
		_out(`Saved Configfile: ${configFile}\n ${JSON.stringify(_obj, null, 4)}\n`);
	});
}

function getUserIDResponse(resp) {
	// console.log("getUserIDResponse: " + resp.sys_id);
	if (resp != false)
		getMyBookmarks(resp.sys_id, getMyBookmarksResponse);

}

function getMyBookmarksResponse(resp) {
	_out("Instance: " + host)
	_out("Logfile: " + logFile)
	console.log("\n\n")
	for (var idx = 0; idx < resp.length; idx++) {
		_out("[" + idx + "] " + resp[idx].title);
	}

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.question('What do you want to see? ', (answer) => {
		// TODO: Log the answer in a database
		var hit = false;
		_out(`OK, cool: ${answer}`);

		rl.close();

		for (var idx = 0; idx < resp.length; idx++) {
			// console.log(answer + " [" + idx + "] " + resp[idx].title);
			if (answer == idx) {
				// console.log("HIT");
				hit = true;
				// console.log("HIT: "+resp[idx].url);
				var url_parts = url.parse(resp[idx].url, true);
				// console.log("HIT2: "+JSON.stringify(url_parts, null, 4));
				var query = url_parts.query.sysparm_query;
				getLogs(query);
			}
		}

		if (!hit) {
			_out("NO HIT");
			setTimeout(function () {
				getUserID(getUserIDResponse);
			}, 2000);
		}
	});
	//sleep(1000);
}

function getUserID(callback) {
	let obj = {};
	options.path = '/api/now/table/sys_user?sysparm_query=' + encodeURIComponent("user_name=" + username);
	const req = https.request(options, res => {
		let data = '';

		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on('end', () => {
			// console.log("Email: " + data + "\n\n");
			obj = JSON.parse(data);
			// console.log("Email: " + obj.result.length + "\n\n");
			// console.log("Email: " + obj.result[0].email + "\n\n");
			if (obj.result.length == 1)
				return callback(obj.result[0]);
			else {
				_error("Could not log in, check config file ...\n\n");
				return false;
			}
		});
	});

	req.on('error', error => {
		console.error(error)
	})

	req.end()
}

function getMyBookmarks(_id, callback) {

	let obj = {};
	options.path = '/api/now/table/sys_ui_bookmark?sysparm_query=' + encodeURIComponent("user=" + _id + "^urlLIKEsyslog");
	const req = https.request(options, res => {
		let data = '';

		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on('end', () => {
			obj = JSON.parse(data);
			// console.log("BOOKMARKS" + JSON.stringify(obj, null, 4));
			return callback(obj.result);
		});
	});

	req.on('error', error => {
		_error(error)
	})

	req.end()
}

function getLogs(_query) {
	_log("getLogs Query: " + _query)
	options.path = '/api/now/table/syslog?sysparm_limit=200000&sysparm_query=' + encodeURIComponent(_query);
	const req = https.request(options, res => {
		let data = '';
		let msg = [];
		_log(`statusCode: ${res.statusCode}`)

		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on('end', () => {
			//process.stdout.write(d)
			var obj = JSON.parse(data)
			_log("getLogs LEN: " + obj.result.length)
			for (var idx = 0; idx < obj.result.length; idx++) {
				// _log(obj.result[idx].message); 
				msg.push(obj.result[idx].message);
			}
			msg.sort();

			fs.readFile(logFile, function (err, data) {
				let len = 0;
				// console.log(`read len ${data.length}`);
				if (err) {
					_error(err)
					_out(msg.join("\n"));
					msg.reverse();

					fs.writeFile(logFile, msg.join("\n"), function (err) {
						if (err) {
							return console.log(err);
						}
						_log(`statusCode: ${res.statusCode} - File saved ...`);
					});
				} else {
					let dataNew = msg.join("\n");
					if (!init || (data.length != dataNew.length)) {
						init = true;
						_out("Ups - need refresh ... ")
						_out(msg.join("\n"));
						msg.reverse();

						fs.writeFile(logFile, msg.join("\n"), function (err) {
							if (err) {
								return console.log(err);
							}
							_log(`statusCode: ${res.statusCode} - File saved ...`);
						});

					}
				}
			});

			setTimeout(function () {
				getLogs(_query)
			}, 3000);
		})
	})

	req.on('error', error => {
		_error(error)
	})

	req.end()

}



