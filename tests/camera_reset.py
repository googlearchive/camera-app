#!/usr/bin/python

import subprocess
import sys

print 'Removing uvcvideo...'
p = subprocess.Popen(['rmmod', '-w', 'uvcvideo'], shell=False)
p.wait()
# Ignore the return code, since the module may not be available if already
# removed.

# TODO(mtomasz): We should return an error if the device is mounted, but rmmode
# failed, because of lack of permissions.

p2 = subprocess.Popen(['modprobe', 'uvcvideo'], shell=False)
p2.wait()

print 'Probing uvcvideo...'
# Forward the return code, since mod probing must succeed.
sys.exit(p2.returncode)

