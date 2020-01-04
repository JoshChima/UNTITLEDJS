function keyReleased() {
    if (key == 'f' && ship) {
        ship.firing(false);
    }
    if (key == 'b' && ship) {
        ship.beamActive(false);
    }
    if (keyCode == LEFT_ARROW && ship) {
        ship.setRotation(0);
    }
    if (keyCode == RIGHT_ARROW && ship) {
        ship.setRotation(0);
    }
    
    if (keyCode == UP_ARROW && ship) {
        ship.boosting(false);
    }
}

function keyPressed() {
    // console.log(key)
    // if (key == 'r') {
    //     socket.emit('resetCollections')
    // }
    //Movement
    if (keyCode == UP_ARROW && ship) {
        ship.boost();
        ship.boosting(true);
    }
    if (keyCode == LEFT_ARROW && ship) {
        ship.setRotation(-0.1);
    }
    if (keyCode == RIGHT_ARROW && ship) {
        ship.setRotation(0.1);
    }
    //Fire
    if (key == 'f' && ship) {
        ship.fire();
        ship.firing(true);
        // ship.lasers.push(new Laser(ship.id, ship.pos, ship.heading));
    }
    if (key == 'b' && ship) {
        ship.activateBeam();
        ship.beamActive(true);
    }
}