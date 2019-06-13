const lib = require('../util/lib.js');
const getPlayerData = lib.getData;
const getPlayerList = lib.getList;
const play = require('../util/play.js');

function mock(io) {
    const rooms = {};
    const mock = io.of('mock-draft');
    mock.on('connection', (socket) => {
        let rand;
        console.log(`${socket.id} connected`);
        getPlayerData('player', (result1, result2) => {
            socket.emit('output', result1, result2);
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
                    rooms[socket.mock].draftPlayers = ['電腦1', '電腦2', '電腦3'];
                    getPlayerList('player', (result) => {
                        rooms[data].playerList = result;
                    });
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
            socket.emit('messages', `你是第${rooms[socket.mock].draftPlayers.indexOf('You') + 1}順位`);
            // Random generate 4 choices
            rooms[socket.mock].count = rooms[socket.mock].playerList.length;
            for (let i = 0; i < 4; i += 1) {
                rand = Math.floor(Math.random() * rooms[socket.mock].playerList.length);
                rooms[socket.mock].temp.push(rooms[socket.mock].playerList[rand]);
                rooms[socket.mock].playerList.splice(rand, 1);
                // rooms[socket.mock].count -= 1;
            }
            console.log(rooms[socket.mock].temp);
            if (rooms[socket.mock].order === 0) {
                socket.emit('messages', '輪到你了!');
            } else if (rooms[socket.mock].order === 1) {
                socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]}選擇了${rooms[socket.mock].temp[0]}`);
                rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                rooms[socket.mock].temp.splice(0, 1);
            } else if (rooms[socket.mock].order === 2) {
                socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]}選擇了${rooms[socket.mock].temp[0]}`);
                rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]}選擇了${rooms[socket.mock].temp[1]}`);
                rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
                rooms[socket.mock].temp.splice(0, 1);
                rooms[socket.mock].temp.splice(0, 1);
            } else {
                socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]}選擇了${rooms[socket.mock].temp[0]}`);
                rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]}選擇了${rooms[socket.mock].temp[1]}`);
                rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
                socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]}選擇了${rooms[socket.mock].temp[2]}`);
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
                // console.log(rooms[socket.mock].draftedList);
                socket.emit('messages', `你選擇了${data}`);
                rooms[socket.mock].playerList.splice(rooms[socket.mock].playerList.indexOf(data), 1);
                if (rooms[socket.mock].temp.length <= 3) {
                    for (let i = 0; i < 4; i += 1) {
                        rand = Math.floor(Math.random() * rooms[socket.mock].playerList.length);
                        rooms[socket.mock].temp.push(rooms[socket.mock].playerList[rand]);
                        rooms[socket.mock].playerList.splice(rand, 1);
                        // rooms[socket.mock].count -= 1;
                    }
                    console.log(rooms[socket.mock].temp);
                }
                if (rooms[socket.mock].order === 0) {
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]}選擇了${rooms[socket.mock].temp[0]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]}選擇了${rooms[socket.mock].temp[1]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[3]}選擇了${rooms[socket.mock].temp[2]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                    if (rooms[socket.mock].draftedList.length >= 4 * 5) {
                        socket.emit('end', 'end of draft');
                        return;
                    }
                } else if (rooms[socket.mock].order === 1) {
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]}選擇了${rooms[socket.mock].temp[0]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[3]}選擇了${rooms[socket.mock].temp[1]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
                    if (rooms[socket.mock].draftedList.length >= 4 * 5) {
                        socket.emit('end', 'end of draft');
                        return;
                    }
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]}選擇了${rooms[socket.mock].temp[2]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                } else if (rooms[socket.mock].order === 2) {
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[3]}選擇了${rooms[socket.mock].temp[0]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                    if (rooms[socket.mock].draftedList.length >= 4 * 5) {
                        socket.emit('end', 'end of draft');
                        return;
                    }
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]}選擇了${rooms[socket.mock].temp[1]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]}選擇了${rooms[socket.mock].temp[2]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                } else {
                    if (rooms[socket.mock].draftedList.length >= 4 * 5) {
                        socket.emit('end', 'end of draft');
                        return;
                    }
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[0]}選擇了${rooms[socket.mock].temp[0]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[0]);
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[1]}選擇了${rooms[socket.mock].temp[1]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[1]);
                    socket.emit('messages', `${rooms[socket.mock].draftPlayers[2]}選擇了${rooms[socket.mock].temp[2]}`);
                    rooms[socket.mock].draftedList.push(rooms[socket.mock].temp[2]);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                    rooms[socket.mock].temp.splice(0, 1);
                }
            }
        });
    });
}

module.exports = mock;