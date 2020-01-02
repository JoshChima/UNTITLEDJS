//How to Convert to https:
//https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/
require('dotenv').config()
var PORT = process.env.PORT || 3000;
var express = require('express');
var _ = require('underscore');
//const socket = require('socket.io');
var http = require('http');
const math = require('mathjs')
const db = require("./db")
const collection = "untitled_col"
var player_collection;
var laser_collection;
var beam_collection;

var ArenaWidth = 2000
var ArenaHeight = 2000

var stars = [];
//var player_bulk = db.getDB().player_collection.initializeUnorderedBulkOp();
//var laser_bulk = db.getDB().laser_collection.initializeUnorderedBulkOp();

//let Player = require("./client/js/Player");
function Ship(username, id, x, y, h, lasers) {
    this.username = username;
    this.sid = id;
    this.x = x;
    this.y = y;
    this.heading = h;
    this.lasers = lasers;
}

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

let players = [];
let projectiles = [];


function playerIds() {
    if (players.length > 0) {
        return players.map(player => player.sid)
    } else {
        return players
    }
}

function projectileIds() {
    if (projectiles.length > 0) {
        return projectiles.map(projectile => projectile.lid)
    } else {
        return projectiles
    }
}

var app = express();
var server = http.Server(app);

db.connect((err) => {
    if (err) {
        console.log('unable to connect to database');
        process.exit(1);
    } else {
        console.log('MD connected')
        player_collection = db.getDB().collection("player_col")
        laser_collection = db.getDB().collection("laser_col")
        beam_collection = db.getDB().collection("beam_col")
        server.listen(PORT, function () {
            console.log("Server running")
            for (var i = 0; i < 1000; i++) {
                stars[i] = new Star();
            }

            // let allSids = player_collection.find({
            //     sid: {
            //         $nin: playerIds()
            //     }
            // }).toArray(function (err, result) {
            //     if (err) throw err;
            //     return result;
            // });
            // console.log(allSids);
        });
    }
})

var io = require('socket.io')(server);

app.use(express.static('client'));

setInterval(heartbeat, 60);

function findAllPlayer_SpecField(fieldOptions) {
    fO = fieldOptions
    player_collection.find({}, {
        projection: fO
    }).toArray(function (err, result) {
        if (err) throw err;
        return result;
    });
}
// function findAllPlayer_SpecField(fieldOptions) {
//     db.getDB().collection(player_collection).find({}, {
//         projection: fieldOptions
//     }).toArray(function (err, result) {
//         if (err) throw err;
//         return result
//     });
// }

function heartbeat() {
    // for (var i = 0; i < stars.length; i++) {
    //     stars[i].update();
    // }
    // let dataset = stars.map(star => star.starData())
    // io.emit('starUpdate', dataset);
    player_collection.aggregate([{
        $lookup: {
            from: 'laser_col',
            localField: 'sid',
            foreignField: 'sid',
            as: 'lasers'
        }
    }, {
        $lookup: {
            from: 'beam_col',
            localField: 'sid',
            foreignField: 'sid',
            as: 'beams'
        }
    }]).toArray(function (err, res) {
        if (err) throw err;
        res.forEach(player => {
            if (_.contains(playerIds(), player.sid) == false) {
                player.lasers.forEach(laser => {
                    if (_.contains(projectileIds(), laser.lid) == false) {
                        player.lasers = _.without(player.lasers, _.findWhere(player.lasers, {
                            lid: laser.lid
                        }));
                    }
                    laser_collection.deleteOne({
                        lid: laser.lid
                    }, function (err, obj) {
                        if (err) throw err;
                        // console.log(obj.result.n + " document(s) deleted");
                    })
                })
                res = _.without(res, _.findWhere(res, {
                    sid: player.sid
                }));

                player_collection.deleteOne({
                    sid: player.sid
                }, function (err, obj) {
                    if (err) throw err;
                    // console.log(obj.result.n + " document(s) deleted");
                })
            }
        })
        //console.log(res)

        io.emit('heartbeat', JSON.stringify(res));
    });
    // players.forEach(player => {

    // })
    //io.emit('heartbeat', JSON.stringify(players));
}

