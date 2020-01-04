function Beam(id ,x, y) {
    this.shipID = id
    this.uniqueID = id + '_' + uuid()

    this.pos = createVector(x, y);
    this.active = true
    this.lifespan = 500;

    this.update = function() {
        this.lifespan -= 2;
        if (this.lifespan<0) {
            this.active = false
        }
    }

    this.render = function() {
        push()
        noStroke()
        fill(148,0,211)
        ellipse(this.pos.x, this.pos.y, scl+(scl*.3), scl+(scl*.3));
        pop()
    }

}