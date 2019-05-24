// const $ = require('cheerio');
// const rp = require('request-promise-native');
// const fs = require('fs');
const async = require('async');
const crypto = require('crypto');
const schedule = require('node-schedule');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL Initialization
const db = require('./db.js');
// const cert = require('./util/cert.js');

// const options = { key: cert.privateKey, cert: cert.certificate, ca: cert.chain };
const server = require('http').Server(app);

// const server = require('http').Server(app);
// attach the socket.io server
const io = require('socket.io')(server);

const scrape = require('./util/scrape.js');
const play = require('./util/play.js');

// node-schedule for scrapping batter and pitcher data
schedule.scheduleJob('0 25 2 * * *', (firedate) => {
  console.log(`node-schedule-scrapebatter:${firedate} actual time:${new Date()}`);
  async.parallel(
    [
      function (callback) {
        scrape.batter('http://www.cpbl.com.tw/web/team_playergrade.php?&team=E02&gameno=01', callback);
      },
      function (callback) {
        scrape.batter('http://www.cpbl.com.tw/web/team_playergrade.php?&team=L01&gameno=01', callback);
      },
      function (callback) {
        scrape.batter('http://www.cpbl.com.tw/web/team_playergrade.php?&team=A02&gameno=01', callback);
      },
      function (callback) {
        scrape.batter('http://www.cpbl.com.tw/web/team_playergrade.php?&team=B04&gameno=01', callback);
      },
    ],
    (err, results) => {
      if (err) {
        throw err;
      } else {
        console.log(results);
        console.log('batter scraping completed');
      }
    },
  );
});
schedule.scheduleJob('0 27 2 * * *', (firedate) => {
  console.log(`node-schedule-scrapepitcher:${firedate} actual time:${new Date()}`);
  async.parallel(
    [
      function (callback) {
        scrape.pitcher('http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=E02&year=2019&grade=2&syear=2019', callback);
      },
      function (callback) {
        scrape.pitcher('http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=L01&year=2019&grade=2&syear=2019', callback);
      },
      function (callback) {
        scrape.pitcher('http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=A02&year=2019&grade=2&syear=2019', callback);
      },
      function (callback) {
        scrape.pitcher('http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=B04&year=2019&grade=2&syear=2019', callback);
      },
    ],
    (err, results) => {
      if (err) {
        throw err;
      } else {
        console.log(results);
        console.log('pitcher scraping completed');
      }
    },
  );
});
// node-schedule for autoplaying scheduled games
schedule.scheduleJob('30 30 7 * * *', (firedate) => {
  console.log(`node-schedule-autoPlay:${firedate} actual time:${new Date()}`);
  db.query(`select * from cpbl_game where date < ${Date.now()} and result is NULL and home_user_status = 'Ready' and away_user_status = 'Ready'`, (error, results) => {
    if (error) {
      throw error;
    }
    for (let i = 0; i < results.length; i += 1) {
      play.autoPlay(results[i].id, results[i].league_id, results[i].home_user_id, results[i].away_user_id);
    }
  });
  // db.query(`insert into cpbl_schedule (date) values (${Date.now() + 15 * 60 * 1000})`, function(error, results, fields) {
  // if (error) {
  // throw error;
  // }
  // });
});