io.on('connection', function (socket) {
    console.log('New client: ' + socket.id);



    socket.on('start', function (d) {
        let data = JSON.parse(d)
        player_collection.insertOne({
            username: data.username,
            sid: socket.id,
            x: data.x,
            y: data.y,
            isalive: data.isalive,
            heading: data.h
        }, function (err, data) {

            if (err != null) {
                return console.log(err);
            }
            //console.log(data.ops[0]);
        })
        player_collection.findOne({
            sid: socket.id
        }, function (err, result) {
            if (err) throw err;
            //console.log(result.sid + " " + result.x + " " + result.y)
        });


        let ship = new Ship(data.username, socket.id, data.x, data.y, data.h, data.lasers);
        players.push(ship);
    });

    socket.on('addLaser', function (d) {
        let data = JSON.parse(d)
        laser_collection.insertOne({
            lid: data.lid,
            sid: socket.id,
            x: data.x,
            y: data.y,
            active: data.active
        }, function (err, res) {
            if (err) throw err;
            // console.log("Number of documents inserted: " + res.insertedCount);
        });
        projectiles.push({
            lid: data.lid,
            sid: socket.id
        })
    })

    socket.on('addBeam', function (d) {
        let data = JSON.parse(d)
        beam_collection.insertOne({
            lid: data.lid,
            sid: socket.id,
            x: data.x,
            y: data.y,
            active: data.active
        }, function (err, res) {
            if (err) throw err;
            // console.log("Number of documents inserted: " + res.insertedCount);
        });
        projectiles.push({
            lid: data.lid,
            sid: socket.id
        });
    });

    socket.on('removeLaser', function (data) {
        let query = {
            lid: data
        }
        laser_collection.deleteOne(query, function (err, res) {
            if (err) throw err;
            // console.log("deleted one");
            // console.log(res)
        });
        let projectileIndex = _.findLastIndex(projectiles, {
            lid: data
        });
        projectiles.splice(projectileIndex, 1)
    });

    socket.on('removeBeam', function (data) {
        let query = {
            lid: data
        }
        beam_collection.deleteOne(query, function (err, res) {
            if (err) throw err;
            // console.log("deleted one");
            // console.log(res)
        });
        let projectileIndex = _.findLastIndex(projectiles, {
            lid: data
        });
        projectiles.splice(projectileIndex, 1)
    });

    socket.on('laserHit', function (slid) {
        let target_sid = socket.id
        let aggress_sid = slid.sid
        let aggress_lid = slid.lid
        io.to(aggress_sid).emit('laserHasHit', {
            t_sid: target_sid,
            a_lid: aggress_lid
        })
        console.log(target_sid + ' shot by ' + aggress_sid)
    })

    socket.on('beamHit', function (slid) {
        let target_sid = socket.id
        let aggress_sid = slid.sid
        let aggress_lid = slid.lid
        io.to(aggress_sid).emit('beamHasHit', {
            t_sid: target_sid,
            a_lid: aggress_lid
        })
        console.log(target_sid + ' shot by ' + aggress_sid)
    })

    socket.on('update', function (d) {

        let data = JSON.parse(d)

        let query = {
            sid: socket.id
        };
        let newVal = {
            $set: {
                x: data.x,
                y: data.y,
                isalive: data.isalive,
                heading: data.h
            }
        }
        player_collection.updateOne(query, newVal, function (err, res) {
            if (err) throw err;
        });
        player_collection.findOne({
            sid: socket.id
        }, function (err, result) {
            if (err) throw err;
            // console.log(result.sid + " " + result.x + " " + result.y)
        });

        lsrs = data.lasers;
        bms = data.beams;

        if (bms.length > 0) {
            bms.forEach(bm => {
                let query = {
                    lid: bm.lid
                };
                let newVal = {
                    $set: {
                        active: bm.active
                    }
                }
                beam_collection.updateOne(query, newVal, function (err, res) {
                    if (err) throw err;
                    // console.log(res.result.nModified + " document(s) updated");
                });
            });
        }

        if (lsrs.length > 0) {
            lsrs.forEach(lsr => {
                let query = {
                    lid: lsr.lid
                };
                let newVal = {
                    $set: {
                        x: lsr.x,
                        y: lsr.y,
                        active: lsr.active
                    }
                }
                laser_collection.updateOne(query, newVal, function (err, res) {
                    if (err) throw err;
                    // console.log(res.result.nModified + " document(s) updated");
                });
            });
        }
    });
    let ship;
    for (let i = 0; i < players.length; i++) {
        let ESid = players[i].sid;
        if (socket.id == ESid) {
            ship = players[i];
            ship.x = data.x;
            ship.y = data.y;
            ship.heading = data.h
            ship.lasers = data.lasers
        }
    }



    socket.on('disconnect', function () {
        for (let i = 0; i < players.length; i++) {
            let ESid = players[i].sid;
            if (socket.id == ESid) {
                players.splice(i, 1);
            }
        }
        // let ids = players.map(player => player.sid);
        // let plyrs = findAllPlayer_SpecField({
        //     sid: 1,
        //     x: 1,
        //     y: 1,
        //     heading: 1
        // })


        // let query = {
        //     sid: socket.id
        // };
        // let newVal = {
        //     $set: {
        //         isalive: false
        //     }
        // }
        // db.getDB().collection(player_collection).updateOne({query, newVal}, function (err, obj) {
        //     if (err) throw err;
        //     console.log("1 document update");
        // });


        player_collection.deleteOne({
            sid: socket.id
        }, function (err, obj) {
            if (err) throw err;
            // console.log(obj.result.n + " document(s) deleted");
        })
        console.log('Client ' + socket.id + ' has disconnected');
    });

    // if (players.length == 0) {
    //     // db.getDB.connection.close();
    // };

});