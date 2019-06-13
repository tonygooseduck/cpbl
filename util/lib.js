const db = require('../db.js');

function getPlayerData(player, callback) {
    let batterList = [];
    let pitcherList = [];
    db.query('select * from batter', (err, result) => {
        if (err) throw err;
        else {
            let batter;
            for (let i = 0; i < result.length; i += 1) {
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
                    for (let i = 0; i < result.length; i += 1) {
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
            for (let i = 0; i < result.length; i += 1) {
                playerList.push(result[i].name);
            }
            db.query('select * from pitcher', (err, result) => {
                if (err) throw err;
                else {
                    for (let i = 0; i < result.length; i += 1) {
                        playerList.push(result[i].name);
                    }
                }
                callback(playerList);
            });
        }
    });
}

module.exports = {
    getData: getPlayerData,
    getList: getPlayerList,
}