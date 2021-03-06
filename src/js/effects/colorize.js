'use strict';

/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Namespace for effects.
 */
camera.effects = camera.effects || {};

/**
 * @param {camera.Tracker} tracker Head tracker object.
 * @constructor
 * @extends {camera.Effect}
 */
camera.effects.Colorize = function(tracker) {
  camera.Effect.call(this, tracker);

  /**
   * @type {number}
   * @private
   */
  this.hue_ = 0.5;

  // End of properties. Seal the object.
  Object.seal(this);
};

camera.effects.Colorize.prototype = {
  __proto__: camera.Effect.prototype
};

/**
 * @override
 */
camera.effects.Colorize.prototype.randomize = function() {
  this.hue_ = Math.random() * 2.0 - 1.0;
};

/**
 * @override
 */
camera.effects.Colorize.prototype.filterFrame = function(canvas) {
  canvas.hueSaturation(this.hue_, 0);
};

/**
 * @override
 */
camera.effects.Colorize.prototype.getTitle = function() {
  return chrome.i18n.getMessage('colorizeEffect');
};

