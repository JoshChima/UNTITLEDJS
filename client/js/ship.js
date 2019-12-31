function between(x, min, max) {
    return x >= min && x <= max;
}

function listTransform(lsr) {
    var data = {
        lid: lsr.uniqueID,
        sid: lsr.shipID,
        x: lsr.pos.x,
        y: lsr.pos.y,
        active: lsr.active
    };
    return data
}
//width/2, height/2
function Ship( username, id, x, y, scl) {
    this.username = username
    this.id = id;
    this.pos = createVector(x, y);
    this.r = scl;
    this.heading = 0;
    this.rotation = 0;
    this.velocity = createVector(0, 0);
    this.isBoosting = false;
    this.isFiring = false;
    this.isalive = true;
    this.lasers = [];
    this.coolDown = 0

    this.health = 1000;
    this.score = 0;

    this.getLaserData = function () {
        const arr = this.lasers.map(lsr => listTransform(lsr))
        return arr
    }
    this.getOneLaserData = function (index) {
        return listTransform(this.lasers[index])
    }

    this.reset = function () {
        this.pos = createVector(ArenaWidth / 2, ArenaHeight / 2); //change this
        this.heading = 0;
        this.rotation = 0;
        this.velocity = createVector(0, 0);
        this.isBoosting = false;
        this.isFiring = false;
        // this.isBeeming = false
        this.isalive = true;
        this.health = 1000
        this.score = 0
        this.coolDown = 0

    }

    this.boosting = function (b) {
        this.isBoosting = b;
    }
    this.firing = function (b) {
        this.isFiring = b;
    }

    this.update = function () {
        if (this.isBoosting) {
            this.boost();
        }
        if (this.isFiring && this.coolDown < 5) {
            this.fire();
        }
        if (this.coolDown > 0 ) {
            this.coolDown -= 0.5;
        }
        this.pos.add(this.velocity);
        this.velocity.mult(0.991)
    }

    this.gunHeatUp = function () {
        if (this.coolDown < 4) {
            this.coolDown += 1;
        } else if (this.coolDown == 4) {
            this.coolDown += 5;
        }
    }

    this.boost = function () {
        var force = p5.Vector.fromAngle(this.heading)
        force.mult(0.1); //tweak this for speed differences between players
        this.velocity.add(force)
    }

    this.fire = function () {
        this.lasers.push(new Laser(this.id, this.pos.x, this.pos.y, this.heading));
        let data = this.getOneLaserData((ship.lasers.length - 1));
        socket.emit('addLaser', JSON.stringify(data));
        this.gunHeatUp()
    }

    this.render = function () {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.heading + PI / 2)
        triangle(-this.r, this.r, this.r, this.r, 0, -this.r);
        stroke(100);

        // if (this.isBoosting) {

        // }

        pop();
    }

    this.setRotation = function (a) {
        this.rotation = a;
    }

    this.turn = function () {
        this.heading += this.rotation;
    }

    this.deathCheck = function () {
        this.edges()
        if (this.health<0) {
            this.isalive = false
            this.reset()
        }
    }

    this.hit = function (ld, lsr) {
        if (ld < this.r) {
            socket.emit('laserHit', {
                sid: lsr.sid,
                lid: lsr.lid
            });
            socket.emit('removeLaser', lsr.lid)
            console.log('You where hit by ' + lsr.sid)
            this.health -= 10
        }
    }

    this.edges = function () {
        if (between((this.pos.x), -ArenaWidth, ArenaWidth) === false) {
            this.health -= 10
        }
        if (between((this.pos.y), -ArenaHeight, ArenaHeight) == false) {
            this.health -= 10
        }
    }

    this.ruLasers = function () {
        for (var i = 0; i < this.lasers.length; i++) {
            this.lasers[i].edges();
            if (this.lasers[i].active == false) {
                this.lasers.splice(i, 1);
            } else {
                this.lasers[i].render();
                this.lasers[i].update();
            }
        }
    }
}