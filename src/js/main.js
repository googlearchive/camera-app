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
   * Video element to catch the stream and plot it later onto a canvas.
   * @type {Video}
   * @private
   */
  this.video_ = document.createElement('video');

  /**
   * Shutter sound player.
   * @type {Audio}
   * @private
   */
  this.shutterSound_ = document.createElement('audio');

  /**
   * Canvas element with the current frame downsampled to small resolution, to
   * be used in effect preview windows.
   *
   * @type {Canvas}
   * @private
   */
  this.previewInputCanvas_ = document.createElement('canvas');

 /**
   * @type {boolean}
   * @private
   */
  this.running_ = false;

  /**
   * The main (full screen) canvas for full quality capture.
   * @type {fx.Canvas}
   * @private
   */
  this.mainCanvas_ = fx.canvas();

  /**
   * The main (full screen canvas) for fast capture.
   * @type {fx.Canvas}
   * @private
   */
  this.mainFastCanvas_ = fx.canvas();

  /**
   * The main (full screen) processor in the full quality mode.
   * @type {camera.Processor}
   * @private
   */
  this.mainProcessor_ = new camera.Processor(this.video_, this.mainCanvas_);

  /**
   * The main (full screen) processor in the fast mode.
   * @type {camera.Processor}
   * @private
   */
  this.mainFastProcessor_ = new camera.Processor(
      this.video_, this.mainFastCanvas_, camera.Processor.Mode.FAST);

  /**
   * Processors for effect previews.
   * @type {Array.<camera.Processor>}
   * @private
   */
  this.previewProcessors_ = [];

  /**
   * Selected effect or null if no effect.
   * @type {number}
   */
  this.currentEffectIndex_ = 0;

  /**
   * Face detector and tracker.
   * @type {camera.Tracker}
   * @private
   */
  this.tracker_ = new camera.Tracker(this.previewInputCanvas_);

  /**
   * Current frame.
   * @type {number}
   * @private
   */
  this.frame_ = 0;

  /**
   * If the gallery is opened.
   * @type {boolean}
   * @private
   */
  this.gallery_ = false;
  
  /**
   * If the tools are expanded.
   * @type {boolean}
   * @private
   */
  this.expanded_ = false;

  /**
   * Tools animation effect wrapper.
   * @type {camera.util.StyleEffect}
   * @private
   */
  this.toolsEffect_ = new camera.util.StyleEffect(
      function(args, callback) {
        if (args)
          document.body.classList.add('expanded');
        else
          document.body.classList.remove('expanded');
        camera.util.waitForTransitionCompletion(
          document.querySelector('#toolbar'), 500, callback);
      });
  
  /**
   * Whether a picture is being taken. Used to decrease video quality of
   * previews for smoother response.
   * @type {boolean}
   * @private
   */
  this.taking_ = false;

  /**
   * Timer used to automatically collapse the tools.
   * @type {?number}
   * @private
   */
  this.collapseTimer_ = null;
  
  /**
   * Timer used to suspend capturing while resizing for smoother UI.
   * @type {?number}
   * @private
   */
  this.resizingTimer_ = null;

  /**
   * Set to true before the ribbon is displayed. Used to render the ribbon's
   * frames while it is not yet displayed, so the previews have some image
   * as soon as possible.
   * @type {boolean}
   * @private
   */
  this.ribbonInitialization_ = true;

  // Insert the main canvas to its container.
  document.querySelector('#main-canvas-wrapper').appendChild(this.mainCanvas_);
  document.querySelector('#main-fast-canvas-wrapper').appendChild(
      this.mainFastCanvas_);

  // Set the default effect.
  this.mainProcessor_.effect = new camera.effects.Swirl();

  // Synchronize bounds of the video now, when window is resized or if the
  // video dimensions are loaded.
  window.addEventListener('resize', this.onWindowResize_.bind(this));
  this.video_.addEventListener('loadedmetadata',
      this.synchronizeBounds_.bind(this));
  this.synchronizeBounds_();

  // Prepare effect previews.
  this.addEffect_(new camera.effects.Normal(this.tracker_));
  this.addEffect_(new camera.effects.Vintage(this.tracker_));
  this.addEffect_(new camera.effects.BigHead(this.tracker_));
  this.addEffect_(new camera.effects.BigJaw(this.tracker_));
  this.addEffect_(new camera.effects.BunnyHead(this.tracker_));
  // this.addEffect_(new camera.effects.Andy(this.tracker_));
  this.addEffect_(new camera.effects.Swirl(this.tracker_));
  this.addEffect_(new camera.effects.Grayscale(this.tracker_));
  this.addEffect_(new camera.effects.Sepia(this.tracker_));
  this.addEffect_(new camera.effects.Colorize(this.tracker_));
  this.addEffect_(new camera.effects.Newspaper(this.tracker_));
  this.addEffect_(new camera.effects.TiltShift(this.tracker_));
  this.addEffect_(new camera.effects.Cinema(this.tracker_));

  // Select the default effect.
  this.setCurrentEffect_(0);

  // Handle key presses to make the Camera app accessible via the keyboard.
  document.body.addEventListener('keydown', this.onKeyPressed_.bind(this));
  
  // Show tools on touch or mouse move/click.
  document.body.addEventListener(
      'mousemove', this.setExpanded_.bind(this, true));
  document.body.addEventListener(
      'touchmove', this.setExpanded_.bind(this, true));
  document.body.addEventListener(
      'click', this.setExpanded_.bind(this, true));

  // Make the preview ribbon possible to scroll by dragging with mouse.
  document.querySelector('#effects').addEventListener(
      'mousemove', this.onRibbonMouseMove_.bind(this));

  // Handle window decoration buttons.
  document.querySelector('#gallery-button').addEventListener('click',
      this.onGalleryClicked_.bind(this));
  document.querySelector('#maximize-button').addEventListener('click',
      this.onMaximizeClicked_.bind(this));
  document.querySelector('#close-button').addEventListener('click',
      this.onCloseClicked_.bind(this));

  // Handle the 'Take' button.
  document.querySelector('#take-picture').addEventListener(
      'click', this.takePicture_.bind(this));

  // Load the shutter sound.
  this.shutterSound_.src = '../sounds/shutter.wav';
};

