var PORT = process.env.PORT || 3000;
var express = require('express');
var _ = require('underscore');
var http = require('http');

const ArenaWidth = 2000
const ArenaHeight = 2000

var stars = [];
let players = [];
let projectiles = {
    lasers: {},
    beams: {}
    // lids() {
    //     let llids = this.lasers.map(laser => laser.lid);
    //     let blids = this.beams.map(beam => beam.lid);
    //     arr = llids.concat(blids)
    //     return arr
    // }
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRndFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function Star() {
    this.x = getRndInteger(-ArenaWidth, ArenaWidth);
    this.y = getRndInteger(-ArenaHeight, ArenaHeight);
    this.size = getRndFloat(0.25, 3);
    this.t = getRndFloat(6.28318530717958647693);

    this.starData = function () {
        let data = {
            x: this.x,
            y: this.y,
            size: this.size,
            t: this.t
        }
        return data
    }

    this.update = function () {
        this.t += 0.1;
    }
}

var app = express();
var server = http.Server(app);

server.listen(PORT, function () {
    console.log("Server running")
    for (var i = 0; i < 1000; i++) {
        stars[i] = new Star();
    }
});

var io = require('socket.io')(server);

app.use(express.static('client'));

io.sockets.on('connection', function (socket) {

    console.log(`${socket.id} connected`);
    socket.emit('setId', {
        id: socket.id
    });
    let starset = stars.map(star => star.starData());
    io.emit('starUpdate', starset);

    socket.on('disconnect', function () {
        console.log(`Player ${socket.id} disconnected`);
        delete socket.userData
        socket.broadcast.emit('deletedPlayer', {
            id: socket.id
        });
    });

    socket.on('start', function (d) {
        let data = JSON.parse(d);
        socket.userData = {
            username: data.username,
            x: data.x,
            y: data.y,
            heading: data.h,
            health: data.health,
            score: data.score,
            isalive: data.isalive,
            lasers: data.lasers,
            beams: data.beams
        }
    });

    socket.on('update', function (d) {
        let data = JSON.parse(d); 
        if (socket.userData !== undefined) {
            socket.userData.username = data.username
            socket.userData.x = data.x
            socket.userData.y = data.y
            socket.userData.heading = data.h
            socket.userData.health = data.health
            socket.userData.score = data.score
            socket.userData.isalive = data.isalive
            // socket.userData.lasers = data.lasers
            // socket.userData.beams = data.beams
            data.lasers.forEach(laser => {
                // if (Object.keys(projectiles.lasers).includes(laser.lid)) 
                if (projectiles.lasers[laser.lid] !== undefined) {
                    projectiles.lasers[laser.lid].x = laser.x
                    projectiles.lasers[laser.lid].y = laser.y
                    projectiles.lasers[laser.lid].active = laser.active
                }
            });
            data.beams.forEach(beam => {
                // if (Object.keys(projectiles.beams).includes(beam.lid)) 
                if (projectiles.beams[beam.lid] !== undefined) {
                    projectiles.beams[beam.lid].active = beam.active
                }
            });
        }
    });

    socket.on('addLaser', function (d) {
        let data = JSON.parse(d)
        // projectiles.newLasers.push(data)
        projectiles.lasers[data.lid] = {
            lid: data.lid,
            sid: data.sid,
            x: data.x,
            y: data.y,
            active: data.active
        }
    });

    socket.on('addBeam', function (d) {
        let data = JSON.parse(d)
        // projectiles.newBeams,push(data)
        projectiles.beams[data.lid] = {
            lid: data.lid,
            sid: data.sid,
            x: data.x,
            y: data.y,
            active: data.active
        }
    });

    socket.on('laserHit', function (slid) {
        let target_sid = socket.id
        let aggress_sid = slid.sid
        let aggress_lid = slid.lid
        io.to(aggress_sid).emit('laserHasHit', {
            t_sid: target_sid,
            a_lid: aggress_lid
        });
        console.log(target_sid + ' shot by ' + aggress_sid)
    });

    socket.on('beamHit', function (slid) {
        let target_sid = socket.id
        let aggress_sid = slid.sid
        let aggress_lid = slid.lid
        io.to(aggress_sid).emit('beamHasHit', {
            t_sid: target_sid,
            a_lid: aggress_lid
        });
        console.log(target_sid + ' shot by ' + aggress_sid)
    });

    socket.on('removeLaser', function (llid) {
        delete projectiles.lasers[llid]
    });
    socket.on('removeBeam', function (llid) {
        delete projectiles.beams[llid]
    });
});

setInterval(heartBeat, 50)

function heartBeat() {
    const nsp = io.of('/');
    let pack = {
        players: [],
        usernames: [],
        projectiles: {
            lasers: Object.values(projectiles.lasers),
            beams: Object.values(projectiles.beams)
        }
    };
    // pack.projectiles.lasers.push(...Object.values(projectiles.lasers))
    // pack.projectiles.beams.push(...Object.values(projectiles.beams))
    for (let id in io.sockets.sockets) {
        const socket = nsp.connected[id]
        if (socket.userData !== undefined) {
            pack.usernames.push(socket.userData.username)
            pack.players.push({
                username: socket.userData.username,
                sid: socket.id,
                x: socket.userData.x,
                y: socket.userData.y,
                heading: socket.userData.heading,
                health: socket.userData.health,
                score: socket.userData.score,
                isalive: socket.userData.isalive
                // lasers: getLasersBySid(socket.id),
                // beams: getBeamsBySid(socket.id)
            });
        }
    }
    // if (pack.projectiles.lasers.length > 0) {
        //     console.log(pack.projectiles.lasers.length)
        // }
        // if (pack.projectiles.beams.length > 0) {
        //     console.log(pack.projectiles.beams.length)
        // }
    if (pack.players.length > 0) {
        io.emit('heartbeat', JSON.stringify(pack));
    }
}

// function getLasersBySid(lsid) {
//     return _.where(projectiles.lasers, {
//         sid: lsid
//     });
// }

// function getBeamsBySid(bsid) {
//     return _.where(projectiles.beams, {
//         sid: bsid
//     });
// }