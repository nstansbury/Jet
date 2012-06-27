var httpRequest = 'GET http://localhost/ HTTP/1.1\r\n\
Host: localhost\r\n\
Connection: keep-alive\r\n\
Cache-Control: max-age=0\r\n\
User-Agent: Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.83 Safari/535.11\r\n\
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n\
Accept-Encoding: gzip,deflate,sdch\r\n\
Multi-Line-Header:    some-long-value-1a,\n\
            some-long-value-1b\
Accept-Language: en-GB,en-US;q=0.8,en;q=0.6\r\n\
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3\r\n\
If-None-Match: "2000000034ccf-1f8b-4bb0b3da6536c"\r\n\
If-Modified-Since: Mon, 12 Mar 2012 12:54:20 GMT\r\n\
\r\n\
GET http://localhost/common.css HTTP/1.1\r\n\
Host: localhost\r\n\
Connection: keep-alive\r\n\
Cache-Control: max-age=0\r\n\
If-Modified-Since: Thu, 09 Feb 2012 11:08:35 GMT\r\n\
User-Agent: Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.83 Safari/535.11\r\n\
Accept: text/css,*/*;q=0.1\r\n\
If-None-Match: "200000000ef20-360-4b8860891a767"\r\n\
Referer: http://dev.itv.com/\r\n\
Accept-Encoding: gzip,deflate,sdch\r\n\
Accept-Language: en-GB,en-US;q=0.8,en;q=0.6\r\n\
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3\r\n\
\r\n\
GET localhost/index.js HTTP/1.1\r\n\
Host: localhost\r\n\
Connection: keep-alive\r\n\
Cache-Control: max-age=0\r\n\
If-Modified-Since: Thu, 08 Mar 2012 11:34:37 GMT\r\n\
User-Agent: Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.83 Safari/535.11\r\n\
Accept: */*\r\n\
If-None-Match: "2000000034ccd-2ff6-4bab9a93b1902"\r\n\
Referer: http://localhost/\r\n\
Accept-Encoding: gzip,deflate,sdch\r\n\
Accept-Language: en-GB,en-US;q=0.8,en;q=0.6\r\n\
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3\r\n\
\r\n';