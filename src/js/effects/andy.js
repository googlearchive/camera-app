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
camera.effects.Andy = function(tracker) {
  camera.Effect.call(this, tracker);
};

camera.effects.Andy.prototype = {
  __proto__: camera.Effect.prototype
};

camera.effects.Andy.prototype.filterFrame = function(canvas) {
  canvas.bulgePinch(canvas.width / 2, canvas.height / 2, canvas.width / 10, -1);
};

camera.effects.Andy.prototype.getTitle = function() {
  return 'Andy';
};

