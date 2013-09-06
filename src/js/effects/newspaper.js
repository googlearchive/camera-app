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
camera.effects.Newspaper = function(tracker) {
  camera.Effect.call(this, tracker);
  this.amount_ = 3;
};

camera.effects.Newspaper.prototype = {
  __proto__: camera.Effect.prototype
};

camera.effects.Newspaper.prototype.randomize = function() {
  this.amount_ = this.amount_ % 15 + 3;
};

camera.effects.Newspaper.prototype.filterFrame = function(canvas) {
  canvas.dotScreen(320, 239.5, 1.1, this.amount_ / 720 * canvas.height);
};

camera.effects.Newspaper.prototype.getTitle = function() {
  return 'Newspaper';
};

