/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Namespace for views.
 */
camera.views = camera.views || {};

/**
 * Creates the Gallery view controller.
 * @param {camera.view.Context} context Context object.
 * @constructor
 */
camera.views.Gallery = function(context) {
  camera.View.call(this, context);

  /**
   * @type {Array.<Image>}
   * @private
   */
  this.pictures_ = [];

  /**
   * @type {?number}
   * @private
   */
  this.currentIndex_ = null;
};

camera.views.Gallery.prototype = {
  __proto__: camera.View.prototype
};

/**
 * Enters the view.
 */
camera.views.Gallery.prototype.onEnter = function() {
  this.onResize();
  document.body.classList.add('gallery');
};

/**
 * Leaves the view.
 */
camera.views.Gallery.prototype.onLeave = function() {
  document.body.classList.remove('gallery');
};

camera.views.Gallery.prototype.setCurrentIndex_ = function(index) {
  if (this.currentIndex_ !== null)
    this.pictures_[this.currentIndex_].classList.remove('selected');
  this.currentIndex_ = index;
  if (index !== null)
    this.pictures_[index].classList.add('selected');
};

camera.views.Gallery.prototype.deletePicture_ = function(index) {
  this.pictures_[index].parentNode.removeChild(this.pictures_[index]);
  this.pictures_.splice(index, 1);
  for (var index = 0; index < this.pictures_.length; index++) {
    this.pictures_[index].setAttribute('data-index', index);
  }
  if (this.currentIndex_ !== null) {
    var index = null;
    if (this.pictures_.length > 0) {
      if (this.currentIndex_ > 0)
        index = this.currentIndex_ - 1;
      else
        index = 0;
    }
    this.currentIndex_ = null;
    this.setCurrentIndex_(index);
  }
};

camera.views.Gallery.prototype.showPicture_ = function(index) {
};

/**
 * @override
 */
camera.views.Gallery.prototype.onKeyPressed = function(event) {
  var currentPicture = this.pictures_[this.currentIndex_];
  switch (event.keyIdentifier) {
    case 'Right':
      var index = (this.currentIndex_ + this.pictures_.length - 1) %
          this.pictures_.length;
      this.setCurrentIndex_(index);
      break;
    case 'Left':
      var index = (this.currentIndex_ + 1) % this.pictures_.length;
      this.setCurrentIndex_(index);
      break;
    case 'Down':
      for (var offset = 1; offset < this.pictures_.length; offset++) {
        var index = (this.currentIndex_ + this.pictures_.length - offset) %
            this.pictures_.length;
        if (currentPicture.offsetLeft == this.pictures_[index].offsetLeft) {
          this.setCurrentIndex_(index);
          break;
        }
      }
      event.preventDefault();
      break;
    case 'Up':
      for (var offset = 1; offset < this.pictures_.length; offset++) {
        var index = (this.currentIndex_ + this.pictures_.length + offset) %
            this.pictures_.length;
        if (currentPicture.offsetLeft == this.pictures_[index].offsetLeft) {
          this.setCurrentIndex_(index);
          break;
        }
      }
      event.preventDefault();
      break;
    case 'End':
      this.setCurrentIndex_(0);
      break;
    case 'Home':
      this.setCurrentIndex_(this.pictures_.length - 1);
      break;
    case 'U+007F':
      this.deletePicture_(this.currentIndex_);
      break;
    case 'Enter':
      this.showPicture_(this.currentIndex_);
      break;
  }
};

camera.views.Gallery.prototype.setCurrentPicture_ = function(picture) {
  if (this.currentIndex_ !== null)
    this.pictures_[this.currentIndex_].classList.remove('selected');
  this.pictures_
};

/**
 * Adds a picture to the gallery.
 * @param {String} dataURL Image data as Data URL
 */
camera.views.Gallery.prototype.addPicture = function(dataURL) {
  var index = this.pictures_.length;

  // Add to DOM.
  var gallery = document.querySelector('#gallery .padder');
  var img = document.createElement('img');
  img.src = dataURL
  img.setAttribute('data-index', index);

  if (gallery.firstChild)
    gallery.insertBefore(img, gallery.firstChild);
  else
    gallery.appendChild(img);

  // Add to the collection.
  this.pictures_.push(img);

  // Add handlers.
  img.addEventListener('click', function() {
    var index = img.getAttribute('data-index');
    if (this.currentIndex_ == index)
      this.showPicture_(index);
    else
      this.setCurrentIndex_(index);
  }.bind(this));
};

