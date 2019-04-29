const $ = require("cheerio");
const rp = require("request-promise-native");
//const cheerio = require('cheerio');
const async = require("async");
const crypto = require("crypto");
const schedule = require("node-schedule");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const db = require("./db.js");
const app = express();

app.use(cookieParser());
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(bodyParser.json());

let privateKey = fs.readFileSync("/etc/letsencrypt/live/www.tonygooseduck.com/privkey.pem", "utf8");
let certificate = fs.readFileSync("/etc/letsencrypt/live/www.tonygooseduck.com/cert.pem", "utf8");
let chain = fs.readFileSync("/etc/letsencrypt/live/www.tonygooseduck.com/chain.pem", "utf8");
let options = { key: privateKey, cert: certificate, ca: chain };
const server = require("https").Server(options, app);
// attach the socket.io server
const io = require("socket.io")(server);
//socket.io application
let rooms = {};
// class playerList {
//     constructor () {
//         this.data = getPlayerList('player', function(result) {
//             return result;
//         });
//     }
// }

let j = schedule.scheduleJob("30 * * * * *", function(firedate) {
	console.log("node-schedule:" + firedate + "actual time:" + new Date());
	db.query(`select * from cpbl_game where date < ${Date.now()} and result is NULL`, function(error, results, fields) {
		if (error) {
			throw error;
		}
		for (let i = 0; i < results.length; i++) {
			let temp = shuffle(["W", "L"]);
			db.query(`update cpbl_game set result = '${temp[0]}' where id = '${results[i].id}'`, function(error, results, fields) {
				if (error) {
					throw error;
				}
			});
		}
		console.log("update complete");
	});
	db.query(`insert into cpbl_schedule (date) values (${Date.now() + 15 * 60 * 1000})`, function(error, results, fields) {
		if (error) {
			throw error;
		}
	});
});

