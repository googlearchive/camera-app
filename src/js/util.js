/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Namespace for utilities.
 */
camera.util = camera.util || {};

/**
 * Sets a class which invokes an animation and calls the callback when the
 * animation is done. The class is released once the animation is finished.
 * If the class name is already set, then calls onCompletion immediately.
 *
 * @param {Element} classElement Element to be applied the class on.
 * @param {Element} animationElement Element to be animated.
 * @param {string} className Class name to be added.
 * @param {number} timeout Animation timeout in milliseconds.
 * @param {=function()} opt_onCompletion Completion callback.
 */
camera.util.setAnimationClass = function(
    classElement, animationElement, className, timeout, opt_onCompletion) {
  if (classElement.classList.contains(className)) {
    if (opt_onCompletion)
      opt_onCompletion();
    return;
  }

  classElement.classList.add(className);
  var onAnimationCompleted = function() {
    classElement.classList.remove(className);
    if (opt_onCompletion)
      opt_onCompletion();
  };
  
  camera.util.waitForAnimationCompletion(
      animationElement, timeout, onAnimationCompleted);
};

/**
 * Waits for animation completion and calls the callback.
 *
 * @param {Element} animationElement Element to be animated.
 * @param {number} timeout Timeout for completion.
 * @param {function()} onCompletion Completion callback.
 */
camera.util.waitForAnimationCompletion = function(
    animationElement, timeout, onCompletion) {
  var completed = false;
  var onAnimationCompleted = function() {
    if (completed)
      return;
    completed = true;
    animationElement.removeEventListener(onAnimationCompleted);
    onCompletion();
  };
  setTimeout(onAnimationCompleted, timeout);
  animationElement.addEventListener('webkitAnimationEnd', onAnimationCompleted);  
};

/**
 * Waits for transition completion and calls the callback.
 *
 * @param {Element} transitionElement Element to be transitioned.
 * @param {number} timeout Timeout for completion.
 * @param {function()} onCompletion Completion callback.
 */
camera.util.waitForTransitionCompletion = function(
    transitionElement, timeout, onCompletion) {
  var completed = false;
  var onTransitionCompleted = function() {
    if (completed)
      return;
    completed = true;
    transitionElement.removeEventListener(onTransitionCompleted);
    onCompletion();
  };
  setTimeout(onTransitionCompleted, timeout);
  transitionElement.addEventListener(
      'webkitTransitionEnd', onTransitionCompleted);  
};

/**
 * Wraps an effect in style implemented as either CSS3 animation or CSS3
 * transition. The passed closure should invoke the effect. 
 * Only the last callback, passed to the latest invoke() call will be called
 * on the transition or the animation end.
 *
 * @param {function(*, function())} closure Closure for invoking the effect.
 * @constructor
 */
camera.util.StyleEffect = function(closure) {
  /**
   * @param {function}
   * @private
   */
  this.closure_ = closure;
};

/**
 * Invokes the animation and calls the callback on completion. Note, that
 * the callback will not be called if there is another invocation called after.
 *
 * @param {*} state State of the effect to be set
 * @param {function()} callback Completion callback.
 */
camera.util.StyleEffect.prototype.invoke = function(state, callback) {
  this.callback_ = callback;
  this.closure_(state, function() {
    if (!this.callback_)
      return;
    var callback = this.callback_;
    this.callback_ = null;
    
    // Let the animation neatly finish.
    setTimeout(callback, 0);
  }.bind(this));
};

/**
 * Checks whether the effect is in progress or already finished.
 * @return {boolean}
 */
camera.util.StyleEffect.prototype.isActive = function() {
  return !!this.callback_;
};

