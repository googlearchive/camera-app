/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Creates a processor object, which takes the camera stream and processes it.
 * Flushes the result to a canvas.
 *
 * @param {Canvas|Video} input Canvas or Video with the input frame.
 * @param {fx.Canvas} output Canvas with the output frame.
 * @param {=camera.Processor.Mode} opt_mode Optional mode of the processor.
 *     Default is the high quality mode.
 * @constructor
 */
camera.Processor = function(input, output, opt_mode) {
  /**
   * @type {Canvas|Video}
   * @private
   */
  this.input_ = input;

  /**
   * @type {fx.Canvas}
   * @private
   */
  this.output_ = output;

  /**
   * @type {camera.Processor.Mode}
   * @private
   */
  this.mode_ = opt_mode || camera.Processor.Mode.DEFAULT;

  /**
   * @type {fx.Texture}
   * @private
   */
  this.texture_ = null;

  /**
   * @type {camera.Effect}
   */
  this.effect_ = null;
};

camera.Processor.Mode = {
  DEFAULT: 0,
  FAST: 1
};

camera.Processor.prototype = {
  set effect(inEffect) {
    this.effect_ = inEffect;
  },
  get effect() {
    return this.effect_;
  }
};

camera.Processor.prototype.processFrame = function() {
  var width = this.input_.videoWidth || this.input_.width;
  var height = this.input_.videoHeight || this.input_.height;
  if (!width || !height)
    return;

  if (!this.texture_)
    this.texture_ = this.output_.texture(this.input_);

  var textureWidth = null;
  var textureHeight = null;

  switch (this.mode_) {
    case camera.Processor.Mode.FAST:
      textureWidth = width / 2;
      textureHeight = height / 2;
      break;
    case camera.Processor.Mode.DEFAULT:
      textureWidth = width;
      textureHeight = height;
      break;
  }

  try {
    this.texture_.loadContentsOf(this.input_);
    this.output_.draw(this.texture_, textureWidth, textureHeight);
    if (this.effect_)
      this.effect_.filterFrame(this.output_);
    this.output_.update();
  } catch (e) {
    throw e;
  }
};

