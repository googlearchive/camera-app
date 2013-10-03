#!/usr/bin/python

"""Binds or unbinds a specified USB video device.

To use, run as root: ./camera_ctl.py device-identifier bind/unbind

The USB identifier looks like 2-1.4.3:1.0. Available devices are in:
/sys/bus/usb/drivers/uvcvideo/.
"""

import sys

# Starts the script.
def main():
  device_id  = sys.argv[1]
  command = sys.argv[2]

  if command != 'bind' and command != 'unbind':
    print 'Incorrect command.'
    sys.exit(-1)

  with open('/sys/bus/usb/drivers/uvcvideo/%s' % command, 'w') as driver:
    driver.write(device_id)
    driver.close()

if __name__ == '__main__':
  main()

