const async = require('async');
const db = require('../db.js');

function autoPlay(id, leagueId, user1, user2) {
  async.parallel(
    [
      function (callback) {
        db.query(`select AVG(RBI), AVG(H), AVG(OBP), AVG(AVG) from cpbl_draft join batter on player_name = batter.name where user_id = ${user1} and league_id = ${leagueId} and player_status = Start`, (err, results) => {
          if (err) {
            throw err;
          }
          callback(null, results[0]['AVG(RBI)'], results[0]['AVG(H)'], results[0]['AVG(OBP)'], results[0]['AVG(AVG)']);
        });
      },
      function (callback) {
        db.query(`select AVG(ERA), AVG(WHIP), AVG(W) from cpbl_draft join pitcher on player_name = pitcher.name where user_id = ${user1} and league_id = ${leagueId} and player_status = Start`, (err, results) => {
          if (err) {
            throw err;
          }
          callback(null, [results[0]['AVG(ERA)'], results[0]['AVG(WHIP)'], results[0]['AVG(W)']]);
        });
      },
      function (callback) {
        db.query(`select AVG(RBI), AVG(H), AVG(OBP), AVG(AVG) from cpbl_draft join batter on player_name = batter.name where user_id = ${user2} and league_id = ${leagueId} and player_status = Start`, (err, results) => {
          if (err) {
            throw err;
          }
          callback(null, results[0]['AVG(RBI)'], results[0]['AVG(H)'], results[0]['AVG(OBP)'], results[0]['AVG(AVG)']);
        });
      },
      function (callback) {
        db.query(`select AVG(ERA), AVG(WHIP), AVG(W) from cpbl_draft join pitcher on player_name = pitcher.name where user_id = ${user2} and league_id = ${leagueId} and player_status = Start`, (err, results) => {
          if (err) {
            throw err;
          }
          callback(null, [results[0]['AVG(ERA)'], results[0]['AVG(WHIP)'], results[0]['AVG(W)']]);
        });
      }
    ],
    function (err, results) {
      if (err) {
        throw err;
      }
      let count = 0;
      //compare batter data
      for (let i = 0; i < 4; i++) {
        if (results[0][i] == null && results[2][i] == null) {
          break;
        }
        if (results[0][i] == null) {
          count--;
          break;
        }
        if (results[2][i] == null) {
          count++;
          break;
        }
        if (results[0][i] > results[2][i]) {
          count++;
        } else {
          count--;
        }
      }
      //compare pitcher data
      for (let j = 0; j < 2; j++) {
        if (results[1][j] == null && results[3][j] == null) {
          break;
        }
        if (results[1][j] == null) {
          count--;
          break;
        }
        if (results[3][j] == null) {
          count++;
          break;
        }
        if (results[1][j] < results[3][j]) {
          count++;
        } else {
          count--;
        }
      }
      if (results[1][2] > results[3][2]) {
        count++;
      } else {
        count--;
      }
      console.log(count);
      if (count > 0) {
        //user1 wins
        db.query(`update cpbl_game set home_user_result = 'Win', away_user_result = 'Lose', result = 'Done' where id = '${id}'`, function (error, results, fields) {
          if (error) {
            throw error;
          }
        });
      } else {
        //user2 wins
        db.query(`update cpbl_game set home_user_result = 'Lose', away_user_result = 'Win', result = 'Done' where id = '${id}'`, function (error, results, fields) {
          if (error) {
            throw error;
          }
        });
      }
    }
  );
}

function shuffle(array) {
  let currentIndex = array.length,
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

module.exports = {
  autoPlay: autoPlay,
  shuffle: shuffle,
}