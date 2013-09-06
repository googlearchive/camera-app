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
 * @param {=function()} opt_onCompletion Completion callback.
 */
camera.util.setAnimationClass = function(
    classElement, animationElement, className, opt_onCompletion) {
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
      animationElement, onAnimationCompleted);
};

camera.util.waitForAnimationCompletion = function(
    animationElement, onCompletion) {
  var onAnimationCompleted = function() {
    animationElement.removeEventListener(onAnimationCompleted);
    onCompletion();
  };
  animationElement.addEventListener('webkitAnimationEnd', onAnimationCompleted);  
};

