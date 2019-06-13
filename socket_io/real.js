const lib = require('../util/lib.js');
const getPlayerData = lib.getData;
const getPlayerList = lib.getList;
const play = require('../util/play.js');
const db = require('../db.js');

function real(io) {
    const leagues = {};
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
}

module.exports = real;