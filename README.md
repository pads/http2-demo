# http2-demo
Demonstrating the HTTP2 protocol

```bash
nvm use
npm install
npm start
open https://localhost:8443
```

In Chrome you can also see the HTTP2 session:

`chrome://net-internals/#http2`

To test fallback to HTTP1.1 you can run Chrome as follows (Mac example):

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-http2
```
