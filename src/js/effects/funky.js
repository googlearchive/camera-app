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
camera.effects.Funky = function(tracker) {
  camera.Effect.call(this, tracker);
};

camera.effects.Funky.prototype = {
  __proto__: camera.Effect.prototype
};

camera.effects.Funky.prototype.filterFrame = function(canvas) {
  canvas.colorHalftone(320, 0.25, 5);
};

camera.effects.Funky.prototype.getTitle = function() {
  return 'Funky';
};

