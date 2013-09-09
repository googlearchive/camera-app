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
 * @param {number} offset Vertical offset in percents.
 * @param {number} scale Scale factor.
 * @constructor
 * @extend {camera.Effect}
 */
camera.effects.Pinch = function(tracker, offset, size, strength) {
  camera.Effect.call(this, tracker);
  this.amount_ = 0.5;
  this.offset_ = offset;
  this.size_ = size;
  this.strength_ = strength;
};

camera.effects.Pinch.prototype = {
  __proto__: camera.Effect.prototype
};

/**
 * @override
 */
camera.effects.Pinch.prototype.randomize = function() {
  this.amount_ = Math.random() * 0.6 + 0.2;
};

/**
 * @override
 */
camera.effects.Pinch.prototype.filterFrame = function(canvas) {
  var face = this.tracker_.getFace();
  x = canvas.width * (face.x + (face.width / 2));
  y = canvas.height * face.y;
  radius = Math.sqrt(face.width * face.width +
                     face.height * face.height) * canvas.width;
  canvas.bulgePinch(x,
                    y + this.offset_ * radius,
                    radius * this.amount_ * this.size_,
                    0.5 * face.confidence * this.strength_);
};

/**
 * @override
 */
camera.effects.Pinch.prototype.getTitle = function() {
  return chrome.i18n.getMessage('pinchEffect');
};

camera.effects.BigHead = function(tracker) {
  camera.effects.Pinch.call(this, tracker, 0, 1.0, 1.0);
};

camera.effects.BigHead.prototype = {
  __proto__: camera.effects.Pinch.prototype
};

camera.effects.BigHead.prototype.getTitle = function() {
  return chrome.i18n.getMessage('bigHeadEffect');
};

camera.effects.BigJaw = function(tracker) {
  camera.effects.Pinch.call(this, tracker, 0.45, 0.6, 1.0);
};

camera.effects.BigJaw.prototype = {
  __proto__: camera.effects.Pinch.prototype
};

camera.effects.BigJaw.prototype.getTitle = function() {
  return chrome.i18n.getMessage('bigJawEffect');
};

camera.effects.BunnyHead = function(tracker) {
  camera.effects.Pinch.call(this, tracker, 0.4, 0.8, -0.7);
};

camera.effects.BunnyHead.prototype = {
  __proto__: camera.effects.Pinch.prototype
};

camera.effects.BunnyHead.prototype.getTitle = function() {
  return chrome.i18n.getMessage('bunnyHeadEffect');
};


