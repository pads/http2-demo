const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

const PORT = 8443;
const { HTTP2_HEADER_PATH } = http2.constants;

const config = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost-privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost-cert.pem')),
  allowHTTP1: true
};

const push = (stream, file) => {
  stream.pushStream({ [HTTP2_HEADER_PATH]: file }, (pushStream) => {
    pushStream.respondWithFD(file.fileDescriptor, file.headers);
  })
};

const getFile = (filename) => {
  const filePath = path.join(__dirname, 'public', filename);
  const fileDescriptor = fs.openSync(filePath, 'r');
  const stat = fs.fstatSync(fileDescriptor);
  const contentType = mime.getType(filePath);

  return {
    fileDescriptor: fileDescriptor,
    headers: {
      'content-length': stat.size,
      'last-modified': stat.mtime.toUTCString(),
      'content-type': contentType
    }
  }
};

const requestHandler = (request, response) => {
  const headerPath = request.headers[HTTP2_HEADER_PATH];
  const filename = headerPath === '/' ? 'index.html' : headerPath;
  const file = getFile(filename);

  if (filename === 'index.html') {
    push(response.stream, getFile('main.bundle.js'));
    push(response.stream, getFile('vendor.bundle.js'));
  }

  response.stream.respondWithFD(file.fileDescriptor, file.headers);
};

const server = http2.createSecureServer(config, requestHandler);

server.on('error', (error) => console.error(error));
server.on('socketError', (error) => console.error(error));
server.on('stream', (stream) => {
  console.log('streaming');
});

server.listen(PORT, (error) => {
  if (error) {
    console.log(error);
    return -1;
  }
  console.log(`server listening on ${PORT}`);
});
