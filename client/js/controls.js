function keyReleased() {
    ship.setRotation(0);
    ship.boosting(false);
    ship.firing(false)
}

function keyPressed() {
    //Fire
    if (key == ' ') {
        ship.fire();
        ship.firing(true);
        // ship.lasers.push(new Laser(ship.id, ship.pos, ship.heading));
        let data = ship.getOneLaserData((ship.lasers.length - 1));
        socket.emit('addLaser', JSON.stringify(data));
    }
    // if (key == 'r') {
    //     socket.emit('resetCollections')
    // }
    //Movement
    if (keyCode == RIGHT_ARROW) {
        ship.setRotation(0.1);
    } else if (keyCode == LEFT_ARROW) {
        ship.setRotation(-0.1);
    }
    
    if (keyCode == UP_ARROW) {
        ship.boost();
        ship.boosting(true);
    }
}