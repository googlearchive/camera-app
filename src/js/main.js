/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Creates the Camera App main object.
 * @constructor
 */
camera.Camera = function() {
  /**
   * @type {camera.Camera.Context}
   */
  this.context_ = new camera.Camera.Context(
      this.onPictureTaken_.bind(this),
      this.onError_.bind(this));

   /**
   * @type {camera.views.Camera}
   * @private
   */
  this.cameraView_ = new camera.views.Camera(this.context_);

  /**
   * @type {camera.views.Gallery}
   * @private
   */
  this.galleryView_ = new camera.views.Gallery(this.context_);

  /**
   * @type {camera.View}
   * @private
   */
  this.currentView_ = null;

  /**
   * @type {?number}
   * @private
   */
  this.resizingTimer_ = null;

  // Handle key presses to make the Camera app accessible via the keyboard.
  document.body.addEventListener('keydown', this.onKeyPressed_.bind(this));
  
   // Handle window decoration buttons.
  document.querySelector('#gallery-button').addEventListener('click',
      this.onGalleryClicked_.bind(this));
  document.querySelector('#maximize-button').addEventListener('click',
      this.onMaximizeClicked_.bind(this));
  document.querySelector('#close-button').addEventListener('click',
      this.onCloseClicked_.bind(this));
};

/**
 * Creates context for the views.
 *
 * @param {function(string)} onPictureTaken Callback to be called, when a
 *     picture is added.
 * @param {function(string)} onError Callback to be called, when an error
 *     occurs.
 * @constructor
 */
camera.Camera.Context = function(onPictureTaken, onError) {
  camera.View.Context.call(this);
  
  /**
   * @param {boolean}
   */
  this.resizing = false;

  /**
   * @param {boolean}
   */
  this.hasError = false;

  /**
   * @param {function(string)}
   */
  this.onPictureTaken = onPictureTaken;

  /**
   * @param {function(string)}
   */
  this.onError = onError;
};

camera.Camera.Context.prototype = {
  __proto__: camera.View.Context.prototype
};

camera.Camera.prototype.start = function() {
  var remaining = 2;

  var maybeFinished = function() {
    remaining--;
    if (!remaining)
      this.switchView_(this.cameraView_);
  }.bind(this);;

  this.cameraView_.initialize(maybeFinished);
  this.galleryView_.initialize(maybeFinished);
};

/**
 * Leaves the previous view and enters the passed one.
 * @param {camera.View} view View to be opened.
 * @private
 */
camera.Camera.prototype.switchView_ = function(view) {
  if (this.currentView_)
    this.currentView_.leave();
  this.currentView_ = view;
  view.enter();
};

/**
 * Handles resizing of the window.
 * @private
 */
camera.Camera.prototype.onWindowResize_ = function() {
  // Suspend capturing while resizing for smoother UI.
  this.context_.resizing = true;
  if (this.resizingTimer_) {
    clearTimeout(this.resizingTimer_);
    this.resizingTimer_ = null;
  }
  this.resizingTimer_ = setTimeout(function() {
    this.resizingTimer_ = null;
    this.context_.resizing = false;
  }.bind(this), 100);

  this.currentView_.onResize();
};

/**
 * Handles pressed keys.
 * @param {Event} event Key press event.
 * @private
 */
camera.Camera.prototype.onKeyPressed_ = function(event) {
  this.currentView_.onKeyPressed(event);
};

/**
 * Handles clicking on the toggle gallery button. Enters or leaves the
 * gallery mode.
 * @private
 */
camera.Camera.prototype.onGalleryClicked_ = function() {
  this.switchView_(this.currentView_ != this.galleryView_ ? this.galleryView_ :
                                                            this.cameraView_);
};

/**
 * Handles clicking on the toggle maximization button.
 * @private
 */
camera.Camera.prototype.onMaximizeClicked_ = function() {
  if (chrome.app.window.current().isMaximized())
    chrome.app.window.current().restore();
  else
    chrome.app.window.current().maximize();
};

/**
 * Handles clicking on the close application button.
 * @private
 */
camera.Camera.prototype.onCloseClicked_ = function() {
  chrome.app.window.current().close();
};

/**
 * Adds a picture taken in the camera view to the gallery view.
 * @param {function(string)} dataURL
 * @private
 */
camera.Camera.prototype.onPictureTaken_ = function(dataURL) {
  this.galleryView_.addPicture(dataURL);
};

camera.Camera.prototype.onError_ = function(message) {
  document.body.classList.add('no-camera');
  this.context_.hasError = true;
};

/**
 * @type {camera.Camera} Singleton of the Camera object.
 * @private
 */
camera.Camera.instance_ = null;

/**
 * Returns the singleton instance of the Camera class.
 * @return {camera.Camera}
 */
camera.Camera.getInstance = function() {
  if (!camera.Camera.instance_)
    camera.Camera.instance_ = new camera.Camera();
  return camera.Camera.instance_;
};

/**
 * Creates the Camera object and starts screen capturing.
 */
document.addEventListener('DOMContentLoaded', function() {
  camera.Camera.getInstance().start();
});
