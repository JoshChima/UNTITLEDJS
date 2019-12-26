//How to Convert to https:
//https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/

var PORT = process.env.PORT || 3000;
var express = require('express');
//const socket = require('socket.io');
var http = require('http');

//let Player = require("./client/js/Player");
function Ship(id, x, y, h, lasers) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.heading = h;
    this.lasers = lasers;
}
let players = [];

var app = express();
var server = http.Server(app);


server.listen(PORT, function () {
    console.log("Server running")
});

var io = require('socket.io')(server);

app.use(express.static('client'));

setInterval(heartbeat, 50);
function heartbeat() {
    io.emit('heartbeat', JSON.stringify(players));
}

io.on('connection', function (socket) {
    console.log('New client: ' + socket.id);

    

    socket.on('start', function (d) {
        let data = JSON.parse(d)
        console.log(socket.id + " " + data.x + " " + data.y)
        let ship = new Ship(socket.id, data.x, data.y, data.h, data.lasers);
        players.push(ship);
    });

    socket.on('update', function (d) {
        let data = JSON.parse(d)
        console.log(socket.id + " " + data.x + " " + data.y);
        let ship;
        for (let i = 0; i < players.length; i++) {
            let ESid = players[i].id;
            if (socket.id == ESid) {
                ship = players[i];
                ship.x = data.x;
                ship.y = data.y;
                ship.heading = data.h
                ship.lasers = data.lasers
            }
        }

    });

    socket.on('disconnect', function () {
        for (let i = 0; i < players.length; i++) {
            let ESid = players[i].id;
            if (socket.id == ESid) {
                players.splice(i, 1);
            }
        }
        console.log('Client has disconnected');
    });
});