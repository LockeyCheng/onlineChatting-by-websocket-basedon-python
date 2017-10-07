# coding=utf-8
'''
file:a.py
date:2017/10/2 20:48
author:lockey
email:lockey@123.com
desc:
'''
import socket,json,time
import hashlib
import threading, random
from base64 import b64encode, b64decode

clients = {}
users={}
groups={}
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
    return frame


def parse_recv_data(msg):
    en_bytes = b''
    cn_bytes = []
    if len(msg) < 6:
        return ''
    v = msg[1] & 0x7f
    if v == 0x7e:
        p = 4
    elif v == 0x7f:
        p = 10
    else:
        p = 2
    mask = msg[p:p + 4]
    data = msg[p + 4:]

    for k, v in enumerate(data):
        nv = chr(v ^ mask[k % 4])
        nv_bytes = nv.encode()
        nv_len = len(nv_bytes)
        if nv_len == 1:
            en_bytes += nv_bytes
        else:
            en_bytes += b'%s'
            cn_bytes.append(ord(nv_bytes.decode()))
    if len(cn_bytes) > 2:
        # 字节数组转汉字
        cn_str = ''
        clen = len(cn_bytes)
        count = int(clen / 3)
        for x in range(0, count):
            i = x * 3
            b = bytes([cn_bytes[i], cn_bytes[i + 1], cn_bytes[i + 2]])
            cn_str += b.decode()
        new = en_bytes.replace(b'%s%s%s', b'%s')
        new = new.decode()
        res = (new % tuple(list(cn_str)))
    else:
        res = en_bytes.decode()

    return res
def send_data(dataObj):
    data = json.dumps(dataObj)
    if data == None or len(data) <= 0:
        return False
    if dataObj['type'] == 'personal':
        userto = dataObj['to']
        userfrom = dataObj['from']
        try:
            users[userto]['conn'].send(pack(data))
        except:
            users[userto]['toRead'].append(data)
            print(users[userto]['toRead'])
            ret = {'type': 'server', 'status': 0}
            data = json.dumps(ret)
            users[userfrom]['conn'].send(pack(data))
    if dataObj['type'] == 'group':
        groupto = dataObj['to']
        grps = groups[groupto]
        for user in grps['groupmems']:
            try:
                users[user]['conn'].send(pack(data))
            except:
                print('group Members error')
