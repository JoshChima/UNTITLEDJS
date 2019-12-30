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
function Ship(id, x, y) {
    this.id = id;
    this.pos = createVector(x, y);
    this.r = 10;
    this.heading = 0;
    this.rotation = 0;
    this.velocity = createVector(0, 0);
    this.isBoosting = false;
    this.isFiring = false;
    this.isalive = true;
    this.lasers = [];

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
        if (this.isFiring) {
            this.fire();
        }
        this.pos.add(this.velocity);
        this.velocity.mult(0.999)
    }

    this.boost = function () {
        var force = p5.Vector.fromAngle(this.heading)
        force.mult(0.1); //tweak this for speed differences between players
        this.velocity.add(force)
    }

    this.fire = function () {
        this.lasers.push(new Laser(this.id, this.pos, this.heading));
        let data = this.getOneLaserData((ship.lasers.length - 1));
        socket.emit('addLaser', JSON.stringify(data));
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

    this.edges = function () {
        if (between((this.pos.x), -ArenaWidth, ArenaWidth) === false) {
            this.isalive = false;
            this.reset()
        }
        if (between((this.pos.y), -ArenaHeight, ArenaHeight) == false) {
            this.isalive = false;
            this.reset()
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