/**
 * Adds an effect to the user interface.
 * @param {camera.Effect} effect Effect to be added.
 * @private
 */
camera.Camera.prototype.addEffect_ = function(effect) {
  // Create the preview on the ribbon.
  var list = document.querySelector('#effects');
  var wrapper = document.createElement('div');
  wrapper.className = 'preview-canvas-wrapper';
  var canvas = fx.canvas();
  var padder = document.createElement('div');
  padder.className = 'preview-canvas-padder';
  padder.appendChild(canvas);
  wrapper.appendChild(padder);
  var item = document.createElement('li');
  item.appendChild(wrapper);
  list.appendChild(item);
  var label = document.createElement('span');
  label.textContent = effect.getTitle();
  item.appendChild(label);

  // Calculate the effect index.
  var effectIndex = this.previewProcessors_.length;
  item.id = 'effect-' + effectIndex;

  // Assign events.
  item.addEventListener('click',
      this.setCurrentEffect_.bind(this, effectIndex));

  // Create the preview processor.
  var processor = new camera.Processor(
      this.previewInputCanvas_, canvas);
  processor.effect = effect;
  this.previewProcessors_.push(processor);
};

/**
 * Sets the current effect.
 * @param {number} Effect index.
 * @private
 */
camera.Camera.prototype.setCurrentEffect_ = function(effectIndex) {
  document.querySelector('#effects #effect-' + this.currentEffectIndex_).
      removeAttribute('selected');
  document.querySelector('#effects #effect-' + effectIndex).setAttribute(
      'selected', '');
  if (this.currentEffectIndex_ == effectIndex)
    this.previewProcessors_[effectIndex].effect.randomize();
  this.mainProcessor_.effect = this.previewProcessors_[effectIndex].effect;
  this.mainFastProcessor_.effect = this.previewProcessors_[effectIndex].effect;
  this.currentEffectIndex_ = effectIndex;
};

/**
 * Handles resizing of the window.
 * @private
 */
camera.Camera.prototype.onWindowResize_ = function() {
  // Suspend capturing while resizing for smoother UI.
  if (this.resizingTimer_) {
    clearTimeout(this.resizingTimer_);
    this.resizingTimer_ = null;
  }
  this.resizingTimer_ = setTimeout(function() {
    this.resizingTimer_ = null;
  }.bind(this), 100);
    
  this.synchronizeBounds_();
};

/**
 * Handles pressed keys.
 * @param {Event} event Key press event.
 * @private
 */
camera.Camera.prototype.onKeyPressed_ = function(event) {
  // Force forucs on the ribbon.
  document.querySelector('#effects').focus();

  if (!this.gallery_) {
    switch (event.keyIdentifier) {  // TODO(mtomasz): To be implemented.
      case 'Left':
        this.setCurrentEffect_(
            (this.currentEffectIndex_ + this.previewProcessors_.length - 1) %
                this.previewProcessors_.length);
        break;
      case 'Right':
        this.setCurrentEffect_(
            (this.currentEffectIndex_ + 1) % this.previewProcessors_.length);
        break;
      case 'Home':
        this.setCurrentEffect_(0);
        break;
      case 'End':
        this.setCurrentEffect_(this.previewProcessors_.length - 1);
        break;
      case 'Enter':
      case 'U+0020':
        this.takePicture_();
        event.stopPropagation();
        event.preventDefault();
        break;
    }
  } else {
    // TODO(mtomasz): To be implemented.
  }
};

