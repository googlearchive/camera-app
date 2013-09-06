/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * @private {camera.Tracker} tracker
 * @constructor
 */
camera.Effect = function(tracker) {
  this.tracker_ = tracker;
};

camera.Effect.prototype.randomize = function() {
};

camera.Effect.prototype.filterFrame = function(canvas) {
};

camera.Effect.prototype.getTitle = function() {
  return '(Effect)';
};

