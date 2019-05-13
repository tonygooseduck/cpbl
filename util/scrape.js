const $ = require('cheerio');
const rp = require('request-promise-native');
const async = require('async');
const db = require('../db.js');

function scrapeBatterData(url, callback) {
  rp(url)
    .then(function (html) {
      let playerUrls = [];
      let list = $('td > a', html).length;
      for (let i = 0; i < list / 2; i++) {
        let str = $('td > a', html)[i * 2].attribs.href.split('=');
        let temp = str[1].split('&');
        playerUrls.push(temp[0]);
      }
      const playerData = [];
      $('tr > td', html).each(function (i, element) {
        playerData[i] = $(this).text();
      });
      const Batter = [];
      let player;
      // There are 31 columns for each player thus, number = playerData.length / 31
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
    .then(function (result) {
      let sql;
      async.eachLimit(
        result,
        1,
        function (bp, callback) {
          async.waterfall(
            [
              function (callback) {
                sql = `update batter set RBI = ${bp.RBI}, H = ${bp.H}, OBP = ${bp.OBP}, AVG = ${bp.AVG} where player_id = '${bp.Player_id}'`;
                db.query(sql, (error, results) => {
                  if (error) {
                    throw error;
                  }
                  if (results.affectedRows == 0) {
                    callback(null, results.affectedRows, bp);
                  } else {
                    callback(null, results.affectedRows, 'haha');
                  }
                });
              },
              function (affectedRows, bp, callback) {
                if (affectedRows == 0) {
                  sql = `insert into batter (name, team, player_id, RBI, H, OBP, AVG) values ('${bp.Name}', '${bp.Team}', '${bp.Player_id}', '${bp.RBI}', '${bp.H}', '${bp.OBP}', '${bp.AVG}')`;
                  db.query(sql, (error, results) => {
                    if (error) {
                      throw error;
                    }
                    callback(null, 'new player inserted');
                  });
                } else {
                  callback(null, 'player exist, updated');
                }
              }
            ],
            function (err, result) {
              console.log(result);
              callback();
            }
          );
        },
        function (err) {
          if (err) {
            console.log(err.message);
          }
          callback(null, result);
        }
      );
    })
    .catch(function (err) {
      console.log(err);
    });
}

function scrapePitcherData(url, callback) {
  rp(url)
    .then(function (html) {
      let playerUrls = [];
      let list = $('td > a', html).length;
      for (let i = 0; i < list / 2; i++) {
        let str = $('td > a', html)[i * 2].attribs.href.split('=');
        let temp = str[1].split('&');
        playerUrls.push(temp[0]);
      }
      console.log(playerUrls);
      const playerData = [];
      $('tr > td', html).each(function (i, element) {
        playerData[i] = $(this).text();
      });
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
    .then(function (result) {
      let sql;
      async.eachLimit(
        result,
        1,
        function (bp, callback) {
          async.waterfall(
            [
              function (callback) {
                sql = `update pitcher set ERA = ${bp.ERA}, WHIP = ${bp.WHIP}, W = ${bp.W} where player_id = '${bp.Player_id}'`;
                db.query(sql, (error, results) => {
                  if (error) {
                    throw error;
                  } else if (results.affectedRows == 0) {
                    callback(null, results.affectedRows, bp);
                  } else {
                    callback(null, results.affectedRows, 'haha');
                  }
                });
              },
              function (affectedRows, bp, callback) {
                if (affectedRows == 0) {
                  sql = `insert into pitcher (name, team, player_id, ERA, WHIP, W) values ('${bp.Name}', '${bp.Team}', '${bp.Player_id}', '${bp.ERA}', '${bp.WHIP}', '${bp.W}')`;
                  db.query(sql, (error, results) => {
                    if (error) {
                      throw error;
                    }
                    callback(null, 'new player inserted');
                  });
                } else {
                  callback(null, 'player exist, updated');
                }
              }
            ],
            function (err, result) {
              console.log(result);
              callback();
            }
          );
        },
        function (err) {
          if (err) {
            console.log(err.message);
          }
          callback(null, result);
        }
      );
    })
    .catch(function (err) {
      console.log(err);
    });
}

module.exports = {
  batter: scrapeBatterData,
  pitcher: scrapePitcherData,
}