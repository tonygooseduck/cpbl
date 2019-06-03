const express = require('express');
const router = express.Router();
const db = require('./db.js');
const path = require('path');

router.use(function (req, res, next) {
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
        res.redirect('/login');
    }
});

router.get('/draft', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/draft.html'));
});
router.get('/mock-draft', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/mock-draft.html'));
});
router.get('/league', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/team.html'));
});

router.get('/team', (req, res) => {
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

router.get('/profile', function (req, res) {
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
router.post('/draft', (req, res) => {
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

router.post('/schedule', (req, res) => {
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
module.exports = router;