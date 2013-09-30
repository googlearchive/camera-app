/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Detects and tracks faces on the input stream.
 *
 * @private {Canvas} input Input canvas.
 * @constructor
 */
camera.Tracker = function(input) {
  /**
   * @type {Canvas}
   * @private
   */
  this.input_ = input;

  /**
   * @type {camera.Tracker.Face}
   * @private
   */
  this.face_ = new camera.Tracker.Face();

  /**
   * @type {boolean}
   * @private
   */
  this.busy_ = false;

  // End of properties. Seal the object.
  Object.seal(this);
};

/**
 * Represents a detected face.
 * @constructor
 */
camera.Tracker.Face = function() {
  this.x_ = 0;
  this.y_ = 0;
  this.targetX_ = 0;
  this.targetY_ = 0;
  this.width_ = 0.3;
  this.height_ = 0.3;
  this.targetWidth_ = 0.3; 
  this.targetHeight_ = 0.3;
  this.confidence_ = 0;
  this.targetConfidence_ = 0;

  Object.seal(this);
};

camera.Tracker.Face.prototype = {
  get x() {
    return this.x_;
  },
  get y() {
    return this.y_;
  },
  get width() {
    return this.width_;
  },
  get height() {
    return this.height_;
  },
  get confidence() {
    return this.confidence_;
  }
};

/**
 * Sets the target x coordinate of the face.
 * @param {number} x Position as a fraction of the width (0-1).
 */
camera.Tracker.Face.prototype.setTargetX = function(x) {
  this.targetX_ = x;
};


/**
 * Sets the target y coordinate of the face.
 * @param {number} y Position as a fraction of the height (0-1).
 */
camera.Tracker.Face.prototype.setTargetY = function(y) {
  this.targetY_ = y;
};

/**
 * Sets the target width of the face.
 * @param {number} width Width as a fraction of the image's width (0-1).
 */
camera.Tracker.Face.prototype.setTargetWidth = function(width) {
  this.targetWidth_ = width;
};

/**
 * Sets the target height of the face.
 * @param {number} height Height as a fraction of the image's height (0-1).
 */
camera.Tracker.Face.prototype.setTargetHeight = function(height) {
  this.targetHeight_ = height;
};

/**
 * Sets the target confidence level.
 * @param {number} Confidence level.
 */
camera.Tracker.Face.prototype.setTargetConfidence = function(confidence) {
  this.targetConfidence_ = confidence;
};

/**
 * Updates the detected face by applying some interpolation.
 */
camera.Tracker.Face.prototype.update = function() {
  var step = 0.3;
  this.x_ += (this.targetX_ - this.x_) * step;
  this.y_ += (this.targetY_ - this.y_) * step;
  this.width_ += (this.targetWidth_ - this.width_) * step;
  this.height_ += (this.targetHeight_ - this.height_) * step;
  this.confidence_ += (this.targetConfidence_ - this.confidence_) * step;
};

/**
 * Requests face detection on the current frame.
 */
camera.Tracker.prototype.detect = function() {
  if (this.busy_)
    return;
  this.busy_ = true;

  var result = ccv.detect_objects({
    canvas: this.input_,//ccv.grayscale(ccv.pre(this.input_)),
    cascade: getCascade(),
    interval: 5,
    min_neighbors: 1,
    worker: 1,
    async: true
  })(function(result) {
    if (result.length) {
      result.sort(function(a, b) {
        return a.confidence < b.confidence;
      });

      this.face_.setTargetX(result[0].x / this.input_.width);
      this.face_.setTargetY(result[0].y / this.input_.height);
      this.face_.setTargetWidth(result[0].width / this.input_.width);
      this.face_.setTargetHeight(result[0].height / this.input_.height);
      this.face_.setTargetConfidence(1.0);
    } else {
      this.face_.setTargetConfidence(0);
    }
    this.busy_ = false;
  }.bind(this));
};

/**
 * Updates the face by applying some interpolation.
 */
camera.Tracker.prototype.update = function() {
  this.face_.update();
};

/**
 * Returns detected faces by the last call of update().
 * @return {camera.Tracker.Face}
 */
camera.Tracker.prototype.getFace = function() {
  return this.face_;
};

