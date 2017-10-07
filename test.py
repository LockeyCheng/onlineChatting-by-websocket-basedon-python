#coding:utf-8
'''
file:test.py
date:2017/10/5 17:22
author:lockey
email:lockey@123.com
desc:
'''
s = '\xe9\x9d\x92\xe8\x9b\x99\xe7\x8e\x8b\xe5\xad\x90'
ss = s.encode('raw_unicode_escape')
print(ss)  # 结果：b'\xe9\x9d\x92\xe8\x9b\x99\xe7\x8e\x8b\xe5\xad\x90'
sss = ss.decode()
print(sss)
good='阿达'
print(good.encode('utf-8'))
aa = '\xe9\x98\xbf\xe8\xbe\xbe'
print((aa.encode('raw_unicode_escape')).decode())