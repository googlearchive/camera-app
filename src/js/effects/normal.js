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
camera.effects.Normal = function(tracker) {
  camera.Effect.call(this, tracker);
  Object.freeze(this);
};

camera.effects.Normal.prototype = {
  __proto__: camera.Effect.prototype
};

/**
 * @override
 */
camera.effects.Normal.prototype.getTitle = function() {
  return chrome.i18n.getMessage('normalEffect');
};