// socket.io application
// global variable that includes all the rooms in namespace 'mock-draft'
let rooms = {};
const mock = io.of('mock-draft');
mock.on('connection', (socket) => {
  let playerList;
  let rand;
  console.log(`${socket.id} connected`);
  getPlayerData('player', (result) => {
    socket.emit('output', result);
  });
  getPlayerList('player', (result) => {
    playerList = JSON.stringify(result);
  });
  socket.on('disconnect', (reason) => {
    console.log(reason);
  });
  socket.on('joinroom', (data, callback) => {
    if (Object.keys(rooms).indexOf(data) !== -1) {
      callback(true);
    } else {
      callback(false);
      socket.join(data, () => {
        // get the room name and save it in socket.mock
        socket.mock = socket.rooms[data];
        // create room in rooms
        rooms[data] = {};
        rooms[socket.mock].draftPlayers = ['AlphaGo', 'AlphaStar', 'OpenAI'];
        rooms[socket.mock].playerList = JSON.parse(playerList);
        rooms[socket.mock].draftedList = [];
        rooms[socket.mock].temp = [];
        rooms[socket.mock].turn;
      });
    }
  });
  socket.on('start', (data, callback) => {
    rooms[socket.mock].draftPlayers.push('You');
    rooms[socket.mock].draftPlayers = play.shuffle(rooms[socket.mock].draftPlayers);
    callback(true);
    rooms[socket.mock].order = rooms[socket.mock].draftPlayers.indexOf('You');
    socket.emit('messages', `You are player ${rooms[socket.mock].draftPlayers.indexOf('You') + 1}`);
    // Random generate 4 choices
    rooms[socket.mock].count = rooms[socket.mock].playerList.length;
    for (let i = 0; i < 4; i += 1) {
      rand = Math.floor(Math.random() * rooms[socket.mock].count);
      rooms[socket.mock].temp.push(rooms[socket.mock].playerList[rand]);
      rooms[socket.mock].playerList.splice(rand, 1);
      rooms[socket.mock].count -= 1;
    }
    if (rooms[socket.mock].order === 0) {
      socket.emit('messages', 'Your turn to pick!');
    } else if (rooms[socket.mock].order === 1) {
      socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[0]}`);
      rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
      rooms[socket.mock].temp.splice(0, 1);
    } else if (rooms[socket.mock].order === 2) {
      socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[0]}`);
      rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
      socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[1]}`);
      rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
      rooms[socket.mock].temp.splice(0, 1);
      rooms[socket.mock].temp.splice(0, 1);
    } else {
      socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[0]}`);
      rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
      socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[1]}`);
      rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
      socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[2]}`);
      rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
      rooms[socket.mock].temp.splice(0, 1);
      rooms[socket.mock].temp.splice(0, 1);
      rooms[socket.mock].temp.splice(0, 1);
    }
  });
  socket.on('draft', (data, callback) => {
    rooms[socket.mock].turn = rooms[socket.mock].draftedList.length % rooms[socket.mock].draftPlayers.length;
    if (rooms[socket.mock].draftedList.indexOf(data) !== -1) {
      callback(false);
    } else if (rooms[socket.mock].playerList.indexOf(data) === -1 && rooms[socket.mock].temp.indexOf(data) === -1) {
      console.log(rooms[socket.mock].playerList.indexOf(data));
      console.log(rooms[socket.mock].temp.indexOf(data));
      callback(false);
    } else if (rooms[socket.mock].draftPlayers.indexOf('You') !== rooms[socket.mock].turn) {
      callback(false);
    } else {
      callback(true);
      rooms[socket.mock].draftedList.push(data);
      if (rooms[socket.mock].temp.indexOf(data) !== -1) {
        rooms[socket.mock].temp.splice(rooms[socket.mock].temp.indexOf(data), 1);
      }
      console.log(rooms[socket.mock].draftedList);
      socket.emit('messages', `You drafted ${data}`);
      rooms[socket.mock].playerList.splice(rooms[socket.mock].playerList.indexOf(data), 1);
      if (rooms[socket.mock].temp.length < 3) {
        for (let i = 0; i < 4; i += 1) {
          rand = Math.floor(Math.random() * rooms[socket.mock].count);
          rooms[socket.mock].temp.push(rooms[socket.mock].playerList[rand]);
          rooms[socket.mock].playerList.splice(rand, 1);
          rooms[socket.mock].count -= 1;
        }
      }
      if (rooms[socket.mock].order === 0) {
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[0]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[1]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[3]} picked ${rooms[socket.mock].temp[2]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
        rooms[socket.mock].temp.splice(0, 1);
        rooms[socket.mock].temp.splice(0, 1);
        rooms[socket.mock].temp.splice(0, 1);
        if (rooms[socket.mock].draftedList.length >= 4 * 5) {
          socket.emit('end', 'end of draft');
          return;
        }
      } else if (rooms[socket.mock].order === 1) {
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[0]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[3]} picked ${rooms[socket.mock].temp[1]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
        if (rooms[socket.mock].draftedList.length >= 4 * 5) {
          socket.emit('end', 'end of draft');
          return;
        }
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[2]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
        rooms[socket.mock].temp.splice(0, 1);
        rooms[socket.mock].temp.splice(0, 1);
        rooms[socket.mock].temp.splice(0, 1);
      } else if (rooms[socket.mock].order === 2) {
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[3]} picked ${rooms[socket.mock].temp[0]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
        if (rooms[socket.mock].draftedList.length >= 4 * 5) {
          socket.emit('end', 'end of draft');
          return;
        }
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[1]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[2]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
        rooms[socket.mock].temp.splice(0, 1);
        rooms[socket.mock].temp.splice(0, 1);
        rooms[socket.mock].temp.splice(0, 1);
      } else {
        if (rooms[socket.mock].draftedList.length >= 4 * 5) {
          socket.emit('end', 'end of draft');
          return;
        }
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[0]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[1]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
        socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[2]}`);
        rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
        rooms[socket.mock].temp.splice(0, 1);
        rooms[socket.mock].temp.splice(0, 1);
        rooms[socket.mock].temp.splice(0, 1);
      }
    }
    console.log(rooms);
  });
});
// global variable for all the leagues in namespace 'real-draft'
let leagues = {};
const real = io.of('real-draft');
real.on('connection', (socket) => {
  // socket.counter = counter++;
  // sockets[socket.counter] = socket;
  // console.log(`user ${socket.counter} connected`);
  console.log(`${socket.id} connected`);
  // get player full stats
  getPlayerData('player', (result1, result2) => {
    socket.emit('output', result1, result2);
  });
  // setinterval event on client side to avoid ping timeout
  socket.on('abc', () => { });
  socket.on('disconnect', (reason) => {
    // delete sockets[socket.counter];
    // console.log(`user ${socket.counter} disconnected`);
    // let i = players.indexOf(socket);
    // players.splice(i, 1);
    // console.log(reason);
    console.log(`${reason} ${socket.id} has disconnected`);
  });
  socket.on('nickname', (data, callback) => {
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
  socket.on('create', (data, userId, userName, callback) => {
    if (Object.keys(leagues).indexOf(data) === -1) {
      callback(true, data);
      socket.join(data, () => {
        socket.userId = userId;
        socket.userName = userName;
        socket.league = socket.rooms[data];
        leagues[data] = {};
        leagues[data].participants = {};
        leagues[data].order = [];
        leagues[data].order.push(userName);
        leagues[data].participants[socket.userId] = socket.id;
        getPlayerList('player', (result) => {
          leagues[data].playerList = result;
        });
        leagues[data].draftedList = [];
        leagues[data].turn;
        // generate a invitationCoded
      });
    } else {
      callback(false);
    }
  });
  socket.on('joinLeague', (data, userId, userName, callback) => {
    if (Object.keys(leagues).indexOf(data) !== -1) {
      // to-do avoid new player joining room after there are 4 players
      // player_number < 4 OR userId already in participants list
      if (Object.keys(leagues[data].participants).length < 4 || Object.keys(leagues[data].participants).indexOf(userId.toString()) !== -1) {
        callback(true, data);
        socket.join(data, () => {
          socket.userId = userId;
          socket.userName = userName;
          socket.league = socket.rooms[data];
          leagues[data].participants[socket.userId] = socket.id;
          leagues[data].order.push(userName);
          socket.to(socket.league).emit('message', `${socket.userName} joined the room!`);
          console.log(Object.keys(leagues[socket.league].participants));
          if (Object.keys(leagues[socket.league].participants).length === 4) {
            leagues[data].order = play.shuffle(leagues[data].order);
            real.in(socket.league).emit('message', `draft order: ${leagues[data].order[0]}, ${leagues[data].order[1]}, ${leagues[data].order[2]}, ${leagues[data].order[3]}`);
          }
        });
      } else {
        callback(false, 'league reached player limit');
      }
    } else {
      callback(false, 'league does not exist, you can create it or join another league');
    }
  });
  socket.on('draft', (data, user_id, callback) => {
    leagues[socket.league].turn = leagues[socket.league].draftedList.length % Object.keys(leagues[socket.league].participants).length;
    if (Object.keys(leagues[socket.league].participants).length !== 4) {
      callback(false, 'draft can only begin when there are 4 players');
    } else if (leagues[socket.league].draftedList.indexOf(data) !== -1) {
      // check whether player is already drafted
      callback(false, 'Player already drafted');
    } else if (leagues[socket.league].playerList.indexOf(data) === -1) {
      callback(false, 'Player eithe drafted or does not exist');
    } else if (leagues[socket.league].order.indexOf(socket.userName) !== leagues[socket.league].turn) {
      // check whose turn to draft
      callback(false, 'Another player is drafting');
    } else {
      callback(true);
      let pick = {};
      pick[socket.userId] = data;
      leagues[socket.league].draftedList.push(pick);
      leagues[socket.league].playerList.splice(leagues[socket.league].playerList.indexOf(data), 1);
      real.in(socket.league).emit('message', `${socket.user_name} drafted ${data}`);

      if (leagues[socket.league].draftedList.length === Object.keys(leagues[socket.league].participants).length * 3) {
        console.log(leagues[socket.league].draftedList);
        // console.log(Object.entries(leagues[socket.league].draftedList));
        real.emit('end', 'Draft has ended');
        db.beginTransaction((error) => {
          if (error) throw error;
          db.query(`insert into cpbl_league (name) values ('${socket.league}')`, (error, results) => {
            if (error) {
              db.rollback(() => {
                throw error;
              });
              return;
            }
            let commitCallback = function (error) {
              if (error) {
                return db.rollback(function () {
                  throw error;
                });
              }
              console.log('draft complete');
            };
            let league_id = results.insertId;
            let cpblUserId;
            let playerName;
            for (let i = 0; i < leagues[socket.league].draftedList.length; i++) {
              //console.log(leagues[socket.league].draftedList[i]);
              cpblUserId = parseInt(Object.keys(leagues[socket.league].draftedList[i]));
              playerName = Object.values(leagues[socket.league].draftedList[i]);
              query = `insert into cpbl_draft (user_id, player_name, league_id, player_status) values ('${cpblUserId}', '${playerName}', '${league_id}', 'Bench')`;
              db.query(query, function (error, results, fields) {
                if (error) {
                  db.rollback(function () {
                    throw error;
                  });
                  return;
                }
              });
            }
            //db.commit(commitCallback);
            let participants = Object.keys(leagues[socket.league].participants).map(function (id) {
              return parseInt(id);
            });
            db.query(`select * from cpbl_schedule where date > ${Date.now()}`, function (error, results, fields) {
              if (error) {
                db.rollback(function () {
                  throw error;
                });
                return;
              }
              let temp = results;
              for (let i = 0; i < temp.length; i++) {
                participants = play.shuffle(participants);
                db.query(
                  `insert into cpbl_game (league_id, date, home_user_id, away_user_id, home_user_status, away_user_status, home_user_result, away_user_result) values ('${league_id}','${temp[i].date}', '${participants[0]}', '${participants[1]}', 'Unready', 'Unready', 'TBD', 'TBD')
								, ('${league_id}','${temp[i].date}', '${participants[2]}', '${participants[3]}', 'Unready', 'Unready', 'TBD', 'TBD')`,
                  function (error, results, fields) {
                    if (error) {
                      db.rollback(function () {
                        throw error;
                      });
                      return;
                    }
                  }
                );
              }
              db.commit(commitCallback);
            });
            // db.commit(commitCallback);
          });
        });
      }
    }
  });
});

// routes

app.use('/user/:id', function (req, res, next) {
  let now = Date.now();
  if (req.cookies.access_token) {
    db.query('select * from cpbl_user where access_token = ?', [req.cookies.access_token], function (error, results, fields) {
      if (error) {
        throw error;
      }
      if (results.length === 0) {
        res.send({ error: 'Invalid access token, please log in' });
        return;
      }
      if (now > results[0].access_expired) {
        res.send({ error: 'Access token has expired, please log in again' });
        return;
      }
      next();
    });
  } else {
    // redirect to login page
    res.redirect('/');
  }
});
app.get('/getAllLeague', (req, res) => {
  db.query('select * from cpbl_league', (error, results) => {
    if (error) {
      throw error;
    }
    res.send(results);
  });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/main.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user.html'));
});
app.get('/user/draft', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/draft.html'));
});

app.get('/getplayerdata', (req, res) => {
  getPlayerData('nothing', (result) => {
    res.send(result);
  });
});
app.get('/user/team', (req, res) => {
  if (req.cookies.access_token) {
    db.query('select * from cpbl_user where access_token = ?', [req.cookies.access_token], (error, results) => {
      if (error) {
        throw error;
      }
      if (results.length === 0) {
        res.send({ error: 'Invalid access token, please log in' });
        return;
      }
      let id = results[0].id;
      db.query(`select name,league_id from cpbl_draft join cpbl_league on cpbl_draft.league_id = cpbl_league.id where user_id = '${id}' group by league_id`, function (error, results) {
        if (error) {
          throw error;
        }
        res.send(results);
      });
    });
  }
});
app.post('/user/draft', (req, res) => {
  let data = req.body;
  if (req.cookies.access_token) {
    db.query('select * from cpbl_user where access_token = ?', [req.cookies.access_token], function (error, results, fields) {
      if (error) {
        throw error;
      }
      if (results.length === 0) {
        res.send({ error: 'Invalid access token, please log in' });
        return;
      }
      let id = results[0].id;
      db.query(`select * from cpbl_draft where user_id = '${id}' and league_id = '${data.league}'`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.send(results);
      });
    });
  }
});
app.post('/user/schedule', (req, res) => {
  let data = req.body;
  if (req.cookies.access_token) {
    db.query('select * from cpbl_user where access_token = ?', [req.cookies.access_token], function (error, results, fields) {
      if (error) {
        throw error;
      }
      if (results.length === 0) {
        res.send({ error: 'Invalid access token, please log in' });
        return;
      }
      let id = results[0].id;
      let results1;
      let date = Date.now();
      db.query(`select date, result, name, away_user_status, home_user_result from cpbl_game join cpbl_user on away_user_id = cpbl_user.id where home_user_id = '${id}' and league_id = '${data.league}'`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        for (let i = 0; i < results.length; i++) {
          results[i].date = results[i].date - date;
        }
        results1 = results;
        db.query(`select date, result, name, home_user_status, away_user_result from cpbl_game join cpbl_user on home_user_id = cpbl_user.id where away_user_id = '${id}' and league_id = '${data.league}'`, function (error, results, fields) {
          if (error) {
            throw error;
          }
          for (let i = 0; i < results.length; i++) {
            results[i].date = results[i].date - date;
          }
          res.send(results1.concat(results));
        });
      });
    });
  }
});
app.get('/user/mock-draft', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/mock-draft.html'));
});
app.get('/user/league', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/team.html'));
});

app.get('/profile', function (req, res) {
  let now = Date.now();
  if (req.cookies.access_token) {
    db.query('select * from cpbl_user where access_token = ?', [req.cookies.access_token], function (error, results, fields) {
      if (error) {
        throw error;
      }
      if (results.length === 0) {
        res.send({ error: 'Invalid access token, please log in' });
        return;
      }
      if (now > results[0].access_expired) {
        res.send({ error: 'Access token has expired, please log in again' });
        return;
      }
      let data = {
        id: results[0].id,
        name: results[0].name
      };
      res.send(data);
    });
  } else {
    res.send('please log in first');
  }
});
app.post('/add/lineup', (req, res) => {
  let data = req.body;
  if (req.cookies.access_token) {
    db.query('select * from cpbl_user where access_token = ?', [req.cookies.access_token], function (error, results, fields) {
      if (error) {
        throw error;
      }
      if (results.length === 0) {
        res.send({ error: 'Invalid access token, please log in' });
        return;
      }
      let id = results[0].id;
      let query = 'update cpbl_draft set player_status = ? where user_id = ? and player_name = ? and league_id = ?';
      db.query(query, ['Start', id, data.name, data.league], function (error, results, fields) {
        if (error) {
          throw error;
        }
        if (results.affectedRows === 1) {
          res.send({ result: 'Success' });
        } else {
          res.send({ result: 'update fail' });
        }
      });
    });
  }
});
app.post('/remove/lineup', (req, res) => {
  let data = req.body;
  if (req.cookies.access_token) {
    db.query('select * from cpbl_user where access_token = ?', [req.cookies.access_token], function (error, results, fields) {
      if (error) {
        throw error;
      }
      if (results.length === 0) {
        res.send({ error: 'Invalid access token, please log in' });
        return;
      }
      let id = results[0].id;
      let query = 'update cpbl_draft set player_status = ? where user_id = ? and player_name = ? and player_status = ? and league_id = ?';
      db.query(query, ['Bench', id, data.name, 'Start', data.league], function (error, results, fields) {
        if (error) {
          throw error;
        }
        if (results.affectedRows === 1) {
          res.send({ result: 'Success' });
        } else {
          res.send({ result: 'update fail' });
        }
      });
    });
  }
});
app.post('/ready/lineup', (req, res) => {
  let data = req.body;
  if (req.cookies.access_token) {
    db.query('select * from cpbl_user where access_token = ?', [req.cookies.access_token], function (error, results) {
      if (error) {
        throw error;
      }
      if (results.length === 0) {
        res.send({ error: 'Invalid access token, please log in' });
        return;
      }
      let id = results[0].id;
      db.query('select * from cpbl_draft where user_id = ? and league_id = ? and player_status = ?', [id, data.league, 'Start'], function (error, results, fields) {
        if (error) {
          throw error;
        }
        if (results.length === 3) {
          db.query('update cpbl_game set home_user_status = ? where home_user_id = ? and league_id = ?', ['Ready', id, data.league], function (error, results, fields) {
            if (error) {
              throw error;
            }
            db.query('update cpbl_game set away_user_status = ? where away_user_id = ? and league_id = ?', ['Ready', id, data.league], function (error, results, fields) {
              if (error) {
                throw error;
              }
              res.send({ result: 'Success' });
            });
          });
        } else {
          res.send({ result: `${results.length} players in lineup, please modify to 3 then try again` });
        }
      });
    });
  }
});
app.post('/signup', (req, res) => {
  let data = req.body;
  if (!data.name || !data.email || !data.password) {
    res.send({ error: 'Name, email and password are required' });
    return;
  }
  db.beginTransaction(function (error) {
    if (error) throw error;
    db.query(`select * from cpbl_user where email = '${data.email}'`, function (error, results, fields) {
      if (error) {
        res.send({ error: 'Database query error' });
        return db.rollback(function () {
          throw error;
        });
      }
      if (results.length > 0) {
        res.send({ error: 'Email already exists' });
        return;
      }
      let commitCallback = function (error) {
        if (error) {
          res.send({ error: 'Database query error' });
          return db.rollback(function () {
            throw error;
          });
        }
        res.cookie('access_token', user.access_token);
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
        res.redirect('/');
      };
      let now = Date.now();
      let user;
      //generate access token
      let sha = crypto.createHash('sha256');
      sha.update(data.email + data.password + now);
      let accessToken = sha.digest('hex');
      //generate salt for hashing
      let salt = crypto.randomBytes(32).toString('hex');
      //hash password
      crypto.pbkdf2(data.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) throw err;
        let hashedPwd = derivedKey.toString('hex');
        console.log(hashedPwd);
        user = {
          provider: 'native',
          email: data.email,
          name: data.name,
          salt: salt,
          password: hashedPwd,
          access_token: accessToken,
          access_expired: now + 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
        };
        //let query = `insert into cpbl_user (name, email, provider, salt, password, access_token, access_expired) values ('${data.name}', '${data.email}', 'native', '${salt}', '${hashedPwd}', '${accessToken}', '${user.access_expired}')`;
        let query = 'insert into cpbl_user set ?';
        db.query(query, user, function (error, results, fields) {
          if (error) {
            res.send({ error: 'Database query error' });
            return db.rollback(function () {
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

app.post('/signin', (req, res) => {
  let data = req.body;
  if (!data.email || !data.password) {
    res.send({ error: 'email and password are required' });
    return;
  }
  db.beginTransaction(function (error) {
    if (error) {
      throw error;
    }
    db.query('select * from cpbl_user where email = ?', [data.email], function (error, results, fields) {
      if (error) {
        res.send({ error: 'Database query error' });
        return db.rollback(function () {
          throw error;
        });
      }
      let user;
      let now = Date.now();
      let sha = crypto.createHash('sha256');
      sha.update(data.email + data.password + now);
      let accessToken = sha.digest('hex');
      let commitCallback = function (error) {
        if (error) {
          res.send({ error: 'Database query error' });
          return db.rollback(function () {
            throw error;
          });
        }
        if (user === null) {
          res.send({ error: 'Sign in error, user does not exist or incorrect password' });
        } else {
          res.cookie('access_token', user.access_token);
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
          res.send({ success: 'log in succeeded' });
        }
      };
      if (results.length == 0) {
        user = null;
        db.commit(commitCallback);
      } else {
        let salt = results[0].salt;
        let hashedPwd = results[0].password;
        // use salt to hash entered password and compare with the hashedPwd in db
        crypto.pbkdf2(data.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
          if (err) throw err;
          derivedKey = derivedKey.toString('hex');
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
            let query = 'update cpbl_user set access_token = ?, access_expired = ? where id = ?';
            db.query(query, [user.access_token, user.access_expired, user.id], function (error, results, fields) {
              if (error) {
                res.send({ error: 'Database query error' });
                return db.rollback(function () {
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

app.get('/batter', (req, res) => {
  async.parallel(
    [
      function (callback) {
        scrape.batter('http://www.cpbl.com.tw/web/team_playergrade.php?&team=E02&gameno=01', callback);
      },
      function (callback) {
        scrape.batter('http://www.cpbl.com.tw/web/team_playergrade.php?&team=L01&gameno=01', callback);
      },
      function (callback) {
        scrape.batter('http://www.cpbl.com.tw/web/team_playergrade.php?&team=A02&gameno=01', callback);
      },
      function (callback) {
        scrape.batter('http://www.cpbl.com.tw/web/team_playergrade.php?&team=B04&gameno=01', callback);
      }
    ],
    function (err, results) {
      res.send(results);
    }
  );
});
app.get('/pitcher', (req, res) => {
  async.parallel(
    [
      function (callback) {
        scrape.pitcher('http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=E02&year=2019&grade=2&syear=2019', callback);
      },
      function (callback) {
        scrape.pitcher('http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=L01&year=2019&grade=2&syear=2019', callback);
      },
      function (callback) {
        scrape.pitcher('http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=A02&year=2019&grade=2&syear=2019', callback);
      },
      function (callback) {
        scrape.pitcher('http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=B04&year=2019&grade=2&syear=2019', callback);
      }
    ],
    function (err, results) {
      res.send(results);
    }
  );
});

function getPlayerData(player, callback) {
  let batterList = [];
  let pitcherList = [];
  db.query('select * from batter', (err, result) => {
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
        batterList.push(batter);
      }
      db.query('select * from pitcher', (err, result) => {
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
            pitcherList.push(pitcher);
          }
        }
        callback(batterList, pitcherList);
      });
    }
  });
}

function getPlayerList(player, callback) {
  let playerList = [];
  db.query('select * from batter', (err, result) => {
    if (err) throw err;
    else {
      for (let i = 0; i < result.length; i++) {
        playerList.push(result[i].name);
      }
      db.query('select * from pitcher', (err, result) => {
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

server.listen(3000, () => console.log('server running on port 3000'));
