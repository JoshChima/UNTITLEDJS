//How to Convert to https:
//https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/
require('dotenv').config()
var PORT = process.env.PORT || 3000;
var express = require('express');
//const socket = require('socket.io');
var http = require('http');
const math = require('mathjs')
const db = require("./db")
const collection = "untitled_col"
const player_collection = "player_col"
const laser_collection = "laser_col"

//var player_bulk = db.getDB().player_collection.initializeUnorderedBulkOp();
//var laser_bulk = db.getDB().laser_collection.initializeUnorderedBulkOp();

//let Player = require("./client/js/Player");
function Ship(id, x, y, h, lasers) {
    this.sid = id;
    this.x = x;
    this.y = y;
    this.heading = h;
    this.lasers = lasers;
}
// let players = [];

var app = express();
var server = http.Server(app);

db.connect((err) => {
    if (err) {
        console.log('unable to connect to database');
        process.exit(1);
    } else {
        console.log('MD connected')
        server.listen(PORT, function () {
            console.log("Server running")
        });
    }
})

var io = require('socket.io')(server);

app.use(express.static('client'));

setInterval(heartbeat, 50);

function findAllPlayer_SpecField(fieldOptions) {
    db.getDB().collection(player_collection).find({}, {
        projection: fieldOptions
    }).toArray(function (err, result) {
        if (err) throw err;
        return result
    });
}

function heartbeat() {
    let plyrs = findAllPlayer_SpecField({
        sid: 1,
        x: 1,
        y: 1,
        heading: 1
    })

    db.getDB().collection(player_collection).aggregate([{
        $lookup: {
            from: laser_collection,
            localField: 'sid',
            foreignField: 'sid',
            as: 'lasers'
        }
    }]).toArray(function (err, res) {
        if (err) throw err;
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
        db.getDB().collection(player_collection).insertOne({
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
        db.getDB().collection(player_collection).findOne({
            sid: socket.id
        }, function (err, result) {
            if (err) throw err;
            //console.log(result.sid + " " + result.x + " " + result.y)
        });


        let ship = new Ship(socket.id, data.x, data.y, data.h, data.lasers);
        players.push(ship);
    });

    socket.on('addLaser', function (d) {
        let data = JSON.parse(d)
        db.getDB().collection(laser_collection).insertOne({
            lid: data.lid,
            sid: socket.id,
            x: data.x,
            y: data.y,
            active: data.active
        }, function (err, res) {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
        });
    })

    socket.on('removeLaser', function (data) {
        let query = {
            lid: data
        }
        db.getDB().collection(laser_collection).deleteOne(query, function (err, res) {
            if (err) throw err;
            console.log("deleted one");
            console.log(res)
        });
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
        db.getDB().collection(player_collection).updateOne(query, newVal, function (err, res) {
            if (err) throw err;
        });
        db.getDB().collection(player_collection).findOne({
            sid: socket.id
        }, function (err, result) {
            if (err) throw err;
            // console.log(result.sid + " " + result.x + " " + result.y)
        });

        lsrs = data.lasers

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
                db.getDB().collection(laser_collection).updateOne(query, newVal, function (err, res) {
                    if (err) throw err;
                    console.log(res.result.nModified + " document(s) updated");
                });
            });
        }
    })
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

    // socket.on('resetCollections', function () {
    //     let dp;
    //     let dl;
    //     db.getDB().collection(player_collection).deleteMany({}, function(err, delOK) {
    //         if (err) throw err;
    //         if (delOK) {
    //             console.log("Player Collection cleared");
    //             dp = delOK;
    //         }
    //       });
    //     db.getDB().collection(player_collection).deleteMany({}, function(err, delOK) {
    //     if (err) throw err;
    //     if (delOK) {
    //         console.log("Player Collection cleared");
    //         dl = delOK;
    //     }
    //     });
    //     if(dp && dl) {
    //         process.exit();
    //     } else {
    //         console.log('action failed')
    //         process.exit();
    //     }
    // });

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


        db.getDB().collection(player_collection).deleteOne({
            sid: socket.id
        }, function (err, obj) {
            if (err) throw err;
            console.log(obj.result.n + " document(s) deleted");
        })
        console.log('Client ' + socket.id + ' has disconnected');
    });

    // if (players.length == 0) {
    //     // db.getDB.connection.close();
    // };

});