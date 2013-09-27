#!/usr/bin/python

import os
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

# Step 0. Set the timeout.
def timeout(signum, frame):
  print 'Timeout.'
  sys.exit(websocket_handler.STATUS_INTERNAL_ERROR)

signal.signal(signal.SIGALRM, timeout)
signal.alarm(test_timeout)

# Step 1. Kill all existing chrome windows.
kill_cmd = ['killall', '-q', '-9', chrome_binary]
kill_process = subprocess.Popen(kill_cmd, shell=False)
kill_process.wait()

# Step 2. Start the TCP server for communication with the Camera app.
server = websocket_handler.Server(('localhost', 47552), websocket_handler.Handler, close, test_case)
server_thread = threading.Thread(target=server.serve_forever)
server_thread.daemon = True
server_thread.start()

# Step 3. Install the Camera app.
run_cmd = [chrome_path, '--verbose', '--enable-logging', '--load-and-launch-app=%s' % camera_path, '--camera-run-tests']
chrome_process = subprocess.Popen(run_cmd, shell=False)
chrome_process.wait()

# Wait until the browser is closed.
kill_process = subprocess.Popen(kill_cmd, shell=False)
kill_process.wait()
sys.exit(status)

