// const fs = require('fs');
const async = require('async');
const crypto = require('crypto');
const schedule = require('node-schedule');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const user = require('./user');

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
const server = require('http').Server(app);

// attach the socket.io server
const io = require('socket.io')(server);

const scrape = require('./util/scrape.js');
const play = require('./util/play.js');
const lib = require('./util/lib.js');
const getPlayerData = lib.getData;
const getPlayerList = lib.getList;

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
const mock = require('./socket_io/mock.js');
mock(io);
// global variable for all the leagues in namespace 'real-draft'
const real = require('./socket_io/real.js');
real(io);

// routes
app.use('/user', user);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/main.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user.html'));
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

server.listen(3000, () => console.log('server running on port 3000'));
