function keyReleased() {
    if (key == ' ') {
        ship.firing(false)
    }
    if (keyCode == LEFT_ARROW) {
        ship.setRotation(0);
    }
    if (keyCode == RIGHT_ARROW) {
        ship.setRotation(0);
    }
    
    if (keyCode == UP_ARROW) {
        ship.boosting(false);
    }
}

function keyPressed() {
    // if (key == 'r') {
    //     socket.emit('resetCollections')
    // }
    //Movement
    if (keyCode == UP_ARROW) {
        ship.boost();
        ship.boosting(true);
    }
    if (keyCode == LEFT_ARROW) {
        ship.setRotation(-0.1);
    }
    else if (keyCode == RIGHT_ARROW) {
        ship.setRotation(0.1);
    }
    //Fire
    else if (key == ' ') {
        ship.fire();
        if (keyCode !== LEFT_ARROW || keyCode !== RIGHT_ARROW) {
            ship.firing(true);
        }
        // ship.lasers.push(new Laser(ship.id, ship.pos, ship.heading));
    }
}