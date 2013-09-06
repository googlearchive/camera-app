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
camera.effects.Normal = function(tracker) {
  camera.Effect.call(this, tracker);
};

camera.effects.Normal.prototype = {
  __proto__: camera.Effect.prototype
};

camera.effects.Normal.prototype.getTitle = function() {
  return 'Normal';
};