class WebSocket(threading.Thread):  # 继承Thread

    GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

    def __init__(self, conn, name, remote, path="/"):
        threading.Thread.__init__(self)  # 初始化父类Thread
        self.conn = conn
        self.name = name
        self.remote = remote
        self.path = path
        self.buffer = ""

    def run(self):
        headers = {}
        self.handshaken = False
        while True:
            if self.handshaken == False:
                print('Start Handshaken with {}!'.format(self.remote))
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
                    print('Handshaken with {} success!'.format(self.remote))

            else:
                all_data = self.conn.recv(128)
                data=parse_recv_data(all_data)

                if not len(all_data):
                    return False
                else:
                    try:
                        print(data)
                        #nowTime = time.strftime('%H:%M:%S', time.localtime(time.time()))
                        dataObj = json.loads(data)
                        if dataObj['type'] == 'quit':
                            quituser = dataObj['username']
                            print('User %s Logout!' % (quituser))
                            del users[quituser]['conn']
                            self.conn.close()
                            return False
                        if (dataObj['type'] == 'login'):
                            regUser = dataObj['username']
                            try:
                                if users[regUser] and users[regUser]['password'] == dataObj['password']:
                                    toRead = users[regUser]['toRead']
                                    dataObj = {"type":"login","status":0,"toRead":'~'.join(toRead)}
                                    users[regUser]['toRead'] = []
                                    users[regUser]['conn']= self.conn
                                else:
                                    dataObj = {"type": "login", "status": 1}
                            except:
                                dataObj = {"type": "login", "status": 1}
                            finally:
                                data = json.dumps(dataObj)
                                self.conn.send(pack(data))
                            continue
                        if (dataObj['type'] == 'reg'):
                            regUser = dataObj['username']
                            if regUser in users:
                                dataObj = {"type": "reg", "status": 1}
                            else:
                                users[regUser] = {'password':dataObj['password'],'conn':self.conn,'friends':[],'groups':[],'toRead':[]}
                                dataObj = {"type":"reg","status":0}
                            data = json.dumps(dataObj)
                            self.conn.send(pack(data))
                            continue
                        if (dataObj['type'] == 'addFriend'):
                            username = dataObj['username']
                            friendname = dataObj['target']
                            if friendname not in users[username]['friends']:
                                users[username]['friends'].append(friendname);
                                users[friendname]['friends'].append(username);
                                dataObj = {"type": "addFriend", "status": 0}
                            else:
                                dataObj = {"type":"reg","status":1}
                            data = json.dumps(dataObj)
                            self.conn.send(pack(data))
                            continue
                        if (dataObj['type'] == 'search'):
                            keywords = dataObj['keywords']
                            gps=[];persons=[]
                            for g in groups:
                                if keywords in g:
                                    gps.append(g)
                            for p in users:
                                if keywords in p:
                                    persons.append(p)
                            dataObj={"type":"search",'groups':gps,'persons':persons}
                            data = json.dumps(dataObj)
                            self.conn.send(pack(data))
                            continue
                        if (dataObj['type'] == 'enterGroup'):
                            gname = dataObj['target']
                            uname = dataObj['username']
                            if uname not in groups[gname]['groupmems']:
                                groups[gname]['groupmems'].append(uname)
                                users[uname]['groups'].append(gname)
                                dataObj = {"type": "enterGroup", "status": 0}
                            else:
                                dataObj = {"type": "enterGroup", "status": 1}
                            data = json.dumps(dataObj)
                            self.conn.send(pack(data))
                            continue
                        if (dataObj['type'] == 'getGroups'):
                            uname = dataObj['username']
                            if uname in users:
                                dataObj = {"type": "getGroups", "status": 0,'list':users[uname]['groups']}
                            else:
                                dataObj = {"type":"getGroups","status":1}
                            data = json.dumps(dataObj)
                            self.conn.send(pack(data))
                            continue
                        if (dataObj['type'] == 'getFriends'):
                            uname = dataObj['username']
                            if uname in users:
                                dataObj = {"type": "getFriends", "status": 0,'list':users[uname]['friends']}
                            else:
                                dataObj = {"type":"getFriends","status":1}
                            data = json.dumps(dataObj)
                            self.conn.send(pack(data))
                            continue
                        if (dataObj['type'] == 'addgroup'):
                            owner = dataObj['username']
                            groupname = dataObj['groupName']
                            groupmotto = dataObj['groupMotto']
                            groupmems = dataObj['groupMems']
                            if groupname in groups:
                                dataObj = {"type": "addgroup", "status": 1}
                            else:
                                members=groupmems.split(',')
                                groups[groupname] = {'owner':owner,'groupname':groupname,'groupmotto':groupmotto,'groupmems':members}
                                dataObj = {"type":"addgroup","status":0}
                                for user in members:
                                    users[user]['groups'].append(groupname)
                            data = json.dumps(dataObj)
                            self.conn.send(pack(data))
                            continue
                        send_data(dataObj)
                    except:
                        print('Something wrong!')


class WebSocketServer(object):
    def __init__(self):
        self.socket = None

    def begin(self):
        print('WebSocketServer Start!')
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(("192.168.0.33", 8899))
        self.socket.listen(50)

        while True:
            connection, address = self.socket.accept()
            username = "user-" + str(address[1])
            newSocket = WebSocket(connection, username, address)
            newSocket.start()  # 开始线程,执行run函数


if __name__ == "__main__":
    server = WebSocketServer()
    server.begin()

'''
1.先建立连接，然后再通过发送过来的信息填充字典users={username:conn,password.etc}
'''