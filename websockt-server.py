# -*- coding: utf-8 -*-
'''
file:a.py
date:2017/10/2 20:48
author:lockey
email:lockey@123.com
desc:
'''
import struct, socket
import hashlib
import threading, random
import time
import struct
from base64 import b64encode, b64decode

clients = {}
def is_bit_set(int_type, offset):
    mask = 1 << offset
    return not 0 == (int_type & mask)

def set_bit(int_type, offset):
    return int_type | (1 << offset)

def bytes_to_int(data):
    # note big-endian is the standard network byte order
    return int.from_bytes(data, byteorder='big')

def pack(data):
    """pack bytes for sending to client"""
    frame_head = bytearray(2)

    # set final fragment
    frame_head[0] = set_bit(frame_head[0], 7)

    # set opcode 1 = text
    frame_head[0] = set_bit(frame_head[0], 0)

    # payload length
    assert len(data) < 126, "haven't implemented that yet"
    frame_head[1] = len(data)

    # add data
    frame = frame_head + data.encode('utf-8')
    #print(list(hex(b) for b in frame))
    return frame

def send_data(data):
    for connection in clients.values():
        if data != None and len(data) > 0:
            connection.send(pack(data))

def deleteconnection(item):
    global clients
    del clients['client'+item]

class WebSocket(threading.Thread):  # 继承Thread

    GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

    def __init__(self, conn, index, name, remote, path="/"):
        threading.Thread.__init__(self)  # 初始化父类Thread
        self.conn = conn
        self.index = index
        self.name = name
        self.remote = remote
        self.path = path
        self.buffer = ""

    def run(self):
        print('Socket%s Start!' % self.index)
        headers = {}
        self.handshaken = False
        while True:
            if self.handshaken == False:
                print('Socket%s Start Handshaken with %s!' % (self.index, self.remote))
                self.buffer += bytes.decode(self.conn.recv(1024))
                if self.buffer.find('\r\n\r\n') != -1:
                    header, data = self.buffer.split('\r\n\r\n', 1)
                    for line in header.split("\r\n")[1:]:
                        key, value = line.split(": ", 1)
                        headers[key] = value

                    headers["Location"] = ("ws://%s%s" % (headers["Host"], self.path))
                    key = headers['Sec-WebSocket-Key']
                    token = b64encode(hashlib.sha1(str.encode(str(key + self.GUID))).digest())

                    handshake = "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + bytes.decode(
                        token) + "\r\nWebSocket-Origin: " + str(headers["Origin"]) + "\r\nWebSocket-Location: " + str(
                        headers["Location"]) + "\r\n\r\n"

                    self.conn.send(str.encode(str(handshake)))
                    self.handshaken = True
                    print('Socket %s Handshaken with %s success!' % (self.index, self.remote))
            else:
                all_data = self.conn.recv(128)
                if not len(all_data):
                    return False
                else:
                    code_len = all_data[1] & 127
                    if code_len == 126:
                        masks = all_data[4:8]
                        data = all_data[8:]
                    elif code_len == 127:
                        masks = all_data[10:14]
                        data = all_data[14:]
                    else:
                        masks = all_data[2:6]
                        data = all_data[6:]
                    raw_str = ""
                    i = 0
                    for d in data:
                        raw_str += chr(d ^ masks[i % 4])
                        i += 1
                    nowTime = time.strftime('%H:%M:%S', time.localtime(time.time()))
                    if raw_str == 'quit':
                        print(u'Socket%s Logout!' % (self.index))
                        send_data('Logout')
                        deleteconnection(str(self.index))
                        self.conn.close()
                        return False
                    else:
                        if raw_str:
                            print(raw_str)
                            send_data(raw_str)


class WebSocketServer(object):
    def __init__(self):
        self.socket = None

    def begin(self):
        print('WebSocketServer Start!')
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(("192.168.100.2", 12345))
        self.socket.listen(50)

        global clients

        i = 0
        while True:
            connection, address = self.socket.accept()
            username = "user-" + str(address[1])
            newSocket = WebSocket(connection, i, username, address)
            newSocket.start()  # 开始线程,执行run函数
            clients['client'+str(i)] = connection
            i = i + 1


if __name__ == "__main__":
    server = WebSocketServer()
    server.begin()