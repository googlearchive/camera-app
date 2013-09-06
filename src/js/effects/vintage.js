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
camera.effects.Vintage = function(tracker) {
  camera.Effect.call(this, tracker);
  this.brightness_ = 0;
  this.vibrance_ = -1;
  this.contrast_ = 0;
};

camera.effects.Vintage.prototype = {
  __proto__: camera.Effect.prototype
};

camera.effects.Vintage.prototype.randomize = function() {
  this.brightness_ = Math.random() * 0.4;
  this.vibrance_ = Math.random() > 0.5 ? -1 : 1;
  this.contrast_ = Math.random() * 0.6 - 0.2;
};

camera.effects.Vintage.prototype.filterFrame = function(canvas) {
  canvas.brightnessContrast(this.brightness_, this.contrast_).
    vibrance(this.vibrance_).
    vignette(0.5, 0.4);
};

camera.effects.Vintage.prototype.getTitle = function() {
  return 'Vintage';
};

