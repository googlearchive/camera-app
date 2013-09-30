/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Namespace for effects.
 */
camera.effects = camera.effects || {};

/**
 * @private {camera.Tracker} tracker
 * @constructor
 * @extend {camera.Effect}
 */
camera.effects.Funky = function(tracker) {
  camera.Effect.call(this, tracker);
  this.amount_ = 6;
};

camera.effects.Funky.prototype = {
  __proto__: camera.Effect.prototype
};

/**
 * @override
 */
camera.effects.Funky.prototype.randomize = function() {
  this.amount_ = this.amount_ % 15 + 3;
};

/**
 * @override
 */
camera.effects.Funky.prototype.filterFrame = function(canvas) {
  canvas.colorHalftone(320, 240, 0.25, this.amount_ / 720 * canvas.height);
};

/**
 * @override
 */
camera.effects.Funky.prototype.getTitle = function() {
  return chrome.i18n.getMessage('funkyEffect');
};

