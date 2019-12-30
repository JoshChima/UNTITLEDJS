function uuid() {
    let gUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    console.log(gUuid)
    return gUuid
  }
function Laser(id ,spos, angle) {
    this.shipID = id
    this.uniqueID = id + '_' + uuid()

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