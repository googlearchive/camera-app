/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Namespace for the testing stuff.
 */
camera.test = camera.test || {};

/**
 * Namespace for the test cases.
 */
camera.test.cases = {};

/**
 * Checks if the window gets opened.
 */
camera.test.cases.basic = function(callback) {
  camera.test.waitForTrue('Wait for the window.', function() {
    return !!camera.bg.appWindow;
  }, function() {
    camera.test.success('Window created.');
    callback();
  });
};

/**
 * Checks if the window gets opened and if the stream is available.
 */
camera.test.cases.capture = function(callback) {
  camera.test.runSteps([
    function(next) {
      camera.test.waitForTrue('Wait for the window.', function() {
        return !!camera.bg.appWindow;
      }, next),
    },
    function(next) {
      camera.test.waitForTrue('Wait for the camera instance.', function() {
        return camera.bg.appWindow.contentWindow.camera &&
          camera.bg.appWindow.contentWindow.camera.Camera &&
          camera.bg.appWindow.contentWindow.camera.Camera.getInstance();
      }, next);
    },
    function(next) {
      var instance = camera.bg.appWindow.contentWindow.camera.Camera.
            getInstance();
      camera.test.waitForTrue('Wait for the Camera view.', function() {
        return instance.currentView &&
               instance.currentView == instance.cameraView;
      }, next);
    },
    function(next) {
      camera.test.waitForTrue('Wait for the stream.', function() {
        return instance.currentView.running;
      }, callback);
    }
  ]);
};

