#!/usr/bin/python

import os
import glob
import signal
import subprocess
import sys
import websocket_handler
import threading
import SocketServer

kill_cmd = None
server = None
server_thread = None
closing = False
status = websocket_handler.STATUS_INTERNAL_ERROR

def cmd(command):
  p = subprocess.Popen(command, shell=False)
  p.wait()
  return p.returncode

def close(returncode):
  global kill_cmd, server, closing, status

  if closing:
    return
  closing = True

  status = returncode
  server.terminate();
  kill_process = subprocess.Popen(kill_cmd, shell=False)
  kill_process.wait()

# Test case to be run.
test_case = sys.argv[1]
test_timeout = int(sys.argv[2])

# Location of the Chrome binary.
chrome_path = 'google-chrome'
chrome_binary = 'chrome'

# Location of the Camera app.
camera_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../build/tests')

# Step 1. Kill all existing chrome windows.
kill_cmd = ['killall', '-q', '-9', chrome_binary]
cmd(kill_cmd)

# Step 2. Restart the camera module.
if cmd(['sudo', './camera_reset.py']) != 0:
  print 'Failed to reload the camera kernel module.'
  sys.exit(websocket_handler.STATUS_INTERNAL_ERROR)

# Step 3. Fetch camera devices.
camera_devices = [os.path.basename(x)
    for x in glob.glob('/sys/bus/usb/drivers/uvcvideo/?-*')]
if not camera_devices:
  print 'No cameras detected.'
  sys.exit(websocket_handler.STATUS_INTERNAL_ERROR)

# Step 4. Set the timeout.
def timeout(signum, frame):
  print 'Timeout.'
  sys.exit(websocket_handler.STATUS_INTERNAL_ERROR)

signal.signal(signal.SIGALRM, timeout)
signal.alarm(test_timeout)

# Step 5. Check if there is a camera attached.
if not glob.glob("/dev/video*"):
  print 'Camera device is missing.'
  sys.exit(websocket_handler.STATUS_INTERNAL_ERROR);

# Step 6. Start the TCP server for communication with the Camera app.
def command(name):
  if name == 'detach':
    for camera_device in camera_devices:
      if not os.path.exists('/sys/bus/usb/drivers/uvcvideo/%s' % camera_device):
        continue
      if cmd(['sudo', './camera_ctl.py', camera_device, '0']) != 0:
        print 'Failed to detach a camera.'
        sys.exit(websocket_handler.STATUS_INTERNAL_ERROR)
  if name == 'attach':
    for camera_device in camera_devices:
      if os.path.exists('/sys/bus/usb/drivers/uvcvideo/%s' % camera_device):
        continue
      if cmd(['sudo', './camera_ctl.py', camera_device, '1']) != 0:
        print 'Failed to attach the camera.'
        sys.exit(websocket_handler.STATUS_INTERNAL_ERROR)

server = websocket_handler.Server(('localhost', 47552), websocket_handler.Handler, close, command, test_case)
server_thread = threading.Thread(target=server.serve_forever)
server_thread.daemon = True
server_thread.start()

# Step 7. Install the Camera app.
run_cmd = [chrome_path, '--verbose', '--enable-logging', '--load-and-launch-app=%s' % camera_path, '--camera-run-tests']
chrome_process = subprocess.Popen(run_cmd, shell=False)
chrome_process.wait()

# Wait until the browser is closed.
cmd(kill_cmd)
sys.exit(status)

