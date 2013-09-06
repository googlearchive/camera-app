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
camera.effects.Grayscale = function(tracker) {
  camera.Effect.call(this, tracker);
};

camera.effects.Grayscale.prototype = {
  __proto__: camera.Effect.prototype
};

camera.effects.Grayscale.prototype.filterFrame = function(canvas) {
  canvas.hueSaturation(0, -1);
};

camera.effects.Grayscale.prototype.getTitle = function() {
  return 'Grayscale';
};

