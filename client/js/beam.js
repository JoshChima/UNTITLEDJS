// function uuid() {
//     let gUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//         var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
//         return v.toString(16);
//       });
//     return gUuid
//   }
// function Beam(id ,x, y) {
//     this.shipID = id
//     this.uniqueID = id + '_' + uuid()

//     this.pos = createVector(x, y);
//     this.active = true
//     this.lifespan = 1000;

//     this.update = function() {
//         this.lifespan -= 2;
//         if (this.lifespan<0) {
//             this.active = false
//         }
//     }

//     this.render = function() {
//         push()
//         fill(255)
//         ellipse(this.pos.x, this.pos.y, scl*2, scl*2);
//         pop()
//     }

// }