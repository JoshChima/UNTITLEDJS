function Laser(id ,spos, angle) {
    this.shipID = id
    this.pos = createVector(spos.x, spos.y);
    this.velocity = p5.Vector.fromAngle(angle);
    this.velocity.mult(10);
    this.active = true

    this.update = function() {
        this.pos.add(this.velocity);
    }

    this.edges = function () {
        if (between((this.pos.x), -ArenaWidth, ArenaWidth) === false) {
            this.active = false
        }
        if (between((this.pos.y), -ArenaHeight, ArenaHeight) == false) {
            this.active = false;
        }
    }

    this.render = function() {
        push()
        stroke(255);
        strokeWeight(4);
        point(this.pos.x, this.pos.y);
        pop()
    }

}