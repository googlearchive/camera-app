#!/usr/bin/python

import sys

id = sys.argv[1]
mode = sys.argv[2]

command = ''

if mode == '0':
  command = 'unbind'
elif mode == '1':
  command = 'bind'
else:
  print 'Incorrect mode.'
  sys.exit(-1)

with open('/sys/bus/usb/drivers/uvcvideo/%s' % command, 'w') as driver:
  driver.write(id)
  driver.close()