const mock = io.of("mock-draft");
mock.on("connection", function(socket) {
	//let temp;
	//let draftedList = [];
	//let draftPlayers = ["Faye", "David", "Jim"];
	//let order;
	//let rand;
	//let count;
	let a;
	console.log(`${socket.id} connected`);
	getPlayerData("player", function(result) {
		socket.emit("output", result);
	});
	getPlayerList("player", function(result) {
		a = JSON.stringify(result);
	});
	socket.on("disconnect", function(reason) {
		console.log(reason);
	});
	socket.on("joinroom", function(data, callback) {
		if (Object.keys(rooms).indexOf(data) != -1) {
			callback(true);
		} else {
			callback(false);
			socket.join(data, () => {
				// get the room name and save it in socket.mock
				socket.mock = socket.rooms[data];
				// console.log(Object.keys(socket.rooms));
				// create room in rooms
				rooms[data] = {};
				rooms[socket.mock].draftPlayers = ["AlphaGo", "AlphaStar", "OpenAI"];
				rooms[socket.mock].playerList = JSON.parse(a);
				rooms[socket.mock].draftedList = [];
				rooms[socket.mock].temp = [];
				rooms[socket.mock].turn;
				console.log(Object.keys(rooms));
			});
		}
	});
	socket.on("start", function(data, callback) {
		rooms[socket.mock].draftPlayers.push("You");
		rooms[socket.mock].draftPlayers = shuffle(rooms[socket.mock].draftPlayers);
		callback(true);
		rooms[socket.mock].order = rooms[socket.mock].draftPlayers.indexOf("You");
		socket.emit("messages", `You are player ${rooms[socket.mock].draftPlayers.indexOf("You") + 1}`);
		// Random generate 4 choice, if one was taken , use the other three, if not takn , use the first three
		rooms[socket.mock].count = rooms[socket.mock].playerList.length;
		for (let i = 0; i < 4; i++) {
			rand = Math.floor(Math.random() * rooms[socket.mock].count);
			rooms[socket.mock].temp.push(rooms[socket.mock].playerList[rand]);
			rooms[socket.mock].playerList.splice(rand, 1);
			rooms[socket.mock].count--;
		}
		//console.log(rooms);
		if (rooms[socket.mock].order == 0) {
			socket.emit("messages", "Your turn to pick!");
		} else if (rooms[socket.mock].order == 1) {
			socket.emit("messages", `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[0]}`);
			rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
			rooms[socket.mock].temp.splice(0, 1);
		} else if (rooms[socket.mock].order == 2) {
			socket.emit("messages", `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[0]}`);
			rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
			socket.emit("messages", `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[1]}`);
			rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
			rooms[socket.mock].temp.splice(0, 1);
			rooms[socket.mock].temp.splice(0, 1);
		} else {
			socket.emit("messages", `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[0]}`);
			rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
			socket.emit("messages", `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[1]}`);
			rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
			socket.emit("messages", `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[2]}`);
			rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
			rooms[socket.mock].temp.splice(0, 1);
			rooms[socket.mock].temp.splice(0, 1);
			rooms[socket.mock].temp.splice(0, 1);
		}
	});
	socket.on("draft", function(data, callback) {
		rooms[socket.mock].turn = rooms[socket.mock].draftedList.length % rooms[socket.mock].draftPlayers.length;
		if (rooms[socket.mock].draftedList.indexOf(data) != -1) {
			callback(false);
		} else if (rooms[socket.mock].playerList.indexOf(data) == -1 && rooms[socket.mock].temp.indexOf(data) == -1) {
			console.log(rooms[socket.mock].playerList.indexOf(data));
			console.log(rooms[socket.mock].temp.indexOf(data));
			callback(false);
		} else if (rooms[socket.mock].draftPlayers.indexOf("You") !== rooms[socket.mock].turn) {
			callback(false);
		} else {
			callback(true);
			rooms[socket.mock].draftedList.push(data);
			if (rooms[socket.mock].temp.indexOf(data) != -1) {
				rooms[socket.mock].temp.splice(rooms[socket.mock].temp.indexOf(data), 1);
			}
			console.log(rooms[socket.mock].draftedList);
			socket.emit("messages", `You drafted ${data}`);
			rooms[socket.mock].playerList.splice(rooms[socket.mock].playerList.indexOf(data), 1);
			if (rooms[socket.mock].temp.length < 3) {
				for (let i = 0; i < 4; i++) {
					rand = Math.floor(Math.random() * rooms[socket.mock].count);
					rooms[socket.mock].temp.push(rooms[socket.mock].playerList[rand]);
					rooms[socket.mock].playerList.splice(rand, 1);
					rooms[socket.mock].count--;
				}
			}
			if (rooms[socket.mock].order == 0) {
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[0]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[1]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[3]} picked ${rooms[socket.mock].temp[2]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
				rooms[socket.mock].temp.splice(0, 1);
				rooms[socket.mock].temp.splice(0, 1);
				rooms[socket.mock].temp.splice(0, 1);
				if (rooms[socket.mock].draftedList.length >= 4 * 5) {
					socket.emit("end", "end of draft");
					return;
				}
			} else if (rooms[socket.mock].order == 1) {
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[0]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[3]} picked ${rooms[socket.mock].temp[1]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
				if (rooms[socket.mock].draftedList.length >= 4 * 5) {
					socket.emit("end", "end of draft");
					return;
				}
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[2]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
				rooms[socket.mock].temp.splice(0, 1);
				rooms[socket.mock].temp.splice(0, 1);
				rooms[socket.mock].temp.splice(0, 1);
			} else if (rooms[socket.mock].order == 2) {
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[3]} picked ${rooms[socket.mock].temp[0]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
				if (rooms[socket.mock].draftedList.length >= 4 * 5) {
					socket.emit("end", "end of draft");
					return;
				}
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[1]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[2]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
				rooms[socket.mock].temp.splice(0, 1);
				rooms[socket.mock].temp.splice(0, 1);
				rooms[socket.mock].temp.splice(0, 1);
			} else {
				if (rooms[socket.mock].draftedList.length >= 4 * 5) {
					socket.emit("end", "end of draft");
					return;
				}
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[0]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[1]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
				socket.emit("messages", `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[2]}`);
				rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
				rooms[socket.mock].temp.splice(0, 1);
				rooms[socket.mock].temp.splice(0, 1);
				rooms[socket.mock].temp.splice(0, 1);
			}
		}
		console.log(rooms);
	});
});
let leagues = {};
// let leagues = {
//    leagueName: {}
// };
// leagueName: {
//     Invitation code:
//     Participants:,
//     PlayerList:
//     DraftedList: {
//         Participant: Player
//     }
// }
const real = io.of("real-draft");
real.on("connection", function(socket) {
	//socket.counter = counter++;
	//sockets[socket.counter] = socket;
	//console.log(`user ${socket.counter} connected`);
	console.log(`${socket.id} connected`);
	// get player full stats
	getPlayerData("player", function(result) {
		socket.emit("output", result);
	});
	// setinterval event on client side to avoid ping timeout
	socket.on("abc", function(data) {});
	socket.on("disconnect", function(reason) {
		//delete sockets[socket.counter];
		//console.log(`user ${socket.counter} disconnected`);
		// let i = players.indexOf(socket);
		// players.splice(i, 1);
		//console.log(reason);
		console.log(`${reason} ${socket.id} has disconnected`);
	});
	socket.on("nickname", function(data, callback) {
		// if(nicknames.indexOf(data) != -1) {
		//     callback(false);
		// } else {
		//     callback(true);
		//     nicknames.push(data);
		//     socket.nickname = data;
		//     real.emit('nicknames', nicknames);
		// }
		callback(true);
		socket.nickname = data;
	});
	socket.on("create", function(data, user_id, user_name, callback) {
		if (Object.keys(leagues).indexOf(data) == -1) {
			callback(true, data);
			socket.join(data, () => {
				socket.nickname = user_id;
				socket.user_name = user_name;
				socket.league = socket.rooms[data];
				leagues[data] = {};
				leagues[data].participants = {};
				leagues[data].participants[socket.nickname] = socket.id;
				getPlayerList("player", function(result) {
					leagues[data].playerList = result;
				});
				leagues[data].draftedList = [];
				leagues[data].turn;
				//generate a invitationCoded
				leagues[data].invitationCode;
			});
		} else {
			callback(false);
		}
	});
	socket.on("joinLeague", function(data, user_id, user_name, callback) {
		if (Object.keys(leagues).indexOf(data) != -1) {
			callback(true, data);
			socket.join(data, () => {
				console.log(socket.id);
				socket.nickname = user_id;
				socket.user_name = user_name;
				socket.league = socket.rooms[data];
				leagues[data].participants[socket.nickname] = socket.id;
				socket.to(socket.league).emit("message", `${socket.user_name} joined the room!`);
			});
		}
	});
	socket.on("draft", function(data, user_id, callback) {
		leagues[socket.league].turn = leagues[socket.league].draftedList.length % Object.keys(leagues[socket.league].participants).length;
		//check whether player is already drafted
		if (leagues[socket.league].draftedList.indexOf(data) != -1) {
			callback(false, "Player already drafted");
		} else if (leagues[socket.league].playerList.indexOf(data) == -1) {
			callback(false, "Player eithe drafted or does not exist");
		}
		//check whose turn to drafts
		else if (Object.keys(leagues[socket.league].participants).indexOf(socket.nickname.toString()) !== leagues[socket.league].turn) {
			console.log("here");
			callback(false, "Another player is drafting");
		} else {
			callback(true);
			let pick = {};
			pick[socket.nickname] = data;
			leagues[socket.league].draftedList.push(pick);
			leagues[socket.league].playerList.splice(leagues[socket.league].playerList.indexOf(data), 1);
			socket.to(socket.league).emit("message", `${socket.user_name} drafted ${data}`);
			//real.emit('message', `${socket.nickname} drafted ${data}`);
			if (leagues[socket.league].draftedList.length === Object.keys(leagues[socket.league].participants).length * 3) {
				console.log(leagues[socket.league].draftedList);
				//console.log(Object.entries(leagues[socket.league].draftedList));
				real.emit("end", "Draft has ended");
				db.beginTransaction(function(error) {
					if (error) throw error;
					db.query(`insert into cpbl_league (name) values ('${socket.league}')`, function(error, results, fields) {
						if (error) {
							db.rollback(function() {
								throw error;
							});
							return;
						}
						let commitCallback = function(error) {
							if (error) {
								return db.rollback(function() {
									throw error;
								});
							}
							console.log("draft complete");
						};
						let league_id = results.insertId;
						let cpblUserId;
						let playerName;
						for (let i = 0; i < leagues[socket.league].draftedList.length; i++) {
							//console.log(leagues[socket.league].draftedList[i]);
							cpblUserId = parseInt(Object.keys(leagues[socket.league].draftedList[i]));
							playerName = Object.values(leagues[socket.league].draftedList[i]);
							query = `insert into cpbl_draft (user_id, player_name, league_id, player_status) values ('${cpblUserId}', '${playerName}', '${league_id}', 'W')`;
							db.query(query, function(error, results, fields) {
								if (error) {
									db.rollback(function() {
										throw error;
									});
									return;
								}
							});
						}
						//db.commit(commitCallback);
						let participants = Object.keys(leagues[socket.league].participants).map(function(id) {
							return parseInt(id);
						});
						db.query(`select * from cpbl_schedule where date > ${Date.now()}`, function(error, results, fields) {
							if (error) {
								db.rollback(function() {
									throw error;
								});
								return;
							}
							let temp = results;
							for (let i = 0; i < temp.length; i++) {
								participants = shuffle(participants);
								db.query(
									`insert into cpbl_game (league_id, date, home_user_id, away_user_id) values ('${league_id}','${temp[i].date}', '${
										participants[0]
									}', '${participants[1]}')
								, ('${league_id}','${temp[i].date}', '${participants[2]}', '${participants[3]}')`,
									function(error, results, fields) {
										if (error) {
											db.rollback(function() {
												throw error;
											});
											return;
										}
									}
								);
							}
							db.commit(commitCallback);
						});
						//db.commit(commitCallback);
					});
				});
			}
		}
	});
});

