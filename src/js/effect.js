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

/**
 * @override
 */
camera.Effect.prototype.randomize = function() {
};

/**
 * @override
 */
camera.Effect.prototype.filterFrame = function(canvas) {
};

/**
 * @override
 */
camera.Effect.prototype.getTitle = function() {
  return '(Effect)';
};

/**
 * Returns true if the effect is slow and preview should be done in lower
 * resolution to keep acceptable FPS.
 *
 * @return {boolean} True if slow, false otherwise.
 */
camera.Effect.prototype.isSlow = function() {
  return false;
};

