#!/usr/bin/python

"""Runs a single test case.

On success returns 0. On failure returns a negative value. See
websocket_handler.py for possible return values.

To use, run ./run_test.py test_case_name timeout_in_secs. Note, that all of the
Chrome windows will be killed.
"""

import os
import glob
import signal
import subprocess
import sys
import websocket_handler
import threading

# Location of the Chrome binary.
CHROME_PATH = 'google-chrome'
CHROME_BINARY = 'chrome'

# Location of the Camera app.
SELF_PATH = os.path.dirname(os.path.abspath(__file__))
CAMERA_PATH = os.path.join(SELF_PATH, '../build/tests')

# Runs a command, waits and returns the error code.
def run(command):
  process = subprocess.Popen(command, shell=False)
  process.wait()
  return process.returncode

# Kills all of chrome instances.
def kill_chrome():
  run(['killall', '-q', '-9', CHROME_BINARY])

# Test case runner.
class TestCaseRunner:
  __server = None
  __server_thread = None
  __closing = False
  __status = websocket_handler.STATUS_INTERNAL_ERROR
  __test_case = ''
  __test_timeout = -1

  def __init__(self, test_case, test_timeout):
    self.__test_case = test_case
    self.__test_timeout = test_timeout

  # Closes the run_task.py process by stopping the WebSocket server, terminating
  # all of the Chrome windows, and returning the passed error code.
  def __close(self, returncode):
    if self.__closing:
      return
    self.__closing = True

    self.__status = returncode
    self.__server.terminate()
    kill_chrome()

  # Runs the test case with the specified timeout passed as arguments. Returns
  # the error code.
  def run(self):
    if self.__server != None:
      raise Exception('Unable to call run() more than once.')

    # Step 1. Kill all existing chrome windows.
    kill_chrome()

    # Step 2. Restart the camera module.
    if run(['sudo', os.path.join(SELF_PATH, 'camera_reset.py')]) != 0:
      print 'Failed to reload the camera kernel module.'
      return websocket_handler.STATUS_INTERNAL_ERROR

    # Step 3. Fetch camera devices.
    camera_devices = [os.path.basename(usb_id)
        for usb_id in glob.glob('/sys/bus/usb/drivers/uvcvideo/?-*')]
    if not camera_devices:
      print 'No cameras detected.'
      return websocket_handler.STATUS_INTERNAL_ERROR

    # Step 4. Set the timeout.
    def timeout():
      print 'Timeout.'
      return websocket_handler.STATUS_INTERNAL_ERROR

    signal.signal(signal.SIGALRM, timeout)
    signal.alarm(self.__test_timeout)

    # Step 5. Check if there is a camera attached.
    if not glob.glob("/dev/video*"):
      print 'Camera device is missing.'
      return websocket_handler.STATUS_INTERNAL_ERROR

    # Step 6. Start the TCP server for communication with the Camera app.
    def handle_websocket_command(name):
      if name == 'detach':
        for camera_device in camera_devices:
          if not os.path.exists('/sys/bus/usb/drivers/uvcvideo/%s' %
              camera_device):
            continue
          if run(['sudo', os.path.join(SELF_PATH, 'camera_ctl.py'),
              camera_device, 'unbind']) != 0:
            print 'Failed to detach a camera.'
            return websocket_handler.STATUS_INTERNAL_ERROR
      if name == 'attach':
        for camera_device in camera_devices:
          if os.path.exists('/sys/bus/usb/drivers/uvcvideo/%s' % camera_device):
            continue
          if run(['sudo', os.path.join(SELF_PATH, 'camera_ctl.py'),
              camera_device, 'bind']) != 0:
            print 'Failed to attach the camera.'
            return websocket_handler.STATUS_INTERNAL_ERROR

    self.__server = websocket_handler.Server(('localhost', 47552),
      websocket_handler.Handler, self.__close, handle_websocket_command,
      self.__test_case)
    server_thread = threading.Thread(target=self.__server.serve_forever)
    server_thread.daemon = True
    server_thread.start()

    # Step 7. Install the Camera app.
    run_command = [CHROME_PATH, '--verbose', '--enable-logging',
        '--load-and-launch-app=%s' % CAMERA_PATH, '--camera-run-tests']
    run(run_command)

    # Wait until the browser is closed.
    kill_chrome()
    return self.__status

# Starts the application
def main():
  test_case = sys.argv[1]
  test_timeout = int(sys.argv[2])
  test_runner = TestCaseRunner(test_case, test_timeout)
  sys.exit(test_runner.run())

if __name__ == '__main__':
  main()