//routes

app.use("/user/:id", function(req, res, next) {
	let now = Date.now();
	if (req.cookies.access_token) {
		db.query("select * from cpbl_user where access_token = ?", [req.cookies.access_token], function(error, results, fields) {
			if (error) {
				throw error;
			}
			if (results.length === 0) {
				res.send({ error: "Invalid access token, please log in" });
				return;
			}
			if (now > results[0].access_expired) {
				res.send({ error: "Access token has expired, please log in again" });
				return;
			}
			next();
		});
	} else {
		res.send("please log in first");
		//redirect to log in page
	}
});
app.get("/getAllLeague", (req, res) => {
	db.query("select * from cpbl_league", function(error, results, fields) {
		if (error) {
			throw error;
		}
		res.send(results);
	});
});
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/main.html");
});
app.get("/login", (req, res) => {
	res.sendFile(__dirname + "/user.html");
});
app.get("/user/draft", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.get("/getplayerdata", (req, res) => {
	getPlayerData("nothing", function(result) {
		res.send(result);
	});
});
app.get("/getUserTeam", (req, res) => {
	if (req.cookies.access_token) {
		db.query("select * from cpbl_user where access_token = ?", [req.cookies.access_token], function(error, results, fields) {
			if (error) {
				throw error;
			}
			if (results.length === 0) {
				res.send({ error: "Invalid access token, please log in" });
				return;
			}
			let id = results[0].id;
			db.query(`select league_id from cpbl_draft where user_id = '${id}' group by league_id`, function(error, results, fields) {
				if (error) {
					throw error;
				}
				res.send(results);
			});
		});
	}
});
app.post("/getUserPlayers", (req, res) => {
	let data = req.body;
	if (req.cookies.access_token) {
		db.query("select * from cpbl_user where access_token = ?", [req.cookies.access_token], function(error, results, fields) {
			if (error) {
				throw error;
			}
			if (results.length === 0) {
				res.send({ error: "Invalid access token, please log in" });
				return;
			}
			let id = results[0].id;
			db.query(`select * from cpbl_draft where user_id = '${id}' and league_id = '${data.league}'`, function(error, results, fields) {
				if (error) {
					throw error;
				}
				res.send(results);
			});
		});
	}
});
app.post("/getUserSchedule", (req, res) => {
	let data = req.body;
	if (req.cookies.access_token) {
		db.query("select * from cpbl_user where access_token = ?", [req.cookies.access_token], function(error, results, fields) {
			if (error) {
				throw error;
			}
			if (results.length === 0) {
				res.send({ error: "Invalid access token, please log in" });
				return;
			}
			let id = results[0].id;
			let results1;
			db.query(
				`select date, result, home_user_id, away_user_id from cpbl_game where home_user_id = '${id}' and league_id = '${data.league}'`,
				function(error, results, fields) {
					if (error) {
						throw error;
					}
					results1 = results;
					db.query(
						`select date, result, home_user_id, away_user_id from cpbl_game where away_user_id = '${id}' and league_id = '${data.league}'`,
						function(error, results, fields) {
							if (error) {
								throw error;
							}
							res.send(results1.concat(results));
						}
					);
				}
			);
		});
	}
});
app.get("/user/mock-draft", (req, res) => {
	res.sendFile(__dirname + "/mock-draft.html");
});
app.get("/user/team", (req, res) => {
	res.sendFile(__dirname + "/team.html");
});

app.get("/profile", function(req, res) {
	let now = Date.now();
	if (req.cookies.access_token) {
		db.query("select * from cpbl_user where access_token = ?", [req.cookies.access_token], function(error, results, fields) {
			if (error) {
				throw error;
			}
			if (results.length === 0) {
				res.send({ error: "Invalid access token, please log in" });
				return;
			}
			if (now > results[0].access_expired) {
				res.send({ error: "Access token has expired, please log in again" });
				return;
			}
			let data = {
				id: results[0].id,
				name: results[0].name
			};
			res.send(data);
		});
	} else {
		res.send("please log in first");
	}
});
app.post("/add/lineup", (req, res) => {
	let data = req.body;
	if (req.cookies.access_token) {
		db.query("select * from cpbl_user where access_token = ?", [req.cookies.access_token], function(error, results, fields) {
			if (error) {
				throw error;
			}
			if (results.length === 0) {
				res.send({ error: "Invalid access token, please log in" });
				return;
			}
			let id = results[0].id;
			let query = "update cpbl_draft set player_status = ? where user_id = ? and player_name = ? and league_id = ?";
			db.query(query, ["Start", id, data.name, data.league], function(error, results, fields) {
				if (error) {
					throw error;
				}
				if (results.affectedRows === 1) {
					res.send({ result: "Success" });
				} else {
					res.send({ result: "update fail" });
				}
			});
		});
	}
});
app.post("/remove/lineup", (req, res) => {
	let data = req.body;
	if (req.cookies.access_token) {
		db.query("select * from cpbl_user where access_token = ?", [req.cookies.access_token], function(error, results, fields) {
			if (error) {
				throw error;
			}
			if (results.length === 0) {
				res.send({ error: "Invalid access token, please log in" });
				return;
			}
			let id = results[0].id;
			let query = "update cpbl_draft set player_status = ? where user_id = ? and player_name = ? and player_status = ? and league_id = ?";
			db.query(query, ["Bench", id, data.name, "Start", data.league], function(error, results, fields) {
				if (error) {
					throw error;
				}
				if (results.affectedRows === 1) {
					res.send({ result: "Success" });
				} else {
					res.send({ result: "update fail" });
				}
			});
		});
	}
});

app.post("/signup", (req, res) => {
	let data = req.body;
	if (!data.name || !data.email || !data.password) {
		res.send({ error: "Name, email and password are required" });
		return;
	}
	db.beginTransaction(function(error) {
		if (error) throw error;
		db.query(`select * from cpbl_user where email = '${data.email}'`, function(error, results, fields) {
			if (error) {
				res.send({ error: "Database query error" });
				return db.rollback(function() {
					throw error;
				});
			}
			if (results.length > 0) {
				res.send({ error: "Email already exists" });
				return;
			}
			let commitCallback = function(error) {
				if (error) {
					res.send({ error: "Database query error" });
					return db.rollback(function() {
						throw error;
					});
				}
				res.cookie("access_token", user.access_token);
				// res.send({
				// 	data: {
				// 		access_token: user.access_token,
				// 		// 30 days of expiration time
				// 		access_expired: Math.floor((user.access_expired - now) / 1000),
				// 		user: {
				// 			id: user.id,
				// 			provider: user.provider,
				// 			name: user.name,
				// 			email: user.email
				// 		}
				// 	}
				// });
				res.redirect("/");
			};
			let now = Date.now();
			let user;
			//generate access token
			let sha = crypto.createHash("sha256");
			sha.update(data.email + data.password + now);
			let accessToken = sha.digest("hex");
			//generate salt for hashing
			let salt = crypto.randomBytes(32).toString("hex");
			//hash password
			crypto.pbkdf2(data.password, salt, 100000, 64, "sha512", (err, derivedKey) => {
				if (err) throw err;
				let hashedPwd = derivedKey.toString("hex");
				console.log(hashedPwd);
				user = {
					provider: "native",
					email: data.email,
					name: data.name,
					salt: salt,
					password: hashedPwd,
					access_token: accessToken,
					access_expired: now + 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
				};
				//let query = `insert into cpbl_user (name, email, provider, salt, password, access_token, access_expired) values ('${data.name}', '${data.email}', 'native', '${salt}', '${hashedPwd}', '${accessToken}', '${user.access_expired}')`;
				let query = "insert into cpbl_user set ?";
				db.query(query, user, function(error, results, fields) {
					if (error) {
						res.send({ error: "Database query error" });
						return db.rollback(function() {
							throw error;
						});
					}
					user.id = results.insertId;
					db.commit(commitCallback);
				});
			});
		});
	});
});

app.post("/signin", (req, res) => {
	let data = req.body;
	if (!data.email || !data.password) {
		res.send({ error: "email and password are required" });
		return;
	}
	db.beginTransaction(function(error) {
		if (error) {
			throw error;
		}
		db.query("select * from cpbl_user where email = ?", [data.email], function(error, results, fields) {
			if (error) {
				res.send({ error: "Database query error" });
				return db.rollback(function() {
					throw error;
				});
			}
			console.log(results.length);
			let user;
			let now = Date.now();
			let sha = crypto.createHash("sha256");
			sha.update(data.email + data.password + now);
			let accessToken = sha.digest("hex");
			let commitCallback = function(error) {
				if (error) {
					res.send({ error: "Database query error" });
					return db.rollback(function() {
						throw error;
					});
				}
				if (user === null) {
					res.send({ error: "Sign in error, user does not exist or incorrect password" });
				} else {
					res.cookie("access_token", user.access_token);
					// res.send({
					// 	data: {
					// 		access_token: user.access_token,
					// 		access_expired: Math.floor((user.access_expired - now) / 1000),
					// 		user: {
					// 			id: user.id,
					// 			provider: user.provider,
					// 			name: user.name,
					// 			email: user.email
					// 		}
					// 	}
					// });
					res.redirect("/");
				}
			};
			if (results.length == 0) {
				user = null;
				db.commit(commitCallback);
			} else {
				let salt = results[0].salt;
				let hashedPwd = results[0].password;
				// use salt to hash entered password and compare with the hashedPwd in db
				crypto.pbkdf2(data.password, salt, 100000, 64, "sha512", (err, derivedKey) => {
					if (err) throw err;
					derivedKey = derivedKey.toString("hex");
					if (derivedKey != hashedPwd) {
						user = null;
						db.commit(commitCallback);
					} else {
						user = {
							id: results[0].id,
							provider: results[0].provdier,
							name: results[0].name,
							email: results[0].email,
							access_token: accessToken,
							access_expired: now + 30 * 24 * 60 * 60 * 1000
						};
						let query = "update cpbl_user set access_token = ?, access_expired = ? where id = ?";
						db.query(query, [user.access_token, user.access_expired, user.id], function(error, results, fields) {
							if (error) {
								res.send({ error: "Database query error" });
								return db.rollback(function() {
									throw error;
								});
							}
							db.commit(commitCallback);
						});
					}
				});
			}
		});
	});
});

app.get("/batter", (req, res) => {
	async.parallel(
		[
			function(callback) {
				scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=E02&gameno=01", callback);
			},
			function(callback) {
				scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=L01&gameno=01", callback);
			},
			function(callback) {
				scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=A02&gameno=01", callback);
			},
			function(callback) {
				scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=B04&gameno=01", callback);
			}
		],
		function(err, results) {
			res.send(results);
		}
	);
});
app.get("/pitcher", (req, res) => {
	async.parallel(
		[
			function(callback) {
				scrapePitcherData("http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=E02&year=2019&grade=2&syear=2019", callback);
			},
			function(callback) {
				scrapePitcherData("http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=L01&year=2019&grade=2&syear=2019", callback);
			},
			function(callback) {
				scrapePitcherData("http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=A02&year=2019&grade=2&syear=2019", callback);
			},
			function(callback) {
				scrapePitcherData("http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=B04&year=2019&grade=2&syear=2019", callback);
			}
		],
		function(err, results) {
			res.send(results);
		}
	);
	// const $ = cheerio.load(html);
	// const playerData = [];
	// $('tr td').each(function(i, element) {
	//     playerData[i] = $(this).text();
	// });
	// playerData.join(', ');
	// console.log(playerData);
	// let test = $('td').map(function(i, element) {
	//     return $(this).text();
	// }).get().join(', ');
	//console.log(test);

	// scrape http://www.cpbl.com.tw/web/team_player.php?&team=E02 first
	// let playerUrls = [];
	// let list = $('td > a', html).length;
	// for(let i = 0; i < list; i++){
	//     playerUrls.push($('td > a', html)[i].attribs.href);
	// }
	// then scrape individual player's data
	// return Promise.all(
	//     playerUrls.map(function(url) {
	//         return playerParse('http://www.cpbl.com.tw' + url);
	//     })
	// );
	// user api

	const playerParse = function(url) {
		return rp(url)
			.then(function(html) {
				return {
					name: $(".player_info_name", html)
						.text()
						.split(" ")[0]
				};
			})
			.catch(function(err) {
				console.log(err);
			});
	};
});

function scrapeBatterData(url, callback) {
	rp(url)
		.then(function(html) {
			let playerUrls = [];
			let list = $("td > a", html).length;
			for (let i = 0; i < list / 2; i++) {
				let str = $("td > a", html)[i * 2].attribs.href.split("=");
				let temp = str[1].split("&");
				playerUrls.push(temp[0]);
			}
			//console.log(playerUrls);
			const playerData = [];
			$("tr > td", html).each(function(i, element) {
				playerData[i] = $(this).text();
			});
			const Batter = [];
			let player;
			// player number = playerData.length / 31
			for (let i = 0; i < playerData.length / 31; i++) {
				player = {
					Name: playerData[i * 31],
					Team: playerData[i * 31 + 1],
					Player_id: playerUrls[i],
					RBI: parseInt(playerData[i * 31 + 5]),
					H: parseInt(playerData[i * 31 + 7]),
					OBP: parseFloat(playerData[i * 31 + 15]),
					AVG: parseFloat(playerData[i * 31 + 17])
				};
				Batter.push(player);
			}
			return Batter;
		})
		.then(function(result) {
			console.log(result);
			let sql;
			let bp;
			for (let i = 0; i < result.length; i++) {
				bp = result[i];
				//sql = `insert into batter (name, team, player_id, RBI, H, OBP, AVG) values ('${bp.Name}', '${bp.Team}', '${bp.Player_id}', '${bp.RBI}', '${bp.H}', '${bp.OBP}', '${bp.AVG}')`;
				sql = `update batter set RBI = ${bp.RBI}, H = ${bp.H}, OBP = ${bp.OBP}, AVG = ${bp.AVG} where player_id = '${bp.Player_id}'`;
				db.query(sql, (err, result) => {
					if (err) throw err;
				});
			}
			callback(null, result);
		})
		.catch(function(err) {
			console.log(err);
		});
	//});
}

function scrapePitcherData(url, callback) {
	//return new Promise((resolve, reject) => {
	rp(url)
		.then(function(html) {
			let playerUrls = [];
			let list = $("td > a", html).length;
			for (let i = 0; i < list / 2; i++) {
				let str = $("td > a", html)[i * 2].attribs.href.split("=");
				let temp = str[1].split("&");
				playerUrls.push(temp[0]);
			}
			console.log(playerUrls);
			const playerData = [];
			$("tr > td", html).each(function(i, element) {
				playerData[i] = $(this).text();
			});
			//console.log(playerData);
			const Pitcher = [];
			let player;
			// player number = playerData.length / 31
			for (let i = 0; i < playerData.length / 31; i++) {
				player = {
					Name: playerData[i * 31],
					Team: playerData[i * 31 + 1],
					Player_id: playerUrls[i],
					W: parseInt(playerData[i * 31 + 8]),
					ERA: parseFloat(playerData[i * 31 + 15]),
					WHIP: parseFloat(playerData[i * 31 + 14])
				};
				Pitcher.push(player);
			}
			return Pitcher;
		})
		.then(function(result) {
			console.log(result);
			let sql;
			let bp;
			for (let i = 0; i < result.length; i++) {
				bp = result[i];
				//sql = `insert into pitcher (name, team, player_id, ERA, WHIP, W) values ('${bp.Name}', '${bp.Team}', '${bp.Player_id}', '${bp.ERA}', '${bp.WHIP}', '${bp.W}')`;
				sql = `update pitcher set ERA = ${bp.ERA}, WHIP = ${bp.WHIP}, W = ${bp.W} where player_id = '${bp.Player_id}'`;
				db.query(sql, (err, result) => {
					if (err) throw err;
				});
			}
			callback(null, result);
		})
		.catch(function(err) {
			console.log(err);
		});
}

function getPlayerData(player, callback) {
	let playerList = [];
	db.query("select * from batter", (err, result) => {
		if (err) throw err;
		else {
			let batter;
			for (let i = 0; i < result.length; i++) {
				batter = {};
				batter.name = result[i].name;
				batter.team = result[i].team;
				batter.player_id = result[i].player_id;
				batter.RBI = result[i].RBI;
				batter.H = result[i].H;
				batter.OBP = result[i].OBP;
				batter.AVG = result[i].AVG;
				playerList.push(batter);
			}
			db.query("select * from pitcher", (err, result) => {
				if (err) throw err;
				else {
					let pitcher;
					for (let i = 0; i < result.length; i++) {
						pitcher = {};
						pitcher.name = result[i].name;
						pitcher.team = result[i].team;
						pitcher.player_id = result[i].player_id;
						pitcher.ERA = result[i].ERA;
						pitcher.WHIP = result[i].WHIP;
						pitcher.W = result[i].W;
						playerList.push(pitcher);
					}
				}
				callback(playerList);
			});
		}
	});
}

function getPlayerList(player, callback) {
	let playerList = [];
	db.query("select * from batter", (err, result) => {
		if (err) throw err;
		else {
			for (let i = 0; i < result.length; i++) {
				playerList.push(result[i].name);
			}
			db.query("select * from pitcher", (err, result) => {
				if (err) throw err;
				else {
					for (let i = 0; i < result.length; i++) {
						playerList.push(result[i].name);
					}
				}
				callback(playerList);
			});
		}
	});
}

function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue,
		randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

server.listen(443, () => console.log("server running on port 80"));
