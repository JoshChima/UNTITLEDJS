function keyReleased() {
    ship.setRotation(0);
    ship.boosting(false);
}

function keyPressed() {
    //Fire
    if (key == ' ') {
        ship.lasers.push(new Laser(ship.id, ship.pos, ship.heading));
    }
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