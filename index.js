const express = require('express');
const $ = require('cheerio');
const rp = require('request-promise-native');
//const cheerio = require('cheerio');

const app = express();
const server = require('http').Server(app);
// attach the socket.io server
const io = require('socket.io')(server);
//database
const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'test'
});
db.connect((err) => {
    if(err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id: ' + db.threadId);
    
    let rooms = {};
    // class playerList {
    //     constructor () {
    //         this.data = getPlayerList('player', function(result) {
    //             return result;
    //         });
    //     }
    // }
    
    const mock = io.of('mock-draft');
    mock.on('connection', function(socket) {
        //let temp;
        //let draftedList = [];
        //let draftPlayers = ["Faye", "David", "Jim"];
        //let order;
        //let rand;
        //let count;
        let a;
        console.log(`${socket.id} connected`);
        getPlayerData('player', function(result) {
            socket.emit('output', result);
        });
        getPlayerList('player', function(result) {
            a = JSON.stringify(result);
        });
        socket.on('joinroom', function(data) {
            socket.join(data, () => {
                // get the room name and save it in socket.mock
                socket.mock = socket.rooms[data];
                // console.log(Object.keys(socket.rooms));
                // create room in rooms
                rooms[data] = {};
                rooms[socket.mock].draftPlayers = ["Faye", "David", "Jim"];
                rooms[socket.mock].playerList = JSON.parse(a);
                rooms[socket.mock].draftedList = [];
                rooms[socket.mock].temp = [];
                rooms[socket.mock].turn;
                console.log(Object.keys(rooms));
            });
            
        });
        socket.on('start', function(data, callback) {

            rooms[socket.mock].draftPlayers.push("You");
            rooms[socket.mock].draftPlayers = shuffle(rooms[socket.mock].draftPlayers);
            callback(true);
            rooms[socket.mock].order = rooms[socket.mock].draftPlayers.indexOf("You");
            socket.emit('messages',`You are player ${rooms[socket.mock].draftPlayers.indexOf("You") + 1}`);
            // Random generate 4 choice, if one was taken , use the other three, if not takn , use the first three
            rooms[socket.mock].count = rooms[socket.mock].playerList.length;
            for(let i = 0; i < 4; i++) {
                rand = Math.floor(Math.random() * rooms[socket.mock].count);
                rooms[socket.mock].temp.push(rooms[socket.mock].playerList[rand]);
                rooms[socket.mock].playerList.splice(rand, 1);
                rooms[socket.mock].count--;
            }
            //console.log(rooms);
            if(rooms[socket.mock].order == 0) {
                socket.emit('messages', 'Your turn to pick!');
            } else if(rooms[socket.mock].order == 1) {
                socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[0]}`);
                rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                rooms[socket.mock].temp.splice(0, 1);
            } else if(rooms[socket.mock].order == 2) {
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
        socket.on('draft', function(data, callback) {
            rooms[socket.mock].turn = rooms[socket.mock].draftedList.length % rooms[socket.mock].draftPlayers.length;
            if(rooms[socket.mock].draftedList.indexOf(data) != -1) {
                callback(false);
            } else if(rooms[socket.mock].playerList.indexOf(data) == -1 && rooms[socket.mock].temp.indexOf(data) == -1) {
                console.log(rooms[socket.mock].playerList.indexOf(data));
                console.log(rooms[socket.mock].temp.indexOf(data));
                callback(false);

            } else if(rooms[socket.mock].draftPlayers.indexOf("You") !== rooms[socket.mock].turn) {
                callback(false);
            } else {
                callback(true);
                rooms[socket.mock].draftedList.push(data);
                if(rooms[socket.mock].temp.indexOf(data) != -1) {
                    rooms[socket.mock].temp.splice(rooms[socket.mock].temp.indexOf(data), 1);
                }
                console.log(rooms[socket.mock].draftedList);
                socket.emit('messages', `You drafted ${data}`);
                rooms[socket.mock].playerList.splice(rooms[socket.mock].playerList.indexOf(data), 1);
                if(rooms[socket.mock].temp.length < 3) {
                    for(let i = 0; i < 4; i++) {
                        rand = Math.floor(Math.random() * rooms[socket.mock].count);
                        rooms[socket.mock].temp.push(rooms[socket.mock].playerList[rand]);
                        rooms[socket.mock].playerList.splice(rand, 1);
                        rooms[socket.mock].count--;
                    }
                }
                if(rooms[socket.mock].order == 0) {
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]} picked ${rooms[socket.mock].temp[0]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[1]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[3]} picked ${rooms[socket.mock].temp[2]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                    if(rooms[socket.mock].draftedList.length >= 4 * 5) {
                        socket.emit('end', 'end of draft');
                        return;
                    }
                } else if(rooms[socket.mock].order == 1) {
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]} picked ${rooms[socket.mock].temp[0]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[3]} picked ${rooms[socket.mock].temp[1]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
                    if(rooms[socket.mock].draftedList.length >= 4 * 5) {
                        socket.emit('end', 'end of draft');
                        return;
                    }
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]} picked ${rooms[socket.mock].temp[2]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                } else if(rooms[socket.mock].order == 2) {
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[3]} picked ${rooms[socket.mock].temp[0]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                    if(rooms[socket.mock].draftedList.length >= 4 * 5) {
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
                    if(rooms[socket.mock].draftedList.length >= 4 * 5) {
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

    const real = io.of('real-draft');
    real.on('connection', function(socket) {
        socket.counter = counter++;
        sockets[socket.counter] = socket;
        //console.log(`user ${socket.counter} connected`);
        console.log(`${socket.id} connected`);

        // get player full stats
        getPlayerData('player', function(result) {
            socket.emit('output', result);
        });
        getPlayerList('player', function(result) {
            playerList = result;
        });

        socket.on('disconnect', function() {
            delete sockets[socket.counter];
            console.log(`user ${socket.counter} disconnected`);
            // let i = players.indexOf(socket);
            // players.splice(i, 1);
        });
        socket.on('nickname', function(data, callback) {
            if(nicknames.indexOf(data) != -1) {
                callback(false);
            } else {
                callback(true);
                nicknames.push(data);
                socket.nickname = data;
                real.emit('nicknames', nicknames);
            }
        });
        
        socket.on('draft', function(data, callback) {
            let turn = draftedList.length % nicknames.length;
            //check whether player is already drafted
            if(draftedList.indexOf(data) != -1) {
                callback(false);
            } else if(playerList.indexOf(data) == -1) {
                callback(false);
            } 
            //check whose turn to draft
            else if(nicknames.indexOf(socket.nickname) !== turn) {
                callback(false);
            } else {
                callback(true);
                draftedList.push(data);
                //console.log(draftedList);
                // let d = playerList.indexOf(data);
                // console.log(d);
                //playerList.splice(d, 1);
                //console.log(playerList);
                real.emit('message', `${socket.nickname} drafted ${data}`);
                if(draftedList.length === nicknames.length * 3) {
                    real.emit('end', 'Draft has ended');
                }
            }
        });
    });
});

//const url = 'http://www.cpbl.com.tw/web/team_player.php?&team=E02';
//const url = 'http://www.cpbl.com.tw/web/team_playergrade.php?&team=E02&gameno=01';
//const url = 'https://en.wikipedia.org/wiki/List_of_Presidents_of_the_United_States';

app.get('/draft', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/mock-draft', (req, res) => {
    res.sendFile(__dirname + '/mock-draft.html')
});

app.get('/', (req, res) => {
// scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=E02&gameno=01");
// scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=L01&gameno=01");
// scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=A02&gameno=01");
// scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=B04&gameno=01");
// res.send('done');
// scrapePitcherData("http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=E02&year=2019&grade=2&syear=2019");
// scrapePitcherData("http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=L01&year=2019&grade=2&syear=2019");
// scrapePitcherData("http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=A02&year=2019&grade=2&syear=2019");
// scrapePitcherData("http://www.cpbl.com.tw/web/team_playergrade.php?&gameno=01&team=B04&year=2019&grade=2&syear=2019");
// res.send('done');

// scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=E02&gameno=01")
// .then((w)=>{
//     console.log(w);
    
//     scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=L01&gameno=01");
// })
// .then(()=>{
//     scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=A02&gameno=01");
// })
// .then(()=> {
//     scrapeBatterData("http://www.cpbl.com.tw/web/team_playergrade.php?&team=B04&gameno=01");
// })
// .then(()=> res.send('done'))
// .catch(err=>console.log(err));
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

const playerParse = function(url) {
    return rp(url)
        .then(function(html) {
            return {
                name: $('.player_info_name', html).text().split(' ')[0]
            };
        })
        .catch(function(err) {
            console.log(err);
        });
};
});
function scrapeBatterData(url) {
//return new Promise((resolve, reject) => {
rp(url)
    .then(function(html){
        let playerUrls = [];
        let list = $('td > a', html).length; 
        for(let i = 0; i < list/2; i++){
            let str = ($('td > a', html)[i * 2].attribs.href).split('=');
            let temp = str[1].split('&')
            playerUrls.push(temp[0]);
        }
        //console.log(playerUrls);
        const playerData = [];
        $('tr > td', html).each(function(i, element) {
            playerData[i] = $(this).text();
        });
        const Batter = [];
        let player;
         // player number = playerData.length / 31
        for(let i = 0; i < playerData.length / 31; i ++) {
            player = {
                Name: playerData[i * 31],
                Team: playerData[i * 31 + 1],
                Player_id: playerUrls[i],
                RBI: parseInt(playerData[i * 31 + 5]),
                H: parseInt(playerData[i * 31 + 7]),
                OBP: parseFloat(playerData[i * 31 + 15]),
                AVG: parseFloat(playerData[i * 31 + 17])
            }
            Batter.push(player);
        }
        return Batter;
    })
    .then(function(result){
        console.log(result);
        let sql;
        let bp;
        for(let i = 0; i < result.length; i++){
            bp = result[i];
            //sql = `insert into batter (name, team, player_id, RBI, H, OBP, AVG) values ('${bp.Name}', '${bp.Team}', '${bp.Player_id}', '${bp.RBI}', '${bp.H}', '${bp.OBP}', '${bp.AVG}')`;
            sql = `update batter set RBI = ${bp.RBI}, H = ${bp.H}, OBP = ${bp.OBP}, AVG = ${bp.AVG} where player_id = '${bp.Player_id}'`;
            db.query(sql, (err, result) => {
                if (err) throw err;

            });
        }
        
    })
    .catch(function(err){
        console.log(err);
    });
//});
}

function scrapePitcherData(url) {
//return new Promise((resolve, reject) => {
rp(url)
    .then(function(html){
        let playerUrls = [];
        let list = $('td > a', html).length; 
        for(let i = 0; i < list/2; i++){
            let str = ($('td > a', html)[i * 2].attribs.href).split('=');
            let temp = str[1].split('&')
            playerUrls.push(temp[0]);
        }
        console.log(playerUrls);
        const playerData = [];
        $('tr > td', html).each(function(i, element) {
            playerData[i] = $(this).text();
        });
        //console.log(playerData);
        const Pitcher = [];
        let player;
            // player number = playerData.length / 31
        for(let i = 0; i < playerData.length / 31; i ++) {
            player = {
                Name: playerData[i * 31],
                Team: playerData[i * 31 + 1],
                Player_id: playerUrls[i],
                W: parseInt(playerData[i * 31 + 8]),
                ERA: parseFloat(playerData[i * 31 + 15]),
                WHIP: parseFloat(playerData[i * 31 + 14])
            }
            Pitcher.push(player);
        }
        return Pitcher;
    })
    .then(function(result){
        console.log(result);
        let sql;
        let bp;
        for(let i = 0; i < result.length; i++){
            bp = result[i];
            //sql = `insert into pitcher (name, team, player_id, ERA, WHIP, W) values ('${bp.Name}', '${bp.Team}', '${bp.Player_id}', '${bp.ERA}', '${bp.WHIP}', '${bp.W}')`;
            sql = `update pitcher set ERA = ${bp.ERA}, WHIP = ${bp.WHIP}, W = ${bp.W} where player_id = '${bp.Player_id}'`;
            db.query(sql, (err, result) => {
                if (err) throw err;

            });
        }
    })
    .catch(function(err){
        console.log(err);
    });
}

function getPlayerData(player, callback) {
    let playerList = [];    
    db.query('select * from batter', (err, result) => {
        if(err) throw err;
        else {
            let batter;
            for(let i = 0; i < result.length; i++) {
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
            db.query('select * from pitcher', (err, result) => {
                if(err) throw err;
                else {
                    let pitcher;
                    for(let i = 0; i < result.length; i++) {
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
    db.query('select * from batter', (err, result) => {
        if(err) throw err;
        else {
            for(let i = 0; i < result.length; i++) {
                playerList.push(result[i].name);
            }
            db.query('select * from pitcher', (err, result) => {
                if(err) throw err;
                else {
                    for(let i = 0; i < result.length; i++) {
                        playerList.push(result[i].name);
                    }
                }
                callback(playerList);
            });
        }
    });
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

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
server.listen(3000, () => console.log('server running on port 3000'));