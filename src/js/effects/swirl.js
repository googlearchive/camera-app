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
camera.effects.Swirl = function(tracker) {
  camera.Effect.call(this, tracker);
};

camera.effects.Swirl.prototype = {
  __proto__: camera.Effect.prototype
};

camera.effects.Swirl.prototype.filterFrame = function(canvas) {
  canvas.swirl(canvas.width / 2, canvas.height / 2, canvas.width / 2, 1);
};

camera.effects.Swirl.prototype.getTitle = function() {
  return 'Swirl';
};

