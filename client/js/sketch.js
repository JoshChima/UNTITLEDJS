var socket;
var ship;
var zoom;
var stars = [];

var username;
var players = [];
var startX;
var starty;

var scl = 10
var c;

var ArenaWidth = 2000
var ArenaHeight = 2000

function shipData() {
    let shipData = {
        username: ship.username,
        x: ship.pos.x,
        y: ship.pos.y,
        h: ship.heading,
        isalive: ship.isalive,
        lasers: ship.getLaserData(),
        beams: ship.getBeamData()
    };
    return shipData
}

function newCanvas() {
    c = createCanvas(window.innerWidth, window.innerHeight);
    c.parent('jumbo-canvas')
}

function newShip() {
    socket = io()
    yert = document.getElementById("login");
    xert = document.getElementById("login-form");
    username = xert.elements[0].value
    yert.style.display = "none";
    startX = floor(random(floor(ArenaWidth / scl))) * scl;
    startY = floor(random(floor(ArenaHeight / scl))) * scl;
    ship = new Ship(username, socket.id, startX, startY, scl);

    let data = shipData()
    socket.emit('start', JSON.stringify(data));
}

function setup() {
    bg = loadImage('img/cos.jpg');
    socket = io()
    // console.log(socket.id);
    socket.on('starUpdate', function (dataset) {
        stars = dataset
    });

    socket.on('heartbeat', function (d) {
        let data = JSON.parse(d);
        // console.log(socket.id)
        // console.log(data);
        players = data;
    });

    socket.on('laserHasHit', function (data) {
        ship.lasers.forEach(laser => {
            if (laser.uniqueID == data.a_lid) {
                laser.lifespan = 0;
                ship.score += 10;
                console.log('Your laser hit ' + data.t_sid)
            }
        })
    })

    socket.on('beamHasHit', function (data) {
        ship.beams.forEach(beam => {
            if (beam.uniqueID == data.a_lid) {
                beam.lifespan = 0;
                ship.score += 100;
                console.log('Your beam hit ' + data.t_sid)
            }
        })
    })
};

function draw() {
    newCanvas()

    background(0);

    // image(bg, 0, 0, ArenaWidth*2, ArenaHeight*2);


    // push()
    // textAlign(CENTER);
    // textSize(12);
    // let position = str(ship.pos.x) + str(ship.pos.y)
    // text(position, ship.pos.x, ship.pos.y)
    // pop()
    translate(width / 2, height / 2)
    if (ship) {
        translate(-ship.pos.x, -ship.pos.y)
    }

    for (let i = 0; i < players.length; i++) {
        let d;
        if (ship) {
            d = int(dist(ship.pos.x, ship.pos.y, players[i].x, players[i].y));
        }

        if (ship && players[i].sid !== socket.id && d < Math.max(width, height)) {
            push()
            fill(255, 0, 0)
            textAlign(CENTER);
            textSize(12);
            // text(socket.id, players[i].x, players[i].y - scl*3)
            text(players[i].username, players[i].x, players[i].y + scl * 3)
            translate(players[i].x, players[i].y);
            rotate(players[i].heading + PI / 2)
            triangle(-scl, scl, scl, scl, 0, -scl);
            pop()

            // push()
            // //distance between
            // line(ship.pos.x, ship.pos.y, players[i].x, players[i].y)
            // ellipse(ship.pos.x, ship.pos.y, 5, 5);
            // ellipse(players[i].x, players[i].y, 5, 5);
            // translate((ship.pos.x + players[i].x) / 2, (ship.pos.y + players[i].y) / 2);
            // rotate(atan2(players[i].y - ship.pos.y, players[i].x - ship.pos.x));
            // text(nfc(d, 1), 0, -5);
            // pop()

            for (let l = 0; l < players[i].beams.length; l++) {
                let bm = players[i].beams[l];
                let bd = int(dist(ship.pos.x, ship.pos.y, bm.x, bm.y));
                if (bd < Math.max(width, height)) {
                    push()
                    fill(255, 0, 0)
                    ellipse(bm.x, bm.y, scl + (scl * .3), scl + (scl * .3));
                    pop()
                }
                ship.hit(bd, bm, 'beam')
            }

            for (let l = 0; l < players[i].lasers.length; l++) {
                let lsr = players[i].lasers[l];
                let ld = int(dist(ship.pos.x, ship.pos.y, lsr.x, lsr.y));
                if (ld < Math.max(width, height)) {
                    push()
                    fill(255, 0, 0)
                    strokeWeight(4);
                    ellipse(lsr.x, lsr.y, 5, 5);
                    //point(lsr.x, lsr.y);
                    pop()
                }
                ship.hit(ld, lsr, 'laser')
            }
        }



    }

    if (ship) {
        ship.deathCheck();
        ship.lasers.forEach(lsr => {
            if (lsr.active == false) {
                let data = lsr.uniqueID
                socket.emit('removeLaser', data)
            }
        });
        ship.beam.forEach(beam => {
            if (beam.active == false) {
                let data = beam.uniqueID
                socket.emit('removeBeam', data)
            }
        });
        ship.ruLasers();
        ship.ruBeams();
        ship.render();
        ship.turn();
        ship.update();
        let data = shipData()
        socket.emit('update', JSON.stringify(data));
    }
    stars.forEach(star => {
        noStroke();
        let scale = star.size + sin(star.t) * 2;
        ellipse(star.x, star.y, scale, scale);
    });
    ellipse(ArenaWidth / 2, ArenaHeight / 2, 20, 20);

    //camera(0,0,2000,ship.pos.x,ship.pos.y,0,0,1,0)
    //camera(0, 0, 20 + sin(frameCount * 0.01) * 10, 0, 0, 0, 0, 1, 0);
    //camera(ship.pos.x, ship.pos.y, zoom.value())

    if (ship) {
        document.getElementById("position").innerHTML = "Username: " + username + "<br> Score: " + ship.score + "<br> Health: " + ship.health + "<br> X: " + int(ship.pos.x) + "<br> Y: " + int(ship.pos.y) + "<br> CoolDown: " + int(ship.coolDown) + "<br> Heading: " + ship.heading;
    }
}