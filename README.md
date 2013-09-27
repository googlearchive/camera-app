Camera App
==========

Camera App is a packaged app designed to take pictures with several effects using the embedded web camera.

Supported systems
-----------------
Should work on any operating system, especially on Chrome OS.

Installing
----------

Camera App is not ready yet. It does not save pictures. However, you can test it by downloading the crx on your Chromebook.
[Download](https://github.com/GoogleChrome/camera-app/blob/master/build-packages/camera.crx?raw=true)

On Chromebooks, you may want to right-click and choose 'Save Link As', then install it from Files App to avoid security messages.

Automated tests
---------------

To perform automated tests on Linux you will need following extra packages: gstreamer-tools, v4l2loopback, python. Other operating systems are not supported at this moment.
Run tests via tests/camera_tests.py

Shortcuts
---------
* Left, Right - choose effects.
* Space, Enter - take a picture.
* Delete - deletes pictures (in the gallery).
* Double click - saves pictures (in the gallery).

Tricks
------
* Clicking on some effects on the ribbon, randomizes its parameters.

Known issues
------------
* Taking pictures could be faster.
* File names could be better.
