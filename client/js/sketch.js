var socket;
var ship;
var zoom;

var players = [];
var startX;
var starty;

var scl = 10
var c;

var ArenaWidth = 2000
var ArenaHeight = 2000

function setup() {
    c = createCanvas(600, 600);
    //c.parent('jumbo-canvas')

    socket = io()

    startX = floor(random(floor(ArenaWidth / scl))) * scl;
    startY = floor(random(floor(ArenaHeight / scl))) * scl;
    // console.log(socket.id);
    ship = new Ship(socket.id, startX, startY);

    var data = {
        x: ship.pos.x,
        y: ship.pos.y,
        h: ship.heading,
        lasers: ship.getLaserData()
    };
    socket.emit('start', JSON.stringify(data));

    socket.on('heartbeat', function (d) {
        let data = JSON.parse(d);
        //console.log(data);
        players = data;
    });
};

function draw() {
    background(100);
    translate(width / 2, height / 2)
    translate(-ship.pos.x, -ship.pos.y)

    for (let i = 0; i < players.length; i++) {
        let d = int(dist(ship.pos.x, ship.pos.y, players[i].x, players[i].y));

        if (players[i].id !== socket.id && d < Math.max(width, height)) {
            push()
            fill(255, 0, 0)
            textAlign(CENTER);
            textSize(12);
            // text(socket.id, players[i].x, players[i].y - scl*3)
            text(players[i].id, players[i].x, players[i].y + scl * 3)
            translate(players[i].x, players[i].y);
            rotate(players[i].heading + PI / 2)
            triangle(-scl, scl, scl, scl, 0, -scl);
            pop()

            push()
            //distance between
            line(ship.pos.x, ship.pos.y, players[i].x, players[i].y)
            ellipse(ship.pos.x, ship.pos.y, 5, 5);
            ellipse(players[i].x, players[i].y, 5, 5);
            translate((ship.pos.x + players[i].x) / 2, (ship.pos.y + players[i].y) / 2);
            rotate(atan2(players[i].y - ship.pos.y, players[i].x - ship.pos.x));
            text(nfc(d, 1), 0, -5);
            pop()
        }

        for (let l = 0; l < players[i].lasers.length; l++) {
            let lsr = players[i].lasers[l];
            let d = int(dist(ship.pos.x, ship.pos.y, lsr.x, lsr.y));
            if (d < Math.max(width, height)) {
                push()
                fill(255, 0, 0)
                strokeWeight(4);
                point(lsr.x, lsr.y);
                pop()

                push()
                //distance between
                line(ship.pos.x, ship.pos.y, lsr.x, lsr.y)
                ellipse(ship.pos.x, ship.pos.y, 5, 5);
                ellipse(lsr.x, lsr.y, 5, 5);
                translate((ship.pos.x + lsr.x) / 2, (ship.pos.y + lsr.y) / 2);
                rotate(atan2(lsr.y - ship.pos.y, lsr.x - ship.pos.x));
                text(nfc(d, 1), 0, -5);
                pop()
            }
            if (d < scl && lsr.id !== ship.id) {
                ship.reset()
            }


        }

    }

    ship.edges();
    ship.ruLasers();
    ship.render();
    ship.turn();
    ship.update();
    var data = {
        x: ship.pos.x,
        y: ship.pos.y,
        h: ship.heading,
        lasers: ship.getLaserData()
    };
    socket.emit('update', JSON.stringify(data));
    ellipse(ArenaWidth / 2, ArenaHeight / 2, 20, 20);


    //camera(0,0,2000,ship.pos.x,ship.pos.y,0,0,1,0)
    //camera(0, 0, 20 + sin(frameCount * 0.01) * 10, 0, 0, 0, 0, 1, 0);
    //camera(ship.pos.x, ship.pos.y, zoom.value())

}