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
camera.effects.Sepia = function(tracker) {
  camera.Effect.call(this, tracker);
};

camera.effects.Sepia.prototype = {
  __proto__: camera.Effect.prototype
};

camera.effects.Sepia.prototype.filterFrame = function(canvas) {
  canvas.sepia(0.5);
};

camera.effects.Sepia.prototype.getTitle = function() {
  return 'Sepia';
};