/**
 * Handles scrolling via mouse on the effects ribbon.
 * @param {Event} event Mouse move event.
 * @private
 */
camera.Camera.prototype.onRibbonMouseMove_ = function(event) {
  if (event.which != 1)
    return;
  var ribbon = document.querySelector('#effects');
  ribbon.scrollLeft = parseInt(ribbon.scrollLeft) - event.webkitMovementX;
};

/**
 * Handles clicking on the toggle gallery button. Enters or leaves the
 * gallery mode.
 * @private
 */
camera.Camera.prototype.onGalleryClicked_ = function() {
  if (this.gallery_) {
    document.body.classList.remove('gallery');
    this.gallery_ = false;
  } else {
    document.body.classList.add('gallery');
    this.gallery_ = true;
  }
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
 * Toggles the tools visibility.
 * @param {boolean} expanded True to show the tools, false to hide.
 * @private
 */
camera.Camera.prototype.setExpanded_ = function(expanded) {
  if (this.collapseTimer_) {
    clearTimeout(this.collapseTimer_);
    this.collapseTimer_ = null;
  }
  if (expanded) {
    this.collapseTimer_ = setTimeout(this.setExpanded_.bind(this, false), 2000);
    if (!this.expanded_) {
      this.toolsEffect_.invoke(true, function() {
        this.expanded_ = true;
      }.bind(this));
    }
  } else {
    if (this.expanded_) {
      this.expanded_ = false;
      this.toolsEffect_.invoke(false, function() {});
    }
  }
};

/**
 * Takes the picture, saves and puts to the gallery with a nice animation.
 * @private
 */
camera.Camera.prototype.takePicture_ = function() {
  // Lock refreshing for smoother experience.
  this.taking_ = true;

  // Show flashing animation with the shutter sound.
  document.body.classList.add('show-shutter');
  var galleryButton = document.querySelector('#gallery-button');
  camera.util.setAnimationClass(galleryButton, galleryButton, 'flash');
  setTimeout(function() {
    document.body.classList.remove('show-shutter');
  }.bind(this), 200);

  this.shutterSound_.currentTime = 0;
  this.shutterSound_.play();

  setTimeout(function() {
    this.mainProcessor_.processFrame();
    var dataURL = this.mainCanvas_.toDataURL('image/jpeg');

    var onError = function(opt_error) {
      console.log(opt_error);
    }.bind(this);
    
    // Take the picture and save to disk.
    if (this.fileSystem_) {
      var dateFormatter = Intl.DateTimeFormat(
          [] /* default locale */,
          {year: 'numeric', month: 'short', day: 'numeric'});
      var base64string = dataURL.substring(dataURL.indexOf(',') + 1);
      var data = atob(base64string);
      this.fileSystem_.root.getDirectory(
          '/drive/root/Camera Pictures', {create: true}, function(dirEntry) {
            var fileName = dateFormatter(new Date()) + '.jpeg';
            dirEntry.getFile(fileName, {create: true}, function(fileEntry) {
              fileEntry.createWriter(function(fileWriter) {
                var blob = new Blob(data, {type: 'image/jpeg'});
                fileWriter.write(blob);
              }.bind(this), onError);
            }.bind(this), onError);
          }.bind(this), onError);
    } else {
      onError();
    }

    // Create a picture preview animation.
    var picturePreview = document.querySelector('#picture-preview');
    var img = document.createElement('img');
    img.src = dataURL;
    img.style.webkitTransform = 'rotate(' + (Math.random() * 40 - 20) + 'deg)';
    picturePreview.appendChild(img);
    camera.util.waitForAnimationCompletion(img, 2500, function() {
      img.parentNode.removeChild(img);
     this.taking_ = false;
    }.bind(this));

    // Add the picture to the gallery.
    var gallery = document.querySelector('#gallery');
    var img2 = document.createElement('img');
    img2.src = dataURL;
    gallery.appendChild(img2);
   }.bind(this), 0);
};

/**
 * Resolutions to be probed on the camera. Format: [[width, height], ...].
 * @type {Array.<Array>}
 * @const
 */
camera.Camera.RESOLUTIONS = [[1280, 720], [800, 600], [640, 480]];

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
 * Synchronizes video size with the window's current size.
 * @private
 */
camera.Camera.prototype.synchronizeBounds_ = function() {
  if (!this.video_.videoWidth)
    return;

  var width = document.body.offsetWidth;
  var height = document.body.offsetHeight;
  var windowRatio = width / height;
  var videoRatio = this.video_.videoWidth / this.video_.videoHeight;

  this.video_.width = this.video_.videoWidth;
  this.video_.height = this.video_.videoHeight;

  // Add 1 pixel to avoid artifacts.
  var zoom = (width + 1) / this.video_.videoWidth;

  // Set resolution of the low-resolution preview input canvas.
  if (videoRatio < 1.5) {
    // For resolutions: 800x600.
    this.previewInputCanvas_.width = 120;
    this.previewInputCanvas_.height = 90;
  } else {
    // For wide resolutions (any other).
    this.previewInputCanvas_.width = 192;
    this.previewInputCanvas_.height = 108;
  }
};

/**
 * Starts capturing with the specified resolution.
 *
 * @param {Array} resolution Width and height of the capturing mode, eg.
 *     [800, 600].
 * @param {function(number, number)} onSuccess Success callback with the set
 *                                   resolution.
 * @param {function()} onFailure Failure callback, eg. the resolution is
 *                     not supported.
 * @private
 */
 camera.Camera.prototype.startWithResolution_ =
     function(resolution, onSuccess, onFailure) {
  if (this.running_)
    this.stop();

  navigator.webkitGetUserMedia({
    video: {
      mandatory: {
        minWidth: resolution[0],
        minHeight: resolution[1]
      }
    }
  }, function(stream) {
    this.running_ = true;
    this.video_.src = window.URL.createObjectURL(stream);
    this.video_.play();
    var onAnimationFrame = function() {
      this.drawFrame_();
      requestAnimationFrame(onAnimationFrame);
    }.bind(this);
    onAnimationFrame();
    onSuccess(resolution[0], resolution[1]);
  }.bind(this), function(error) {
    onFailure();
  });
};

/**
 * Starts capturing the screen with the highest possible resolution.
 */
camera.Camera.prototype.start = function() {
  var index = 0;
  
  var onSuccess = function(width, height) {
    // If the window dimensions are default (set to HD), and the established
    // camera resolution is different (not HD), then adjust the window size
    // to the camera resolution.
    var windowWidth = document.body.offsetWidth;
    var windowHeight = document.body.offsetHeight;
    if (windowWidth == 1024 && windowHeigth == 768 &&
        width * windowHeight !=  height * windowWidth) {
      chrome.app.window.current().resizeTo(width, height);
    }
    chrome.app.window.current().show();
    // Show tools after some small delay to make it more visible.
    setTimeout(function() {
      this.ribbonInitialization_ = false;
      this.setExpanded_(true);
    }.bind(this), 500);
  }.bind(this);

  var onFailure = function() {
    chrome.app.window.current().show();
    // TODO(mtomasz): Show an error message.
  };

  var tryNextResolution = function() {
    this.startWithResolution_(camera.Camera.RESOLUTIONS[index],
                              onSuccess,
                              function() {
                                index++;
                                if (index < camera.Camera.RESOLUTIONS.length)
                                  tryNextResolution();
                                else
                                  onFailure();
                              });
  }.bind(this);

  tryNextResolution();
};

/**
 * Draws a single frame for the main canvas and effects.
 * @private
 */
camera.Camera.prototype.drawFrame_ = function(opt_force) {
  // No capturing when the gallery is opened.
  if (this.gallery_)
    return;

  // No capturing while resizing.
  if (this.resizingTimer_)
    return;

  // Copy the video frame to the back buffer. The back buffer is low resolution,
  // since it is only used by preview windows.
  var context = this.previewInputCanvas_.getContext('2d');
  context.drawImage(this.video_,
                    0,
                    0,
                    this.previewInputCanvas_.width,
                    this.previewInputCanvas_.height); 

  // Detect and track faces.
  if (this.frame_ % 10 == 0)
    this.tracker_.detect();

  // Update internal state of the tracker.
  this.tracker_.update();

  // Process effect preview canvases. Ribbin initialization is true before the
  // ribbon is expanded for the first time. This trick is used to fill the
  // ribbon with images as soon as possible.
  if (this.frame_ % 3 == 0 && this.expanded_ && !this.taking_ ||
      this.ribbonInitialization_) {
    for (var index = 0; index < this.previewProcessors_.length; index++) {
      this.previewProcessors_[index].processFrame();
    }
  }
  this.frame_++;

  // Process the full resolution frame. Decrease FPS when expanding for smooth
  // animations.
  if (this.taking_ || this.toolsEffect_.isActive() ||
      this.mainProcessor_.effect.isSlow()) {
    this.mainFastProcessor_.processFrame();
    this.mainCanvas_.parentNode.hidden = true;
    this.mainFastCanvas_.parentNode.hidden = false;
  } else {
    this.mainProcessor_.processFrame();
    this.mainCanvas_.parentNode.hidden = false;
    this.mainFastCanvas_.parentNode.hidden = true;
   }
};

/**
 * Creates the Camera object and starts screen capturing.
 */
document.addEventListener('DOMContentLoaded', function() {
  camera.Camera.getInstance().start();
});
