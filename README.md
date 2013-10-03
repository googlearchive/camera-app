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

Compiling
---------

To compile run "make clean; make all". Note, that officially only Linux is supported.

Automated tests
---------------

To perform automated tests on Linux, go to camera/tests/ and run run_all_tests.py. Note, that these tests are experimental.
The script must be able to execute sudo without a password. Be sure, to rebuild the project before testing (see: Compiling).

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
