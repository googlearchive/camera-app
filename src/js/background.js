/**
 * Namespace for the Camera app.
 */
var camera = camera || {};

/**
 * Namespace for the background page.
 */
camera.bg = {};

/**
 * Singleton window handle of the Camera app.
 * @type {AppWindow}
 */
camera.bg.appWindow = null;

/**
 * Default width of the window in pixels.
 * @type {number}
 * @const
 */
camera.bg.DEFAULT_WIDTH = 1280;

/**
 * Default height of the window in pixels.
 * @type {number}
 * @const
 */
camera.bg.DEFAULT_HEIGHT = 720;

/**
 * Creates the window. Note, that only one window at once is supported.
 */
camera.bg.create = function() {
  chrome.app.window.create('views/main.html', {
    id: 'main',
    frame: 'none',
    hidden: true,  // Will be shown from main.js once loaded.
    defaultWidth: camera.bg.DEFAULT_WIDTH,
    defaultHeight: camera.bg.DEFAULT_HEIGHT,
    defaultLeft: Math.round((window.screen.availWidth - camera.bg.DEFAULT_WIDTH) / 2),
    defaultTop: Math.round((window.screen.availHeight - camera.bg.DEFAULT_HEIGHT) / 2),
  }, function(inAppWindow) {
    appWindow = inAppWindow;
  });
};

chrome.app.runtime.onLaunched.addListener(camera.bg.create);
