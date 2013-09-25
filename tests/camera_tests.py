#!/usr/bin/python

import os
import subprocess
import sys

# Names of test cases requiring a camera plugged in.
test_cases = ['basic', 'capture']

# Timeout per test case.
timeout = 30

# Run tests which require camera.
for test_case in test_cases:
  p = subprocess.Popen(['./run_test.py', test_case, str(timeout)], shell=False)
  p.wait()
  if p.returncode != 0:
    print '(TEST CASE FAILURE) %s' % test_case
    sys.exit(p.returncode)
  else:
    print '(TEST CASE SUCCESS) %s' % test_case

