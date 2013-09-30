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
camera.effects.Swirl = function(tracker) {
  camera.Effect.call(this, tracker);
  Object.seal(this);
};

camera.effects.Swirl.prototype = {
  __proto__: camera.Effect.prototype
};

/**
 * @override
 */
camera.effects.Swirl.prototype.filterFrame = function(canvas) {
  var face = this.tracker_.getFace();
  x = canvas.width * (face.x + (face.width / 2));
  y = canvas.height * face.y;
  radius = Math.sqrt(face.width * face.width +
                     face.height * face.height) * canvas.width;
  canvas.swirl(x, y, radius, face.confidence * 2.0);
};

/**
 * @override
 */
camera.effects.Swirl.prototype.getTitle = function() {
  return chrome.i18n.getMessage('swirlEffect');
};

