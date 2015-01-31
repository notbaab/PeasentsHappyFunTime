/**
 * Contains all the components that can be used to create game objects.
 * There is no requirement of the components other than that they should
 * have a type variable as that is used for overriding specific properties in
 * the creation in unitTemplates
 */
function Unit() {
  this.color = "#FF0000";
  this.type = "Unit";
  // this.rect = new Rect(x, y, width, height);
}

Unit.prototype = {

  click: function(ev, rightClick) {
    // Player clicked inside the canvas
    console.log("click event")
  },

  draw: function(context) {
    // console.log("drawing this ");
    // console.log(this);
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  },

  update: function() {

  }
}

function Selectable() {
  this.type = "Selectable";
}
Selectable.prototype = {

}

function Damageable() {
  this.type = "Damageable";
}

Damageable.prototype = {
  damage: function(amount) {
    this.hp -= amount;
  }
}

function Attacker() {
  this.delay = 10; // number of frames to wait until able to attack again
  this.attackDistance = 20;
  this.safeDistance = 10; // distance to keep from the 
  this.movingTo = false;
  this.type = "Attacker";
}

Attacker.prototype = {
  engageClosest: function(entities) {
    /**
     * Find closest entity and set it to the engaged target. Entities is an
     * array of Unit Objects
     */

    // TODO: check if has a proper length
    var closest = entities[0];
    var closestDistance = distance(this, closest);
    for (var i = entities.length - 1; i >= 0; i--) {
      var distance = distance(this, entities[i]);
      if (distance < closestDistance) {
        closest = entities[i];
        closestDistance = distance;
      }
    };
    this.engaged = closest;
  },

  engageSpecific: function(entity) {
    this.engaged = entity;
  },

  moveTowardsEngaged: function() {
    if (distance(this, this.engaged) > this.safeDistance)
      moveTowards(this, this.engaged);
  },
  giveMoveCommand: function(point, game) {
    /**
     * informs the unit it needs to move to the point passed in
     * TODO: Hack adding game since I need some functions that are in the game
     * object that need to go somewhere else
     */
    this.movingTo = point;
    this.game = game;
  },

  attack: function() {
    if (distance(this, this.engaged) < this.attackDistance &&
      this.attackTimer == this.delay) {
      // close enough to attack
      this.engaged.damage()
      this.attackerTimer = 0;
    }
    if (this.attackTimer < this.delay) {
      this.attackTimer++;
    }
  },

  update: function() {
    if (this.engaged) {
      this.moveTowardsEngaged();
      this.attack();
      console.log(this.collideRect(this.engaged));
    } else if (this.movingTo) {
      if(!this.doPath()){
        this.movingTo = false;
      }
    }
  },

  doPath: function(){
    console.log("doing path");
    var start = this.game.getGrid(this.center());
    var end = this.game.getGrid(this.movingTo);
    var path = AStar(this.game.mapGrid, start, end, 'Euclidean');
    if (path.length>1){
      var nextStep = {x:path[1].x,y:path[1].y};  // next step in GRID space
      moveTowardsInGrid(this, nextStep, this.game);
      // newDirection = findAngle(nextStep,this,this.directions);    
    } else if(start[0]==end[0] && start[1] == end[1]){ 
      // Reached destination grid;
      // path = [this,destination];               
      // newDirection = findAngle(destination,this,this.directions);
      return false;
    } else { 
      // There is no path
      return false;
    }

    return true;

  },
}


// Utility functions
function distance(point1, point2) {
  var xs = 0;
  var ys = 0;
  // go duck typing go!
  try{
    xs = point2.centerx() - point1.centerx();
  } catch(err){
    // I like to use centerx but not always an option, use x instead
    xs = point2.x - point1.x;
  }
  xs = xs * xs;

  try{
    ys = point2.centery() - point1.centery();
  } catch(err){
    // I like to use centerx but not always an option, use x instead
    ys = point2.y - point1.y;
  }
  ys = ys * ys;

  return Math.sqrt(xs + ys);
}
function moveTowardsInGrid(obj, target, game){
  // var start = game.getCenterOfGrid(obj);
  var end = game.getCenterOfGrid(target);
  moveTowards(obj, end);
}

function moveTowards(obj, target) {
  var y = target.y - obj.centery();
  var x = target.x - obj.centerx();
  var distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  var speed = 3;
  var fullCircle = Math.PI * 2;

  // what's the different between our orientation
  // and the angle we want to face in order to 
  // move directly at our target
  var angle = Math.atan2(y, x);
  var delta = angle - obj.orientation;
  var delta_abs = Math.abs(delta);

  // if the different is more than 180°, convert
  // the angle a corresponding negative value
  if (delta_abs > Math.PI) {
    delta = delta_abs - fullCircle;
  }
  var turnSpeed = 10000;
  // if the angle is already correct,
  // don't bother adjusting
  if (delta !== 0) {
    // do we turn left or right?
    var direction = delta / delta_abs;
    // update our orientation
    obj.orientation += (direction * Math.min(turnSpeed, delta_abs));
  }
  // constrain orientation to reasonable bounds
  obj.orientation %= fullCircle;

  // use orientation and speed to update our position
  obj.x += Math.cos(obj.orientation) * speed;
  obj.y += Math.sin(obj.orientation) * speed;
}