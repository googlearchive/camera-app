import array
import base64
import hashlib
import socket
import struct
import threading
import SocketServer

s2a = lambda s: [ord(c) for c in s]

STATUS_FAILURE = -1
STATUS_NO_RESPONSE = -2
STATUS_INTERNAL_ERROR = -3
STATUS_SUCCESS = 0

class Server(SocketServer.ThreadingTCPServer):
  def __init__(self, server_address, RequestHandlerClass, callback,
        command_callback, test_case):
    self.allow_reuse_address = True
    SocketServer.ThreadingTCPServer.__init__(self, server_address,
        RequestHandlerClass)
    self.callback = callback
    self.command_callback = command_callback
    self.test_case = test_case

  def terminate(self):
    # TODO(mtomasz): This is far from a good design. This is called from the
    # UI thread, but the Server lives on a separate thread.
    self.shutdown()

class Handler(SocketServer.StreamRequestHandler):
  def handle(self):
    status = STATUS_INTERNAL_ERROR;

    # Accept incoming messages.
    if self.handleHeaders():
      status = self.handleFrames();

    # Return the result
    self.server.callback(status)

  def handleHeaders(self):
    headers = {}

    while True:
      try:
        data = self.rfile.readline()
        if data == "":
          return False
        line = data.strip()
        if line.find(':') != -1:
          pair = map(lambda word: word.strip(), line.split(':', 1))
          headers[pair[0]] = pair[1]
        elif line:
          pass
        else:
          # Send the response headers.
          sha1 = hashlib.sha1()
          sha1.update(headers['Sec-WebSocket-Key'] +
              '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
          secret = base64.b64encode(sha1.digest())
          self.wfile.write('HTTP/1.1 101 Switching Protocols\r\n')
          self.wfile.write('Upgrade: websocket\r\n')
          self.wfile.write('Connection: Upgrade\r\n')
          self.wfile.write('Sec-WebSocket-Accept: %s\r\n\r\n' % secret)

          # Send the test case name.
          print '\n{TEST CASE} %s' % self.server.test_case
          data = self.server.test_case.encode('utf-8')
          self.request.send('\x81%s%s' % (chr(len(data)), data))

          return True
      except socket.error:
        return False

  def handleFrames(self):
    status = STATUS_NO_RESPONSE
    while True:
      try:
        data = self.rfile.read(2)
        if len(data) == 0:
          break

        # Parse the header.
        b1, b2 = struct.unpack_from(">BB", data);
        frame_fin = (b1 & 0x80) >> 7
        frame_opcode = b1 & 0x0f
        frame_masked = (b2 & 0x80) >> 7
        frame_length = b2 & 0x7f
        frame_header_length = 2

        if frame_length == 126:
          frame_header_length += 2
          frame_length = struct.unpack_from('>xxH', data)
        elif frame_length == 127:
          frame_header_length += 8
          frame_length = struct.unpack_from('>xxQ', data)
        frame_total_length = frame_header_length + frame_masked * 4 + \
            frame_length;

        data = self.rfile.read(frame_total_length - 2)

        # Partitioned messages are not supported.
        if not frame_fin:
          print 'Error: Partitioned messages are not implemented.'
          status = STATUS_INTERNAL_ERROR
          break

        # Extract the payload.
        frame_payload = ''
        if frame_masked:
          frame_mask = data[0:4]
          frame_mask_a = s2a(frame_mask)
          data_array = array.array('B')
          data_array.fromstring(data[4:4 + frame_length])
          for i in range(len(data_array)):
            data_array[i] ^= frame_mask_a[i % 4]
          frame_payload = data_array.tostring()
        else:
          frame_payload = data

        # Close the connection.
        if frame_opcode == 8:
          return status

        status = self.parseFrameMessage(frame_payload, status)
      except socket.error:
        status = STATUS_INTERNAL_ERROR
        pass

    return status

  def parseFrameMessage(self, line, status):
    command = ''
    message = ''
    if line.find(' ') != -1:
      array = line.split(' ', 1)
      command = array[0]
      message = array[1]
    else:
      command = line

    if message:
      print '[%s] %s' % (command, message)
    else:
      print '[%s]' % command

    if command == 'SUCCESS':
      if status == STATUS_NO_RESPONSE:
        return STATUS_SUCCESS
    if command == 'FAILURE':
      return STATUS_FAILURE
    if command == 'COMMAND':
      command_array = line.split(' ', 2)
      self.server.command_callback(command_array[1])

    return status

