/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Namespace for effects.
 */
camera.effects = camera.effects || {};

/**
 * @private {camera.effects.Andy} tracker
 * @constructor
 * @extend {camera.Effect}
 */
camera.effects.TiltShift = function(tracker) {
  camera.Effect.call(this, tracker);
  this.amount_ = 75;
  this.gradient_ = 2;
};

camera.effects.TiltShift.prototype = {
  __proto__: camera.Effect.prototype
};

camera.effects.TiltShift.prototype.randomize = function() {
  this.amount_ = Math.random() * 100 + 50;
  this.gradient_ = Math.random() * 4 + 1;
};

camera.effects.TiltShift.prototype.filterFrame = function(canvas) {
  canvas.tiltShift(0,
                   canvas.height * 0.4,
                   canvas.width - 1,
                   canvas.height * 0.4,
                   canvas.width / this.amount_,
                   canvas.height / this.gradient_);
};

camera.effects.TiltShift.prototype.getTitle = function() {
  return 'Tilt Shift';
};

