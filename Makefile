CHROME=google-chrome

all: build/camera build/tests build-packages

build/camera:
	mkdir -p build/camera
	cp -R src/_locales build/camera/_locales
	cp -R src/css build/camera/css
	cp -R src/images build/camera/images
	cp -R src/sounds build/camera/sounds
	cp -R src/views build/camera/views
	cp -R src/js build/camera/js
	cp src/manifest.json build/camera/manifest.json
	$(CHROME) --pack-extension=build/camera --pack-extension-key=dev-keys/camera.pem

build/tests:
	mkdir -p build/tests
	cp -R src/_locales build/tests/_locales
	cp -R src/css build/tests/css
	cp -R src/images build/tests/images
	cp -R src/sounds build/tests/sounds
	cp -R src/views build/tests/views
	cp -R src/js build/tests/js
	cp src/manifest-tests.json build/tests/manifest.json
	$(CHROME) --pack-extension=build/tests --pack-extension-key=dev-keys/tests.pem

build-packages:
	mkdir build-packages
	cp build/camera.crx build-packages/camera.crx
	cp build/tests.crx build-packages/tests.crx

clean:
	rm -rf build
	rm -rf build-packages
