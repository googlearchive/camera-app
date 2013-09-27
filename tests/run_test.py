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

# Step 0. Initialize the camera just in case it got removed by previous tests.
cmd(['sudo', 'modprobe', 'uvcvideo'])

# Step 1. Set the timeout.
def timeout(signum, frame):
  print 'Timeout.'
  sys.exit(websocket_handler.STATUS_INTERNAL_ERROR)

signal.signal(signal.SIGALRM, timeout)
signal.alarm(test_timeout)

# Step 2. Kill all existing chrome windows.
kill_cmd = ['killall', '-q', '-9', chrome_binary]
cmd(kill_cmd)

# Step 3. Check if there is a camera attached.
if not glob.glob("/dev/video*"):
  print 'Camera device is missing.'
  sys.exit(websocket_handler.STATUS_INTERNAL_ERROR);

# Step 4. Start the TCP server for communication with the Camera app.
def command(name):
  if name == 'detach':
    cmd(['sudo', 'rmmod', '-w', 'uvcvideo'])
  if name == 'attach':
    cmd(['sudo', 'modprobe', 'uvcvideo'])

server = websocket_handler.Server(('localhost', 47552), websocket_handler.Handler, close, command, test_case)
server_thread = threading.Thread(target=server.serve_forever)
server_thread.daemon = True
server_thread.start()

# Step 5. Install the Camera app.
run_cmd = [chrome_path, '--verbose', '--enable-logging', '--load-and-launch-app=%s' % camera_path, '--camera-run-tests']
chrome_process = subprocess.Popen(run_cmd, shell=False)
chrome_process.wait()

# Wait until the browser is closed.
cmd(kill_cmd)
sys.exit(status)

