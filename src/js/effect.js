'use strict';

/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * @param {camera.Tracker} tracker Head tracker object.
 * @constructor
 */
camera.Effect = function(tracker) {
  /**
   * @type {camera.Tracker}
   * @private
   */
  this.tracker_ = tracker;
};

/**
 * Randomizes the effect values.
 */
camera.Effect.prototype.randomize = function() {
};

/**
 * Filters the passed frame with the effect.
 */
camera.Effect.prototype.filterFrame = function(canvas) {
};

/**
 * Provides title of the effect.
 * @return {string}
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

